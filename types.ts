export enum Diagnosis {
  NORMAL = 'NORMAL',
  PNEUMONIA = 'PNEUMONIA'
}

export interface AnalysisResult {
  diagnosis: Diagnosis;
  confidence: number;
  report: string;
  heatmapExplanation?: string;
  latency?: number;
}

export interface SyntheticImageRequest {
  prompt: string;
  negativePrompt: string;
}

export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  DIAGNOSIS = 'DIAGNOSIS',
  GENERATION = 'GENERATION',
  EXPERIMENTS = 'EXPERIMENTS'
}

export interface ChartDataPoint {
  name: string;
  value: number;
  subset?: string;
}

// Stats from the PDF for visualization
export const SCALING_LAW_DATA = [
  { shots: 20, scratch: 0.55, pretrained: 0.65, ours: 0.78 },
  { shots: 50, scratch: 0.62, pretrained: 0.72, ours: 0.82 },
  { shots: 100, scratch: 0.70, pretrained: 0.79, ours: 0.86 },
  { shots: 200, scratch: 0.75, pretrained: 0.85, ours: 0.89 },
  { shots: 500, scratch: 0.81, pretrained: 0.92, ours: 0.95 },
];

export const ROBUSTNESS_DATA = [
  { noise: 0.0, auc: 0.95 },
  { noise: 0.1, auc: 0.94 },
  { noise: 0.3, auc: 0.90 },
  { noise: 0.5, auc: 0.85 },
  { noise: 0.8, auc: 0.65 },
];

export const PROMPT_ABLATION_DATA = [
  { name: 'Naive', auc: 0.4131 },
  { name: 'Medical Prompt', auc: 0.4565 },
  { name: 'Ours (Linear)', auc: 0.9049 },
];