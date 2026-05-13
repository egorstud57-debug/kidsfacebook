import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import Replicate from 'replicate';
import { StoryPage, BookStyle, GeneratedImage } from '../types';
import { KieFluxKontextService } from './kieFluxKontextService';

interface ImageGenerationParams {
  pages: StoryPage[];
  faceReferencePath: string;
  style: BookStyle;
  stylePrompt: string;
  childName: string;
  onProgress?: (progress: number, current: number, total: number) => void;
}

type ImageBackend = 'kie' | 'replicate' | 'none';

export class ImageGenerationService {
  private outputDir: string;
  private replicate: Replicate | null;
  private kie: KieFluxKontextService | null;
  private backend: ImageBackend;

  constructor() {
    this.outputDir = process.env.OUTPUT_DIR || './output';
    const kieKey = process.env.KIE_AI_API_KEY?.trim();
    const replicateToken = process.env.REPLICATE_API_TOKEN?.trim();
    let prefer = process.env.IMAGE_GEN_PROVIDER?.trim().toLowerCase() ?? '';
    if (prefer === '-none') {
      prefer = 'none';
    }

    this.kie = kieKey ? new KieFluxKontextService(kieKey) : null;
    this.replicate = replicateToken ? new Replicate({ auth: replicateToken }) : null;

    if (prefer === 'none') {
      this.backend = 'none';
    } else if (prefer === 'replicate' && this.replicate) {
      this.backend = 'replicate';
    } else if (prefer === 'kie' && this.kie) {
      this.backend = 'kie';
    } else if (this.kie) {
      this.backend = 'kie';
    } else if (this.replicate) {
      this.backend = 'replicate';
    } else {
      this.backend = 'none';
    }

    console.log(
      `🖼️ Image backend: ${this.backend}${prefer === 'none' ? ' (Kie/Replicate выключены: IMAGE_GEN_PROVIDER=none)' : ''}`,
    );
  }

  async generateImages(params: ImageGenerationParams): Promise<GeneratedImage[]> {
    const { pages, faceReferencePath, stylePrompt, childName, onProgress } = params;
    const images: GeneratedImage[] = [];
    const total = Math.min(pages.length, 12);

    console.log(`🎨 ImageGenerationService: Generating ${total} images for ${childName}`);

    for (let i = 0; i < total; i++) {
      const page = pages[i];
      try {
        const image = await this.generateSingleImage({
          prompt: page.imagePrompt,
          stylePrompt,
          pageNumber: page.pageNumber,
          childName,
          faceReferencePath,
        });
        images.push(image);
      } catch (error) {
        console.error(`Failed to generate image for page ${page.pageNumber}:`, error);
        images.push(await this.getPlaceholderImage(page.pageNumber));
      }

      if (onProgress) {
        onProgress(((i + 1) / total) * 100, i + 1, total);
      }
    }

    return images;
  }

