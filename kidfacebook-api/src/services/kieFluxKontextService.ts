import axios from 'axios';

const KIE_FLUX_KONTEXT_BASE = 'https://api.kie.ai/api/v1/flux/kontext';

export type KieFluxModel = 'flux-kontext-pro' | 'flux-kontext-max';

export interface KieFluxGenerateInput {
  prompt: string;
  /** Публичный URL изображения — нужен для режима редактирования / опоры на референс (должен быть доступен с серверов Kie.ai). */
  inputImage?: string;
  aspectRatio?: string;
  model?: KieFluxModel;
  outputFormat?: 'jpeg' | 'png';
  enableTranslation?: boolean;
}

interface KieTaskPayload {
  successFlag: number;
  response?: {
    resultImageUrl?: string;
    originImageUrl?: string;
  };
  errorMessage?: string;
  errorCode?: string;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class KieFluxKontextService {
  constructor(private readonly apiKey: string) {}

  async createTask(input: KieFluxGenerateInput): Promise<string> {
    const body: Record<string, unknown> = {
      prompt: input.prompt,
      aspectRatio: input.aspectRatio ?? '3:4',
      model: input.model ?? 'flux-kontext-pro',
      outputFormat: input.outputFormat ?? 'png',
      enableTranslation: input.enableTranslation ?? false,
    };
    if (input.inputImage) {
      body.inputImage = input.inputImage;
    }

    const { data, status } = await axios.post<{
      code: number;
      msg: string;
      data?: { taskId?: string };
    }>(`${KIE_FLUX_KONTEXT_BASE}/generate`, body, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      validateStatus: () => true,
    });

    if (status !== 200 || data.code !== 200 || !data.data?.taskId) {
      throw new Error(
        data.msg || `Kie.ai Flux Kontext: не удалось создать задачу (HTTP ${status})`,
      );
    }
    return data.data.taskId;
  }

  async waitForResultImageUrl(
    taskId: string,
    options?: { pollMs?: number; maxMs?: number },
  ): Promise<string> {
    const pollMs = options?.pollMs ?? 2500;
    const maxMs = options?.maxMs ?? parseInt(process.env.KIE_AI_POLL_MAX_MS || '300000', 10);
    const started = Date.now();

    while (Date.now() - started < maxMs) {
      const { data, status } = await axios.get<{
        code: number;
        msg: string;
        data?: KieTaskPayload;
      }>(`${KIE_FLUX_KONTEXT_BASE}/record-info`, {
        params: { taskId },
        headers: { Authorization: `Bearer ${this.apiKey}` },
        validateStatus: () => true,
      });

      if (status !== 200 || data.code !== 200 || !data.data) {
        throw new Error(data.msg || `Kie.ai: ошибка record-info (HTTP ${status})`);
      }

      const task = data.data;
      switch (task.successFlag) {
        case 0:
          await sleep(pollMs);
          break;
        case 1: {
          const url = task.response?.resultImageUrl;
          if (!url) {
            throw new Error('Kie.ai: задача успешна, но resultImageUrl отсутствует');
          }
          return url;
        }
        case 2:
        case 3:
          throw new Error(
            task.errorMessage ||
              `Kie.ai: генерация не удалась (successFlag=${task.successFlag})`,
          );
        default:
          throw new Error(`Kie.ai: неизвестный successFlag=${task.successFlag}`);
      }
    }

    throw new Error(`Kie.ai: превышено время ожидания (${maxMs} ms), taskId=${taskId}`);
  }
}
