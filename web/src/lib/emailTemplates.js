/**
 * Builder Daily - Responsive Branded Email Templates
 * Designed with modern inline CSS for maximum deliverability across Gmail, Apple Mail, Outlook, etc.
 */

export function getNewsletterWelcomeHtml({ name = 'Builder' } = {}) {
  const currentYear = new Date().getFullYear();

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Builder Daily</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0f1013; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e4e4e7; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0f1013; padding: 40px 16px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; background-color: #17181c; border-radius: 16px; border: 1px solid #27272a; overflow: hidden; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);">
          
          <!-- Header Bar -->
          <tr>
            <td style="padding: 32px 36px 20px; border-bottom: 1px solid #27272a;">
              <table role="presentation" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="vertical-align: middle;">
                    <img src="https://builder-daily.vercel.app/builders%20daily-webp.webp" width="32" height="32" alt="Logo" style="display: block; border-radius: 8px; border: 1px solid #3f3f46;" />
                  </td>
                  <td style="padding-left: 12px; vertical-align: middle;">
                    <span style="font-size: 18px; font-weight: 700; letter-spacing: -0.02em; color: #ffffff;">
                      Builder Daily
                      <span style="font-family: Georgia, serif; font-weight: 500; color: #f97316; font-size: 17px; margin-left: 4px;">/dispatch</span>
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Body -->
          <tr>
            <td style="padding: 36px 36px 28px;">
              <h1 style="margin: 0 0 16px; font-size: 24px; font-weight: 700; line-height: 1.3; color: #ffffff; letter-spacing: -0.02em;">
                You're in. Welcome to the frontier.
              </h1>
              
              <p style="margin: 0 0 20px; font-size: 15px; line-height: 1.6; color: #a1a1aa;">
                Hey ${name || 'there'}, thanks for joining <strong>Builder Daily</strong>. We curate daily dispatches, teardowns of frontier AI models, and real-world experiments built by developers and research teams.
              </p>

              <!-- Highlight Box -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #202127; border-radius: 12px; border: 1px solid #3f3f46; margin: 24px 0;">
                <tr>
                  <td style="padding: 20px 22px;">
                    <p style="margin: 0 0 10px; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #f97316;">
                      WHAT TO EXPECT IN YOUR INBOX
                    </p>
                    <ul style="margin: 0; padding-left: 18px; font-size: 14px; line-height: 1.7; color: #d4d4d8;">
                      <li><strong>Daily Intelligence</strong>: Zero-fluff summaries of breakthrough research &amp; models.</li>
                      <li><strong>Experiments &amp; Prototypes</strong>: Code walkthroughs and architectural lessons.</li>
                      <li><strong>Curated Gems</strong>: Practical libraries, GitHub tools, and prompt frameworks.</li>
                    </ul>
                  </td>
                </tr>
              </table>

              <p style="margin: 24px 0 28px; font-size: 15px; line-height: 1.6; color: #a1a1aa;">
                In the meantime, feel free to explore our current live experiments and daily report archives:
              </p>

              <!-- CTA Button -->
              <table role="presentation" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="border-radius: 10px; background-color: #f97316;">
                    <a href="https://builder-daily.vercel.app/blog" target="_blank" style="display: inline-block; padding: 13px 26px; font-size: 14px; font-weight: 700; color: #ffffff; text-decoration: none; border-radius: 10px; letter-spacing: -0.01em;">
                      Explore Experiments &rarr;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 36px 32px; background-color: #121316; border-top: 1px solid #27272a; text-align: left;">
              <p style="margin: 0 0 8px; font-size: 12px; color: #71717a; line-height: 1.5;">
                &copy; ${currentYear} Builder Daily. Built for AI engineers &amp; developers.
              </p>
              <p style="margin: 0; font-size: 11px; color: #52525b; line-height: 1.5;">
                You received this email because you subscribed to updates at Builder Daily.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export function getWaitlistConfirmationHtml({ name = 'Builder', referralCode = '' } = {}) {
  const currentYear = new Date().getFullYear();

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You're on the Builder Daily Waitlist</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0f1013; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e4e4e7; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0f1013; padding: 40px 16px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; background-color: #17181c; border-radius: 16px; border: 1px solid #27272a; overflow: hidden; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);">
          
          <!-- Header Bar -->
          <tr>
            <td style="padding: 32px 36px 20px; border-bottom: 1px solid #27272a;">
              <table role="presentation" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="vertical-align: middle;">
                    <img src="https://builder-daily.vercel.app/builders%20daily-webp.webp" width="32" height="32" alt="Logo" style="display: block; border-radius: 8px; border: 1px solid #3f3f46;" />
                  </td>
                  <td style="padding-left: 12px; vertical-align: middle;">
                    <span style="font-size: 18px; font-weight: 700; letter-spacing: -0.02em; color: #ffffff;">
                      Builder Daily
                      <span style="font-family: Georgia, serif; font-weight: 500; color: #f97316; font-size: 17px; margin-left: 4px;">/waitlist</span>
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Body -->
          <tr>
            <td style="padding: 36px 36px 28px;">
              <div style="display: inline-block; padding: 5px 12px; border-radius: 20px; background-color: rgba(249, 115, 22, 0.15); border: 1px solid rgba(249, 115, 22, 0.35); font-size: 12px; font-weight: 700; color: #f97316; margin-bottom: 16px;">
                &#9679; Priority Early Access Reserved
              </div>

              <h1 style="margin: 0 0 16px; font-size: 24px; font-weight: 700; line-height: 1.3; color: #ffffff; letter-spacing: -0.02em;">
                You're on the Builder Daily Waitlist.
              </h1>
              
              <p style="margin: 0 0 20px; font-size: 15px; line-height: 1.6; color: #a1a1aa;">
                Hey ${name || 'there'}, your spot is secured. We are rolling out private access in batches to ensure seamless testing of our interactive tools, reasoning sandboxes, and builder dispatches.
              </p>

              ${referralCode ? `
              <!-- Referral Box -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #202127; border-radius: 12px; border: 1px solid #3f3f46; margin: 24px 0;">
                <tr>
                  <td style="padding: 20px 22px; text-align: center;">
                    <p style="margin: 0 0 8px; font-size: 13px; color: #a1a1aa;">Share your unique invite link to jump the queue:</p>
                    <p style="margin: 0; font-family: monospace; font-size: 15px; font-weight: 700; color: #f97316; word-break: break-all;">
                      https://builder-daily.vercel.app?ref=${referralCode}
                    </p>
                  </td>
                </tr>
              </table>
              ` : ''}

              <p style="margin: 24px 0 28px; font-size: 15px; line-height: 1.6; color: #a1a1aa;">
                We will email you the moment your invite window opens. No spam, ever.
              </p>

              <!-- CTA Button -->
              <table role="presentation" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="border-radius: 10px; background-color: #27272a; border: 1px solid #3f3f46;">
                    <a href="https://builder-daily.vercel.app" target="_blank" style="display: inline-block; padding: 12px 24px; font-size: 14px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 10px;">
                      View Live Daily Feed &rarr;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 36px 32px; background-color: #121316; border-top: 1px solid #27272a; text-align: left;">
              <p style="margin: 0 0 8px; font-size: 12px; color: #71717a; line-height: 1.5;">
                &copy; ${currentYear} Builder Daily. All rights reserved.
              </p>
              <p style="margin: 0; font-size: 11px; color: #52525b; line-height: 1.5;">
                You received this confirmation because you signed up for the Builder Daily waitlist.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
