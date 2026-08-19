import { useState } from 'react';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

export function useCamera() {
  const [photo, setPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const takePhoto = async () => {
    setLoading(true);
    setError(null);
    try {
      const image = await Camera.getPhoto({
        quality: 80,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera
      });
      if (image.dataUrl) {
        setPhoto(image.dataUrl);
      }
    } catch (err: any) {
      console.warn('Capacitor Camera fallback web:', err);
      // Fallback web
      setError('Cámara no nativa. Usa la carga de archivos del navegador.');
    } finally {
      setLoading(false);
    }
  };

  return { photo, setPhoto, takePhoto, loading, error };
}
