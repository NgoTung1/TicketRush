import React, { useState, useCallback } from 'react';
import Cropper, { Area } from 'react-easy-crop';

interface ImageCropperProps {
  imageSrc: string;
  onCropDone: (croppedBlob: Blob) => void;
  onClose: () => void;
  aspect?: number;
  cropShape?: 'rect' | 'round';
}

const ImageCropper: React.FC<ImageCropperProps> = ({
  imageSrc,
  onCropDone,
  onClose,
  aspect = 1,
  cropShape = 'round',
}) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onCropComplete = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleCrop = async () => {
    if (!croppedAreaPixels) return;
    setIsProcessing(true);
    try {
      const blob = await getCroppedImage(imageSrc, croppedAreaPixels);
      onCropDone(blob);
    } catch (err) {
      console.error('Lỗi khi cắt ảnh:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-[#1C1C1C] rounded-xl w-full max-w-[480px] mx-4 overflow-hidden shadow-2xl animate-[fadeInUp_0.25s_ease-out]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4">
          <h3 className="text-lg font-bold text-white">Chọn vùng cắt</h3>
          <button
            onClick={onClose}
            className="text-tr-text-muted hover:text-white transition-colors duration-200 text-xl leading-none"
            aria-label="Đóng"
          >
            ✕
          </button>
        </div>

        {/* Cropper area */}
        <div className="relative w-full" style={{ height: 320 }}>
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            cropShape={cropShape}
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            style={{
              containerStyle: { background: '#0a0a0a' },
            }}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-center px-5 py-4">
          <button
            onClick={handleCrop}
            disabled={isProcessing}
            className="
              px-8 py-2.5 rounded-lg
              bg-white text-black font-bold text-sm
              transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed
              hover:bg-gray-200
            "
          >
            {isProcessing ? 'Đang xử lý...' : 'Cắt ảnh'}
          </button>
        </div>
      </div>
    </div>
  );
};


async function getCroppedImage(imageSrc: string, pixelCrop: Area): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Canvas toBlob failed'));
    }, 'image/jpeg', 0.92);
  });
}

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener('load', () => resolve(img));
    img.addEventListener('error', (e) => reject(e));
    img.crossOrigin = 'anonymous';
    img.src = url;
  });
}

export default ImageCropper;
