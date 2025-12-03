import { Route, Routes } from "react-router-dom";
import { YandexMap } from "./components/Map/YandexMap";
import { ObjectCard } from "./components/ObjectCard/ObjectCard";
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

                  {isSearchOpen ? (
                    <div className="app-header-search">
                      <div className="app-header-search-wrapper">
                        <input
                          className="app-header-search-input"
                          type="text"
                          placeholder="Поиск учреждений..."
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
                          <img src="/крестик.png" alt="Закрыть" className="app-header-search-close-icon" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="app-header-search-button"
                      onClick={() => {
                        setIsSearchOpen(true);
                        setSearchQuery("");
                      }}
                    >
                      <img src="/лупа.png" alt="Поиск" className="app-header-search-icon" />
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
                />
                {selectedObject && (
                  <ObjectCard
                    object={selectedObject}
                    onClose={() => setSelectedObjectId(null)}
                    onBuildRoute={(id) => {
                      // TODO: Реализовать построение маршрута
                      console.log("Построить маршрут к объекту:", id);
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
                  onClick={() => setActiveTab("route")}
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
                  onClick={() => setActiveTab("profile")}
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


