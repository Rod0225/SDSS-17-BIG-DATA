import {
  User,
  AuthResponse,
  OverviewMetrics,
  AstronomicalPointsResponse,
  ObjectDetail,
  VariableDoc,
  DataQualityReport,
  MLExperimentsSummary,
  PredictionResult,
  PredictionHistoryItem,
  AuditLogItem
} from '../types';

const API_BASE = '/api/v1';

function getHeaders(): HeadersInit {
  const token = localStorage.getItem('sdss_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const headers = options.body instanceof FormData 
    ? { ...(localStorage.getItem('sdss_token') ? { 'Authorization': `Bearer ${localStorage.getItem('sdss_token')}` } : {}) }
    : { ...getHeaders(), ...(options.headers as any) };

  const res = await fetch(url, { ...options, headers });
  
  if (!res.ok) {
    let errMessage = `Error ${res.status}: ${res.statusText}`;
    try {
      const errData = await res.json();
      if (errData.detail) {
        errMessage = typeof errData.detail === 'string' ? errData.detail : JSON.stringify(errData.detail);
      }
    } catch {
      // ignore
    }
    throw new Error(errMessage);
  }

  return res.json();
}

export const api = {
  // Auth
  login: (data: { email: string; password: string }) => 
    request<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  
  register: (data: { email: string; full_name: string; password: string; role?: string }) =>
    request<User>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),

  getMe: () => 
    request<User>('/auth/me'),

  // Overview
  getOverview: () => 
    request<OverviewMetrics>('/overview'),

  // Astronomy 3D
  getPoints: (params: {
    mode?: 'celestial' | 'spatial';
    classes?: string[];
    min_redshift?: number;
    max_redshift?: number;
    min_ra?: number;
    max_ra?: number;
    min_dec?: number;
    max_dec?: number;
    limit?: number;
    offset?: number;
  }) => {
    const q = new URLSearchParams();
    if (params.mode) q.append('mode', params.mode);
    if (params.classes) {
      params.classes.forEach(c => q.append('classes', c));
    }
    if (params.min_redshift !== undefined) q.append('min_redshift', String(params.min_redshift));
    if (params.max_redshift !== undefined) q.append('max_redshift', String(params.max_redshift));
    if (params.min_ra !== undefined) q.append('min_ra', String(params.min_ra));
    if (params.max_ra !== undefined) q.append('max_ra', String(params.max_ra));
    if (params.min_dec !== undefined) q.append('min_dec', String(params.min_dec));
    if (params.max_dec !== undefined) q.append('max_dec', String(params.max_dec));
    if (params.limit !== undefined) q.append('limit', String(params.limit));
    if (params.offset !== undefined) q.append('offset', String(params.offset));
    return request<AstronomicalPointsResponse>(`/astronomy/points?${q.toString()}`);
  },

  getObjectDetail: (objId: string) =>
    request<ObjectDetail>(`/astronomy/object/${objId}`),

  // EDA & Variables
  getEDASummary: (refresh: boolean = false) =>
    request<any>(`/eda/summary?refresh=${refresh}`),

  getVariables: () =>
    request<{ dataset_name: string; total_variables: number; variables: VariableDoc[] }>('/eda/variables'),

  // ETL & Data Quality
  getDataQuality: () =>
    request<DataQualityReport>('/etl/quality'),

  getSparkBenchmark: (runFresh: boolean = false) =>
    request<any>(`/etl/benchmark?run_fresh=${runFresh}`),

  runETL: () =>
    request<{ status: string; message: string; summary: any }>('/etl/run', { method: 'POST' }),

  getETLHistory: () =>
    request<any[]>('/etl/history'),

  // Machine Learning
  getExperiments: () =>
    request<MLExperimentsSummary>('/ml/experiments'),

  retrainModels: (quickMode: boolean = false) =>
    request<{ status: string; message: string; summary: MLExperimentsSummary }>(`/ml/retrain?quick_mode=${quickMode}`, { method: 'POST' }),

  // Predictions
  predictSingle: (data: { u: number; g: number; r: number; i: number; z: number; redshift: number }) =>
    request<PredictionResult>('/predictions/single', { method: 'POST', body: JSON.stringify(data) }),

  predictBatchCSV: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return request<{ total_records: number; predictions: any[]; class_counts: Record<string, number> }>('/predictions/batch', {
      method: 'POST',
      body: formData
    });
  },

  getPredictionHistory: () =>
    request<PredictionHistoryItem[]>('/predictions/history'),

  // User Management
  getUsers: (search?: string, role?: string) => {
    const q = new URLSearchParams();
    if (search) q.append('search', search);
    if (role) q.append('role', role);
    return request<User[]>(`/users/?${q.toString()}`);
  },

  createUser: (data: { email: string; full_name: string; password: string; role: string }) =>
    request<User>('/users/', { method: 'POST', body: JSON.stringify(data) }),

  updateUser: (id: number, data: Partial<{ full_name: string; role: string; is_active: boolean; password?: string }>) =>
    request<User>(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  deleteUser: (id: number) =>
    request<{ message: string }>(`/users/${id}`, { method: 'DELETE' }),

  // Audit Logs
  getAuditLogs: (limit: number = 50, action?: string) => {
    const q = new URLSearchParams({ limit: String(limit) });
    if (action) q.append('action', action);
    return request<AuditLogItem[]>(`/audit/logs?${q.toString()}`);
  }
};

