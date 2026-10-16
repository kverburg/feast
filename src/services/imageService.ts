const MAX_DIMENSION = 1200;
const SCAN_DIMENSION = 1600; // photos of recipe pages need more detail to stay readable
const JPEG_QUALITY = 0.85;

async function loadBitmap(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if (typeof createImageBitmap === 'function') {
    try {
      return await createImageBitmap(file, { imageOrientation: 'from-image' });
    } catch {
      // fall through to <img>
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
}

// Shrink a photo to at most 1200px and re-encode as JPEG, so uploads stay around 100-300 KB.
async function resizeToJpeg(file: File, maxDimension: number = MAX_DIMENSION): Promise<Blob> {
  const bitmap = await loadBitmap(file);
  const width = 'naturalWidth' in bitmap ? bitmap.naturalWidth : bitmap.width;
  const height = 'naturalHeight' in bitmap ? bitmap.naturalHeight : bitmap.height;
  const scale = Math.min(1, maxDimension / Math.max(width, height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(width * scale));
  canvas.height = Math.max(1, Math.round(height * scale));
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not process the image.');
  ctx.fillStyle = '#ffffff'; // transparent PNGs would otherwise turn black
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Could not process the image.'))), 'image/jpeg', JPEG_QUALITY)
  );
}

const blobToDataUrl = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Could not read the image.'));
    reader.readAsDataURL(blob);
  });

/**
 * Prepare an image file for use as a recipe image and return a URL for it.
 * It is stored through the worker (/api/image) when available; where there is no worker
 * (local dev) the resized image is kept inline as a data URL instead.
 */
export async function uploadRecipeImage(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('That file is not an image.');
  const blob = await resizeToJpeg(file);
  try {
    const res = await fetch('/api/image', { method: 'POST', headers: { 'Content-Type': 'image/jpeg' }, body: blob });
    if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
      const body = await res.json();
      if (typeof body.url === 'string') return body.url;
    }
  } catch {
    // fall back to inline below
  }
  return blobToDataUrl(blob);
}

/** Upload a (scan) data URL to the server's image store. Returns its /api/image/... URL, or null when that is not possible. */
export async function uploadDataUrl(dataUrl: string): Promise<string | null> {
  try {
    const blob = await (await fetch(dataUrl)).blob();
    const res = await fetch('/api/image', { method: 'POST', headers: { 'Content-Type': blob.type || 'image/jpeg' }, body: blob });
    if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
      const body = await res.json();
      if (typeof body.url === 'string') return body.url;
    }
  } catch {
    // no server behind this page
  }
  return null;
}

/** A photo of a recipe page, shrunk for the AI to read, returned as a data URL. */
export async function photoToScanDataUrl(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('That file is not an image.');
  return blobToDataUrl(await resizeToJpeg(file, SCAN_DIMENSION));
}
