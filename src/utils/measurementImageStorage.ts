/**
 * Persistent Image Storage for Tailor Measurement Reference Images
 * Awais Tailor House
 */

const STORAGE_PREFIX = 'awais_meas_images_';

export function getStorageKey(customerId?: string): string {
  return `${STORAGE_PREFIX}${customerId || 'global'}`;
}

/**
 * Get all custom uploaded images for a customer (or global defaults)
 */
export function getStoredCustomImages(customerId?: string): Record<string, string> {
  try {
    const key = getStorageKey(customerId);
    const data = localStorage.getItem(key);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Failed to parse stored measurement images:', e);
  }
  return {};
}

/**
 * Save a custom image for a measurement field
 */
export function saveStoredCustomImage(
  customerId: string | undefined,
  field: string,
  dataUrl: string
): void {
  try {
    const key = getStorageKey(customerId);
    const current = getStoredCustomImages(customerId);
    current[field] = dataUrl;
    localStorage.setItem(key, JSON.stringify(current));
    
    // Also save in global if customer is specified, so it can serve as a quick default fallback
    if (customerId) {
      const globalKey = getStorageKey('global');
      const globalCurrent = getStoredCustomImages('global');
      globalCurrent[field] = dataUrl;
      localStorage.setItem(globalKey, JSON.stringify(globalCurrent));
    }
  } catch (e) {
    console.error('Failed to save measurement image:', e);
  }
}

/**
 * Reset a custom image to default
 */
export function removeStoredCustomImage(customerId: string | undefined, field: string): void {
  try {
    const key = getStorageKey(customerId);
    const current = getStoredCustomImages(customerId);
    delete current[field];
    localStorage.setItem(key, JSON.stringify(current));

    if (customerId) {
      const globalKey = getStorageKey('global');
      const globalCurrent = getStoredCustomImages('global');
      delete globalCurrent[field];
      localStorage.setItem(globalKey, JSON.stringify(globalCurrent));
    }
  } catch (e) {
    console.error('Failed to remove custom measurement image:', e);
  }
}

/**
 * Compress and convert a user-selected image file from PC to a clean base64 data URL
 */
export function compressImageFile(file: File, maxDim = 600, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to parse image'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(reader.result as string);
          return;
        }

        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}
