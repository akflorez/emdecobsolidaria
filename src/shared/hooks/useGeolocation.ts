import { useState, useEffect } from 'react';
import { Geolocation } from '@capacitor/geolocation';

export interface LocationCoords {
  latitude: number;
  longitude: number;
}

export function useGeolocation() {
  const [location, setLocation] = useState<LocationCoords | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getCurrentLocation = async () => {
    try {
      const position = await Geolocation.getCurrentPosition();
      setLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      });
    } catch (err: any) {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) => setLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
          (err) => setError(err.message)
        );
      } else {
        setError('Geolocalización no soportada');
      }
    }
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  return { location, error, getCurrentLocation };
}
