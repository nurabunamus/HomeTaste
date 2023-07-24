/* eslint-disable prettier/prettier */
/* eslint-disable arrow-body-style */
/* eslint-disable node/no-unsupported-features/es-syntax */
/* eslint-disable import/no-extraneous-dependencies */
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

cloudinary.config({
  cloud_name: process.env.STORAGE_NAME,
  api_key: process.env.STORAGE_API_KEY,
  api_secret: process.env.STORAGE_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: () => {
    return { folder: 'user-profiles' };
  },
});

export default storage;
