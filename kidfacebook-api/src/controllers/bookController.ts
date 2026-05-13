import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import {
  GenerateBookRequestSchema,
  BookGenerationJob,
  ApiResponse,
  GenerateBookResponse,
  JobStatusResponse,
  BookResultResponse,
  STYLE_PROMPTS,
  STYLE_STORY_TONES,
} from '../types';
import { YandexGptService } from '../services/yandexGptService';
import { ImageGenerationService } from '../services/imageGenerationService';
import { PdfService } from '../services/pdfService';
import { cleanupFiles } from '../utils/cleanup';

const jobs = new Map<string, BookGenerationJob>();

export class BookController {
  private yandexGpt: YandexGptService;
  private imageGeneration: ImageGenerationService;
  private pdf: PdfService;

  constructor() {
    this.yandexGpt = new YandexGptService({
      apiKey: process.env.YANDEX_GPT_API_KEY || '',
      folderId: process.env.YANDEX_GPT_FOLDER_ID || '',
    });
    this.imageGeneration = new ImageGenerationService();
    this.pdf = new PdfService();
  }

  async generateBook(req: Request, res: Response): Promise<void> {
    try {
      const validationResult = GenerateBookRequestSchema.safeParse(req.body);

      if (!validationResult.success) {
        const response: ApiResponse = {
          success: false,
          error: 'Validation failed',
          message: validationResult.error.errors.map((e) => e.message).join(', '),
        };
        res.status(400).json(response);
        return;
      }

      const requestData = validationResult.data;
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        const response: ApiResponse = {
          success: false,
          error: 'No photos uploaded',
          message: 'Please upload at least 1 photo',
        };
        res.status(400).json(response);
        return;
      }

      const jobId = uuidv4();
      const job: BookGenerationJob = {
        id: jobId,
        status: 'pending',
        progress: 0,
        currentStep: 'Инициализация...',
        request: requestData,
        photosPaths: files.map((f) => f.path),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jobs.set(jobId, job);

      this.processBookGeneration(jobId).catch((err) => {
        console.error(`Job ${jobId} failed:`, err);
        const failedJob = jobs.get(jobId);
        if (failedJob) {
          failedJob.status = 'failed';
          failedJob.error = err.message;
          failedJob.updatedAt = new Date();
        }
      });

      const response: ApiResponse<GenerateBookResponse> = {
        success: true,
        data: {
          jobId,
          status: 'pending',
          message: 'Book generation started. Use /api/job/:jobId to check status.',
        },
      };
      res.status(202).json(response);
    } catch (error) {
      console.error('Generate book error:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Failed to start book generation',
      };
      res.status(500).json(response);
    }
  }

  async getJobStatus(req: Request, res: Response): Promise<void> {
    const { jobId } = req.params;
    const job = jobs.get(jobId);

    if (!job) {
      const response: ApiResponse = {
        success: false,
        error: 'Job not found',
      };
      res.status(404).json(response);
      return;
    }

    const statusResponse: JobStatusResponse = {
      jobId: job.id,
      status: job.status,
      progress: job.progress,
      currentStep: job.currentStep,
    };

    if (job.status === 'completed' && job.pdfUrl) {
      statusResponse.result = {
        success: true,
        pdfUrl: job.pdfUrl,
        previewImages: job.previewImages || [],
        title: job.story?.title || 'Книга',
        pageCount: job.story?.pages.length || 0,
      };
    }

    if (job.status === 'failed') {
      statusResponse.error = job.error;
    }

    const response: ApiResponse<JobStatusResponse> = {
      success: true,
      data: statusResponse,
    };
    res.json(response);
  }

  async getJobResult(req: Request, res: Response): Promise<void> {
    const { jobId } = req.params;
    const job = jobs.get(jobId);

    if (!job) {
      res.status(404).json({ success: false, error: 'Job not found' });
      return;
    }

    if (job.status !== 'completed') {
      res.status(400).json({
        success: false,
        error: 'Job not completed',
        status: job.status,
      });
      return;
    }

    const result: BookResultResponse = {
      success: true,
      pdfUrl: job.pdfUrl!,
      previewImages: job.previewImages || [],
      title: job.story?.title || 'Книга',
      pageCount: job.story?.pages.length || 0,
    };
    res.json({ success: true, data: result });
  }

