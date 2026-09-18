/**
 * HTTP helper utilities with exponential backoff and standard headers
 */

export const DEFAULT_USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36';

export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * A wrapper around fetch that implements exponential backoff retry logic.
 * Useful for handling transient 429 Too Many Requests or 5xx errors from free APIs.
 */
export async function fetchWithRetry(url, options = {}, retries = 3, backoff = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);

      // If successful or normal client response (except 429), return immediately
      if (response.ok || (response.status !== 429 && response.status < 500)) {
        return response;
      }

      console.warn(`[Attempt ${i + 1}/${retries}] HTTP ${response.status} for ${url}. Retrying in ${backoff}ms...`);
      if (i < retries - 1) {
        await sleep(backoff);
        backoff *= 2;
      } else {
        return response;
      }
    } catch (err) {
      console.warn(`[Attempt ${i + 1}/${retries}] Fetch error for ${url}: ${err.message}. Retrying in ${backoff}ms...`);
      if (i < retries - 1) {
        await sleep(backoff);
        backoff *= 2;
      } else {
        throw err;
      }
    }
  }
}
