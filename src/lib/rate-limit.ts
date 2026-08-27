import { RateLimiterMemory } from 'rate-limiter-flexible';

const limiterMap = new Map<string, RateLimiterMemory>();

function getLimiter(key: string, points: number, duration: number) {
  if (!limiterMap.has(key)) {
    limiterMap.set(key, new RateLimiterMemory({ points, duration }));
  }
  return limiterMap.get(key)!;
}

export async function rateLimit(
  ip: string,
  action: 'verify_qr' | 'verify_upload' | 'register' | 'issue',
  customHeaders?: Headers
): Promise<{ success: boolean; retryAfter?: number }> {
  const config = {
    verify_qr: { points: 30, duration: 60 },
    verify_upload: { points: 10, duration: 60 },
    register: { points: 5, duration: 300 },
    issue: { points: 20, duration: 60 },
  }[action];

  const limiter = getLimiter(action, config.points, config.duration);

  try {
    await limiter.consume(ip);
    return { success: true };
  } catch (rateLimiterRes) {
    const res = rateLimiterRes as { msBeforeNext: number };
    return { success: false, retryAfter: Math.ceil(res.msBeforeNext / 1000) };
  }
}

export function getClientIp(request: Request): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    '127.0.0.1'
  );
}
