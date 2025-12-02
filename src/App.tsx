import { Route, Routes, useNavigate } from "react-router-dom";
import { YandexMap } from "./components/Map/YandexMap";
import { ObjectDetailPage } from "./components/ObjectDetail/ObjectDetailPage";
import { ObjectCard } from "./components/ObjectCard/ObjectCard";
import { useState } from "react";
import { SocialObject } from "./types";
import { socialObjects } from "./data/socialObjects";
import { CATEGORY_COLORS } from "./utils/mapConfig";

export default function App() {
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    new Set(["healthcare", "culture", "social"])
  );
  const navigate = useNavigate();

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

  const selectedObject: SocialObject | undefined = selectedObjectId
    ? socialObjects.find((o) => o.id === selectedObjectId)
    : undefined;

  return (
    <div className="app-root">
      <Routes>
        <Route
          path="/"
          element={
            <div className="map-page">
              <header className="app-header">
                <div className="app-header-inner">
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
                  <div className="app-header-right-dot" />
                </div>
              </header>
              <div className="filters-header">
                <div className="filters-label">выбери тип учреждения:</div>
                <div className="filters-container">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      className={`filter-button ${
                        selectedCategories.has(category.id) ? "active" : ""
                      }`}
                      onClick={() => toggleCategory(category.id)}
                      style={{
                        backgroundColor: selectedCategories.has(category.id)
                          ? category.color
                          : "#ffffff",
                        color: selectedCategories.has(category.id)
                          ? "#ffffff"
                          : "rgba(39, 51, 80, 0.5)",
                        borderColor: category.color
                      }}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
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
                    onOpenDetails={(id) => navigate(`/object/${id}`)}
                  />
                )}
              </main>
            </div>
          }
        />
        <Route path="/object/:id" element={<ObjectDetailPage />} />
      </Routes>
    </div>
  );
}


