interface RouteInfoModalProps {
  destinationName: string;
  from: [number, number];
  to: [number, number];
  onClose: () => void;
}

export function RouteInfoModal({ destinationName, from, to, onClose }: RouteInfoModalProps) {
  // Вычисляем расстояние между точками (приблизительно)
  const calculateDistance = (from: [number, number], to: [number, number]): number => {
    const R = 6371; // Радиус Земли в км
    const dLat = ((to[1] - from[1]) * Math.PI) / 180;
    const dLon = ((to[0] - from[0]) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((from[1] * Math.PI) / 180) *
        Math.cos((to[1] * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const distance = calculateDistance(from, to);
  const distanceKm = distance.toFixed(1);
  const estimatedTime = Math.round(distance * 1.5); // Примерное время в минутах (при средней скорости)

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
            <div className="route-card-value">{destinationName}</div>
          </div>

          <div className="route-card-row">
            <div className="route-card-label">Расстояние</div>
            <div className="route-card-value">{distanceKm} км</div>
          </div>

          <div className="route-card-row">
            <div className="route-card-label">Примерное время</div>
            <div className="route-card-value">~{estimatedTime} мин</div>
          </div>
        </div>
      </div>
    </div>
  );
}

