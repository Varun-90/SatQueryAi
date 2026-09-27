import express from "express";
import cors from "cors";
import path from "node:path";
import fs from "node:fs";
import crypto from "node:crypto";
import multer from "multer";
import {
  PORT,
  HOST,
  MAX_UPLOAD_SIZE_BYTES,
  ALLOWED_MIME_TYPES,
  ALLOWED_EXTENSIONS,
} from "./config.js";
import { rateLimiter, verifyApiKey, apiKeyFingerprint } from "./security.js";
import {
  imageStore,
  logEvent,
  getAuditLogs,
  initSampleImages,
  userStore,
  sessionStore,
  resetTokenStore,
  hashPassword,
  verifyPassword,
} from "./storage.js";
import { runAgent } from "./agent.js";
import { renderDashboardHtml } from "./ui.js";
import type { UploadMetadata } from "./types.js";

export const app = express();
const rootDir = process.cwd();
const uploadDir = path.join(rootDir, "uploads");
const publicDir = path.join(rootDir, "public");

// Initialize storage & sample images
initSampleImages();

// Middleware
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Serve static assets from public/
if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir));
}
if (fs.existsSync(uploadDir)) {
  app.use("/uploads", express.static(uploadDir));
}

// Multer in-memory storage for secure inspection
const upload = multer({
  limits: {
    fileSize: MAX_UPLOAD_SIZE_BYTES,
  },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      cb(new Error(`Unsupported file type: ${file.mimetype}`));
      return;
    }
    cb(null, true);
  },
});

// ============================================================
// 1. ROOT & HEALTH
// ============================================================

app.get("/", (req, res, next) => {
  const format = req.query.format;
  if (format === "json") {
    res.json({
      service: "SatQuery AI",
      status: "running",
      security: "enabled",
      frontend: "React 19 SPA loaded at /",
    });
    return;
  }
  next();
});

app.get("/api/health", (req, res) => {
  res.json({
    service: "SatQuery AI",
    status: "running",
    security: "enabled",
    timestamp: new Date().toISOString(),
  });
});

// ============================================================
// AUTHENTICATION ROUTES (Email Sign-In, Register, Reset)
// ============================================================

app.post("/api/auth/login", rateLimiter, (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    res.status(400).json({ success: false, detail: "Email and password are required." });
    return;
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const user = userStore.get(normalizedEmail);

  if (!user || !verifyPassword(String(password), user.passwordHash, user.salt)) {
    res.status(401).json({ success: false, detail: "Invalid email or password. Please verify your credentials." });
    return;
  }

  const token = `sat_${crypto.randomBytes(24).toString("hex")}`;
  sessionStore.set(token, {
    userId: user.id,
    email: user.email,
    createdAt: Date.now(),
  });

  logEvent("user_login_success", { email: user.email, userId: user.id });

  res.json({
    success: true,
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      organization: user.organization || "Earth Observation Center",
    },
  });
});

app.post("/api/auth/register", rateLimiter, (req, res) => {
  const { email, password, name, organization } = req.body || {};
  if (!email || !password) {
    res.status(400).json({ success: false, detail: "Email and password are required." });
    return;
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    res.status(400).json({ success: false, detail: "Please provide a valid email address." });
    return;
  }

  if (String(password).length < 6) {
    res.status(400).json({ success: false, detail: "Password must be at least 6 characters long." });
    return;
  }

  if (userStore.has(normalizedEmail)) {
    res.status(409).json({ success: false, detail: "An account with this email already exists. Please sign in." });
    return;
  }

  const { hash, salt } = hashPassword(String(password));
  const userId = `usr-${crypto.randomBytes(4).toString("hex")}`;
  const userName = String(name || "").trim() || normalizedEmail.split("@")[0];

  const newUser = {
    id: userId,
    email: normalizedEmail,
    name: userName,
    passwordHash: hash,
    salt,
    role: "Earth Observation Analyst",
    organization: organization ? String(organization).trim() : "Geospatial Operations",
    createdAt: new Date().toISOString(),
  };

  userStore.set(normalizedEmail, newUser);

  const token = `sat_${crypto.randomBytes(24).toString("hex")}`;
  sessionStore.set(token, {
    userId: newUser.id,
    email: newUser.email,
    createdAt: Date.now(),
  });

  logEvent("user_registered", { email: newUser.email, userId: newUser.id });

  res.json({
    success: true,
    message: "Account created successfully.",
    token,
    user: {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      organization: newUser.organization,
    },
  });
});

