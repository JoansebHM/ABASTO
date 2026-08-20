import { useState } from 'react';

export interface PointCoordinates {
  latitude: number | undefined;
  longitude: number | undefined;
}

export interface PointMapPickerProps {
  value: PointCoordinates;
  onChange: (value: PointCoordinates) => void;
  disabled?: boolean;
}

export function PointMapPicker({
  value,
  onChange,
  disabled = false,
}: PointMapPickerProps) {
  const [locationError, setLocationError] = useState<string | null>(null);

  const updateCoordinate = (
    coordinate: keyof PointCoordinates,
    nextValue: string
  ) => {
    onChange({
      ...value,
      [coordinate]: nextValue === '' ? undefined : Number(nextValue),
    });
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('La geolocalización no está disponible en este navegador.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLocationError(null);
        onChange({
          latitude: coords.latitude,
          longitude: coords.longitude,
        });
      },
      () => {
        setLocationError('No se pudo obtener la ubicación actual.');
      }
    );
  };

  return (
    <fieldset disabled={disabled}>
      <legend>Ubicación del punto</legend>
      <p>Indica las coordenadas o usa la ubicación actual.</p>
      <div>
        <label htmlFor="point-latitude">Latitud</label>
        <input
          id="point-latitude"
          type="number"
          step="any"
          min="-90"
          max="90"
          value={value.latitude ?? ''}
          onChange={(event) => updateCoordinate('latitude', event.target.value)}
        />
      </div>
      <div>
        <label htmlFor="point-longitude">Longitud</label>
        <input
          id="point-longitude"
          type="number"
          step="any"
          min="-180"
          max="180"
          value={value.longitude ?? ''}
          onChange={(event) =>
            updateCoordinate('longitude', event.target.value)
          }
        />
      </div>
      <button type="button" onClick={useCurrentLocation}>
        Usar mi ubicación actual
      </button>
      {locationError && <p role="alert">{locationError}</p>}
    </fieldset>
  );
}

export default PointMapPicker;