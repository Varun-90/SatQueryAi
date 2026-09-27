export const PORT = Number(process.env.PORT || 3000);
export const HOST = "0.0.0.0";

export const MASTER_API_KEY = process.env.MASTER_API_KEY || "satquery-demo-secret";

export const RATE_LIMIT_PER_MINUTE = parseInt(
  process.env.RATE_LIMIT_PER_MINUTE || "60",
  10
);

export const MAX_UPLOAD_SIZE_MB = parseInt(
  process.env.MAX_UPLOAD_SIZE_MB || "50",
  10
);

export const MAX_UPLOAD_SIZE_BYTES = MAX_UPLOAD_SIZE_MB * 1024 * 1024;

export const ALLOWED_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/tiff",
  "image/tif",
]);

export const ALLOWED_EXTENSIONS: Record<string, string> = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/tiff": ".tif",
  "image/tif": ".tif",
};
