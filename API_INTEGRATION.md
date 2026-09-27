# SatQuery AI - Frontend & Backend Integration Guide

This document describes how the SatQuery frontend connects to the backend API services.

## Overview

The application communicates with the backend through two primary endpoints:

1. `POST /api/upload`: Uploads and validates satellite imagery.
2. `POST /api/query`: Executes agentic remote-sensing query analysis.

Optional endpoints:
- `GET /api/health`: Health check and system readiness.
- `GET /api/audit`: Audit logs of operations and queries.

---

## Environment Variables

Create a `.env` file in the project root:

```env
# URL of the backend service (leave empty or omit to use same-origin /api routes)
VITE_API_BASE_URL=

# API Key for authenticated endpoints
VITE_API_KEY=satquery-demo-secret
```

---

## Endpoints

### 1. Upload Satellite Imagery

- **Method**: `POST`
- **Path**: `/api/upload`
- **Headers**:
  - `x-api-key`: `<VITE_API_KEY>`
- **Body**: `multipart/form-data` with field `file`

**Response Example:**
```json
{
  "success": true,
  "message": "Secure upload successful",
  "image_ids": ["8f73b640-c118-4a61-9c60-a7d57f13b632"],
  "metadata": [
    {
      "image_id": "8f73b640-c118-4a61-9c60-a7d57f13b632",
      "filename": "8f73b640-c118-4a61-9c60-a7d57f13b632.png",
      "original_filename": "sentinel2_tile.png",
      "size": 1048576,
      "mime_type": "image/png",
      "sha256": "4b68e91a0c..."
    }
  ]
}
```

---

### 2. Query Remote Sensing Imagery

- **Method**: `POST`
- **Path**: `/api/query`
- **Headers**:
  - `Content-Type`: `application/json`
  - `x-api-key`: `<VITE_API_KEY>`
- **Body**:
```json
{
  "image_ids": ["8f73b640-c118-4a61-9c60-a7d57f13b632"],
  "query_text": "Identify land cover types in this image"
}
```

**Response Example:**
```json
{
  "request_id": "req-9b8a34",
  "task": "land_cover",
  "answer": "The image features dense riparian vegetation alongside agricultural parcels and a central river channel.",
  "confidence": 0.94,
  "execution_summary": {
    "task_type": "land_cover",
    "models_used": ["RS-LLaVA-v1.5", "Gemini-2.5-Flash"],
    "execution_time_ms": 1420
  },
  "visuals": {
    "ndvi_mean": 0.62
  }
}
```
