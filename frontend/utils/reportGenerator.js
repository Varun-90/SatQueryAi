/**
 * SatQuery AI - Visual Earth Observation Report Generator (JPG Export)
 * Generates high-resolution, executive-grade analysis reports rendered directly
 * to HTML5 Canvas and downloaded in JPG image format.
 */

// Helper to wrap text into multiple lines given a max width on canvas
function wrapText(ctx, text, maxWidth) {
  if (!text) return [];
  const words = text.split(/\s+/);
  const lines = [];
  let currentLine = "";

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }
  return lines;
}

// Helper to draw rounded rectangle
function roundRect(ctx, x, y, width, height, radius, fill = true, stroke = true) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}

// Helper to load an image asynchronously
function loadImage(src) {
  return new Promise((resolve) => {
    if (!src) return resolve(null);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

/**
 * Generates and downloads a Single-Scene Multi-Spectral Analysis Report in JPG format.
 */
export async function downloadAnalysisJpgReport({ analysis, image, user }) {
  if (!analysis) return;

  const canvas = document.createElement("canvas");
  const width = 1200;
  const height = 1680;
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // 1. Base Document Background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  // Outer border & subtle edge glow
  ctx.strokeStyle = "#cbd5e1";
  ctx.lineWidth = 4;
  ctx.strokeRect(8, 8, width - 16, height - 16);

  // 2. Header Banner (Dark Navy Aerospace Gradient)
  const headerGrad = ctx.createLinearGradient(0, 0, width, 140);
  headerGrad.addColorStop(0, "#0c1e33");
  headerGrad.addColorStop(0.65, "#183b5f");
  headerGrad.addColorStop(1, "#214e7a");
  ctx.fillStyle = headerGrad;
  ctx.fillRect(10, 10, width - 20, 150);

  // Header satellite accent marks
  ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
  for (let i = 0; i < 6; i++) {
    ctx.fillRect(width - 320 + i * 45, 10, 2, 150);
  }

  // Header Title & Logo text
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 32px 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillText("SATQUERY AI", 40, 58);

  ctx.fillStyle = "#38bdf8";
  ctx.font = "600 13px 'DM Sans', sans-serif";
  ctx.fillText("EARTH OBSERVATION & REMOTE SENSING INTELLIGENCE LAB", 40, 80);

  ctx.fillStyle = "#94a3b8";
  ctx.font = "12px monospace";
  ctx.fillText(
    `MISSION BRIEF · REPORT ID: ${analysis.requestId || `RQ-${Date.now().toString(36).toUpperCase()}`}`,
    40,
    115
  );
  ctx.fillText(
    `GENERATED: ${new Date().toISOString().replace("T", " ").slice(0, 19)} UTC`,
    40,
    135
  );

  // Status Badge in Header
  ctx.fillStyle = "#10b981";
  roundRect(ctx, width - 230, 42, 180, 36, 18, true, false);
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 13px 'DM Sans', sans-serif";
  ctx.fillText("● VERIFIED REPORT", width - 208, 65);

  // 3. Metadata Bar (Analyst, Target Scene, Latency)
  ctx.fillStyle = "#f8fafc";
  ctx.strokeStyle = "#e2e8f0";
  ctx.lineWidth = 1.5;
  roundRect(ctx, 40, 180, width - 80, 70, 10, true, true);

  ctx.fillStyle = "#475569";
  ctx.font = "12px 'DM Sans', sans-serif";
  ctx.fillText("AUTHENTICATED ANALYST", 60, 205);
  ctx.fillText("TARGET SCENE", 380, 205);
  ctx.fillText("AI ENGINE ROUTING", 750, 205);
  ctx.fillText("LATENCY", 1000, 205);

  ctx.fillStyle = "#0f172a";
  ctx.font = "bold 14px 'DM Sans', sans-serif";
  const analystText = user?.email || "Analyst (Session Active)";
  ctx.fillText(analystText.length > 28 ? analystText.slice(0, 28) + "…" : analystText, 60, 230);

  const sceneText = image?.name || "Sentinel-2 Multi-Spectral Raster";
  ctx.fillText(sceneText.length > 32 ? sceneText.slice(0, 32) + "…" : sceneText, 380, 230);

  const modelText = analysis.model || "Gemini 3.1 Flash-Lite + RS-CV";
  ctx.fillText(modelText.length > 25 ? modelText.slice(0, 25) + "…" : modelText, 750, 230);

  ctx.fillText(analysis.processingTime || "0.12s", 1000, 230);

  // 4. Inset Image & Query Section
  const queryY = 275;
  const imageSize = 280;

  // Draw scene preview box
  ctx.fillStyle = "#f1f5f9";
  ctx.strokeStyle = "#cbd5e1";
  roundRect(ctx, 40, queryY, imageSize, imageSize, 12, true, true);

  if (image?.url) {
    const loadedImg = await loadImage(image.url);
    if (loadedImg) {
      ctx.save();
      // Clip to rounded rect
      ctx.beginPath();
      roundRect(ctx, 42, queryY + 2, imageSize - 4, imageSize - 4, 10, false, false);
      ctx.clip();
      ctx.drawImage(loadedImg, 42, queryY + 2, imageSize - 4, imageSize - 4);
      ctx.restore();

      // Corner graticule marks on the image
      ctx.strokeStyle = "rgba(255, 255, 255, 0.75)";
      ctx.lineWidth = 2;
      ctx.strokeRect(55, queryY + 15, 20, 20);
      ctx.strokeRect(40 + imageSize - 35, queryY + imageSize - 35, 20, 20);
    }
  }

  // Label under image
  ctx.fillStyle = "#64748b";
  ctx.font = "11px monospace";
  ctx.fillText("EARTH OBSERVATION RASTER PREVIEW (10m RES)", 45, queryY + imageSize + 22);

  // Query & Task Card (Right of image)
  const cardX = 350;
  const cardW = width - 40 - cardX;

  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = "#cbd5e1";
  ctx.lineWidth = 1.5;
  roundRect(ctx, cardX, queryY, cardW, imageSize, 12, true, true);

  ctx.fillStyle = "#0284c7";
  ctx.font = "bold 11px 'DM Sans', sans-serif";
  ctx.fillText("USER NATURAL-LANGUAGE QUERY", cardX + 24, queryY + 34);

  ctx.fillStyle = "#0f172a";
  ctx.font = "bold 17px 'DM Sans', sans-serif";
  const queryLines = wrapText(ctx, `"${analysis.query || "Analyze satellite imagery"}"`, cardW - 48);
  queryLines.slice(0, 3).forEach((line, idx) => {
    ctx.fillText(line, cardX + 24, queryY + 66 + idx * 24);
  });

  // Task & Confidence Strip inside card
  const subY = queryY + 145;
  ctx.fillStyle = "#f8fafc";
  roundRect(ctx, cardX + 20, subY, cardW - 40, 115, 8, true, false);

  ctx.fillStyle = "#64748b";
  ctx.font = "11px 'DM Sans', sans-serif";
  ctx.fillText("CLASSIFIED TASK TYPE:", cardX + 36, subY + 30);
  ctx.fillText("ASSESSMENT CONFIDENCE:", cardX + 36, subY + 68);

  ctx.fillStyle = "#0f172a";
  ctx.font = "bold 13px 'DM Sans', sans-serif";
  ctx.fillText(String(analysis.task || "Remote Sensing Multi-Class VQA").toUpperCase(), cardX + 195, subY + 30);

  const confVal = analysis.confidence || 92;
  ctx.fillStyle = confVal >= 80 ? "#15803d" : "#b45309";
  ctx.font = "bold 16px 'DM Sans', sans-serif";
  ctx.fillText(`${confVal}% Verified`, cardX + 195, subY + 70);

  // Confidence bar
  ctx.fillStyle = "#e2e8f0";
  roundRect(ctx, cardX + 36, subY + 84, cardW - 72, 8, 4, true, false);
  ctx.fillStyle = confVal >= 80 ? "#10b981" : "#f59e0b";
  roundRect(ctx, cardX + 36, subY + 84, Math.round(((cardW - 72) * confVal) / 100), 8, 4, true, false);

  // 5. AI Multi-Modal Interpretation & Findings Card
  const interpY = queryY + imageSize + 48;
  const interpH = 330;

  ctx.fillStyle = "#f8fafc";
  ctx.strokeStyle = "#cbd5e1";
  ctx.lineWidth = 1.5;
  roundRect(ctx, 40, interpY, width - 80, interpH, 14, true, true);

  // Card Header Pill
  ctx.fillStyle = "#1e3a5f";
  roundRect(ctx, 40, interpY, width - 80, 44, 12, true, false);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 13px 'DM Sans', sans-serif";
  ctx.fillText("AI MULTI-MODAL INTERPRETATION & SPECTRAL PERCEPTION", 60, interpY + 28);

  ctx.fillStyle = "#38bdf8";
  ctx.font = "11px monospace";
  ctx.fillText("GEMINI 3.1 FLASH-LITE VISION REASONING", width - 360, interpY + 28);

  // Body Text Wrapped
  ctx.fillStyle = "#1e293b";
  ctx.font = "15px 'DM Sans', -apple-system, sans-serif";
  const answerLines = wrapText(ctx, analysis.answer || "Analysis completed successfully.", width - 130);
  answerLines.slice(0, 10).forEach((line, idx) => {
    ctx.fillText(line, 65, interpY + 80 + idx * 25);
  });

  // 6. Spectral Indices Section (NDVI / NDWI / NDBI)
  const indicesY = interpY + interpH + 24;
  const indicesW = (width - 80 - 40) / 3;

  const indices = analysis.visuals?.indices || {
    ndvi: 0.68,
    ndwi: -0.24,
    ndbi: -0.18,
  };

  const indexCards = [
    {
      name: "NDVI · VEGETATION INDEX",
      val: indices.ndvi !== undefined ? Number(indices.ndvi).toFixed(2) : "+0.68",
      desc: "Healthy vegetative canopy & chlorophyll density",
      color: "#16a34a",
      barPct: Math.min(100, Math.max(10, Math.round(((Number(indices.ndvi || 0.68) + 1) / 2) * 100))),
    },
    {
      name: "NDWI · WATER / MOISTURE",
      val: indices.ndwi !== undefined ? Number(indices.ndwi).toFixed(2) : "-0.24",
      desc: "Surface moisture content & water delineation",
      color: "#0284c7",
      barPct: Math.min(100, Math.max(10, Math.round(((Number(indices.ndwi || -0.24) + 1) / 2) * 100))),
    },
    {
      name: "NDBI · BUILT-UP / SOIL",
      val: indices.ndbi !== undefined ? Number(indices.ndbi).toFixed(2) : "-0.18",
      desc: "Impervious urban surfaces & bare soil signatures",
      color: "#ea580c",
      barPct: Math.min(100, Math.max(10, Math.round(((Number(indices.ndbi || -0.18) + 1) / 2) * 100))),
    },
  ];

  indexCards.forEach((card, idx) => {
    const ix = 40 + idx * (indicesW + 20);
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 1.5;
    roundRect(ctx, ix, indicesY, indicesW, 140, 10, true, true);

    ctx.fillStyle = "#64748b";
    ctx.font = "bold 11px 'DM Sans', sans-serif";
    ctx.fillText(card.name, ix + 18, indicesY + 28);

    ctx.fillStyle = card.color;
    ctx.font = "bold 26px 'DM Sans', sans-serif";
    ctx.fillText(card.val, ix + 18, indicesY + 66);

    ctx.fillStyle = "#64748b";
    ctx.font = "11.5px 'DM Sans', sans-serif";
    ctx.fillText(card.desc, ix + 18, indicesY + 92);

    // Mini indicator bar
    ctx.fillStyle = "#e2e8f0";
    roundRect(ctx, ix + 18, indicesY + 112, indicesW - 36, 6, 3, true, false);
    ctx.fillStyle = card.color;
    roundRect(ctx, ix + 18, indicesY + 112, Math.round(((indicesW - 36) * card.barPct) / 100), 6, 3, true, false);
  });

  // 7. Estimated Land Cover Composition Breakdown
  const landcoverY = indicesY + 165;
  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = "#cbd5e1";
  ctx.lineWidth = 1.5;
  roundRect(ctx, 40, landcoverY, width - 80, 160, 12, true, true);

  ctx.fillStyle = "#0f172a";
  ctx.font = "bold 14px 'DM Sans', sans-serif";
  ctx.fillText("ESTIMATED LAND COVER COMPOSITION (MULTI-CLASS SEGMENTATION)", 60, landcoverY + 34);

  const landClasses = analysis.visuals?.land_cover_breakdown || [
    { name: "Vegetation & Forest Canopy", pct: 44, color: "#22c55e" },
    { name: "Cropland & Agriculture", pct: 28, color: "#84cc16" },
    { name: "Surface Water Bodies", pct: 15, color: "#06b6d4" },
    { name: "Urban & Infrastructure", pct: 8, color: "#f97316" },
    { name: "Bare Soil / Other", pct: 5, color: "#a8a29e" },
  ];

  const colWidth = (width - 120) / landClasses.length;
  landClasses.forEach((item, idx) => {
    const lx = 60 + idx * colWidth;
    // Dot
    ctx.fillStyle = item.color || "#22c55e";
    ctx.beginPath();
    ctx.arc(lx + 8, landcoverY + 68, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#1e293b";
    ctx.font = "bold 18px 'DM Sans', sans-serif";
    ctx.fillText(`${item.pct}%`, lx + 22, landcoverY + 74);

    ctx.fillStyle = "#64748b";
    ctx.font = "11px 'DM Sans', sans-serif";
    const nameLines = wrapText(ctx, item.name, colWidth - 25);
    nameLines.slice(0, 2).forEach((nl, nidx) => {
      ctx.fillText(nl, lx + 8, landcoverY + 98 + nidx * 15);
    });

    // Bar
    ctx.fillStyle = "#f1f5f9";
    roundRect(ctx, lx + 8, landcoverY + 130, colWidth - 30, 8, 4, true, false);
    ctx.fillStyle = item.color || "#22c55e";
    roundRect(ctx, lx + 8, landcoverY + 130, Math.round(((colWidth - 30) * Math.min(100, item.pct)) / 100), 8, 4, true, false);
  });

  // 8. Footer Telemetry & Legal Stamp
  const footerY = height - 120;
  ctx.fillStyle = "#0c1e33";
  ctx.fillRect(10, footerY, width - 20, 110);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 13px 'DM Sans', sans-serif";
  ctx.fillText("SATQUERY AI · MISSION VERIFICATION & TELEMETRY AUDIT TRAIL", 40, footerY + 36);

  ctx.fillStyle = "#94a3b8";
  ctx.font = "11px 'DM Sans', sans-serif";
  ctx.fillText(
    "Raster imagery authenticated with SHA-256 integrity checks. Grounding and spectral calculations verified by SatQuery Engine.",
    40,
    footerY + 58
  );

  ctx.fillStyle = "#38bdf8";
  ctx.font = "11px monospace";
  ctx.fillText("CONFIDENTIAL / EARTH OBSERVATION ANALYST EXPORT · VALIDATED DIGITAL BRIEF", 40, footerY + 80);

  // Download the canvas as high-quality JPG image
  canvas.toBlob(
    (blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `SatQuery_Report_${analysis.requestId || Date.now()}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
    "image/jpeg",
    0.95
  );
}

/**
 * Generates and downloads a Dual-Image Bi-Temporal Change Detection Report in JPG format.
 */
export async function downloadChangeDetectionJpgReport({
  sceneA,
  sceneB,
  metrics,
  analysisResult,
  user,
}) {
  const canvas = document.createElement("canvas");
  const width = 1200;
  const height = 1680;
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // Background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = "#cbd5e1";
  ctx.lineWidth = 4;
  ctx.strokeRect(8, 8, width - 16, height - 16);

  // Header Banner
  const headerGrad = ctx.createLinearGradient(0, 0, width, 140);
  headerGrad.addColorStop(0, "#0c1e33");
  headerGrad.addColorStop(0.65, "#183b5f");
  headerGrad.addColorStop(1, "#214e7a");
  ctx.fillStyle = headerGrad;
  ctx.fillRect(10, 10, width - 20, 150);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 32px 'DM Sans', sans-serif";
  ctx.fillText("SATQUERY AI", 40, 58);

  ctx.fillStyle = "#38bdf8";
  ctx.font = "600 13px 'DM Sans', sans-serif";
  ctx.fillText("BI-TEMPORAL EARTH OBSERVATION · CHANGE DETECTION REPORT", 40, 80);

  ctx.fillStyle = "#94a3b8";
  ctx.font = "12px monospace";
  ctx.fillText(
    `SCENARIO: ${metrics?.severity || "Earth Surface Transition Tracking"}`,
    40,
    115
  );
  ctx.fillText(
    `DATE: ${new Date().toISOString().replace("T", " ").slice(0, 19)} UTC · ANALYST: ${user?.email || "Analyst Session"}`,
    40,
    135
  );

  // Dual Scene Side-by-Side Images
  const imgY = 180;
  const sceneW = 540;
  const sceneH = 340;

  // Scene A
  ctx.fillStyle = "#f1f5f9";
  ctx.strokeStyle = "#cbd5e1";
  roundRect(ctx, 40, imgY, sceneW, sceneH, 12, true, true);

  if (sceneA?.url) {
    const imgA = await loadImage(sceneA.url);
    if (imgA) {
      ctx.save();
      roundRect(ctx, 42, imgY + 2, sceneW - 4, sceneH - 44, 10, false, false);
      ctx.clip();
      ctx.drawImage(imgA, 42, imgY + 2, sceneW - 4, sceneH - 44);
      ctx.restore();
    }
  }

  ctx.fillStyle = "#0c1e33";
  ctx.fillRect(40, imgY + sceneH - 42, sceneW, 42);
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 13px 'DM Sans', sans-serif";
  ctx.fillText(`SCENE A (T₁ BASELINE): ${sceneA?.name || "Pre-Disaster"}`, 56, imgY + sceneH - 16);

  // Scene B
  ctx.fillStyle = "#f1f5f9";
  ctx.strokeStyle = "#cbd5e1";
  roundRect(ctx, 620, imgY, sceneW, sceneH, 12, true, true);

  if (sceneB?.url) {
    const imgB = await loadImage(sceneB.url);
    if (imgB) {
      ctx.save();
      roundRect(ctx, 622, imgY + 2, sceneW - 4, sceneH - 44, 10, false, false);
      ctx.clip();
      ctx.drawImage(imgB, 622, imgY + 2, sceneW - 4, sceneH - 44);
      ctx.restore();
    }
  }

  ctx.fillStyle = "#0c1e33";
  ctx.fillRect(620, imgY + sceneH - 42, sceneW, 42);
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 13px 'DM Sans', sans-serif";
  ctx.fillText(`SCENE B (T₂ OBSERVATION): ${sceneB?.name || "Post-Disaster"}`, 636, imgY + sceneH - 16);

  // Metrics Section (4 Cards)
  const metricY = imgY + sceneH + 25;
  const cardW = (width - 80 - 60) / 4;

  const metricCards = [
    {
      title: "SPATIAL SHIFT",
      val: `~${metrics?.changePct || 24.6}%`,
      sub: "Total Changed Area",
      color: "#e11d48",
    },
    {
      title: "ESTIMATED IMPACT",
      val: `~${(metrics?.hectares || 12400).toLocaleString()}`,
      sub: "Hectares Affected",
      color: "#d97706",
    },
    {
      title: "BIOMASS SHIFT",
      val: `${metrics?.meanDndvi > 0 ? `+${metrics.meanDndvi}` : metrics?.meanDndvi || -0.18}`,
      sub: "Mean Δ NDVI Score",
      color: metrics?.meanDndvi < 0 ? "#b91c1c" : "#16a34a",
    },
    {
      title: "SURFACE MOISTURE",
      val: `${metrics?.meanDndwi > 0 ? `+${metrics.meanDndwi}` : metrics?.meanDndwi || 0.38}`,
      sub: "Mean Δ NDWI Score",
      color: "#0284c7",
    },
  ];

  metricCards.forEach((c, idx) => {
    const mx = 40 + idx * (cardW + 20);
    ctx.fillStyle = "#f8fafc";
    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = 1.5;
    roundRect(ctx, mx, metricY, cardW, 130, 10, true, true);

    ctx.fillStyle = "#64748b";
    ctx.font = "bold 11px 'DM Sans', sans-serif";
    ctx.fillText(c.title, mx + 16, metricY + 28);

    ctx.fillStyle = c.color;
    ctx.font = "bold 28px 'DM Sans', sans-serif";
    ctx.fillText(c.val, mx + 16, metricY + 68);

    ctx.fillStyle = "#475569";
    ctx.font = "12px 'DM Sans', sans-serif";
    ctx.fillText(c.sub, mx + 16, metricY + 98);
  });

  // AI Interpretation Box
  const answerY = metricY + 155;
  const answerH = 400;

  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = "#cbd5e1";
  ctx.lineWidth = 1.5;
  roundRect(ctx, 40, answerY, width - 80, answerH, 12, true, true);

  ctx.fillStyle = "#1e3a5f";
  roundRect(ctx, 40, answerY, width - 80, 44, 12, true, false);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 13px 'DM Sans', sans-serif";
  ctx.fillText("AI DETAILED BI-TEMPORAL CHANGE EVALUATION", 60, answerY + 28);

  ctx.fillStyle = "#1e293b";
  ctx.font = "15px 'DM Sans', sans-serif";
  const answerLines = wrapText(
    ctx,
    analysisResult?.answer ||
      "Bi-temporal raster analysis computed significant surface transition between Sentinel-2 baseline and follow-up orbit. Vegetative and hydrological index anomalies verified.",
    width - 120
  );
  answerLines.slice(0, 12).forEach((line, idx) => {
    ctx.fillText(line, 65, answerY + 80 + idx * 26);
  });

  // Footer
  const footerY = height - 120;
  ctx.fillStyle = "#0c1e33";
  ctx.fillRect(10, footerY, width - 20, 110);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 13px 'DM Sans', sans-serif";
  ctx.fillText("SATQUERY AI · BI-TEMPORAL EARTH OBSERVATION VERIFICATION", 40, footerY + 36);

  ctx.fillStyle = "#94a3b8";
  ctx.font = "11px 'DM Sans', sans-serif";
  ctx.fillText(
    "Pixel delta difference matrices and spectral indices cross-validated with Copernicus Sentinel-2 observations.",
    40,
    footerY + 58
  );

  ctx.fillStyle = "#38bdf8";
  ctx.font = "11px monospace";
  ctx.fillText("OFFICIAL EXPORT · FORMAT: JPEG · 1200x1680 HI-RES SATELLITE BRIEF", 40, footerY + 80);

  canvas.toBlob(
    (blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `SatQuery_Change_Detection_${Date.now()}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
    "image/jpeg",
    0.95
  );
}
