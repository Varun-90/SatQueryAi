import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import type { UploadMetadata, AuditLogEntry } from "./types.js";

const rootDir = process.cwd();
const uploadDir = path.join(rootDir, "uploads");
const logDir = path.join(rootDir, "logs");
const auditLogFile = path.join(logDir, "audit.jsonl");

// Ensure directories exist
try {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
} catch (err) {
  console.warn("Could not create directories:", err);
}

// In-memory registry of uploaded images
export const imageStore = new Map<string, UploadMetadata>();
export const auditLogs: AuditLogEntry[] = [];

export interface UserAccount {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  salt: string;
  role: string;
  organization?: string;
  createdAt: string;
}

export interface PasswordResetToken {
  email: string;
  code: string;
  expiresAt: number;
}

export const userStore = new Map<string, UserAccount>();
export const sessionStore = new Map<string, { userId: string; email: string; createdAt: number }>();
export const resetTokenStore = new Map<string, PasswordResetToken>();

export function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const s = salt || crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, s, 1000, 64, "sha512").toString("hex");
  return { hash, salt: s };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const result = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return result === hash;
}

// Seed default users
function seedDefaultUsers(): void {
  const defaultAccounts = [
    {
      email: "varunsoniff2007@gmail.com",
      name: "Varun Soni",
      role: "Lead Remote Sensing Scientist",
      organization: "SatQuery Research Lab",
      password: "Password123!",
    },
    {
      email: "analyst@satquery.ai",
      name: "Earth Observation Analyst",
      role: "Mission Operator",
      organization: "Copernicus Geospatial Hub",
      password: "Password123!",
    },
  ];

  for (const acc of defaultAccounts) {
    const { hash, salt } = hashPassword(acc.password);
    userStore.set(acc.email.toLowerCase(), {
      id: `usr-${crypto.randomBytes(4).toString("hex")}`,
      email: acc.email.toLowerCase(),
      name: acc.name,
      passwordHash: hash,
      salt,
      role: acc.role,
      organization: acc.organization,
      createdAt: new Date().toISOString(),
    });
  }
}

seedDefaultUsers();

// Helper to seed sample satellite image if present
export function initSampleImages(): void {
  const samples = [
    {
      id: "sample-sentinel-2",
      filename: "sentinel2_sample.png",
      displayName: "sentinel2_agriculture_river.png",
    },
    {
      id: "sample-urban-coastal",
      filename: "urban_coastal.png",
      displayName: "landsat8_urban_coastal_port.png",
    },
    {
      id: "sample-forest-wildfire",
      filename: "forest_wildfire.png",
      displayName: "sentinel2_forest_burnscar.png",
    },
    {
      id: "sample-flood-pre",
      filename: "flood_pre.jpg",
      displayName: "sentinel2_flood_pre_disaster.jpg",
    },
    {
      id: "sample-flood-post",
      filename: "flood_post.jpg",
      displayName: "sentinel2_flood_post_inundation.jpg",
    },
    {
      id: "sample-forest-pre",
      filename: "forest_pre.jpg",
      displayName: "sentinel2_forest_pre_fire.jpg",
    },
    {
      id: "sample-forest-post",
      filename: "forest_post.jpg",
      displayName: "sentinel2_forest_post_burn.jpg",
    },
    {
      id: "sample-crop-pre",
      filename: "crop_pre.jpg",
      displayName: "sentinel2_crop_early_season.jpg",
    },
    {
      id: "sample-crop-post",
      filename: "crop_post.jpg",
      displayName: "sentinel2_crop_peak_harvest.jpg",
    },
    {
      id: "sample-sentinel2-hd",
      filename: "sentinel2_hd.jpg",
      displayName: "sentinel2_hd_cropland.jpg",
    },
    {
      id: "sample-test-satellite",
      filename: "test_satellite.png",
      displayName: "landsat_surface_features.png",
    },
  ];

  for (const item of samples) {
    try {
      const samplePath = path.join(rootDir, "public", item.filename);
      if (fs.existsSync(samplePath)) {
        const buffer = fs.readFileSync(samplePath);
        const sha256 = crypto.createHash("sha256").update(buffer).digest("hex");
        const sampleMeta: UploadMetadata = {
          image_id: item.id,
          filename: item.filename,
          original_filename: item.displayName,
          size: buffer.length,
          mime_type: "image/png",
          sha256,
          path: samplePath,
          data_url: `data:image/png;base64,${buffer.toString("base64")}`,
          uploaded_at: new Date().toISOString(),
        };
        imageStore.set(item.id, sampleMeta);
      }
    } catch (err) {
      console.warn(`Failed to seed ${item.filename}:`, err);
    }
  }
}

export function getImageBuffer(imageId: string): { buffer: Buffer; mimeType: string; filename: string } | null {
  const meta = imageStore.get(imageId);
  if (meta && meta.path && fs.existsSync(meta.path)) {
    try {
      const buffer = fs.readFileSync(meta.path);
      return {
        buffer,
        mimeType: meta.mime_type || "image/png",
        filename: meta.original_filename || meta.filename,
      };
    } catch (err) {
      console.warn("Failed to read image from path:", err);
    }
  }

  // Check public folder directly by name or id
  const publicCandidate = path.join(rootDir, "public", imageId.endsWith(".png") ? imageId : `${imageId}.png`);
  if (fs.existsSync(publicCandidate)) {
    try {
      const buffer = fs.readFileSync(publicCandidate);
      return {
        buffer,
        mimeType: "image/png",
        filename: path.basename(publicCandidate),
      };
    } catch (err) {
      console.warn("Failed to read public image:", err);
    }
  }

  return null;
}

export function logEvent(event: string, meta: Record<string, unknown> = {}): void {
  const entry: AuditLogEntry = {
    timestamp: new Date().toISOString(),
    level: "INFO",
    event,
    ...meta,
  };

  auditLogs.unshift(entry);
  if (auditLogs.length > 500) {
    auditLogs.pop();
  }

  // Also write to audit.jsonl
  try {
    fs.appendFileSync(auditLogFile, JSON.stringify(entry) + "\n", "utf-8");
  } catch {
    // In-memory fallback is fine
  }
}

export function getAuditLogs(limit = 100): AuditLogEntry[] {
  return auditLogs.slice(0, limit);
}
