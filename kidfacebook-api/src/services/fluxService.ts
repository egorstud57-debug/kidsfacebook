import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { ReplicateConfig, StoryPage, BookStyle, GeneratedImage } from '../types';

interface ImageGenerationParams {
  pages: StoryPage[];
  faceReferenceUrl: string;
  style: BookStyle;
  stylePrompt: string;
  childName: string;
  onProgress?: (progress: number, current: number, total: number) => void;
}

export class FluxService {
  private config: ReplicateConfig;
  private outputDir: string;

  constructor(config: ReplicateConfig) {
    this.config = config;
    this.outputDir = process.env.OUTPUT_DIR || './output';
  }

  async generateImages(params: ImageGenerationParams): Promise<GeneratedImage[]> {
    const { pages, faceReferenceUrl, style, stylePrompt, childName, onProgress } =
      params;

    const images: GeneratedImage[] = [];
    const total = pages.length;

    console.log(`🎨 FluxService: Generating ${total} images for ${childName}`);

    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      try {
        const image = await this.generateSingleImage({
          prompt: page.imagePrompt,
          faceReferenceUrl,
          stylePrompt,
          style,
          pageNumber: page.pageNumber,
          childName,
        });
        images.push(image);

        if (onProgress) {
          onProgress(((i + 1) / total) * 100, i + 1, total);
        }
      } catch (error) {
        console.error(`Failed to generate image for page ${page.pageNumber}:`, error);
        images.push(await this.getPlaceholderImage(page.pageNumber));
      }
    }

    return images;
  }

  private async generateSingleImage(params: {
    prompt: string;
    faceReferenceUrl: string;
    stylePrompt: string;
    style: BookStyle;
    pageNumber: number;
    childName: string;
  }): Promise<GeneratedImage> {
    const { prompt, stylePrompt, pageNumber } = params;
    const _fullPrompt = `${prompt}, ${stylePrompt}, high quality, detailed, child-friendly, safe for kids`;

    console.log(`  📷 Generating page ${pageNumber}: ${prompt.slice(0, 50)}...`);

    await this.simulateDelay(1500);
    return this.getPlaceholderImage(pageNumber);
  }

  // TODO: подключить реальный Replicate API
  private async callReplicateApi(_prompt: string, _faceUrl: string): Promise<string> {
    return '';
  }

  private async getPlaceholderImage(pageNumber: number): Promise<GeneratedImage> {
    const filename = `page_${pageNumber}_${uuidv4()}.png`;
    const filepath = path.join(this.outputDir, filename);

    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }

    const svgContent = this.createPlaceholderSvg(pageNumber);
    fs.writeFileSync(filepath.replace('.png', '.svg'), svgContent);

    return {
      pageNumber,
      url: `/output/${filename.replace('.png', '.svg')}`,
      localPath: filepath.replace('.png', '.svg'),
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

  private simulateDelay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
