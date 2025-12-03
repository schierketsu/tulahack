import { Route, Routes } from "react-router-dom";
import { YandexMap } from "./components/Map/YandexMap";
import { ObjectCard } from "./components/ObjectCard/ObjectCard";
import { RouteCard } from "./components/RouteCard/RouteCard";
import { RouteInfoModal } from "./components/RouteInfo/RouteInfoModal";
import { useState, useRef, useEffect } from "react";
import { SocialObject } from "./types";
import { socialObjects } from "./data/socialObjects";
import { CATEGORY_COLORS } from "./utils/mapConfig";

export default function App() {
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    new Set(["healthcare", "culture", "social"])
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("main");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [centerOnUserLocation, setCenterOnUserLocation] = useState(false);
  const [isRouteCardOpen, setIsRouteCardOpen] = useState(false);
  const [isSelectingFromMap, setIsSelectingFromMap] = useState(false);
  const [selectedMapPoint, setSelectedMapPoint] = useState<[number, number] | null>(null);
  const [route, setRoute] = useState<{
    from: [number, number];
    to: [number, number];
    destinationName: string;
  } | null>(null);
  const [isRouteInfoModalOpen, setIsRouteInfoModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const categories = [
    { id: "healthcare", name: "Здравоохранение", color: CATEGORY_COLORS.healthcare },
    { id: "culture", name: "Культура", color: CATEGORY_COLORS.culture },
    { id: "social", name: "Социальные услуги", color: CATEGORY_COLORS.social }
  ];

  const toggleCategory = (categoryId: string) => {
    const newCategories = new Set(selectedCategories);
    if (newCategories.has(categoryId)) {
      newCategories.delete(categoryId);
    } else {
      newCategories.add(categoryId);
    }
    setSelectedCategories(newCategories);
  };

  // Закрываем dropdown при клике вне его
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const selectedObject: SocialObject | undefined = selectedObjectId
    ? socialObjects.find((o) => o.id === selectedObjectId)
    : undefined;

  const filteredObjects =
    searchQuery.trim().length === 0
      ? []
      : socialObjects.filter((o) =>
          (o.name + " " + o.address)
            .toLowerCase()
            .includes(searchQuery.trim().toLowerCase())
        );

  return (
    <div className="app-root">
      <Routes>
        <Route
          path="/"
          element={
            <div className="map-page">
              <header className="app-header">
                <div className="app-header-inner">
                  {!isSearchOpen && (
                    <div className="app-header-left">
                      <img
                        src="/gerbtula.svg.png"
                        alt="Герб Тульской области"
                        className="app-header-logo"
                      />
                      <div className="app-header-title-wrapper">
                        <span className="app-header-title app-header-title-main">СОЦ. НАВИГАЦИЯ</span>
                        <span className="app-header-title app-header-title-sub">для Тульской области</span>
                      </div>
                    </div>
                  )}

                  {isSearchOpen && (
                    <div className="app-header-search">
                      <div className="app-header-search-wrapper">
                        <input
                          className="app-header-search-input"
                          type="text"
                          placeholder="Введите название учреждения"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          autoFocus
                        />
                        <button
                          type="button"
                          className="app-header-search-close"
                          onClick={() => {
                            setIsSearchOpen(false);
                            setSearchQuery("");
                          }}
                          aria-label="Закрыть поиск"
                        >
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}

                  {!isSearchOpen && (
                    <button
                      type="button"
                      className="app-header-search-button"
                      onClick={() => {
                        setIsSearchOpen(true);
                        setSearchQuery("");
                      }}
                      aria-label="Поиск"
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  )}
                </div>

                {isSearchOpen && filteredObjects.length > 0 && (
                  <div className="app-header-search-dropdown">
                    {filteredObjects.map((obj) => (
                      <button
                        key={obj.id}
                        type="button"
                        className="app-header-search-item"
                        onClick={() => {
                          setSelectedObjectId(obj.id);
                          setIsSearchOpen(false);
                          setSearchQuery("");
                        }}
                      >
                        <div className="app-header-search-item-name">{obj.name}</div>
                        <div className="app-header-search-item-address">{obj.address}</div>
                      </button>
                    ))}
                  </div>
                )}
              </header>
              <main className="map-container">
                <YandexMap
                  selectedObjectId={selectedObjectId}
                  onSelectObject={setSelectedObjectId}
                  selectedCategories={selectedCategories}
                  centerOnUserLocation={centerOnUserLocation}
                  onUserLocationCentered={() => setCenterOnUserLocation(false)}
                  isSelectingFromMap={isSelectingFromMap}
                  selectedMapPoint={selectedMapPoint}
                  onMapPointSelected={setSelectedMapPoint}
                  route={route}
                />
                <button
                  type="button"
                  className="geolocation-button"
                  onClick={() => setCenterOnUserLocation(true)}
                  aria-label="Моё местоположение"
                  title="Моё местоположение"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 8C9.79 8 8 9.79 8 12C8 14.21 9.79 16 12 16C14.21 16 16 14.21 16 12C16 9.79 14.21 8 12 8ZM20.94 11C20.48 6.83 17.17 3.52 13 3.06V1H11V3.06C6.83 3.52 3.52 6.83 3.06 11H1V13H3.06C3.52 17.17 6.83 20.48 11 20.94V23H13V20.94C17.17 20.48 20.48 17.17 20.94 13H23V11H20.94ZM12 19C8.13 19 5 15.87 5 12C5 8.13 8.13 5 12 5C15.87 5 19 8.13 19 12C19 15.87 15.87 19 12 19Z" fill="currentColor"/>
                  </svg>
                </button>
                {selectedObject && !isRouteCardOpen && (
                  <ObjectCard
                    object={selectedObject}
                    onClose={() => setSelectedObjectId(null)}
                    onBuildRoute={(id) => {
                      const object = socialObjects.find((o) => o.id === id);
                      if (!object) return;

                      // Координаты объекта в формате [lat, lon], преобразуем в [lng, lat]
                      const destinationCoords: [number, number] = [
                        object.coordinates[1], // lng
                        object.coordinates[0]  // lat
                      ];

                      // Функция для построения маршрута
                      const buildRouteFromLocation = (userCoords: [number, number]) => {
                        setRoute({
                          from: userCoords,
                          to: destinationCoords,
                          destinationName: object.name
                        });
                        setIsRouteInfoModalOpen(true);
                        // Закрываем карточку объекта
                        setSelectedObjectId(null);
                      };

                      // Если местоположение неизвестно, запрашиваем его
                      if (!navigator.geolocation) {
                        alert("Геолокация не поддерживается вашим браузером. Маршрут не может быть построен.");
                        return;
                      }

                      navigator.geolocation.getCurrentPosition(
                        (position) => {
                          const coords: [number, number] = [
                            position.coords.longitude,
                            position.coords.latitude
                          ];
                          buildRouteFromLocation(coords);
                        },
                        (error) => {
                          console.error("Ошибка получения геолокации:", error);
                          alert("Не удалось определить ваше местоположение. Маршрут не может быть построен.");
                        }
                      );
                    }}
                  />
                )}
                {isRouteCardOpen && (
                  <RouteCard
                    onClose={() => {
                      setIsRouteCardOpen(false);
                      setActiveTab("main");
                      setIsSelectingFromMap(false);
                      setSelectedMapPoint(null);
                      setRoute(null);
                      setIsRouteInfoModalOpen(false);
                    }}
                    onSelectFromMap={(enabled) => {
                      setIsSelectingFromMap(enabled);
                      if (!enabled) {
                        setSelectedMapPoint(null);
                      }
                    }}
                    selectedMapPoint={selectedMapPoint}
                    onSelectPoint={() => {
                      // Точка выбрана, можно использовать selectedMapPoint
                      console.log("Выбрана точка на карте:", selectedMapPoint);
                      setIsSelectingFromMap(false);
                    }}
                    onBuildRoute={(from, to, destinationName) => {
                      setRoute({ from, to, destinationName });
                      setIsRouteCardOpen(false);
                      setIsRouteInfoModalOpen(true);
                    }}
                  />
                )}
                {isRouteInfoModalOpen && route && (
                  <RouteInfoModal
                    destinationName={route.destinationName}
                    from={route.from}
                    to={route.to}
                    onClose={() => {
                      setIsRouteInfoModalOpen(false);
                      setRoute(null);
                    }}
                  />
                )}
              </main>

              <footer className="bottom-nav">
                <div className="bottom-nav-section bottom-nav-section-left">
                  <div className="filter-dropdown" ref={dropdownRef}>
                    <button
                      className={`bottom-nav-button ${activeTab === "main" ? "active" : ""}`}
                      onClick={() => {
                        setActiveTab("main");
                        setIsDropdownOpen(!isDropdownOpen);
                        setIsRouteCardOpen(false);
                      }}
                    >
                      <img 
                        src="/фильтр.png" 
                        alt="Фильтры" 
                        className={`bottom-nav-icon ${activeTab === "main" ? "active" : ""}`}
                      />
                      <span>Фильтры</span>
                    </button>
                    {isDropdownOpen && (
                      <div className="filter-dropdown-menu">
                        {categories.map((category) => (
                          <label
                            key={category.id}
                            className="filter-dropdown-item"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleCategory(category.id);
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={selectedCategories.has(category.id)}
                              onChange={() => {}}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleCategory(category.id);
                              }}
                            />
                            <span
                              style={{
                                color: selectedCategories.has(category.id)
                                  ? category.color
                                  : "rgba(39, 51, 80, 0.5)"
                              }}
                            >
                              {category.name}
                            </span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <button 
                  className={`bottom-nav-section bottom-nav-section-center bottom-nav-button ${activeTab === "route" ? "active" : ""}`}
                  onClick={() => {
                    if (isRouteCardOpen) {
                      setIsRouteCardOpen(false);
                      setActiveTab("main");
                    } else {
                      setActiveTab("route");
                      setIsRouteCardOpen(true);
                      setSelectedObjectId(null);
                    }
                  }}
                >
                  <img 
                    src="/маршрут.png" 
                    alt="Маршрут" 
                    className={`bottom-nav-icon ${activeTab === "route" ? "active" : ""}`}
                  />
                  <span>Маршрут</span>
                </button>

                <button 
                  className={`bottom-nav-section bottom-nav-section-right bottom-nav-button ${activeTab === "profile" ? "active" : ""}`}
                  onClick={() => {
                    setActiveTab("profile");
                    setIsRouteCardOpen(false);
                  }}
                >
                  <img 
                    src="/профиль.png" 
                    alt="Профиль" 
                    className={`bottom-nav-icon ${activeTab === "profile" ? "active" : ""}`}
                  />
                  <span>Профиль</span>
                </button>
              </footer>
            </div>
          }
        />
      </Routes>
    </div>
  );
}


