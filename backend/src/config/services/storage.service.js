import imagekit from 'imagekit';
import fs from 'fs';
import path from 'path';

const hasImageKit = Boolean(
  process.env.IMAGEKIT_PUBLIC_KEY &&
  process.env.IMAGEKIT_PRIVATE_KEY &&
  process.env.IMAGEKIT_URL_ENDPOINT
);

let imageKit = null;
if (hasImageKit) {
  imageKit = new imagekit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
  });
}

async function ensureUploadsDir() {
  const dir = path.resolve(process.cwd(), 'uploads');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

async function uploadImage(fileBuffer, fileName) {
  try {
    if (imageKit) {
      const response = await imageKit.upload({ file: fileBuffer, fileName });
      return response; // includes .url
    }

    // Fallback: save locally under /uploads and serve statically
    const uploadsDir = await ensureUploadsDir();
    const safeBase = (fileName || `upload-${Date.now()}`).replace(/[^a-z0-9_.-]/gi, '_');
    const finalName = `${Date.now()}-${safeBase}`;
    const filePath = path.join(uploadsDir, finalName);
    fs.writeFileSync(filePath, fileBuffer);
    const baseUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 3000}`;
    return { url: `${baseUrl}/uploads/${finalName}` };
  } catch (error) {
    console.error('Error uploading media:', error);
    throw new Error('Image upload failed');
  }
}

export { uploadImage };