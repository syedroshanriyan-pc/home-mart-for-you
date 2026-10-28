/**
 * In-memory sliding-window rate limiter.
 * Protects endpoints from credential stuffing, brute force, and denial of service.
 */

interface RateLimitRecord {
  timestamps: number[];
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Clean up stale entries every 5 minutes to prevent memory leaks
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitStore.entries()) {
      // If no timestamp within the last 10 minutes, delete
      if (record.timestamps.length === 0 || now - record.timestamps[record.timestamps.length - 1] > 10 * 60 * 1000) {
        rateLimitStore.delete(key);
      }
    }
  }, 5 * 60 * 1000).unref?.();
}

export interface RateLimitConfig {
  /** Maximum number of allowed requests in the time window */
  maxRequests: number;
  /** Window duration in milliseconds (default: 60,000ms = 1 minute) */
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  resetSeconds: number;
}

export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = { maxRequests: 20, windowMs: 60 * 1000 }
): RateLimitResult {
  const now = Date.now();
  const windowStart = now - config.windowMs;

  let record = rateLimitStore.get(identifier);
  if (!record) {
    record = { timestamps: [] };
    rateLimitStore.set(identifier, record);
  }

  // Filter out timestamps older than current window
  record.timestamps = record.timestamps.filter((ts) => ts > windowStart);

  if (record.timestamps.length >= config.maxRequests) {
    const oldestTimestamp = record.timestamps[0];
    const resetSeconds = Math.max(1, Math.ceil((oldestTimestamp + config.windowMs - now) / 1000));

    return {
      allowed: false,
      remaining: 0,
      limit: config.maxRequests,
      resetSeconds,
    };
  }

  record.timestamps.push(now);
  const remaining = config.maxRequests - record.timestamps.length;
  const resetSeconds = Math.ceil(config.windowMs / 1000);

  return {
    allowed: true,
    remaining,
    limit: config.maxRequests,
    resetSeconds,
  };
}

/**
 * Extracts a client IP from NextRequest headers for rate limiting
 */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  return "127.0.0.1";
}
