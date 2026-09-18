import { Resend } from 'resend';
import { getNewsletterWelcomeHtml, getWaitlistConfirmationHtml } from './emailTemplates';

const apiKey = process.env.RESEND_API_KEY;
const resend = apiKey ? new Resend(apiKey) : null;
const fromEmail = process.env.RESEND_FROM_EMAIL || 'Builder Daily <onboarding@resend.dev>';
const audienceId = process.env.RESEND_AUDIENCE_ID;

/**
 * Send welcome or waitlist confirmation email
 * @param {Object} options
 * @param {string} options.email - Target recipient email
 * @param {string} [options.name] - Recipient name
 * @param {'newsletter'|'waitlist'} [options.type] - Type of subscription
 * @param {string} [options.referralCode] - Optional referral code for waitlist
 * @returns {Promise<{success: boolean, id?: string, simulated?: boolean, error?: string}>}
 */
export async function sendWelcomeEmail({ email, name = '', type = 'newsletter', referralCode = '' }) {
  if (!email) {
    return { success: false, error: 'Email is required' };
  }

  const isWaitlist = type === 'waitlist';
  const subject = isWaitlist
    ? "You're on the Builder Daily Waitlist"
    : "Welcome to Builder Daily: AI Dispatches & Experiments";
  
  const html = isWaitlist
    ? getWaitlistConfirmationHtml({ name, referralCode })
    : getNewsletterWelcomeHtml({ name });

  // Graceful Fallback for Local Dev or when RESEND_API_KEY is not yet added
  if (!resend) {
    console.info(`[RESEND_SERVICE_MOCK] Key not set. Simulating email send to ${email} (${type})`);
    return {
      success: true,
      simulated: true,
      message: 'Simulated email dispatch (add RESEND_API_KEY to .env.local to send live emails)'
    };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [email],
      subject,
      html,
    });

    if (error) {
      console.error('[RESEND_SERVICE_ERROR]', error);
      return { success: false, error: error.message || 'Failed to send email' };
    }

    return { success: true, id: data?.id };
  } catch (err) {
    console.error('[RESEND_EXCEPTION]', err);
    return { success: false, error: err.message || 'Unexpected email error' };
  }
}

const newsletterAudienceId = process.env.RESEND_NEWSLETTER_AUDIENCE_ID || audienceId;
const waitlistAudienceId = process.env.RESEND_WAITLIST_AUDIENCE_ID || audienceId;

/**
 * Sync contact to Resend Audience if configured
 * @param {Object} options
 * @param {string} options.email
 * @param {string} [options.name]
 * @param {'newsletter'|'waitlist'|'both'} [options.type]
 * @param {boolean} [options.unsubscribed]
 */
export async function syncResendContact({ email, name = '', type = 'newsletter', unsubscribed = false }) {
  if (!resend || !email) return;

  const targetAudienceId = type === 'waitlist' 
    ? (waitlistAudienceId || audienceId) 
    : (newsletterAudienceId || audienceId);

  if (!targetAudienceId) return;

  try {
    await resend.contacts.create({
      email,
      firstName: name || undefined,
      unsubscribed,
      audienceId: targetAudienceId,
    });
  } catch (err) {
    // Non-blocking warning (contact might already exist or audience requires paid tier)
    console.warn('[RESEND_CONTACT_SYNC_WARN]', err.message);
  }
}
