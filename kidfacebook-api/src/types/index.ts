import { z } from 'zod';

export const BookStyleEnum = z.enum(['fairy-tale', 'comic', 'pixar']);
export type BookStyle = z.infer<typeof BookStyleEnum>;

export const GenderEnum = z.enum(['boy', 'girl']);
export type Gender = z.infer<typeof GenderEnum>;

export const JobStatusEnum = z.enum(['pending', 'processing', 'completed', 'failed']);
export type JobStatus = z.infer<typeof JobStatusEnum>;

export const GenerateBookRequestSchema = z.object({
  childName: z
    .string()
    .min(2, 'Имя должно содержать минимум 2 символа')
    .max(50, 'Имя слишком длинное'),
  childAge: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(1).max(12)),
  childGender: GenderEnum,
  interests: z
    .string()
    .transform((val) => JSON.parse(val))
    .pipe(z.array(z.string()).min(1).max(10)),
  style: BookStyleEnum,
});
export type GenerateBookRequest = z.infer<typeof GenerateBookRequestSchema>;

export interface StoryPage {
  pageNumber: number;
  text: string;
  imagePrompt: string;
  imageUrl?: string;
}

export interface GeneratedStory {
  title: string;
  pages: StoryPage[];
  moral?: string;
}

/** Ответ модели YandexGPT (JSON в тексте сообщения). */
export const GeneratedStoryJsonSchema = z.object({
  title: z.string().min(1),
  pages: z
    .array(
      z.object({
        pageNumber: z.coerce.number().int().positive(),
        text: z.string().min(1),
        imagePrompt: z.string().min(1),
      }),
    )
    .min(1),
  moral: z.string().optional(),
});

export interface ImageGenerationRequest {
  prompt: string;
  faceReferenceUrl: string;
  style: BookStyle;
  pageNumber: number;
}

export interface GeneratedImage {
  pageNumber: number;
  url: string;
  localPath: string;
}

export interface BookGenerationJob {
  id: string;
  status: JobStatus;
  progress: number;
  currentStep: string;
  request: GenerateBookRequest;
  photosPaths: string[];
  story?: GeneratedStory;
  images?: GeneratedImage[];
  pdfPath?: string;
  pdfUrl?: string;
  previewImages?: string[];
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface GenerateBookResponse {
  jobId: string;
  status: JobStatus;
  message: string;
}

export interface BookResultResponse {
  success: boolean;
  pdfUrl: string;
  previewImages: string[];
  title: string;
  pageCount: number;
}

export interface JobStatusResponse {
  jobId: string;
  status: JobStatus;
  progress: number;
  currentStep: string;
  result?: BookResultResponse;
  error?: string;
}

export interface YandexGptConfig {
  apiKey: string;
  folderId: string;
  modelUri?: string;
}

export interface ReplicateConfig {
  apiToken: string;
  modelVersion?: string;
}

export const STYLE_PROMPTS: Record<BookStyle, string> = {
  'fairy-tale':
    'magical fairy tale illustration, soft watercolor style, dreamy atmosphere, storybook art',
  comic:
    'vibrant comic book style, bold colors, dynamic composition, cartoon illustration',
  pixar:
    '3D Pixar animation style, warm lighting, expressive characters, cinematic quality',
};

export const STYLE_STORY_TONES: Record<BookStyle, string> = {
  'fairy-tale':
    'волшебная сказка с чудесами и добрыми персонажами, как в русских народных сказках',
  comic: 'весёлая история с юмором и приключениями, как в мультике "Три кота"',
  pixar: 'трогательная история с глубоким смыслом, как в мультфильмах Pixar',
};
