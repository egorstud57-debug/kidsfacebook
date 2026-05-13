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
          images.find((img) => img.pageNumber === 0) ??
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

  /** Полосы по краям, лёгкий орнамент и скруглённая рамка обложки. */
  private drawTitlePageBookDecor(
    doc: PDFKit.PDFDocument,
    pageWidth: number,
    pageHeight: number,
  ): void {
    doc.save();
    doc.rect(0, 0, 18, pageHeight).fill('#E8E0D8');
    doc.rect(pageWidth - 18, 0, 18, pageHeight).fill('#E8E0D8');
    doc.restore();

    doc.save();
    doc.fillColor('#D8D0C8').opacity(0.55);
    const step = 28;
    for (let y = 76; y < pageHeight - 40; y += step) {
      doc.circle(27, y, 1.15).fill();
      doc.circle(pageWidth - 27, y, 1.15).fill();
    }
    doc.opacity(1).restore();

    doc.save();
    doc.lineWidth(0.65).strokeColor('#CEC2B5');
    doc.roundedRect(26, 26, pageWidth - 52, pageHeight - 52, 14).stroke();
    doc.restore();
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
    this.drawTitlePageBookDecor(doc, pageWidth, pageHeight);

    const brandBandY = 40;
    const brandBandH = 40;
    doc.rect(margin, brandBandY, contentWidth, brandBandH).fill('#F3EBE2');
    doc
      .lineWidth(0.45)
      .strokeColor('#D8CBBE')
      .rect(margin, brandBandY, contentWidth, brandBandH)
      .stroke();

    doc.fontSize(15).fillColor('#4A3F35').text('KidFaceBook', margin, brandBandY + 9, {
      align: 'center',
      width: contentWidth,
    });
    doc.fontSize(9).fillColor('#7D726A').text('Персональные сказки с вашим ребёнком в главной роли', margin, brandBandY + 28, {
      align: 'center',
      width: contentWidth,
      lineGap: 2,
    });

    const ornamentsY = brandBandY + brandBandH + 6;
    doc.save();
    doc.strokeColor('#C4B5A4').lineWidth(0.35);
    const ox = pageWidth / 2;
    doc.moveTo(ox - 62, ornamentsY).lineTo(ox - 28, ornamentsY).stroke();
    doc.moveTo(ox + 28, ornamentsY).lineTo(ox + 62, ornamentsY).stroke();
    doc.restore();

    const coverTop = brandBandY + brandBandH + 18;
    const coverH = 198;
    let textCursorY = coverTop + coverH + 28;

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
        .text('Обложка появится после генерации иллюстрации', margin, coverTop + 28, {
          align: 'center',
          width: contentWidth,
        });
      textCursorY = doc.y + 32;
    }

    const titleSize =
      story.title.length > 48 ? 24 : story.title.length > 32 ? 28 : story.title.length > 22 ? 32 : 36;

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

    const decoY = Math.min(doc.y + 24, pageHeight - 58);
    doc.fontSize(13).fillColor('#C4A574').text('★      ★      ★', margin, decoY, {
      align: 'center',
      width: contentWidth,
    });

    doc.fontSize(8).fillColor('#B8AEA6').text('KidFaceBook · персональные детские книги', margin, pageHeight - 46, {
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
    doc.rect(0, 0, 10, doc.page.height).fill('#F4EFE8');

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
