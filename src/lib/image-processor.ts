export interface ImageSpec {
  id: string;
  name: string;
  recommendedWidth: number;
  recommendedHeight: number;
  ratioLabel: string;
  aspectRatio: number; // width / height
  maxOriginalSizeMB: number;
  targetMaxCompressedSizeKB: number;
  description: string;
}

export const IMAGE_SPECS: Record<string, ImageSpec> = {
  logo: {
    id: 'logo',
    name: 'Logo ร้าน',
    recommendedWidth: 800,
    recommendedHeight: 800,
    ratioLabel: '1:1',
    aspectRatio: 1,
    maxOriginalSizeMB: 10,
    targetMaxCompressedSizeKB: 500,
    description: 'แนะนำ 800 × 800 px (Ratio 1:1) รองรับไฟล์ต้นฉบับ ≤ 10 MB',
  },
  product: {
    id: 'product',
    name: 'รูปอาหาร / สินค้า',
    recommendedWidth: 1200,
    recommendedHeight: 1200,
    ratioLabel: '1:1',
    aspectRatio: 1,
    maxOriginalSizeMB: 10,
    targetMaxCompressedSizeKB: 1024,
    description: 'แนะนำ 1200 × 1200 px (Ratio 1:1) รองรับไฟล์ต้นฉบับ ≤ 10 MB',
  },
  square: {
    id: 'square',
    name: 'รูปสี่เหลี่ยมจัตุรัส',
    recommendedWidth: 1200,
    recommendedHeight: 1200,
    ratioLabel: '1:1',
    aspectRatio: 1,
    maxOriginalSizeMB: 10,
    targetMaxCompressedSizeKB: 1024,
    description: 'แนะนำ 1200 × 1200 px (Ratio 1:1) เป้าหมาย ≤ 1 MB',
  },
  portrait: {
    id: 'portrait',
    name: 'รูปแนวตั้ง',
    recommendedWidth: 1080,
    recommendedHeight: 1350,
    ratioLabel: '4:5',
    aspectRatio: 4 / 5,
    maxOriginalSizeMB: 10,
    targetMaxCompressedSizeKB: 1024,
    description: 'แนะนำ 1080 × 1350 px (Ratio 4:5) เป้าหมาย ≤ 1 MB',
  },
  landscape: {
    id: 'landscape',
    name: 'รูปแนวนอน',
    recommendedWidth: 1600,
    recommendedHeight: 900,
    ratioLabel: '16:9',
    aspectRatio: 16 / 9,
    maxOriginalSizeMB: 10,
    targetMaxCompressedSizeKB: 1536,
    description: 'แนะนำ 1600 × 900 px (Ratio 16:9) เป้าหมาย ≤ 1.5 MB',
  },
  banner: {
    id: 'banner',
    name: 'แบนเนอร์ร้าน',
    recommendedWidth: 1920,
    recommendedHeight: 1080,
    ratioLabel: '16:9',
    aspectRatio: 16 / 9,
    maxOriginalSizeMB: 10,
    targetMaxCompressedSizeKB: 1536,
    description: 'แนะนำ 1920 × 1080 px (Ratio 16:9) เป้าหมาย ≤ 1.5 MB',
  },
};

export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface OptimizationResult {
  dataUrl: string;
  blob: Blob;
  originalSizeKB: number;
  optimizedSizeKB: number;
  width: number;
  height: number;
  format: string;
}

export function validateImageFile(file: File, spec: ImageSpec): { valid: boolean; error?: string } {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type.toLowerCase())) {
    return {
      valid: false,
      error: 'รองรับเฉพาะไฟล์รูปภาพ JPG, JPEG, PNG และ WebP เท่านั้น',
    };
  }

  const fileSizeMB = file.size / (1024 * 1024);
  if (fileSizeMB > spec.maxOriginalSizeMB) {
    return {
      valid: false,
      error: `ไม่สามารถอัปโหลดรูปภาพได้ รองรับไฟล์ต้นฉบับสูงสุด ${spec.maxOriginalSizeMB} MB (ไฟล์ปัจจุบัน: ${fileSizeMB.toFixed(1)} MB)`,
    };
  }

  return { valid: true };
}

