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

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

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
  const maxAttempts = 3;
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
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
    } catch (e) {
      lastError = e;
      const netFail =
        e instanceof TypeError ||
        (e instanceof Error && /fetch|network|Failed to fetch/i.test(e.message));
      if (attempt < maxAttempts && netFail) {
        await delay(1500 * attempt);
        continue;
      }
      throw e instanceof Error ? e : new Error('Не удалось запустить генерацию книги');
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Не удалось запустить генерацию книги');
}

export async function getJobStatus(jobId: string): Promise<JobStatusData> {
  const maxAttempts = 6;
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const res = await fetch(`${API_BASE}/api/job/${jobId}`);
      if (!res.ok && res.status >= 500 && attempt < maxAttempts) {
        await delay(800 * attempt);
        continue;
      }

      const body = (await res.json()) as JobStatusApiResponse;
      if (!res.ok || !body.success || !body.data) {
        throw new Error(body.message || body.error || 'Не удалось получить статус генерации');
      }
      return body.data;
    } catch (e) {
      lastError = e;
      if (attempt < maxAttempts) {
        await delay(1000 * attempt);
        continue;
      }
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error('Не удалось получить статус генерации (проблема сети)');
}

export async function waitForJobCompletion(
  jobId: string,
  opts?: { pollIntervalMs?: number; timeoutMs?: number },
): Promise<NonNullable<JobStatusData['result']>> {
  const pollIntervalMs = opts?.pollIntervalMs ?? 2500;
  /** Kie + PDF на Render могут идти дольше 6 минут */
  const timeoutMs = opts?.timeoutMs ?? 20 * 60 * 1000;
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
