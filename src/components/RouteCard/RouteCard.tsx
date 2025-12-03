import { useState, useEffect, useRef } from "react";
import { SocialObject } from "../../types";
import { socialObjects } from "../../data/socialObjects";

interface RouteCardProps {
  onClose: () => void;
  onSelectFromMap?: (enabled: boolean) => void;
  selectedMapPoint?: [number, number] | null;
  onSelectPoint?: () => void;
  onBuildRoute?: (from: [number, number], to: [number, number], destinationName: string) => void;
}

export function RouteCard({ onClose, onSelectFromMap, selectedMapPoint, onSelectPoint, onBuildRoute }: RouteCardProps) {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [locationAddress, setLocationAddress] = useState<string>("Определяется...");
  const [destination, setDestination] = useState<string>("");
  const [selectedDestination, setSelectedDestination] = useState<SocialObject | null>(null);
  const [destinationSearchQuery, setDestinationSearchQuery] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const destinationDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationAddress("Геолокация не поддерживается");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords: [number, number] = [position.coords.longitude, position.coords.latitude];
        setUserLocation(coords);
        // Показываем, что местоположение определено
        setLocationAddress("Моё местоположение");
      },
      (error) => {
        console.error("Ошибка получения геолокации:", error);
        setLocationAddress("Не удалось определить местоположение");
      }
    );
  }, []);

  const filteredDestinationObjects =
    destinationSearchQuery.trim().length === 0
      ? []
      : socialObjects.filter((o) =>
          (o.name + " " + o.address)
            .toLowerCase()
            .includes(destinationSearchQuery.trim().toLowerCase())
        );

  const handleDestinationSelect = (obj: SocialObject) => {
    setDestination(obj.name);
    setSelectedDestination(obj);
    setDestinationSearchQuery("");
  };

  const handleBuildRoute = () => {
    if (!selectedDestination) return;

    // Координаты объекта в формате [lat, lon], преобразуем в [lng, lat]
    const destinationCoords: [number, number] = [
      selectedDestination.coordinates[1], // lng
      selectedDestination.coordinates[0]  // lat
    ];


    // Если местоположение пользователя уже известно, строим маршрут сразу
    if (userLocation) {
      onBuildRoute?.(userLocation, destinationCoords, selectedDestination.name);
      return;
    }

    // Если местоположение неизвестно, запрашиваем его
    if (!navigator.geolocation) {
      alert("Геолокация не поддерживается вашим браузером. Маршрут не может быть построен.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords: [number, number] = [position.coords.longitude, position.coords.latitude];
        setUserLocation(coords);
        onBuildRoute?.(coords, destinationCoords, selectedDestination.name);
      },
      (error) => {
        console.error("Ошибка получения геолокации:", error);
        alert("Не удалось определить ваше местоположение. Маршрут не может быть построен.");
      }
    );
  };

  return (
    <div className="object-card-overlay">
      <div className="object-card">
        <div className="object-card-header">
          <div className="object-card-title">Маршрут</div>
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
            <div className="route-card-label">Куда отправиться</div>
            <div className="route-card-destination-wrapper" ref={destinationDropdownRef}>
              <input
                type="text"
                className="route-card-destination-input"
                placeholder="Введите название учреждения"
                value={destinationSearchQuery || destination}
                onChange={(e) => {
                  const value = e.target.value;
                  setDestinationSearchQuery(value);
                  if (value) {
                    // При начале ввода очищаем выбранное назначение
                    if (destination) {
                      setDestination("");
                      setSelectedDestination(null);
                    }
                  }
                }}
                onFocus={() => {
                  // При фокусе, если выбрана организация, показываем её название для редактирования
                  if (destination && !destinationSearchQuery) {
                    setDestinationSearchQuery(destination);
                    setDestination("");
                    setSelectedDestination(null);
                  }
                }}
              />
              {(destination || destinationSearchQuery) && (
                <button
                  type="button"
                  className="route-card-destination-clear"
                  onClick={() => {
                    setDestination("");
                    setSelectedDestination(null);
                    setDestinationSearchQuery("");
                  }}
                  aria-label="Очистить"
                >
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              )}
              {destinationSearchQuery && filteredDestinationObjects.length > 0 && (
                <div className="route-card-destination-dropdown">
                  {filteredDestinationObjects.map((obj) => (
                    <button
                      key={obj.id}
                      type="button"
                      className="route-card-destination-item"
                      onClick={() => handleDestinationSelect(obj)}
                    >
                      <div className="route-card-destination-item-name">{obj.name}</div>
                      <div className="route-card-destination-item-address">{obj.address}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="route-card-row">
            <div className="route-card-label">Воспользуйтесь ИИ-помощником</div>
            <div className="route-card-input-wrapper">
              <input
                type="text"
                className="route-card-input"
                placeholder="Например: к ближайшей клинике"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                type="button"
                className="route-card-voice-button"
                aria-label="Голосовой ввод"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M12 14C13.1 14 14 13.1 14 12V6C14 4.9 13.1 4 12 4C10.9 4 10 4.9 10 6V12C10 13.1 10.9 14 12 14ZM18.5 12C18.5 15.3 15.9 18 12.5 18V20H15.5C16.05 20 16.5 20.45 16.5 21C16.5 21.55 16.05 22 15.5 22H8.5C7.95 22 7.5 21.55 7.5 21C7.5 20.45 7.95 20 8.5 20H11.5V18C8.1 18 5.5 15.3 5.5 12C5.5 11.45 5.95 11 6.5 11C7.05 11 7.5 11.45 7.5 12C7.5 14.5 9.5 16.5 12 16.5C14.5 16.5 16.5 14.5 16.5 12C16.5 11.45 16.95 11 17.5 11C18.05 11 18.5 11.45 18.5 12Z"
                    fill="currentColor"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="route-card-footer">
          <button
            type="button"
            className="route-card-build-button"
            onClick={handleBuildRoute}
            disabled={!selectedDestination}
          >
            Построить маршрут
          </button>
        </div>
      </div>
    </div>
  );
}