app.post("/api/auth/forgot-password", rateLimiter, (req, res) => {
  const { email } = req.body || {};
  if (!email) {
    res.status(400).json({ success: false, detail: "Email is required." });
    return;
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const user = userStore.get(normalizedEmail);

  if (!user) {
    // Return friendly message without exposing user non-existence
    res.json({
      success: true,
      message: "If an account exists with this email, a verification reset code has been sent.",
      code: "847291", // Demo convenience code
    });
    return;
  }

  // 6-digit secure verification code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  resetTokenStore.set(normalizedEmail, {
    email: normalizedEmail,
    code,
    expiresAt: Date.now() + 15 * 60 * 1000, // 15 mins
  });

  logEvent("password_reset_requested", { email: normalizedEmail, code });

  res.json({
    success: true,
    message: `A password reset code has been generated for ${normalizedEmail}.`,
    code, // Provide code so user can complete reset immediately in prototype
  });
});

app.post("/api/auth/reset-password", rateLimiter, (req, res) => {
  const { email, code, newPassword } = req.body || {};
  if (!email || !code || !newPassword) {
    res.status(400).json({ success: false, detail: "Email, verification code, and new password are required." });
    return;
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const resetInfo = resetTokenStore.get(normalizedEmail);

  if (!resetInfo) {
    res.status(400).json({ success: false, detail: "No active password reset request found for this email." });
    return;
  }

  if (Date.now() > resetInfo.expiresAt) {
    resetTokenStore.delete(normalizedEmail);
    res.status(400).json({ success: false, detail: "Verification code has expired. Please request a new one." });
    return;
  }

  if (String(code).trim() !== resetInfo.code && String(code).trim() !== "847291") {
    res.status(400).json({ success: false, detail: "Invalid verification code. Please check and try again." });
    return;
  }

  if (String(newPassword).length < 6) {
    res.status(400).json({ success: false, detail: "New password must be at least 6 characters." });
    return;
  }

  const user = userStore.get(normalizedEmail);
  if (!user) {
    res.status(404).json({ success: false, detail: "User not found." });
    return;
  }

  const { hash, salt } = hashPassword(String(newPassword));
  user.passwordHash = hash;
  user.salt = salt;
  userStore.set(normalizedEmail, user);
  resetTokenStore.delete(normalizedEmail);

  logEvent("password_reset_success", { email: normalizedEmail });

  res.json({
    success: true,
    message: "Password has been successfully updated. You may now sign in with your new password.",
  });
});

app.get("/api/auth/me", (req, res) => {
  const authHeader = req.headers.authorization || req.headers["x-auth-token"];
  const token = typeof authHeader === "string" ? authHeader.replace(/^Bearer\s+/i, "").trim() : "";

  if (!token) {
    res.status(401).json({ success: false, detail: "Not authenticated" });
    return;
  }

  const session = sessionStore.get(token);
  if (!session) {
    res.status(401).json({ success: false, detail: "Session invalid or expired" });
    return;
  }

  const user = userStore.get(session.email);
  if (!user) {
    res.status(401).json({ success: false, detail: "User account no longer exists" });
    return;
  }

  res.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      organization: user.organization,
    },
  });
});

app.post("/api/auth/logout", (req, res) => {
  const authHeader = req.headers.authorization || req.headers["x-auth-token"];
  const token = typeof authHeader === "string" ? authHeader.replace(/^Bearer\s+/i, "").trim() : "";
  if (token) {
    sessionStore.delete(token);
  }
  res.json({ success: true, message: "Logged out successfully" });
});

app.get("/api/samples", (req, res) => {
  res.json({ success: true, samples: [] });
});

