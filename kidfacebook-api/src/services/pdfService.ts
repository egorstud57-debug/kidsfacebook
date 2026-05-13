import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { GeneratedStory, GeneratedImage, BookStyle } from '../types';

interface PdfGenerationParams {
  story: GeneratedStory;
  images: GeneratedImage[];
  childName: string;
  style: BookStyle;
}

interface PdfResult {
  pdfPath: string;
  filename: string;
}

const NOTO_SANS_VF = 'NotoSans-VF.ttf';

export class PdfService {
  private outputDir: string;

  constructor() {
    this.outputDir = process.env.OUTPUT_DIR || './output';
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  /** Шрифт с кириллицей (Helvetica по умолчанию в PDFKit её не рисует). */
  private cyrillicFontPath(): string {
    const envPath = process.env.PDF_CYRILLIC_FONT_PATH?.trim();
    const candidates = [
      envPath,
      path.join(__dirname, '../../fonts', NOTO_SANS_VF),
      path.join(process.cwd(), 'fonts', NOTO_SANS_VF),
      path.join(process.cwd(), 'kidfacebook-api/fonts', NOTO_SANS_VF),
    ].filter((p): p is string => Boolean(p));

    for (const p of candidates) {
      if (fs.existsSync(p)) {
        return p;
      }
    }

    console.error(
      'PdfService: файл шрифта NotoSans-VF.ttf не найден. Проверено:',
      candidates,
      '— кириллица в PDF будет «кракозябрами». Добавьте шрифт в репозиторий (kidfacebook-api/fonts/) или PDF_CYRILLIC_FONT_PATH.',
    );
    return 'Helvetica';
  }

  async generatePdf(params: PdfGenerationParams): Promise<PdfResult> {
    const { story, images, childName, style } = params;
    const _style = style;
    console.log(`📚 PdfService: Creating PDF for "${story.title}"`);

    const filename = `book_${uuidv4()}.pdf`;
    const pdfPath = path.join(this.outputDir, filename);

    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margins: { top: 50, bottom: 50, left: 50, right: 50 },
          info: {
            Title: story.title,
            Author: `KidFaceBook для ${childName}`,
            Subject: 'Персонализированная детская книга',
            Creator: 'KidFaceBook',
          },
        });

        const stream = fs.createWriteStream(pdfPath);
        doc.pipe(stream);

        const cyrillicFont = this.cyrillicFontPath();
        doc.font(cyrillicFont);

        this.createTitlePage(
          doc,
          story,
          childName,
          _style,
          images.find((img) => img.pageNumber === 1),
        );

        for (let i = 0; i < story.pages.length; i++) {
          const page = story.pages[i];
          const image = images.find((img) => img.pageNumber === page.pageNumber);
          doc.addPage();
          doc.font(cyrillicFont);
          this.createStoryPage(doc, page, image);
        }

        if (story.moral) {
          doc.addPage();
          doc.font(cyrillicFont);
          this.createMoralPage(doc, story.moral, childName);
        }

        doc.end();

