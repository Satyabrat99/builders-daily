/**
 * Formats an external URL by ensuring it includes a valid protocol (https://)
 * and trims extraneous whitespace. Prevents relative path routing issues.
 */
export function formatExternalUrl(url) {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}