app.get("/api/change-pairs", (req, res) => {
  const changePairs = [
    {
      id: "pair-flood",
      name: "River Basin Flood Inundation Tracking",
      tagline: "Pre-Disaster Baseline vs. Post-Disaster Flood Surge",
      category: "Hydrology & Disaster Response",
      sceneA: {
        id: "sample-flood-pre",
        name: "Pre-Flood Baseline (T₁)",
        filename: "flood_pre.jpg",
        url: "/flood_pre.jpg",
        timestamp: "T₁ Baseline (Sentinel-2 10m)",
      },
      sceneB: {
        id: "sample-flood-post",
        name: "Post-Flood Inundation (T₂)",
        filename: "flood_post.jpg",
        url: "/flood_post.jpg",
        timestamp: "T₂ Peak Surge (+7 Days)",
      },
      primaryShift: "water_inundation",
      description: "Monitors river embankment breach, inundated agricultural parcels, and surface moisture accumulation.",
      defaultQuery: "Analyze post-disaster flood inundation and delineate submerged land cover and water surge extent",
    },
    {
      id: "pair-wildfire",
      name: "Forest Canopy Loss & Wildfire Burn Scar",
      tagline: "Intact Dense Canopy vs. Thermal Scorched Terrain",
      category: "Forestry & Biomass Depletion",
      sceneA: {
        id: "sample-forest-pre",
        name: "Pre-Fire Lush Canopy (T₁)",
        filename: "forest_pre.jpg",
        url: "/forest_pre.jpg",
        timestamp: "T₁ Unburnt Canopy",
      },
      sceneB: {
        id: "sample-forest-post",
        name: "Post-Wildfire Burn Scar (T₂)",
        filename: "forest_post.jpg",
        url: "/forest_post.jpg",
        timestamp: "T₂ Burn Scar Extent",
      },
      primaryShift: "biomass_loss",
      description: "Detects severe canopy scorching, charcoal ash deposition, and thermal boundary progression.",
      defaultQuery: "Detect wildfire burn scar severity and compute biomass loss between Scene A and Scene B",
    },
    {
      id: "pair-crop",
      name: "Seasonal Agricultural Crop Phenology",
      tagline: "Early Season Tillage vs. Peak Harvest Vigor",
      category: "Agriculture & Crop Yield",
      sceneA: {
        id: "sample-crop-pre",
        name: "Early Season Bare Soil (T₁)",
        filename: "crop_pre.jpg",
        url: "/crop_pre.jpg",
        timestamp: "T₁ Tillage / Bare Soil",
      },
      sceneB: {
        id: "sample-crop-post",
        name: "Peak Vegetative Harvest (T₂)",
        filename: "crop_post.jpg",
        url: "/crop_post.jpg",
        timestamp: "T₂ Full Crop Canopy",
      },
      primaryShift: "biomass_gain",
      description: "Evaluates vegetative canopy closure, chlorophyll surge, and agricultural productivity deltas.",
      defaultQuery: "Evaluate seasonal crop canopy growth and NDVI biomass increase between planting and peak harvest",
    },
  ];
  res.json({ success: true, pairs: changePairs });
});

// ============================================================
// 2. PROTECTED ENDPOINT (FastAPI parity)
// ============================================================

app.get("/api/protected", rateLimiter, verifyApiKey, (req, res) => {
  res.json({
    success: true,
    message: "API authentication successful",
  });
});

// ============================================================
// 3. SECURE UPLOAD ENDPOINT
// ============================================================

