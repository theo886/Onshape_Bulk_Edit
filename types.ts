export enum UpdateStatus {
  Idle = 'idle',
  Pending = 'pending',
  Success = 'success',
  Error = 'error',
}

export interface ParsedRow {
  id: string; 
  data: Record<string, string>;
  status: UpdateStatus;
  errorMessage?: string;
}

export type ColumnMap = Record<string, string>;

export interface OnshapeConfig {
  accessKey: string;
  secretKey: string;
}