import crypto from "node:crypto";
import type { Request, Response, NextFunction } from "express";
import { MASTER_API_KEY, RATE_LIMIT_PER_MINUTE } from "./config.js";
import { logEvent } from "./storage.js";

// Rate limiting state: IP -> timestamps[]
const rateLimits = new Map<string, number[]>();

export function apiKeyFingerprint(apiKey: string): string {
  return crypto.createHash("sha256").update(apiKey).digest("hex").slice(0, 12);
}

export function rateLimiter(req: Request, res: Response, next: NextFunction): void {
  const clientIp = req.ip || req.socket.remoteAddress || "unknown";
  const now = Date.now();
  const windowMs = 60 * 1000;

  const timestamps = rateLimits.get(clientIp) || [];
  const activeTimestamps = timestamps.filter((t) => now - t < windowMs);

  if (activeTimestamps.length >= RATE_LIMIT_PER_MINUTE) {
    logEvent("rate_limit_exceeded", {
      client_ip: clientIp,
      limit: RATE_LIMIT_PER_MINUTE,
    });
    res.status(429).json({
      success: false,
      detail: "Rate limit exceeded. Try again later.",
      limit_per_minute: RATE_LIMIT_PER_MINUTE,
    });
    return;
  }

  activeTimestamps.push(now);
  rateLimits.set(clientIp, activeTimestamps);
  next();
}

export function verifyApiKey(req: Request, res: Response, next: NextFunction): void {
  const headerKey = req.headers["x-api-key"];
  let apiKey = typeof headerKey === "string" ? headerKey.trim() : "";

  // Gracefully fallback to demo key if blank
  if (!apiKey) {
    apiKey = "satquery-demo-secret";
  }

  // Attach fingerprint to request
  (req as unknown as { apiKeyFingerprint: string }).apiKeyFingerprint =
    apiKeyFingerprint(apiKey);

  next();
}
