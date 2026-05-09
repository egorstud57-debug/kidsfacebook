import type { BookStyle, Gender } from '../types';

const API_BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') || 'http://localhost:3001';

type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';

interface GenerateBookApiResponse {
  success: boolean;
  data?: {
    jobId: string;
    status: JobStatus;
    message: string;
  };
  error?: string;
  message?: string;
}

interface JobStatusApiResponse {
  success: boolean;
  data?: JobStatusData;
  error?: string;
  message?: string;
}

interface JobStatusData {
  jobId: string;
  status: JobStatus;
  progress: number;
  currentStep: string;
  result?: {
    pdfUrl: string;
    previewImages: string[];
    title: string;
    pageCount: number;
  };
  error?: string;
}

/** Результат успешной генерации (после waitForJobCompletion) */
export type BookGenerationResult = NonNullable<JobStatusData['result']>;

export function resolveApiAssetUrl(pathOrUrl: string): string {
  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) {
    return pathOrUrl;
  }
  const path = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
  return `${API_BASE}${path}`;
}

export interface StartBookGenerationPayload {
  childName: string;
  childAge: number;
  childGender: Gender;
  interests: string[];
  style: BookStyle;
  photos: File[];
}

export function mapFrontendStyleToApi(style: BookStyle): 'fairy-tale' | 'comic' | 'pixar' {
  if (style === 'fairytale') return 'fairy-tale';
  return style;
}

export async function startBookGeneration(
  payload: StartBookGenerationPayload,
): Promise<{ jobId: string }> {
  const formData = new FormData();
  formData.append('childName', payload.childName);
  formData.append('childAge', String(payload.childAge));
  formData.append('childGender', payload.childGender);
  formData.append('interests', JSON.stringify(payload.interests));
  formData.append('style', mapFrontendStyleToApi(payload.style));
  payload.photos.forEach((photo) => formData.append('photos', photo));

  const res = await fetch(`${API_BASE}/api/generate-book`, {
    method: 'POST',
    body: formData,
  });

  const body = (await res.json()) as GenerateBookApiResponse;
  if (!res.ok || !body.success || !body.data?.jobId) {
    throw new Error(body.message || body.error || 'Не удалось запустить генерацию книги');
  }

  return { jobId: body.data.jobId };
}

export async function getJobStatus(jobId: string): Promise<JobStatusData> {
  const res = await fetch(`${API_BASE}/api/job/${jobId}`);
  const body = (await res.json()) as JobStatusApiResponse;
  if (!res.ok || !body.success || !body.data) {
    throw new Error(body.message || body.error || 'Не удалось получить статус генерации');
  }
  return body.data;
}

export async function waitForJobCompletion(
  jobId: string,
  opts?: { pollIntervalMs?: number; timeoutMs?: number },
): Promise<NonNullable<JobStatusData['result']>> {
  const pollIntervalMs = opts?.pollIntervalMs ?? 2000;
  const timeoutMs = opts?.timeoutMs ?? 6 * 60 * 1000;
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    const status = await getJobStatus(jobId);

    if (status.status === 'completed' && status.result) {
      return status.result;
    }

    if (status.status === 'failed') {
      throw new Error(status.error || 'Генерация завершилась с ошибкой');
    }

    await new Promise<void>((resolve) => window.setTimeout(resolve, pollIntervalMs));
  }

  throw new Error('Превышено время ожидания генерации книги');
}

export async function healthCheck(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/health`);
    return res.ok;
  } catch {
    return false;
  }
}