  private async generateSingleImage(params: {
    prompt: string;
    stylePrompt: string;
    pageNumber: number;
    childName: string;
    faceReferencePath: string;
  }): Promise<GeneratedImage> {
    const { prompt, stylePrompt, pageNumber, childName, faceReferencePath } = params;
    const kieExt =
      process.env.KIE_FLUX_OUTPUT_FORMAT === 'jpeg' ? 'jpg' : 'png';
    const fileExt = this.backend === 'kie' ? kieExt : 'png';
    const filename = `page_${pageNumber}_${uuidv4()}.${fileExt}`;
    const localPath = path.join(this.outputDir, filename);

    this.ensureOutputDir();

    if (this.backend === 'none') {
      return this.getPlaceholderImage(pageNumber);
    }

    const scenePrompt =
      this.backend === 'kie'
        ? this.buildKieScenePrompt(stylePrompt, childName, prompt)
        : `${stylePrompt}. Pixar 3D style, bright vibrant colors, child-friendly illustration. Cute child character named ${childName}, keep face and hairstyle similar to reference photo. Scene: ${prompt}.`;

    let imageUrl: string;

    if (this.backend === 'kie' && this.kie) {
      const inputImageUrl = this.faceReferencePublicUrl(faceReferencePath);
      const taskId = await this.kie.createTask({
        prompt: scenePrompt,
        inputImage: inputImageUrl,
        aspectRatio: process.env.KIE_FLUX_ASPECT_RATIO || '3:4',
        model: (process.env.KIE_FLUX_MODEL as 'flux-kontext-pro' | 'flux-kontext-max') ||
          'flux-kontext-pro',
        outputFormat:
          process.env.KIE_FLUX_OUTPUT_FORMAT === 'jpeg' ? 'jpeg' : 'png',
        enableTranslation: process.env.KIE_FLUX_ENABLE_TRANSLATION === 'true',
      });
      imageUrl = await this.kie.waitForResultImageUrl(taskId);
    } else if (this.backend === 'replicate' && this.replicate) {
      const referencePhotoBuffer = fs.readFileSync(faceReferencePath);

      const modelId =
        process.env.REPLICATE_FLUX_PULID_MODEL?.trim() || 'bytedance/flux-pulid';
      const width = parseInt(process.env.REPLICATE_FLUX_PULID_WIDTH || '896', 10);
      const height = parseInt(process.env.REPLICATE_FLUX_PULID_HEIGHT || '1195', 10);
      const numSteps = parseInt(process.env.REPLICATE_FLUX_PULID_NUM_STEPS || '20', 10);
      const startStep = parseInt(process.env.REPLICATE_FLUX_PULID_START_STEP || '1', 10);
      const guidanceScale = parseFloat(
        process.env.REPLICATE_FLUX_PULID_GUIDANCE_SCALE || '4',
      );
      const idWeight = parseFloat(process.env.REPLICATE_FLUX_PULID_ID_WEIGHT || '1');

      const output = await this.replicate.run(modelId as `${string}/${string}`, {
        input: {
          main_face_image: referencePhotoBuffer,
          prompt: scenePrompt,
          width,
          height,
          num_steps: numSteps,
          start_step: startStep,
          guidance_scale: guidanceScale,
          id_weight: idWeight,
        },
      });

      const extracted = this.extractFirstImageUrl(output);
      if (!extracted) {
        throw new Error('Replicate did not return an image URL');
      }
      imageUrl = extracted;
    } else {
      return this.getPlaceholderImage(pageNumber);
    }

    const downloaded = await fetch(imageUrl);
    if (!downloaded.ok) {
      throw new Error(`Failed to download generated image: ${downloaded.status}`);
    }
    const arr = await downloaded.arrayBuffer();
    fs.writeFileSync(localPath, Buffer.from(arr));

    return {
      pageNumber,
      url: `/output/${filename}`,
      localPath,
    };
  }

  /** Публичный URL загруженного фото (docs.kie.ai Flux Kontext — inputImage должен быть доступен серверам Kie). */
  private faceReferencePublicUrl(faceReferencePath: string): string {
    const base = (process.env.BASE_URL || 'http://localhost:3001').replace(/\/$/, '');
    const name = path.basename(faceReferencePath);
    return `${base}/uploads/${encodeURIComponent(name)}`;
  }

  /**
   * Редактирование с опорой на фото ребёнка: промпт только на английском (требование Kie).
   */
  private buildKieScenePrompt(
    stylePrompt: string,
    childName: string,
    sceneEnglish: string,
  ): string {
    return [
      "Children's book illustration based on the reference photo.",
      'Preserve the child\'s facial identity and hairstyle from the reference; wholesome and safe for kids.',
      `Named character: ${childName}.`,
      `Visual style: ${stylePrompt}`,
      `Scene: ${sceneEnglish}`,
    ].join(' ');
  }

  private extractFirstImageUrl(output: unknown): string | null {
    if (typeof output === 'string') {
      return output;
    }
    if (!Array.isArray(output) || output.length === 0) {
      return null;
    }
    const first = output[0];
    if (typeof first === 'string') {
      return first;
    }
    if (first && typeof first === 'object' && 'url' in first) {
      const maybeUrl = (first as { url?: unknown }).url;
      return typeof maybeUrl === 'string' ? maybeUrl : null;
    }
    return null;
  }

  private async getPlaceholderImage(pageNumber: number): Promise<GeneratedImage> {
    const filename = `page_${pageNumber}_${uuidv4()}.svg`;
    const localPath = path.join(this.outputDir, filename);
    this.ensureOutputDir();
    fs.writeFileSync(localPath, this.createPlaceholderSvg(pageNumber));

    return {
      pageNumber,
      url: `/output/${filename}`,
      localPath,
    };
  }

  private createPlaceholderSvg(pageNumber: number): string {
    const colors = ['#FFB6C1', '#87CEEB', '#98FB98', '#DDA0DD', '#F0E68C'];
    const color = colors[pageNumber % colors.length];
    return `
      <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${color}"/>
        <text x="50%" y="45%" font-family="Arial" font-size="32" fill="#333" text-anchor="middle">
          🎨 Иллюстрация
        </text>
        <text x="50%" y="55%" font-family="Arial" font-size="24" fill="#666" text-anchor="middle">
          Страница ${pageNumber}
        </text>
      </svg>
    `;
  }

  private ensureOutputDir(): void {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }
}
