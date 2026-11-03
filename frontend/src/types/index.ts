export type Role = 'ADMIN' | 'ANALYST' | 'VIEWER';

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: Role;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface OverviewMetrics {
  total_records: number;
  galaxy_count: number;
  star_count: number;
  qso_count: number;
  completeness_percentage: number;
  best_model: {
    name: string;
    accuracy: number;
  };
  last_updated: string;
}

export interface AstronomicalPoint {
  id: string;
  x: number;
  y: number;
  z: number;
  class: 'GALAXY' | 'STAR' | 'QSO';
  ra: number;
  dec: number;
  z_val: number;
  r_mag: number;
  dist_mpc?: number;
}

export interface AstronomicalPointsResponse {
  mode: 'celestial' | 'spatial';
  total_available: number;
  total_filtered: number;
  count_returned: number;
  points: AstronomicalPoint[];
}

export interface ObjectDetail {
  obj_ID: string;
  class: string;
  alpha: number;
  delta: number;
  u: number;
  g: number;
  r: number;
  i: number;
  z: number;
  u_g: number;
  g_r: number;
  r_i: number;
  i_z: number;
  redshift: number;
  plate: number;
  MJD: number;
  fiber_ID: number;
  spec_obj_ID: string;
  pos_celestial: { x: number; y: number; z: number };
  pos_spatial: { x: number; y: number; z: number; estimated_distance_mpc: number };
  machine_learning_inference?: {
    predicted_class: string;
    confidence: number;
    probabilities: Record<string, number>;
    model_used: string;
  };
}

export interface VariableDoc {
  name: string;
  description: string;
  type: string;
  unit: string;
  ml_role: string;
  importance: string;
  stats: Record<string, any>;
}

export interface DataQualityReport {
  timestamp: string;
  total_records: number;
  total_columns: number;
  valid_records: number;
  discarded_records: number;
  completeness_percentage: number;
  missing_percentage: number;
  duplicate_count: number;
  duplicate_percentage: number;
  sensor_error_count: number;
  total_outliers_detected: number;
  quality_score: number;
  quality_grade: string;
  quality_label: string;
  outliers_by_column: Record<string, { count: number; percentage: number; lower_bound: number; upper_bound: number }>;
  missing_by_column: Record<string, number>;
  recommendations: string[];
}

export interface ModelComparison {
  model_name: string;
  accuracy: number;
  precision_macro: number;
  recall_macro: number;
  f1_macro: number;
  roc_auc_macro: number;
  training_time_seconds: number;
  inference_time_seconds: number;
  confusion_matrix: number[][];
  classes: string[];
  classification_report: Record<string, any>;
  feature_importances: Record<string, number>;
  roc_curves: Record<string, { fpr: number[]; tpr: number[]; auc: number }>;
}

export interface MLExperimentsSummary {
  timestamp: string;
  dataset_rows: number;
  train_rows: number;
  test_rows: number;
  feature_columns: string[];
  target_classes: string[];
  best_model_name: string;
  best_f1_macro: number;
  best_model_path: string;
  models_comparison: ModelComparison[];
  permutation_importance_best_model: Record<string, { mean: number; std: number }>;
  scientific_ml_analysis: {
    best_performer: string;
    accuracy_goal_achieved: boolean;
    key_drivers: string;
    conclusion: string;
  };
}

export interface PredictionResult {
  predicted_class: 'GALAXY' | 'STAR' | 'QSO';
  confidence: number;
  probabilities: Record<string, number>;
  input_features: Record<string, number>;
  model_used: string;
}

export interface PredictionHistoryItem {
  id: number;
  user_id: number;
  model_name: string;
  predicted_class: string;
  confidence_score: number;
  probabilities: Record<string, number>;
  input_data: Record<string, number>;
  created_at: string;
}

export interface AuditLogItem {
  id: number;
  user_id: number | null;
  user_email: string | null;
  action: string;
  module: string;
  details: string | null;
  ip_address: string | null;
  timestamp: string;
}

