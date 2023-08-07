import multer, { FileFilterCallback } from 'multer';
import { Request, Response, NextFunction } from 'express';
import storage from '../config/cloudinary';

// Error handling middleware for file size limit
export const fileSizeLimitErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // If the error is a MulterError
  if (err instanceof multer.MulterError) {
    res.status(413).json({ error: 'The image size exceeds 5 MB limit' });
  }
  // If there is a different type of error => Invalid file type
  else if (err) {
    res.status(400).json({ error: err.message });
  } else {
    next();
  }
};
// Multer configuration for file upload
export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB in bytes
  },
  // Define a file filter to allow only 'image/' MIME types
  fileFilter: (
    req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback
  ) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  },
});
