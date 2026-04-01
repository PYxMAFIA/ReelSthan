import imagekit from 'imagekit';

let imageKit = null;

function initImageKit() {
  if (imageKit) return imageKit;

  const hasConfig = Boolean(
    process.env.IMAGEKIT_PUBLIC_KEY &&
    process.env.IMAGEKIT_PRIVATE_KEY &&
    process.env.IMAGEKIT_URL_ENDPOINT
  );

  if (hasConfig) {
    imageKit = new imagekit({
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
    });
  }
  return imageKit;
}

async function uploadImage(fileBuffer, fileName) {
  try {
    const ik = initImageKit();
    if (!ik) {
      throw new Error('ImageKit is not configured. Please check your environment variables.');
    }

    const response = await ik.upload({ file: fileBuffer, fileName });
    return response;
  } catch (error) {
    console.error('Error uploading media:', error);
    throw new Error('Image upload failed: ' + error.message);
  }
}

export { uploadImage };