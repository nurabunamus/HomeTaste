import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

/*
The provided code sets up a Cloudinary configuration and creates a Cloudinary storage instance 
for handling user profile images with Multer Middleware.
*/

cloudinary.config({
  cloud_name: process.env.STORAGE_NAME,
  api_key: process.env.STORAGE_API_KEY,
  api_secret: process.env.STORAGE_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: () => ({ folder: 'user-profiles' }),
});

export default storage;
