export interface VectorResult {
  svg: string;
  eps?: string;
}

export enum ConversionStatus {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  GENERATING_SVG = 'GENERATING_SVG',
  GENERATING_EPS = 'GENERATING_EPS',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR',
}

export interface ImageFile {
  file: File;
  preview: string;
  base64: string;
}
