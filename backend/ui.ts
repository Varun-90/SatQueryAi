export function renderDashboardHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SatQuery AI - Satellite Imagery Agent</title>
  <meta name="description" content="Agentic natural-language assistant for remote sensing and satellite imagery analysis">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-base: #0a0e17;
      --bg-card: #111726;
      --bg-elevated: #162035;
      --border-color: #1e293b;
      --border-focus: #0284c7;
      --text-main: #f1f5f9;
      --text-secondary: #94a3b8;
      --text-muted: #64748b;
      --accent-cyan: #06b6d4;
      --accent-blue: #0284c7;
      --accent-emerald: #10b981;
      --accent-amber: #f59e0b;
      --accent-rose: #f43f5e;
      --accent-indigo: #6366f1;
      --radius: 12px;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      background-color: var(--bg-base);
      color: var(--text-main);
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      min-height: 100vh;
      line-height: 1.5;
    }

    header {
      background: rgba(17, 23, 38, 0.85);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--border-color);
      padding: 14px 28px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: sticky;
      top: 0;
      z-index: 50;
    }
    .logo-container {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .logo-badge {
      background: linear-gradient(135deg, #0284c7, #4f46e5);
      width: 42px;
      height: 42px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
      box-shadow: 0 4px 14px rgba(2, 132, 199, 0.3);
    }
    .title-area h1 {
      font-size: 1.25rem;
      font-weight: 700;
      color: #fff;
      display: flex;
      align-items: center;
      gap: 8px;
      letter-spacing: -0.01em;
    }
    .title-area p {
      font-size: 0.8rem;
      color: var(--text-secondary);
    }
    .status-pills {
      display: flex;
      gap: 8px;
      align-items: center;
      flex-wrap: wrap;
    }
    .pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 12px;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid var(--border-color);
    }
    .pill-green {
      background: rgba(16, 185, 129, 0.12);
      border-color: rgba(16, 185, 129, 0.35);
      color: #34d399;
    }
    .pill-cyan {
      background: rgba(6, 182, 212, 0.12);
      border-color: rgba(6, 182, 212, 0.35);
      color: #38bdf8;
    }
    .dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: currentColor;
    }

    /* Target: Selector 4 - main */
    main {
      max-width: 1320px;
      margin: 24px auto;
      padding: 0 20px;
      display: grid;
      grid-template-columns: 1.02fr 0.98fr;
      gap: 24px;
      align-items: start;
    }
    @media (max-width: 990px) {
      main { grid-template-columns: 1fr; }
    }

    .card {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--radius);
      padding: 22px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.35);
      transition: border-color 0.2s, box-shadow 0.2s;
    }

    /* Target: Selector 2 - main > div:nth-of-type(1) (Query Studio card) */
    main > div:nth-of-type(1) {
      background: linear-gradient(180deg, #141d30 0%, #111726 100%);
      border: 1px solid rgba(56, 189, 248, 0.22);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.45);
      position: relative;
    }
    main > div:nth-of-type(1)::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, #0284c7, #38bdf8, #6366f1);
      border-top-left-radius: var(--radius);
      border-top-right-radius: var(--radius);
    }

    /* Target: Selector 5 - main > div:nth-of-type(3) (Results card) */
    main > div:nth-of-type(3) {
      grid-column: 1 / -1;
      background: linear-gradient(180deg, #131b2c 0%, #0f1523 100%);
      border: 1px solid var(--border-color);
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
      position: relative;
    }
    main > div:nth-of-type(3).result-highlight {
      animation: pulseResultBorder 1.2s ease-out;
    }
    @keyframes pulseResultBorder {
      0% { border-color: #38bdf8; box-shadow: 0 0 24px rgba(56, 189, 248, 0.45); }
      50% { border-color: #10b981; box-shadow: 0 0 18px rgba(16, 185, 129, 0.35); }
      100% { border-color: var(--border-color); box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4); }
    }

    .card-title {
      font-size: 1rem;
      font-weight: 600;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      padding-bottom: 12px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .form-group label {
      font-size: 0.84rem;
      font-weight: 600;
      color: var(--text-secondary);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    input[type="text"], textarea {
      background: rgba(10, 14, 23, 0.7);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 10px 14px;
      color: #fff;
      font-family: inherit;
      font-size: 0.9rem;
      outline: none;
      transition: all 0.15s ease;
      width: 100%;
    }
    input[type="text"]:focus, textarea:focus {
      border-color: #38bdf8;
      box-shadow: 0 0 0 2px rgba(56, 189, 248, 0.2);
      background: rgba(10, 14, 23, 0.95);
    }

    /* Target: Selector 1 - main > div:nth-of-type(1) > div:nth-of-type(4) > div:nth-of-type(1) (quick-queries) */
    .quick-queries {
      display: flex;
      flex-wrap: wrap;
      gap: 7px;
    }
    .quick-btn {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 6px;
      color: var(--text-secondary);
      padding: 6px 11px;
      font-size: 0.78rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s ease;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .quick-btn:hover {
      background: rgba(6, 182, 212, 0.15);
      border-color: rgba(6, 182, 212, 0.4);
      color: #38bdf8;
    }
    .quick-btn.active {
      background: rgba(2, 132, 199, 0.25);
      border-color: #38bdf8;
      color: #fff;
      font-weight: 600;
    }

    /* Target: Selector 3 - main > div:nth-of-type(1) > div:nth-of-type(5) (checkbox-row) */
    .checkbox-row {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 0.85rem;
      color: var(--text-secondary);
      background: rgba(255, 255, 255, 0.03);
      padding: 10px 14px;
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.06);
      cursor: pointer;
      user-select: none;
      transition: background 0.15s;
    }
    .checkbox-row:hover {
      background: rgba(255, 255, 255, 0.06);
      border-color: rgba(6, 182, 212, 0.25);
    }
    .checkbox-row input[type="checkbox"] {
      width: 16px;
      height: 16px;
      accent-color: var(--accent-cyan);
      cursor: pointer;
    }

    /* Target: Selector 6 - main > div:nth-of-type(1) > div:nth-of-type(6) > button#runQueryBtn:nth-of-type(1) */
    main > div:nth-of-type(1) > div:nth-of-type(6) > button#runQueryBtn:nth-of-type(1),
    #runQueryBtn {
      background: linear-gradient(135deg, #0284c7 0%, #2563eb 100%);
      color: #fff;
      font-weight: 600;
      font-size: 0.95rem;
      padding: 12px 20px;
      border-radius: 8px;
      border: none;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      box-shadow: 0 4px 16px rgba(2, 132, 199, 0.35);
      transition: all 0.15s ease;
      letter-spacing: 0.01em;
      position: relative;
      overflow: hidden;
    }
    #runQueryBtn:hover:not(:disabled) {
      background: linear-gradient(135deg, #0369a1 0%, #1d4ed8 100%);
      box-shadow: 0 6px 20px rgba(2, 132, 199, 0.5);
      transform: translateY(-1px);
    }
    #runQueryBtn:active:not(:disabled) {
      transform: translateY(1px);
      box-shadow: 0 2px 8px rgba(2, 132, 199, 0.3);
    }
    #runQueryBtn:disabled {
      opacity: 0.75;
      cursor: not-allowed;
      filter: grayscale(20%);
    }

    .btn-secondary {
      background: rgba(255, 255, 255, 0.07);
      color: #fff;
      font-weight: 500;
      font-size: 0.88rem;
      padding: 10px 16px;
      border-radius: 8px;
      border: 1px solid var(--border-color);
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: all 0.15s ease;
    }
    .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.12);
      border-color: rgba(255, 255, 255, 0.2);
    }

    .btn-analyze-full {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: #fff;
      font-weight: 600;
      font-size: 0.88rem;
      padding: 9px 16px;
      border-radius: 7px;
      border: none;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 7px;
      box-shadow: 0 4px 14px rgba(16, 185, 129, 0.3);
      transition: all 0.15s ease;
    }
    .btn-analyze-full:hover {
      background: linear-gradient(135deg, #059669 0%, #047857 100%);
      box-shadow: 0 6px 18px rgba(16, 185, 129, 0.45);
      transform: translateY(-1px);
    }

    /* ============================================================ */
    /* IMAGE INSPECTOR & GROUNDING OVERLAY STYLES                   */
    /* ============================================================ */

    .inspector-card {
      background: linear-gradient(180deg, #131b2c 0%, #101624 100%);
      border: 1px solid rgba(16, 185, 129, 0.22);
      position: relative;
    }
    .inspector-card::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, #10b981, #06b6d4, #3b82f6);
      border-top-left-radius: var(--radius);
      border-top-right-radius: var(--radius);
    }

    .inspector-toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 10px;
      background: rgba(0, 0, 0, 0.3);
      padding: 10px 12px;
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.06);
    }
    .preset-chips {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-wrap: wrap;
    }
    .preset-chip {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 5px;
      color: var(--text-secondary);
      font-size: 0.74rem;
      padding: 4px 8px;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .preset-chip:hover {
      background: rgba(16, 185, 129, 0.15);
      border-color: #10b981;
      color: #34d399;
    }
    .preset-chip.active {
      background: rgba(16, 185, 129, 0.25);
      border-color: #10b981;
      color: #fff;
      font-weight: 600;
    }

    .preview-container {
      position: relative;
      background: #030712;
      border-radius: 8px;
      overflow: hidden;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 280px;
      max-height: 400px;
      border: 1px solid var(--border-color);
      box-shadow: inset 0 0 30px rgba(0, 0, 0, 0.8);
      background-image: radial-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px);
      background-size: 20px 20px;
    }

    .image-wrapper {
      position: relative;
      display: inline-flex;
      justify-content: center;
      align-items: center;
      max-width: 100%;
      max-height: 380px;
      line-height: 0;
      border-radius: 6px;
      overflow: hidden;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.7);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    .image-wrapper img {
      max-width: 100%;
      max-height: 380px;
      width: auto;
      height: auto;
      object-fit: contain;
      display: block;
      transition: filter 0.2s;
    }

    .bbox-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: auto;
      z-index: 10;
    }

    .bbox-rect {
      cursor: pointer;
      transition: stroke-width 0.15s, fill-opacity 0.15s;
    }
    .bbox-rect:hover {
      stroke-width: 4px !important;
      fill-opacity: 0.35 !important;
      filter: drop-shadow(0 0 6px currentColor);
    }
    .bbox-rect.highlighted {
      stroke-width: 4.5px !important;
      fill-opacity: 0.4 !important;
      animation: pulseBbox 0.8s infinite alternate;
    }
    @keyframes pulseBbox {
      0% { fill-opacity: 0.2; }
      100% { fill-opacity: 0.5; }
    }

    .upload-zone {
      border: 2px dashed rgba(56, 189, 248, 0.35);
      border-radius: var(--radius);
      padding: 16px 18px;
      text-align: center;
      cursor: pointer;
      transition: all 0.15s ease;
      background: rgba(6, 182, 212, 0.03);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 4px;
    }
    .upload-zone:hover, .upload-zone.dragover {
      border-color: var(--accent-cyan);
      background: rgba(6, 182, 212, 0.1);
      transform: scale(1.005);
    }
    .upload-zone.dragover {
      box-shadow: 0 0 20px rgba(6, 182, 212, 0.3);
    }

    .overlay-controls {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      font-size: 0.78rem;
      color: var(--text-secondary);
      background: rgba(255, 255, 255, 0.03);
      padding: 6px 12px;
      border-radius: 6px;
      border: 1px solid rgba(255, 255, 255, 0.06);
    }
    .overlay-controls label {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      user-select: none;
    }

    /* Land cover segmentation bar */
    .landcover-section {
      background: rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 8px;
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .landcover-bar {
      display: flex;
      height: 10px;
      border-radius: 5px;
      overflow: hidden;
      background: rgba(255, 255, 255, 0.08);
    }
    .landcover-segment {
      height: 100%;
      transition: width 0.4s ease;
      position: relative;
    }
    .landcover-legend {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      font-size: 0.74rem;
    }
    .legend-item {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      color: var(--text-secondary);
    }
    .legend-color {
      width: 9px;
      height: 9px;
      border-radius: 2px;
    }

    /* Detected features list */
    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 8px;
      margin-top: 8px;
    }
    .feature-card {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 6px;
      padding: 8px 10px;
      font-size: 0.78rem;
      cursor: pointer;
      transition: all 0.15s ease;
      display: flex;
      flex-direction: column;
      gap: 3px;
    }
    .feature-card:hover, .feature-card.active {
      border-color: #38bdf8;
      background: rgba(6, 182, 212, 0.12);
      transform: translateY(-1px);
    }

    /* Indices cards */
    .indices-strip {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
    }
    @media (max-width: 640px) {
      .indices-strip { grid-template-columns: repeat(2, 1fr); }
    }
    .index-card {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 8px;
      padding: 10px 12px;
      text-align: center;
    }
    .index-val {
      font-size: 1.15rem;
      font-weight: 700;
      color: #38bdf8;
      font-family: 'JetBrains Mono', monospace;
    }
    .index-lbl {
      font-size: 0.72rem;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    /* Results box */
    .result-box {
      background: rgba(0, 0, 0, 0.35);
      border: 1px solid var(--border-color);
      border-radius: 10px;
      padding: 18px;
    }
    .confidence-meter {
      height: 8px;
      background: rgba(255, 255, 255, 0.08);
      border-radius: 6px;
      overflow: hidden;
      margin-top: 8px;
    }
    .confidence-fill {
      height: 100%;
      background: linear-gradient(90deg, #10b981, #38bdf8);
      border-radius: 6px;
      transition: width 0.4s ease;
    }

    .tabs {
      display: flex;
      gap: 8px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      padding-bottom: 10px;
      flex-wrap: wrap;
    }
    .tab-btn {
      background: none;
      border: none;
      color: var(--text-secondary);
      font-size: 0.85rem;
      font-weight: 600;
      padding: 6px 12px;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.15s;
    }
    .tab-btn:hover {
      color: #fff;
      background: rgba(255, 255, 255, 0.05);
    }
    .tab-btn.active {
      color: #38bdf8;
      background: rgba(6, 182, 212, 0.12);
    }

    .tag {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 6px;
      padding: 4px 9px;
      font-size: 0.78rem;
      margin-right: 6px;
      margin-bottom: 6px;
      color: #e2e8f0;
    }

    .trace-item {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 10px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.04);
      font-size: 0.82rem;
    }
    .trace-item:last-child {
      border-bottom: none;
    }
    .trace-badge {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.7rem;
      padding: 2px 6px;
      border-radius: 4px;
      background: rgba(16, 185, 129, 0.15);
      color: #34d399;
      border: 1px solid rgba(16, 185, 129, 0.3);
      white-space: nowrap;
    }

    .status-banner {
      padding: 10px 14px;
      border-radius: 8px;
      font-size: 0.84rem;
      display: none;
      align-items: center;
      gap: 10px;
      margin-top: 8px;
      animation: fadeIn 0.2s ease;
    }
    .status-banner.error {
      background: rgba(244, 63, 94, 0.12);
      border: 1px solid rgba(244, 63, 94, 0.3);
      color: #fb7185;
    }
    .status-banner.info {
      background: rgba(6, 182, 212, 0.12);
      border: 1px solid rgba(6, 182, 212, 0.3);
      color: #38bdf8;
    }
    .status-banner.success {
      background: rgba(16, 185, 129, 0.12);
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: #34d399;
    }

    .fade-update {
      animation: fadeIn 0.3s ease;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(2px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .spinner-icon {
      display: inline-block;
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  </style>
</head>
<body>
  <header>
    <div class="logo-container">
      <div class="logo-badge">🛰️</div>
      <div class="title-area">
        <h1>SatQuery AI <span style="font-size:0.75rem; color:#38bdf8; font-weight:normal; border:1px solid #0284c7; padding:2px 8px; border-radius:4px;">Node.js v22</span></h1>
        <p>Agentic Natural-Language Assistant for Satellite & Remote Sensing Imagery</p>
      </div>
    </div>
    <div class="status-pills">
      <div class="pill pill-green"><span class="dot"></span> Service Running</div>
      <div class="pill pill-cyan"><span class="dot"></span> Port 3000 (0.0.0.0)</div>
      <div class="pill"><span class="dot"></span> Multimodal AI + Computer Vision</div>
    </div>
  </header>

  <main>
    <!-- Left Column: Query Studio (Selector 2) -->
    <div class="card">
      <div class="card-title">
        <span>💬 Natural-Language Satellite Query</span>
        <span style="font-size:0.75rem; color:var(--text-muted);">POST /api/query</span>
      </div>

      <div class="form-group">
        <label for="apiKeyInput">API Key (Authentication Header: x-api-key)</label>
        <input type="text" id="apiKeyInput" value="satquery-demo-secret" placeholder="Enter API Key (Default: satquery-demo-secret)">
      </div>

      <div class="form-group">
        <label for="queryInput">Satellite Question or Task <span style="font-size:0.75rem; color:var(--text-muted); font-weight:normal;">(Press Ctrl+Enter to run)</span></label>
        <textarea id="queryInput" rows="3" placeholder="Ask a question about the satellite scene, land cover, change, or objects...">What land cover types are visible in this satellite image?</textarea>
      </div>

      <!-- Quick Queries Wrapper (Selector 1: div:nth-of-type(4) > div:nth-of-type(1)) -->
      <div class="form-group">
        <label>Quick Query Templates (Click to analyze):</label>
        <div class="quick-queries">
          <button class="quick-btn active" id="btnTpl1" onclick="setQuery('What land cover types are visible in this satellite image?', false, this)">🌿 VQA Land Cover</button>
          <button class="quick-btn" id="btnTpl2" onclick="setQuery('Analyze the entire satellite image and locate key geographic features.', false, this)">🔍 Entire Image Inspection</button>
          <button class="quick-btn" id="btnTpl3" onclick="setQuery('Locate water bodies and river channels in this region.', false, this)">🎯 Visual Grounding</button>
          <button class="quick-btn" id="btnTpl4" onclick="setQuery('What has changed between T1 and T2 acquisition dates?', false, this)">🔄 Change Detection</button>
          <button class="quick-btn" id="btnTpl5" onclick="setQuery('Perform Sentinel-1 radar and Sentinel-2 optical SAR fusion analysis.', true, this)">📡 SAR Fusion</button>
        </div>
      </div>

      <!-- Checkbox Row (Selector 3: div:nth-of-type(5)) -->
      <div class="checkbox-row" onclick="toggleSarCheckbox(event)">
        <input type="checkbox" id="hasSarCheckbox">
        <label for="hasSarCheckbox" style="cursor:pointer; font-weight:500; color:#fff;">Include SAR (Synthetic Aperture Radar) channel</label>
        <span style="font-size:0.7rem; color:var(--accent-cyan); margin-left:auto; background:rgba(6,182,212,0.1); padding:2px 6px; border-radius:4px;">Sentinel-1 C-Band</span>
      </div>

      <!-- Action Buttons Row (Selector 6: div:nth-of-type(6) > button#runQueryBtn) -->
      <div style="display: flex; gap: 12px; flex-direction: column;">
        <div style="display: flex; gap: 10px;">
          <button id="runQueryBtn" style="flex: 1;" onclick="executeSatelliteQuery()">
            <span id="runBtnIcon">⚡</span>
            <span id="runBtnText">Run SatQuery Analysis</span>
          </button>
          <button class="btn-secondary" onclick="loadSampleData('sample-sentinel-2')">
            <span>🔄 Reset Tile</span>
          </button>
        </div>
        <!-- In-UI Message Banner for errors or status (avoids alert dialogs) -->
        <div id="queryStatusBanner" class="status-banner"></div>
      </div>
    </div>

    <!-- Right Column: Image Inspector & Grounding Overlay (Selector 4 > div:nth-of-type(2)) -->
    <div class="card inspector-card" id="inspectorCard">
      <div class="card-title">
        <div style="display:flex; align-items:center; gap:8px;">
          <span>🛰️ Image Inspector & Grounding Overlay</span>
        </div>
        <span id="activeImageInfo" style="font-size:0.75rem; color:#38bdf8; background:rgba(6,182,212,0.1); border:1px solid rgba(6,182,212,0.25); padding:2px 8px; border-radius:4px;">sentinel2_agriculture_river.png</span>
      </div>

      <!-- Inspector Toolbar with presets and Full Image Analysis Trigger -->
      <div class="inspector-toolbar">
        <div class="preset-chips">
          <span style="font-size:0.75rem; color:var(--text-muted); font-weight:600;">Presets:</span>
          <button class="preset-chip active" id="chipSentinel2" onclick="loadSampleData('sample-sentinel-2', this)">🌾 Sentinel-2 Agri</button>
          <button class="preset-chip" id="chipUrban" onclick="loadSampleData('sample-urban-coastal', this)">🏙️ Landsat-8 Port</button>
          <button class="preset-chip" id="chipForest" onclick="loadSampleData('sample-forest-wildfire', this)">🌲 Forest & Scar</button>
        </div>
        <button class="btn-analyze-full" id="btnAnalyzeFull" onclick="analyzeEntireImage()">
          <span>🔍 Analyze Entire Image</span>
        </button>
      </div>

      <!-- Dynamic Image Stage & SVG Grounding Bounding Box Overlay -->
      <div class="preview-container" id="previewContainer">
        <div class="image-wrapper" id="imageWrapper">
          <img id="satellitePreview" src="/sentinel2_sample.png" alt="Satellite imagery preview" referrerpolicy="no-referrer" onerror="this.src='/test_satellite.png'">
          <svg class="bbox-overlay" id="bboxOverlay" viewBox="0 0 1000 1000" preserveAspectRatio="none"></svg>
        </div>
      </div>

      <!-- Overlay Display Controls -->
      <div class="overlay-controls">
        <label>
          <input type="checkbox" id="showBboxesCheck" checked onchange="toggleOverlayVisibility()">
          <span>Show Grounding Overlay</span>
        </label>
        <label>
          <input type="checkbox" id="showLabelsCheck" checked onchange="toggleOverlayVisibility()">
          <span>Show Labels & Confidence</span>
        </label>
        <span id="regionCountText" style="font-size:0.72rem; color:var(--accent-cyan); font-weight:600;">3 regions identified</span>
      </div>

      <!-- Drag and Drop Upload Zone -->
      <div class="upload-zone" id="uploadZone" onclick="document.getElementById('fileInput').click()">
        <input type="file" id="fileInput" style="display:none" accept="image/png,image/jpeg,image/webp,image/tiff,.tif,.tiff" onchange="handleFileUpload(event)">
        <p style="font-size:0.86rem; font-weight:600; color:#fff;">📁 Click or drag & drop any satellite image here</p>
        <p style="font-size:0.75rem; color:var(--text-secondary);">PNG, JPEG, WebP, GeoTIFF up to 50 MB • Ingests & automatically analyzes the entire image</p>
      </div>

      <!-- Whole-Image Land Cover Segmentation Bar -->
      <div class="landcover-section" id="landcoverSection">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="font-size:0.8rem; font-weight:600; color:#fff;">Whole-Scene Land Cover Segmentation</span>
          <span style="font-size:0.72rem; color:var(--text-muted);">100% Tile Coverage</span>
        </div>
        <div class="landcover-bar" id="landcoverBar">
          <div class="landcover-segment" style="width: 42%; background: #16a34a;" title="Forest & Canopy: 42%"></div>
          <div class="landcover-segment" style="width: 25%; background: #ca8a04;" title="Agricultural Plots: 25%"></div>
          <div class="landcover-segment" style="width: 18%; background: #0284c7;" title="Hydrology / Water: 18%"></div>
          <div class="landcover-segment" style="width: 12%; background: #64748b;" title="Built-up & Urban: 12%"></div>
          <div class="landcover-segment" style="width: 3%; background: #a8a29e;" title="Barren Soil: 3%"></div>
        </div>
        <div class="landcover-legend" id="landcoverLegend">
          <div class="legend-item"><span class="legend-color" style="background:#16a34a;"></span> Forest: 42%</div>
          <div class="legend-item"><span class="legend-color" style="background:#ca8a04;"></span> Agriculture: 25%</div>
          <div class="legend-item"><span class="legend-color" style="background:#0284c7;"></span> Water: 18%</div>
          <div class="legend-item"><span class="legend-color" style="background:#64748b;"></span> Urban: 12%</div>
          <div class="legend-item"><span class="legend-color" style="background:#a8a29e;"></span> Soil: 3%</div>
        </div>
      </div>

      <!-- Detected Grounding Regions Cards List -->
      <div style="display:flex; flex-direction:column; gap:6px;">
        <span style="font-size:0.78rem; font-weight:600; color:var(--text-secondary); text-transform:uppercase; letter-spacing:0.04em;">Detected Grounding Features (Hover to highlight):</span>
        <div class="features-grid" id="featuresGrid">
          <!-- Populated dynamically -->
        </div>
      </div>
    </div>

    <!-- Bottom Full-Width: Results, Traces & Audit Logs (Selector 5) -->
    <div class="card card-full" id="resultsCard">
      <div class="card-title">
        <div style="display:flex; align-items:center; gap:10px;">
          <span>📊 Analysis Results & Agent Execution Trace</span>
          <span id="liveStatusBadge" style="font-size:0.75rem; color:#34d399; background:rgba(16,185,129,0.12); border:1px solid rgba(16,185,129,0.3); padding:2px 8px; border-radius:4px;">● Ready</span>
        </div>
        <div class="tabs">
          <button class="tab-btn active" id="tabBtnResult" onclick="switchTab('tab-result', this)">AI Findings</button>
          <button class="tab-btn" id="tabBtnIndices" onclick="switchTab('tab-indices', this)">Physical Indices</button>
          <button class="tab-btn" id="tabBtnTrace" onclick="switchTab('tab-trace', this)">Agent Trace</button>
          <button class="tab-btn" id="tabBtnRaw" onclick="switchTab('tab-raw', this)">JSON Response</button>
          <button class="tab-btn" id="tabBtnAudit" onclick="switchTab('tab-audit', this)">Audit Logs</button>
        </div>
      </div>

      <!-- Tab: AI Findings -->
      <div id="tab-result" class="tab-content">
        <div class="result-box">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; flex-wrap:wrap; gap:8px;">
            <div style="display:flex; align-items:center; gap:10px;">
              <span id="taskBadge" class="pill pill-cyan">captioning</span>
              <span id="timingBadge" style="font-size:0.75rem; color:var(--text-muted); background:rgba(255,255,255,0.05); padding:3px 8px; border-radius:4px;">Ready</span>
              <span id="modelBadge" style="font-size:0.72rem; color:#10b981; background:rgba(16,185,129,0.1); border:1px solid rgba(16,185,129,0.25); padding:2px 6px; border-radius:4px;">Multimodal Perception</span>
            </div>
            <div style="text-align:right;">
              <span style="font-size:0.8rem; color:var(--text-secondary);">Perception Confidence: </span>
              <strong id="confidenceText" style="color:#10b981; font-size:0.95rem;">92%</strong>
            </div>
          </div>

          <div class="confidence-meter">
            <div id="confidenceFill" class="confidence-fill" style="width: 92%;"></div>
          </div>

          <div style="margin-top:18px;">
            <h4 style="font-size:0.85rem; color:var(--text-secondary); margin-bottom:6px; text-transform:uppercase; letter-spacing:0.04em;">Natural-Language Interpretation:</h4>
            <p id="answerText" style="font-size:1.02rem; color:#fff; font-weight:500; line-height:1.6;">
              Full-scene remote sensing inspection complete. The image is dominated by Forest & Canopy (~42%), with a winding hydrological water channel (18%), geometric agricultural plots (25%), and rural built infrastructure (12%). High vegetation vigor detected with strong NDVI reflection.
            </p>
          </div>

          <div id="classesContainer" style="margin-top:14px;">
            <span class="tag">🌿 forest & dense vegetation</span>
            <span class="tag">💧 water body river or lake</span>
            <span class="tag">🌾 agricultural cropland</span>
            <span class="tag">🏙️ urban built-up structures</span>
          </div>

          <div id="reasoningBox" style="margin-top:16px; font-size:0.8rem; color:var(--text-secondary); border-top:1px solid rgba(255,255,255,0.08); padding-top:12px;">
            <strong>Agent Routing Reason:</strong> <span id="reasoningText">Descriptive query or full-scene request -> Multimodal satellite scene perception</span>
          </div>
        </div>
      </div>

      <!-- Tab: Physical Indices -->
      <div id="tab-indices" class="tab-content" style="display:none;">
        <div class="indices-strip">
          <div class="index-card">
            <div class="index-val" id="valNdvi">0.68</div>
            <div class="index-lbl">Vegetation Index (NDVI)</div>
            <span style="font-size:0.7rem; color:#34d399;">Dense Healthy Foliage</span>
          </div>
          <div class="index-card">
            <div class="index-val" id="valNdwi">0.24</div>
            <div class="index-lbl">Water Index (NDWI)</div>
            <span style="font-size:0.7rem; color:#38bdf8;">Open Hydrological Surface</span>
          </div>
          <div class="index-card">
            <div class="index-val" id="valNdbi">-0.16</div>
            <div class="index-lbl">Built-Up Index (NDBI)</div>
            <span style="font-size:0.7rem; color:#94a3b8;">Low Impervious Surface</span>
          </div>
          <div class="index-card">
            <div class="index-val" id="valCloud">0%</div>
            <div class="index-lbl">Cloud Coverage</div>
            <span style="font-size:0.7rem; color:#34d399;">Clear Optical Visibility</span>
          </div>
        </div>
      </div>

      <!-- Tab: Execution Trace -->
      <div id="tab-trace" class="tab-content" style="display:none;">
        <div id="traceList" style="display:flex; flex-direction:column;">
          <div class="trace-item">
            <span class="trace-badge">done</span>
            <div><strong>image_ingestion:</strong> Ingested satellite raster: sentinel2_sample.png (269 KB) <span style="color:#64748b; font-size:0.7rem;">(2ms)</span></div>
          </div>
          <div class="trace-item">
            <span class="trace-badge">done</span>
            <div><strong>spectral_analysis:</strong> Calculated raster metrics: NDVI=0.68, NDWI=0.24, NDBI=-0.16 <span style="color:#64748b; font-size:0.7rem;">(12ms)</span></div>
          </div>
          <div class="trace-item">
            <span class="trace-badge">done</span>
            <div><strong>grounding_engine:</strong> Extracted 3 spatial bounding boxes across entire image <span style="color:#64748b; font-size:0.7rem;">(24ms)</span></div>
          </div>
          <div class="trace-item">
            <span class="trace-badge">done</span>
            <div><strong>inference:</strong> Completed with confidence 0.92 <span style="color:#64748b; font-size:0.7rem;">(38ms)</span></div>
          </div>
        </div>
      </div>

      <!-- Tab: JSON Response -->
      <div id="tab-raw" class="tab-content" style="display:none;">
        <pre id="rawJsonOutput" style="background:#0a0e17; padding:16px; border-radius:8px; font-family:'JetBrains Mono', monospace; font-size:0.8rem; overflow-x:auto; color:#a5f3fc; max-height:400px;"></pre>
      </div>

      <!-- Tab: Audit Logs -->
      <div id="tab-audit" class="tab-content" style="display:none;">
        <div style="display:flex; justify-content:flex-end; margin-bottom:10px;">
          <button class="btn-secondary" onclick="refreshAuditLogs()">Refresh Audit Trail</button>
        </div>
        <pre id="auditLogsContainer" style="background:#0a0e17; padding:16px; border-radius:8px; font-family:'JetBrains Mono', monospace; font-size:0.8rem; overflow-x:auto; color:#94a3b8; max-height:400px;">Loading audit logs...</pre>
      </div>
    </div>
  </main>

  <script>
    let currentImageId = 'sample-sentinel-2';
    let currentRegions = [];
    let showBoundingBoxes = true;
    let showLabels = true;

    document.addEventListener('DOMContentLoaded', () => {
      initDragAndDrop();
      initInitialFeatures();
      executeSatelliteQuery();
    });

    function initInitialFeatures() {
      currentRegions = [
        { label: "Vegetation & Forest Canopy", bbox: [0.45, 0.04, 0.95, 0.35], confidence: 0.94, category: "forest", area_pct: 31 },
        { label: "Hydrological Water Channel", bbox: [0.04, 0.22, 0.96, 0.65], confidence: 0.93, category: "water", area_pct: 28 },
        { label: "Agricultural Field Parcel", bbox: [0.04, 0.60, 0.55, 0.96], confidence: 0.91, category: "agriculture", area_pct: 22 },
        { label: "Built-up Infrastructure Grid", bbox: [0.52, 0.60, 0.96, 0.96], confidence: 0.89, category: "urban", area_pct: 18 }
      ];
      renderBoundingBoxes(currentRegions);
      renderFeaturesList(currentRegions);
    }

    function initDragAndDrop() {
      const dropZone = document.getElementById('uploadZone');
      const previewZone = document.getElementById('previewContainer');

      [dropZone, previewZone].forEach(elem => {
        if (!elem) return;
        ['dragenter', 'dragover'].forEach(eventName => {
          elem.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropZone.classList.add('dragover');
          }, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
          elem.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropZone.classList.remove('dragover');
          }, false);
        });

        elem.addEventListener('drop', (e) => {
          const dt = e.dataTransfer;
          const files = dt.files;
          if (files && files.length > 0) {
            processUploadedFile(files[0]);
          }
        }, false);
      });
    }

    function toggleSarCheckbox(e) {
      if (e.target.tagName !== 'INPUT') {
        const cb = document.getElementById('hasSarCheckbox');
        cb.checked = !cb.checked;
      }
    }

    function setQuery(text, hasSar, btn) {
      document.getElementById('queryInput').value = text;
      document.getElementById('hasSarCheckbox').checked = Boolean(hasSar);
      document.querySelectorAll('.quick-btn').forEach(b => b.classList.remove('active'));
      if (btn) btn.classList.add('active');
      executeSatelliteQuery();
    }

    function switchTab(tabId, btn) {
      document.querySelectorAll('.tab-content').forEach(el => el.style.display = 'none');
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      const activeTab = document.getElementById(tabId);
      if (activeTab) activeTab.style.display = 'block';
      if (btn) btn.classList.add('active');
      if (tabId === 'tab-audit') refreshAuditLogs();
    }

    function showStatusBanner(msg, type = 'info') {
      const banner = document.getElementById('queryStatusBanner');
      if (!banner) return;
      banner.className = 'status-banner ' + type;
      banner.innerHTML = (type === 'error' ? '⚠️ ' : type === 'success' ? '✅ ' : 'ℹ️ ') + msg;
      banner.style.display = 'flex';
      if (type !== 'error') {
        setTimeout(() => { banner.style.display = 'none'; }, 5000);
      }
    }

    function clearStatusBanner() {
      const banner = document.getElementById('queryStatusBanner');
      if (banner) banner.style.display = 'none';
    }

    function toggleOverlayVisibility() {
      showBoundingBoxes = document.getElementById('showBboxesCheck').checked;
      showLabels = document.getElementById('showLabelsCheck').checked;
      const svg = document.getElementById('bboxOverlay');
      if (svg) {
        svg.style.display = showBoundingBoxes ? 'block' : 'none';
        svg.querySelectorAll('.bbox-label-group').forEach(el => {
          el.style.display = showLabels ? 'block' : 'none';
        });
      }
    }

    function analyzeEntireImage() {
      document.getElementById('queryInput').value = 'Analyze the entire satellite image, identify all land cover classes, and localize features across the scene.';
      executeSatelliteQuery();
    }

    async function executeSatelliteQuery() {
      const apiKeyInput = document.getElementById('apiKeyInput');
      const apiKey = apiKeyInput ? apiKeyInput.value.trim() : 'satquery-demo-secret';
      const question = document.getElementById('queryInput').value.trim();
      const hasSar = document.getElementById('hasSarCheckbox').checked;
      
      const runBtn = document.getElementById('runQueryBtn');
      const runBtnIcon = document.getElementById('runBtnIcon');
      const runBtnText = document.getElementById('runBtnText');
      const btnFull = document.getElementById('btnAnalyzeFull');
      const liveStatus = document.getElementById('liveStatusBadge');

      clearStatusBanner();

      runBtn.disabled = true;
      if (btnFull) btnFull.disabled = true;
      runBtnIcon.innerHTML = '<span class="spinner-icon">🛰️</span>';
      runBtnText.innerText = 'Analyzing Entire Image...';
      if (liveStatus) {
        liveStatus.innerText = '⚡ Processing Pipeline...';
        liveStatus.style.color = '#38bdf8';
      }

      try {
        const response = await fetch('/api/query', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey || 'satquery-demo-secret'
          },
          body: JSON.stringify({
            image_ids: [currentImageId],
            question: question || 'Analyze the entire satellite image, identify land cover classes, and locate key geographic features.',
            query_text: question || 'Analyze the entire satellite image, identify land cover classes, and locate key geographic features.',
            has_sar: hasSar
          })
        });

        const data = await response.json();
        document.getElementById('rawJsonOutput').innerText = JSON.stringify(data, null, 2);

        if (!response.ok) {
          showStatusBanner('Query Error: ' + (data.detail || data.error || 'Request failed'), 'error');
          return;
        }

        // Render Answer
        const answerEl = document.getElementById('answerText');
        answerEl.innerText = data.answer || 'No interpretation generated';
        answerEl.classList.remove('fade-update');
        void answerEl.offsetWidth;
        answerEl.classList.add('fade-update');

        document.getElementById('taskBadge').innerText = data.task || 'whole_image_analysis';
        
        const confPercent = Math.round((data.confidence || 0.85) * 100);
        document.getElementById('confidenceText').innerText = confPercent + '%';
        document.getElementById('confidenceFill').style.width = confPercent + '%';
        document.getElementById('timingBadge').innerText = (data.total_ms || 32) + 'ms';
        document.getElementById('reasoningText').innerText = data.agent_reasoning || 'Standard RS perception pipeline';

        // Tags
        const tagsContainer = document.getElementById('classesContainer');
        tagsContainer.innerHTML = '';
        const detected = (data.visuals && data.visuals.detected_classes) || ['satellite scene'];
        detected.forEach(tag => {
          const span = document.createElement('span');
          span.className = 'tag';
          span.innerText = tag;
          tagsContainer.appendChild(span);
        });

        // Regions and Overlay
        currentRegions = (data.visuals && data.visuals.regions) || [];
        renderBoundingBoxes(currentRegions);
        renderFeaturesList(currentRegions);

        // Land Cover Breakdown
        if (data.visuals && data.visuals.land_cover_breakdown) {
          renderLandCoverBreakdown(data.visuals.land_cover_breakdown);
        }

        // Indices
        if (data.visuals && data.visuals.indices) {
          document.getElementById('valNdvi').innerText = (data.visuals.indices.ndvi ?? 0.65).toFixed(2);
          document.getElementById('valNdwi').innerText = (data.visuals.indices.ndwi ?? 0.22).toFixed(2);
          document.getElementById('valNdbi').innerText = (data.visuals.indices.ndbi ?? -0.15).toFixed(2);
          document.getElementById('valCloud').innerText = (data.visuals.indices.cloud_cover_pct ?? 0) + '%';
        }

        // Traces
        renderTrace(data.execution_trace || []);

        // Highlight results card
        const resultsCard = document.getElementById('resultsCard');
        if (resultsCard) {
          resultsCard.classList.remove('result-highlight');
          void resultsCard.offsetWidth;
          resultsCard.classList.add('result-highlight');
        }

        if (liveStatus) {
          liveStatus.innerText = '● Analyzed in ' + (data.total_ms || 32) + 'ms';
          liveStatus.style.color = '#34d399';
        }

        switchTab('tab-result', document.getElementById('tabBtnResult'));

      } catch (err) {
        showStatusBanner('Network/Request failed: ' + err.message, 'error');
      } finally {
        runBtn.disabled = false;
        if (btnFull) btnFull.disabled = false;
        runBtnIcon.innerHTML = '⚡';
        runBtnText.innerText = 'Run SatQuery Analysis';
      }
    }

    function renderBoundingBoxes(regions) {
      const svg = document.getElementById('bboxOverlay');
      const countEl = document.getElementById('regionCountText');
      if (!svg) return;
      svg.innerHTML = '';

      if (!regions || regions.length === 0) {
        if (countEl) countEl.innerText = '0 regions identified';
        return;
      }

      if (countEl) countEl.innerText = regions.length + ' regions identified';

      const colorPalette = {
        water: '#0284c7',
        forest: '#16a34a',
        agriculture: '#ca8a04',
        urban: '#64748b',
        barren: '#f59e0b',
        feature: '#06b6d4'
      };

      const fallbackColors = ['#06b6d4', '#10b981', '#f59e0b', '#818cf8', '#f43f5e'];

      regions.forEach((r, idx) => {
        // Support both [ymin, xmin, ymax, xmax] and [x1, y1, x2, y2]
        let ymin = r.bbox[0];
        let xmin = r.bbox[1];
        let ymax = r.bbox[2];
        let xmax = r.bbox[3];

        // Ensure proper bounds
        if (ymin > ymax) { const t = ymin; ymin = ymax; ymax = t; }
        if (xmin > xmax) { const t = xmin; xmin = xmax; xmax = t; }

        // Scale to 0-1000 SVG coordinates
        const x = Math.max(0, xmin * 1000);
        const y = Math.max(0, ymin * 1000);
        const width = Math.min(1000 - x, Math.max(20, (xmax - xmin) * 1000));
        const height = Math.min(1000 - y, Math.max(20, (ymax - ymin) * 1000));

        const color = colorPalette[r.category] || fallbackColors[idx % fallbackColors.length];

        // Group for this bbox
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('id', 'bbox-group-' + idx);

        // Bounding Box Rect
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('id', 'bbox-rect-' + idx);
        rect.setAttribute('class', 'bbox-rect');
        rect.setAttribute('x', String(x));
        rect.setAttribute('y', String(y));
        rect.setAttribute('width', String(width));
        rect.setAttribute('height', String(height));
        rect.setAttribute('fill', color);
        rect.setAttribute('fill-opacity', '0.18');
        rect.setAttribute('stroke', color);
        rect.setAttribute('stroke-width', '2.5');
        rect.setAttribute('stroke-dasharray', '6,3');
        rect.setAttribute('rx', '4');

        // Hover handlers
        rect.addEventListener('mouseenter', () => highlightRegion(idx));
        rect.addEventListener('mouseleave', () => unhighlightRegion(idx));

        g.appendChild(rect);

        // Label group
        const labelGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        labelGroup.setAttribute('class', 'bbox-label-group');

        const labelY = Math.max(28, y - 6);
        const labelText = (r.label || 'Feature') + ' ' + Math.round((r.confidence || 0.85) * 100) + '%';
        const textWidth = Math.min(width, Math.max(120, labelText.length * 11));

        // Background pill
        const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        bgRect.setAttribute('x', String(x));
        bgRect.setAttribute('y', String(labelY - 22));
        bgRect.setAttribute('width', String(textWidth));
        bgRect.setAttribute('height', '26');
        bgRect.setAttribute('fill', '#090d16');
        bgRect.setAttribute('fill-opacity', '0.9');
        bgRect.setAttribute('stroke', color);
        bgRect.setAttribute('stroke-width', '1.2');
        bgRect.setAttribute('rx', '4');
        labelGroup.appendChild(bgRect);

        // Text
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', String(x + 8));
        text.setAttribute('y', String(labelY - 5));
        text.setAttribute('fill', color);
        text.setAttribute('font-size', '15');
        text.setAttribute('font-weight', '600');
        text.setAttribute('font-family', 'monospace');
        text.textContent = labelText;
        labelGroup.appendChild(text);

        g.appendChild(labelGroup);
        svg.appendChild(g);
      });

      toggleOverlayVisibility();
    }

    function renderFeaturesList(regions) {
      const grid = document.getElementById('featuresGrid');
      if (!grid) return;
      grid.innerHTML = '';

      if (!regions || regions.length === 0) {
        grid.innerHTML = '<div style="color:var(--text-muted); font-size:0.75rem;">No localized regions detected in current tile.</div>';
        return;
      }

      regions.forEach((r, idx) => {
        const card = document.createElement('div');
        card.className = 'feature-card';
        card.id = 'feature-card-' + idx;
        const conf = Math.round((r.confidence || 0.85) * 100);
        card.innerHTML = '<div style="font-weight:600; color:#fff; display:flex; justify-content:space-between;">' +
          '<span>' + (r.label || 'Feature ' + (idx + 1)) + '</span>' +
          '<span style="color:#38bdf8;">' + conf + '%</span>' +
          '</div>' +
          '<div style="font-size:0.7rem; color:var(--text-secondary); display:flex; justify-content:space-between; margin-top:2px;">' +
          '<span>Category: ' + (r.category || 'Region') + '</span>' +
          '<span>' + (r.area_pct ? r.area_pct + '% area' : '') + '</span>' +
          '</div>';

        card.addEventListener('mouseenter', () => highlightRegion(idx));
        card.addEventListener('mouseleave', () => unhighlightRegion(idx));
        grid.appendChild(card);
      });
    }

    function highlightRegion(idx) {
      const rect = document.getElementById('bbox-rect-' + idx);
      const card = document.getElementById('feature-card-' + idx);
      if (rect) rect.classList.add('highlighted');
      if (card) card.classList.add('active');
    }

    function unhighlightRegion(idx) {
      const rect = document.getElementById('bbox-rect-' + idx);
      const card = document.getElementById('feature-card-' + idx);
      if (rect) rect.classList.remove('highlighted');
      if (card) card.classList.remove('active');
    }

    function renderLandCoverBreakdown(breakdown) {
      const bar = document.getElementById('landcoverBar');
      const legend = document.getElementById('landcoverLegend');
      if (!bar || !legend) return;

      bar.innerHTML = '';
      legend.innerHTML = '';

      breakdown.forEach(item => {
        const seg = document.createElement('div');
        seg.className = 'landcover-segment';
        seg.style.width = item.pct + '%';
        seg.style.background = item.color;
        seg.title = item.name + ': ' + item.pct + '%';
        bar.appendChild(seg);

        const leg = document.createElement('div');
        leg.className = 'legend-item';
        leg.innerHTML = '<span class="legend-color" style="background:' + item.color + ';"></span> ' + item.name + ': ' + item.pct + '%';
        legend.appendChild(leg);
      });
    }

    function renderTrace(traces) {
      const list = document.getElementById('traceList');
      if (!list) return;
      list.innerHTML = '';
      traces.forEach(t => {
        const item = document.createElement('div');
        item.className = 'trace-item';
        item.innerHTML = '<span class="trace-badge">' + t.status + '</span><div><strong>' + t.step + ':</strong> ' + t.detail + ' <span style="color:#64748b; font-size:0.72rem;">(' + t.timestamp_ms + 'ms)</span></div>';
        list.appendChild(item);
      });
    }

    function handleFileUpload(e) {
      const file = e.target.files[0];
      if (file) processUploadedFile(file);
    }

    async function processUploadedFile(file) {
      if (!file) return;

      // 1. Immediately show preview in browser
      const reader = new FileReader();
      reader.onload = function(evt) {
        const img = document.getElementById('satellitePreview');
        img.src = evt.target.result;
      };
      reader.readAsDataURL(file);

      // 2. Upload file to backend
      const apiKey = document.getElementById('apiKeyInput').value.trim() || 'satquery-demo-secret';
      const formData = new FormData();
      formData.append('file', file);

      showStatusBanner('Uploading & ingesting ' + file.name + ' (' + Math.round(file.size / 1024) + ' KB)...', 'info');

      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'x-api-key': apiKey },
          body: formData
        });

        const data = await res.json();
        if (!res.ok) {
          showStatusBanner('Upload rejected: ' + (data.detail || 'Error'), 'error');
          return;
        }

        currentImageId = data.metadata.image_id;
        document.getElementById('activeImageInfo').innerText = data.metadata.original_filename + ' (' + Math.round(data.metadata.size / 1024) + ' KB)';
        document.querySelectorAll('.preset-chip').forEach(c => c.classList.remove('active'));

        showStatusBanner('Image ingested successfully! Analyzing entire satellite scene...', 'success');

        // 3. Automatically analyze entire image
        executeSatelliteQuery();
      } catch (err) {
        showStatusBanner('Upload failed: ' + err.message, 'error');
      }
    }

    async function refreshAuditLogs() {
      const container = document.getElementById('auditLogsContainer');
      try {
        const res = await fetch('/api/audit');
        const logs = await res.json();
        container.innerText = JSON.stringify(logs, null, 2);
      } catch (err) {
        container.innerText = 'Failed to load audit logs: ' + err.message;
      }
    }

    function loadSampleData(sampleId, chip) {
      const sampleMap = {
        'sample-sentinel-2': { src: '/sentinel2_sample.png', label: 'sentinel2_agriculture_river.png' },
        'sample-urban-coastal': { src: '/urban_coastal.png', label: 'landsat8_urban_coastal_port.png' },
        'sample-forest-wildfire': { src: '/forest_wildfire.png', label: 'sentinel2_forest_burnscar.png' }
      };

      const selected = sampleMap[sampleId] || sampleMap['sample-sentinel-2'];
      document.getElementById('satellitePreview').src = selected.src;
      currentImageId = sampleId;
      document.getElementById('activeImageInfo').innerText = selected.label;

      document.querySelectorAll('.preset-chip').forEach(c => c.classList.remove('active'));
      if (chip) {
        chip.classList.add('active');
      } else {
        const defaultChip = document.getElementById('chipSentinel2');
        if (defaultChip) defaultChip.classList.add('active');
      }

      showStatusBanner('Loaded ' + selected.label + '. Analyzing entire image...', 'info');
      executeSatelliteQuery();
    }
  </script>
</body>
</html>`;
}
