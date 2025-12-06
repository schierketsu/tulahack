import { socialObjects } from "../../data/socialObjects";
import { TULA_CENTER } from "../../utils/mapConfig";

interface RouteInfoModalProps {
  destinationName: string;
  from: [number, number];
  to: [number, number];
  onClose: () => void;
}

export function RouteInfoModal({ destinationName, from, to, onClose }: RouteInfoModalProps) {
  // Нормализуем стартовую точку: если пользователь вне Тульской области,
  // считаем, что маршрут начинается из центра Тулы (как на карте)
  const normalizeStart = (coords: [number, number]): [number, number] => {
    const [lng, lat] = coords; // [lng, lat]
    // Приблизительные границы Тульской области (как в карте)
    const minLng = 35.5;
    const maxLng = 39.5;
    const minLat = 53.0;
    const maxLat = 54.8;

    if (lng < minLng || lng > maxLng || lat < minLat || lat > maxLat) {
      // TULA_CENTER задан как [lat, lng], преобразуем в [lng, lat]
      return [TULA_CENTER[1], TULA_CENTER[0]];
    }

    return coords;
  };

  // Вычисляем расстояние между точками (приблизительно, по сфере)
  const calculateDistance = (fromCoords: [number, number], toCoords: [number, number]): number => {
    const [fromLng, fromLat] = fromCoords; // [lng, lat]
    const [toLng, toLat] = toCoords;       // [lng, lat]

    const R = 6371; // Радиус Земли в км
    const dLat = ((toLat - fromLat) * Math.PI) / 180;
    const dLon = ((toLng - fromLng) * Math.PI) / 180;
    const fromLatRad = (fromLat * Math.PI) / 180;
    const toLatRad = (toLat * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(fromLatRad) *
        Math.cos(toLatRad) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Находим объект по координатам назначения или по названию
  // to в формате [lng, lat], а в socialObjects координаты в формате [lat, lng]
  let destinationObject = socialObjects.find((obj) => {
    const objLng = obj.coordinates[1];
    const objLat = obj.coordinates[0];
    // Сравниваем с небольшой погрешностью (около 100 метров)
    const tolerance = 0.001;
    return (
      Math.abs(objLng - to[0]) < tolerance &&
      Math.abs(objLat - to[1]) < tolerance
    );
  });

  // Если не нашли по координатам, пробуем найти по названию
  if (!destinationObject) {
    destinationObject = socialObjects.find((obj) => obj.name === destinationName);
  }

  const destinationAddress = destinationObject?.address || "";

  const normalizedFrom = normalizeStart(from);
  const distance = calculateDistance(normalizedFrom, to);
  const distanceKm = distance.toFixed(1);

  return (
    <div className="object-card-overlay">
      <div className="object-card">
        <div className="object-card-header">
          <div className="object-card-title">Маршрут построен</div>
          <button
            className="object-card-close"
            type="button"
            aria-label="Закрыть"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div className="route-card-content">
          <div className="route-card-row">
            <div className="route-card-label">Пункт назначения</div>
            <div className="route-card-value">
              {destinationAddress && (
                <div className="object-card-address" style={{ marginTop: 0, marginBottom: '8px' }}>
                  {destinationAddress}
                </div>
              )}
              <div>{destinationName}</div>
            </div>
          </div>

          <div className="route-card-row">
            <div className="route-card-label">Расстояние</div>
            <div className="route-card-value">{distanceKm} км</div>
          </div>

        </div>
      </div>
    </div>
  );
}