        stream.on('finish', () => resolve({ pdfPath, filename }));
        stream.on('error', reject);
      } catch (error) {
        reject(error);
      }
    });
  }

  private createTitlePage(
    doc: PDFKit.PDFDocument,
    story: GeneratedStory,
    childName: string,
    _style: BookStyle,
    coverImage?: GeneratedImage,
  ): void {
    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    const margin = 50;
    const contentWidth = pageWidth - margin * 2;

    doc.rect(0, 0, pageWidth, pageHeight).fill('#FFF8EF');

    const coverTop = 44;
    const coverH = 210;
    let textCursorY = coverTop + coverH + 32;

    let hasCover = false;
    if (
      coverImage &&
      fs.existsSync(coverImage.localPath) &&
      !coverImage.localPath.endsWith('.svg')
    ) {
      try {
        doc.image(coverImage.localPath, margin, coverTop, {
          fit: [contentWidth, coverH],
          align: 'center',
          valign: 'center',
        });
        doc
          .lineWidth(0.75)
          .strokeColor('#D9C9B8')
          .rect(margin, coverTop, contentWidth, coverH)
          .stroke();
        hasCover = true;
      } catch {
        hasCover = false;
      }
    }

    if (!hasCover) {
      doc.rect(margin, coverTop, contentWidth, 10).fill('#E8D5C5');
      doc
        .fontSize(11)
        .fillColor('#A89888')
        .text('Персональная книга', margin, coverTop + 28, {
          align: 'center',
          width: contentWidth,
        });
      textCursorY = doc.y + 36;
    }

    const titleSize =
      story.title.length > 56 ? 22 : story.title.length > 38 ? 26 : story.title.length > 28 ? 30 : 34;

    doc.fontSize(titleSize).fillColor('#3A3A3A').text(story.title, margin, textCursorY, {
      align: 'center',
      width: contentWidth,
      lineGap: 8,
    });

    const subtitleY = doc.y + 22;
    doc
      .fontSize(15)
      .fillColor('#6E6E6E')
      .text(`Персональная история для ${childName}`, margin, subtitleY, {
        align: 'center',
        width: contentWidth,
        lineGap: 4,
      });

    const decoY = Math.min(doc.y + 26, pageHeight - 72);
    doc.fontSize(13).fillColor('#C4A574').text('★      ★      ★', margin, decoY, {
      align: 'center',
      width: contentWidth,
    });

    doc.fontSize(9).fillColor('#B0B0B0').text('KidFaceBook', margin, pageHeight - 52, {
      align: 'center',
      width: contentWidth,
    });
  }

  private createStoryPage(
    doc: PDFKit.PDFDocument,
    page: { pageNumber: number; text: string; imagePrompt: string },
    image?: GeneratedImage,
  ): void {
    const pageWidth = doc.page.width;
    const margin = 50;
    const contentWidth = pageWidth - margin * 2;

    doc.rect(0, 0, pageWidth, doc.page.height).fill('#FFFEF5');
    doc.fontSize(12).fillColor('#CCCCCC').text(`— ${page.pageNumber} —`, margin, 30, {
      align: 'center',
      width: contentWidth,
    });

    const imageY = 60;
    const imageHeight = 350;

    if (image && fs.existsSync(image.localPath)) {
      if (image.localPath.endsWith('.svg')) {
        doc.rect(margin, imageY, contentWidth, imageHeight).fillAndStroke('#E8F4F8', '#CCE5FF');
        doc.fontSize(18).fillColor('#666').text('Иллюстрация', margin, imageY + imageHeight / 2 - 20, {
          align: 'center',
          width: contentWidth,
        });
      } else {
        try {
          doc.image(image.localPath, margin, imageY, {
            fit: [contentWidth, imageHeight],
            align: 'center',
            valign: 'center',
          });
        } catch {
          doc.rect(margin, imageY, contentWidth, imageHeight).fill('#F0F0F0');
        }
      }
    } else {
      doc.rect(margin, imageY, contentWidth, imageHeight).fill('#F5F5F5');
    }

    const textY = imageY + imageHeight + 40;
    doc.fontSize(18).fillColor('#333333').text(page.text, margin, textY, {
      align: 'center',
      width: contentWidth,
      lineGap: 8,
    });
  }

  private createMoralPage(doc: PDFKit.PDFDocument, moral: string, childName: string): void {
    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    const margin = 50;
    const contentWidth = pageWidth - margin * 2;

    doc.rect(0, 0, pageWidth, pageHeight).fill('#FFF8DC');
    doc.fontSize(32).fillColor('#4A4A4A').text('Конец', margin, 160, {
      align: 'center',
      width: contentWidth,
    });
    doc.fontSize(22).fillColor('#333333').text(`«${moral}»`, margin, 280, {
      align: 'center',
      width: contentWidth,
      lineGap: 6,
    });
    doc.fontSize(16).fillColor('#888888').text(
      `Эта сказка была создана специально для тебя, ${childName}!`,
      margin,
      pageHeight - 200,
      { align: 'center', width: contentWidth },
    );
  }
}