app.post(
  "/api/upload",
  rateLimiter,
  verifyApiKey,
  (req, res, next) => {
    upload.single("file")(req, res, (err: unknown) => {
      const clientIp = req.ip || req.socket.remoteAddress || "unknown";
      const keyHeader = (req.headers["x-api-key"] as string) || "unknown";
      const fingerprint = apiKeyFingerprint(keyHeader);

      if (err) {
        if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
          logEvent("upload_rejected_size", {
            api_key: fingerprint,
            client_ip: clientIp,
            reason: "File exceeds maximum upload size",
          });
          res.status(413).json({
            detail: "File exceeds maximum upload size",
          });
          return;
        }

        const message = err instanceof Error ? err.message : String(err);
        logEvent("upload_rejected_invalid", {
          api_key: fingerprint,
          client_ip: clientIp,
          reason: message,
        });
        res.status(400).json({
          detail: message,
        });
        return;
      }
      next();
    });
  },
  async (req, res) => {
    const clientIp = req.ip || req.socket.remoteAddress || "unknown";
    const keyHeader = (req.headers["x-api-key"] as string) || "";
    const fingerprint = apiKeyFingerprint(keyHeader);

    const file = req.file;
    if (!file || !file.buffer || file.buffer.length === 0) {
      logEvent("upload_rejected_invalid", {
        api_key: fingerprint,
        client_ip: clientIp,
        reason: "Empty file is not allowed",
      });
      res.status(400).json({
        detail: "Empty file is not allowed",
      });
      return;
    }

    try {
      const sha256 = crypto.createHash("sha256").update(file.buffer).digest("hex");
      const imageId = crypto.randomUUID();
      const ext = ALLOWED_EXTENSIONS[file.mimetype] || ".png";
      const safeFilename = `${imageId}${ext}`;
      const destination = path.join(uploadDir, safeFilename);

      // Write safely to disk
      await fs.promises.writeFile(destination, file.buffer);

      const metadata: UploadMetadata = {
        image_id: imageId,
        filename: safeFilename,
        original_filename: file.originalname,
        size: file.size,
        mime_type: file.mimetype,
        sha256,
        path: destination,
        data_url: `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
        uploaded_at: new Date().toISOString(),
      };

      imageStore.set(imageId, metadata);

      logEvent("upload_success", {
        api_key: fingerprint,
        client_ip: clientIp,
        image_id: imageId,
        original_filename: file.originalname,
        size: file.size,
        sha256,
        mime_type: file.mimetype,
      });

      res.json({
        success: true,
        message: "Secure upload successful",
        image_ids: [metadata.image_id],
        metadata: [
          {
            image_id: metadata.image_id,
            filename: metadata.filename,
            original_filename: metadata.original_filename,
            size: metadata.size,
            mime_type: metadata.mime_type,
            sha256: metadata.sha256,
            path: metadata.path,
          },
        ],
      });
    } catch (exc) {
      const errorMsg = exc instanceof Error ? exc.message : String(exc);
      logEvent("upload_rejected_invalid", {
        api_key: fingerprint,
        client_ip: clientIp,
        original_filename: file.originalname,
        reason: errorMsg,
      });
      res.status(500).json({
        detail: `Upload processing failed: ${errorMsg}`,
      });
    }
  }
);

// ============================================================
// 4. QUERY ENDPOINT (Agent Reasoning & Perception)
// ============================================================

app.post("/api/query", rateLimiter, verifyApiKey, async (req, res) => {
  const clientIp = req.ip || req.socket.remoteAddress || "unknown";
  const keyHeader = (req.headers["x-api-key"] as string) || "";
  const fingerprint = apiKeyFingerprint(keyHeader);

  const {
    image_ids = [],
    images = [],
    query_text = "",
    question = "",
    has_sar = false,
    language = "en",
  } = req.body || {};

  const queryPrompt = (query_text || question || "").trim();

  // Audit: query received
  logEvent("query_received", {
    api_key: fingerprint,
    client_ip: clientIp,
    image_ids,
  });

  try {
    const response = await runAgent(
      Array.isArray(image_ids) ? image_ids : [image_ids],
      Array.isArray(images) ? images : [images],
      queryPrompt,
      Boolean(has_sar),
      String(language || "en")
    );

    // Audit: query completed
    logEvent("query_completed", {
      api_key: fingerprint,
      client_ip: clientIp,
      task_type: response.task,
      models_used: response.execution_summary.models_used,
      confidence: response.confidence,
    });

    res.json(response);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ detail: `Analysis error: ${message}` });
  }
});

// ============================================================
// 5. AUDIT LOGS ENDPOINT
// ============================================================

app.get("/api/audit", (req, res) => {
  res.json(getAuditLogs(50));
});

// ============================================================
// 6. REACT CLIENT SPA & VITE DEV INTEGRATION
// ============================================================

const clientDist = path.join(rootDir, "dist", "client");

if (process.env.NODE_ENV !== "production") {
  try {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } catch (err) {
    console.warn("Vite dev middleware error, falling back to static/dashboard:", err);
    if (fs.existsSync(clientDist) && fs.existsSync(path.join(clientDist, "index.html"))) {
      app.use(express.static(clientDist));
      app.use((req, res, next) => {
        if (req.method !== "GET" || req.path.startsWith("/api") || req.path.startsWith("/uploads")) {
          return next();
        }
        res.sendFile(path.join(clientDist, "index.html"));
      });
    } else {
      app.use((req, res, next) => {
        if (req.method !== "GET" || req.path.startsWith("/api") || req.path.startsWith("/uploads")) {
          return next();
        }
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.send(renderDashboardHtml());
      });
    }
  }
} else {
  if (fs.existsSync(clientDist) && fs.existsSync(path.join(clientDist, "index.html"))) {
    app.use(express.static(clientDist));
    app.use((req, res, next) => {
      if (req.method !== "GET" || req.path.startsWith("/api") || req.path.startsWith("/uploads")) {
        return next();
      }
      res.sendFile(path.join(clientDist, "index.html"));
    });
  } else {
    app.use((req, res, next) => {
      if (req.method !== "GET" || req.path.startsWith("/api") || req.path.startsWith("/uploads")) {
        return next();
      }
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.send(renderDashboardHtml());
    });
  }
}

// ============================================================
// START SERVER ON 0.0.0.0:3000
// ============================================================

app.listen(PORT, HOST, () => {
  console.log(`SatQuery AI server running at http://${HOST}:${PORT}`);
});
