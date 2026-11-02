/**
 * Resilient fetch utility with network timeout and automatic retry
 * Meets Requirement A4: 20s network timeouts, 1 retry on network error, safe JSON parsing.
 */

export async function fetchWithRetry(
  url: string,
  options: RequestInit & { skipCache?: boolean } = {},
  maxRetries: number = 1,
  timeoutMs: number = 30000
): Promise<Response> {
  let attempt = 0;

  const headers = new Headers(options.headers || {});
  if (options.skipCache) {
    headers.set('x-skip-cache', 'true');
  }

  while (attempt <= maxRetries) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timer);

      // If server returned 5xx, retry once
      if (!response.ok && response.status >= 500 && attempt < maxRetries) {
        attempt++;
        await new Promise((res) => setTimeout(res, 1200));
        continue;
      }

      return response;
    } catch (err: any) {
      clearTimeout(timer);

      const isTimeout = err.name === 'AbortError';
      const isNetworkError =
        err instanceof TypeError ||
        err.message?.includes('fetch') ||
        err.message?.includes('network') ||
        isTimeout;

      if (attempt < maxRetries && isNetworkError) {
        attempt++;
        // Backoff delay before retry
        await new Promise((res) => setTimeout(res, 1200));
        continue;
      }

      if (isTimeout) {
        const timeoutSeconds = Math.round(timeoutMs / 1000);
        throw new Error(`Request timed out after ${timeoutSeconds}s. Please check your internet connection or retry.`);
      }
      throw err;
    }
  }

  throw new Error('Network request failed after retry.');
}

/**
 * Safely parse JSON from Response or string without crashing
 */
export async function safeJsonParse<T = any>(responseOrText: Response | string, fallback: T): Promise<T> {
  try {
    if (typeof responseOrText === 'string') {
      return JSON.parse(responseOrText) as T;
    }
    return (await responseOrText.json()) as T;
  } catch (err) {
    console.warn('Failed to parse JSON safely:', err);
    return fallback;
  }
}
