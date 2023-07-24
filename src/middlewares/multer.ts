/* eslint-disable object-shorthand */
/* eslint-disable prettier/prettier */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable node/no-unsupported-features/es-syntax */
import multer from 'multer';
import { Request } from 'express';
import storage from '../config/cloudinary';

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req: Request, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  },
});

export default upload;
