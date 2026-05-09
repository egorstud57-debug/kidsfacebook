import fs from 'fs';
import path from 'path';

export async function cleanupFiles(filePaths: string[]): Promise<void> {
  for (const filePath of filePaths) {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`🗑️ Deleted: ${filePath}`);
      }
    } catch (error) {
      console.error(`Failed to delete ${filePath}:`, error);
    }
  }
}

export async function cleanupOldFiles(
  directory: string,
  maxAgeMs: number = 24 * 60 * 60 * 1000,
): Promise<void> {
  if (!fs.existsSync(directory)) return;

  const now = Date.now();
  const files = fs.readdirSync(directory);

  for (const file of files) {
    const filePath = path.join(directory, file);
    const stats = fs.statSync(filePath);
    const fileAge = now - stats.mtimeMs;

    if (fileAge > maxAgeMs) {
      try {
        if (stats.isDirectory()) {
          fs.rmSync(filePath, { recursive: true });
        } else {
          fs.unlinkSync(filePath);
        }
        console.log(`🗑️ Cleaned up old file: ${filePath}`);
      } catch (error) {
        console.error(`Failed to cleanup ${filePath}:`, error);
      }
    }
  }
}

export function ensureDirectory(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

export function generateFileName(prefix: string, extension: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}_${timestamp}_${random}.${extension}`;
}

export function isImageFile(filename: string): boolean {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
  const ext = path.extname(filename).toLowerCase();
  return imageExtensions.includes(ext);
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
