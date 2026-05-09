import { Router, Request } from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { BookController } from '../controllers/bookController';

const router = Router();
const bookController = new BookController();

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, process.env.UPLOAD_DIR || './uploads');
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueSuffix);
  },
});

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG and WebP are allowed.'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10),
    files: parseInt(process.env.MAX_FILES || '3', 10),
  },
});

router.post(
  '/generate-book',
  upload.array('photos', 3),
  bookController.generateBook.bind(bookController),
);
router.get('/job/:jobId', bookController.getJobStatus.bind(bookController));
router.get('/job/:jobId/result', bookController.getJobResult.bind(bookController));
router.delete('/job/:jobId', bookController.cancelJob.bind(bookController));
router.get('/styles', bookController.getStyles.bind(bookController));

export { router as generateRoutes };