export async function processAndOptimizeImage(
  imageSource: string | File,
  spec: ImageSpec,
  cropArea?: CropArea
): Promise<OptimizationResult> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const naturalWidth = img.naturalWidth;
        const naturalHeight = img.naturalHeight;

        let sourceX = 0;
        let sourceY = 0;
        let sourceWidth = naturalWidth;
        let sourceHeight = naturalHeight;

        if (cropArea) {
          sourceX = Math.max(0, cropArea.x);
          sourceY = Math.max(0, cropArea.y);
          sourceWidth = Math.min(naturalWidth - sourceX, cropArea.width);
          sourceHeight = Math.min(naturalHeight - sourceY, cropArea.height);
        } else if (spec.aspectRatio) {
          // Auto center-crop to target aspect ratio if no manual crop
          const currentRatio = naturalWidth / naturalHeight;
          if (currentRatio > spec.aspectRatio) {
            // Wider than target ratio
            sourceWidth = naturalHeight * spec.aspectRatio;
            sourceHeight = naturalHeight;
            sourceX = (naturalWidth - sourceWidth) / 2;
            sourceY = 0;
          } else {
            // Taller than target ratio
            sourceWidth = naturalWidth;
            sourceHeight = naturalWidth / spec.aspectRatio;
            sourceX = 0;
            sourceY = (naturalHeight - sourceHeight) / 2;
          }
        }

        // Automatic Resize Rule:
        // If image is larger than target recommended dimensions, downscale.
        // If image is smaller (e.g. 800x800 vs 1200x1200), DO NOT upscale to maintain clarity.
        let targetWidth = sourceWidth;
        let targetHeight = sourceHeight;

        if (targetWidth > spec.recommendedWidth || targetHeight > spec.recommendedHeight) {
          const widthScale = spec.recommendedWidth / targetWidth;
          const heightScale = spec.recommendedHeight / targetHeight;
          const scale = Math.min(widthScale, heightScale);

          targetWidth = Math.round(targetWidth * scale);
          targetHeight = Math.round(targetHeight * scale);
        }

        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          throw new Error('Canvas 2D context is not supported');
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        ctx.drawImage(
          img,
          sourceX,
          sourceY,
          sourceWidth,
          sourceHeight,
          0,
          0,
          targetWidth,
          targetHeight
        );

        // Compress iteratively to satisfy target file size
        let quality = 0.90;
        let dataUrl = canvas.toDataURL('image/webp', quality);
        let byteString = atob(dataUrl.split(',')[1]);
        let sizeKB = byteString.length / 1024;

        // Fallback to JPEG if WebP isn't smaller or not supported in export
        while (sizeKB > spec.targetMaxCompressedSizeKB && quality > 0.4) {
          quality -= 0.08;
          dataUrl = canvas.toDataURL('image/webp', quality);
          byteString = atob(dataUrl.split(',')[1]);
          sizeKB = byteString.length / 1024;
        }

        // Convert dataURL to Blob
        const arrayBuffer = new ArrayBuffer(byteString.length);
        const uintArray = new Uint8Array(arrayBuffer);
        for (let i = 0; i < byteString.length; i++) {
          uintArray[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([arrayBuffer], { type: 'image/webp' });

        const originalSizeKB =
          typeof imageSource !== 'string'
            ? imageSource.size / 1024
            : (img.src.length * 3) / 4 / 1024;

        resolve({
          dataUrl,
          blob,
          originalSizeKB: Math.round(originalSizeKB),
          optimizedSizeKB: Math.round(sizeKB),
          width: targetWidth,
          height: targetHeight,
          format: 'image/webp',
        });
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load image for processing'));
    };

    if (typeof imageSource === 'string') {
      img.src = imageSource;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          img.src = e.target.result as string;
        }
      };
      reader.readAsDataURL(imageSource);
    }
  });
}