  async cancelJob(req: Request, res: Response): Promise<void> {
    const { jobId } = req.params;
    const job = jobs.get(jobId);

    if (!job) {
      res.status(404).json({ success: false, error: 'Job not found' });
      return;
    }

    const filesToClean = [
      ...job.photosPaths,
      ...(job.images?.map((i) => i.localPath) || []),
      job.pdfPath,
    ].filter(Boolean) as string[];

    await cleanupFiles(filesToClean);
    jobs.delete(jobId);
    res.json({ success: true, message: 'Job cancelled and files cleaned up' });
  }

  async getStyles(_req: Request, res: Response): Promise<void> {
    const styles = [
      {
        id: 'fairy-tale',
        name: 'Волшебная сказка',
        description:
          'Мягкие акварельные иллюстрации в стиле классических сказок',
        preview: '/assets/styles/fairy-tale.jpg',
      },
      {
        id: 'comic',
        name: 'Комикс',
        description: 'Яркий стиль как в мультике "Три кота"',
        preview: '/assets/styles/comic.jpg',
      },
      {
        id: 'pixar',
        name: 'Pixar 3D',
        description: 'Объёмные персонажи как в мультфильмах Pixar',
        preview: '/assets/styles/pixar.jpg',
      },
    ];
    res.json({ success: true, data: styles });
  }

  private async processBookGeneration(jobId: string): Promise<void> {
    const job = jobs.get(jobId);
    if (!job) return;

    try {
      this.updateJob(jobId, {
        status: 'processing',
        progress: 10,
        currentStep: 'Создаём волшебную историю...',
      });

      const story = await this.yandexGpt.generateStory({
        childName: job.request.childName,
        childAge: job.request.childAge,
        childGender: job.request.childGender,
        interests: job.request.interests,
        style: job.request.style,
        tone: STYLE_STORY_TONES[job.request.style],
      });

      this.updateJob(jobId, {
        story,
        progress: 30,
        currentStep: 'История готова! Рисуем иллюстрации...',
      });

      const faceReferencePath = job.photosPaths[0];
      const images = await this.imageGeneration.generateImages({
        pages: story.pages,
        faceReferencePath,
        style: job.request.style,
        stylePrompt: STYLE_PROMPTS[job.request.style],
        childName: job.request.childName,
        onProgress: (progress, current, total) => {
          this.updateJob(jobId, {
            progress: 30 + Math.round((progress / 100) * 50),
            currentStep: `Рисуем иллюстрацию ${current} из ${total}...`,
          });
        },
      });

      this.updateJob(jobId, {
        images,
        progress: 80,
        currentStep: 'Собираем книгу...',
      });

      const pdfResult = await this.pdf.generatePdf({
        story,
        images,
        childName: job.request.childName,
        style: job.request.style,
      });

      const baseUrl = (process.env.BASE_URL || 'http://localhost:3001').replace(
        /\/$/,
        '',
      );

      this.updateJob(jobId, {
        status: 'completed',
        progress: 100,
        currentStep: 'Книга готова!',
        pdfPath: pdfResult.pdfPath,
        pdfUrl: `${baseUrl}/output/${pdfResult.filename}`,
        previewImages: images
          .slice(0, 3)
          .map((img) => `${baseUrl}/${img.localPath.replace(/\\/g, '/')}`),
      });

      console.log(`✅ Job ${jobId} completed successfully`);
    } catch (error) {
      console.error(`❌ Job ${jobId} failed:`, error);
      this.updateJob(jobId, {
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  private updateJob(jobId: string, updates: Partial<BookGenerationJob>): void {
    const job = jobs.get(jobId);
    if (job) {
      Object.assign(job, updates, { updatedAt: new Date() });
    }
  }
}
