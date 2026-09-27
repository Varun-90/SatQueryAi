export interface UploadMetadata {
  image_id: string;
  filename: string;
  original_filename: string;
  size: number;
  mime_type: string;
  sha256: string;
  path: string;
  data_url?: string;
  uploaded_at: string;
}

export interface UploadResponse {
  success: boolean;
  message: string;
  metadata: UploadMetadata;
}

export interface QueryRequest {
  image_ids?: string[];
  images?: string[]; // base64 or data URLs
  query_text?: string;
  question?: string;
  has_sar?: boolean;
}

export interface ExecutionTraceStep {
  step: string;
  status: "done" | "running" | "error";
  detail: string;
  timestamp_ms: number;
}

export interface GroundingRegion {
  label: string;
  bbox: [number, number, number, number]; // [ymin, xmin, ymax, xmax] or [x1, y1, x2, y2] normalized 0-1
  confidence: number;
  category?: string;
  area_pct?: number;
}

export interface LandCoverClass {
  name: string;
  pct: number;
  color: string;
}

export interface SpectralIndices {
  ndvi: number;
  ndwi: number;
  ndbi: number;
  cloud_cover_pct: number;
}

export interface ImageMetaInfo {
  width: number;
  height: number;
  filename: string;
  format: string;
  size_kb: number;
}

export interface ChangeDetectionResult {
  description: string;
  change_pct: number;
  change_severity: string;
  spectral_change_hints: string[];
  confidence: number;
  change_bbox: [number, number, number, number] | null;
  model: string;
  inference_ms: number;
  task: string;
}

export interface SarFusionResult {
  analysis: string;
  caption: string;
  confidence: number;
  fusion_strategy_used: string;
  sar_preprocessing_steps: string[];
  modality_conflict_detected: boolean;
  model: string;
  inference_ms: number;
  task: string;
}

export interface ExecutionSummary {
  task_type: string;
  models_used: string[];
  parameters: Record<string, unknown>;
  inputs: Record<string, unknown>;
  outputs_summary: Record<string, unknown>;
}

export interface QueryResponse {
  request_id: string;
  task: string;
  answer: string;
  confidence: number;
  agent_reasoning: string;
  ambiguous_tasks: string[];
  low_confidence_fallback?: boolean;
    visuals: {
    regions?: GroundingRegion[];
    change_pct?: number;
    change_severity?: string;
    spectral_hints?: string[];
    biomass_shift_pct?: number;
    water_shift_pct?: number;
    delta_indices?: {
      delta_ndvi: number;
      delta_ndwi: number;
      delta_ndbi: number;
    };
    heatmap_matrix?: number[][];
    change_type?: "water_inundation" | "biomass_loss" | "biomass_gain" | "urban_expansion" | "mixed";
    heatmap_scores?: number[][];
    detected_classes?: string[];
    land_cover_breakdown?: LandCoverClass[];
    indices?: SpectralIndices;
    image_meta?: ImageMetaInfo;
  };
  execution_summary: ExecutionSummary;
  execution_trace: ExecutionTraceStep[];
  total_ms: number;
  error?: string;
}

export interface AuditLogEntry {
  timestamp: string;
  level: string;
  event: string;
  api_key?: string;
  client_ip?: string;
  image_id?: string;
  original_filename?: string;
  size?: number;
  sha256?: string;
  mime_type?: string;
  task_type?: string;
  models_used?: string[];
  reason?: string;
  confidence?: number;
}
