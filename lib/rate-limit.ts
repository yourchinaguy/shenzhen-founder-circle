const windowMs = 24 * 60 * 60 * 1000; // 24 hours
const store = new Map<string, number[]>();

export function rateLimit(key: string, maxRequests: number): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const timestamps = store.get(key) ?? [];
  const recent = timestamps.filter((t) => now - t < windowMs);

  if (recent.length >= maxRequests) {
    store.set(key, recent);
    return { allowed: false, remaining: 0 };
  }

  recent.push(now);
  store.set(key, recent);
  return { allowed: true, remaining: maxRequests - recent.length };
}
