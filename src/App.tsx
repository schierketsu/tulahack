import { Route, Routes } from "react-router-dom";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { YandexMap } from "./components/Map/YandexMap";
import { ObjectCard } from "./components/ObjectCard/ObjectCard";
import { RouteCard } from "./components/RouteCard/RouteCard";
import { RouteInfoModal } from "./components/RouteInfo/RouteInfoModal";
import { useState, useRef, useEffect } from "react";
import { SocialObject, DisabilityType, User, UserStats, Review } from "./types";
import { socialObjects } from "./data/socialObjects";
import { CATEGORY_COLORS } from "./utils/mapConfig";
import { ChatAssistant } from "./components/ChatAssistant/ChatAssistant";
import { login, register, me, getObjectReviews, deleteReview } from "./api";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import StarRateIcon from "@mui/icons-material/StarRate";
import DeleteIcon from "@mui/icons-material/Delete";

export default function App() {
  type UserProfileReview = {
    id: number;
    objectId: string;
    objectName: string;
    objectAddress: string;
    rating: number;
    text?: string;
    created_at: string;
  };

  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    new Set(["healthcare", "culture", "social", "market"])
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
    aiComment?: string;
  } | null>(null);
  const [isRouteInfoModalOpen, setIsRouteInfoModalOpen] = useState(false);
  const [selectedDisabilities, setSelectedDisabilities] = useState<
    Set<DisabilityType>
  >(new Set());
  const [profileTab, setProfileTab] = useState<"settings" | "achievements">(
    "achievements"
  );
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [childrenProfile, setChildrenProfile] = useState<string[]>([]);
  const [noChildrenPregnant, setNoChildrenPregnant] = useState(false);
  const [pregnancyWeekProfile, setPregnancyWeekProfile] = useState("");
  const [familyStatusProfile, setFamilyStatusProfile] = useState("");
  const [familyIncomeProfile, setFamilyIncomeProfile] = useState("");
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authNickname, setAuthNickname] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(() => {
    return localStorage.getItem("auth_token");
  });
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [userReviewsProfile, setUserReviewsProfile] = useState<UserProfileReview[]>([]);
  const [userReviewsLoading, setUserReviewsLoading] = useState(false);
  const [userReviewsError, setUserReviewsError] = useState<string | null>(null);
  const [deletingProfileReviewId, setDeletingProfileReviewId] = useState<number | null>(
    null
  );
  const dropdownRef = useRef<HTMLDivElement>(null);

  const categories = [
    { id: "healthcare", name: "Здравоохранение", color: CATEGORY_COLORS.healthcare },
    { id: "culture", name: "Культура", color: CATEGORY_COLORS.culture },
    { id: "social", name: "Социальные услуги", color: CATEGORY_COLORS.social },
    { id: "market", name: "Рынок товаров и услуг", color: CATEGORY_COLORS.market }
  ];

  const disabilityCards: { type: DisabilityType; label: string; icon: string }[] = [
    { type: "vision", label: "Нарушения зрения", icon: "/профиль/глаз.png" },
    { type: "hearing", label: "Нарушения слуха", icon: "/профиль/слух.png" },
    { type: "wheelchair", label: "Кресло-коляска", icon: "/профиль/коляска.png" },
    { type: "mobility", label: "Опорно-двигательный аппарат", icon: "/профиль/трость.png" },
    { type: "mental", label: "Умственные нарушения", icon: "/профиль/мозг.png" }
  ];
  const familyStatusOptions = [
    "Многодетная семья",
    "Малообеспеченная семья",
    "Семья ребёнка-инвалида",
    "Опекун / приёмная семья",
    "Одинокий родитель"
  ];

  const achievementDefs = [
    {
      id: "achv-1",
      title: "Первый шаг",
      icon: "/достижения/1уровень.png",
      condition: "Оставь 1 отзыв",
      threshold: 1,
    },
    {
      id: "achv-2",
      title: "Новичок",
      icon: "/достижения/2ур.png",
      condition: "Оставь 10 отзывов",
      threshold: 10,
    },
    {
      id: "achv-3",
      title: "Авантюрист",
      icon: "/достижения/3ур.png",
      condition: "Оставь 25 отзывов (обязательно справишься!)",
      threshold: 25,
    },
  ];
  const achievements = achievementDefs.map((ach) => ({
    ...ach,
    completed: userStats ? userStats.reviewCount >= ach.threshold : false,
  }));
  const level = userStats ? Math.floor(userStats.points / 100) + 1 : 1;
  const levelProgress = userStats ? Math.min(userStats.points % 100, 100) : 0;

  const updateUserReviewsProfile = (objectId: string, reviews: UserProfileReview[]) => {
    setUserReviewsProfile((prev) => {
      const others = prev.filter((r) => r.objectId !== objectId);
      return [...others, ...reviews].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });
  };

  const loadUserReviewsProfile = async () => {
    if (!currentUser) {
      setUserReviewsProfile([]);
      return;
    }
    try {
      setUserReviewsLoading(true);
      setUserReviewsError(null);
      const results = await Promise.all(
        socialObjects.map(async (obj) => {
          try {
            const res = await getObjectReviews(obj.id);
            const own = (res.reviews || []).filter(
              (rev) => rev.nickname === currentUser.nickname
            );
            return own.map((rev) => ({
              id: rev.id,
              objectId: obj.id,
              objectName: obj.name,
              objectAddress: obj.address,
              rating: rev.rating,
              text: rev.text,
              created_at: rev.created_at,
            }));
          } catch {
            return [];
          }
        })
      );
      const flat = results.flat();
      setUserReviewsProfile(
        flat.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
      );
    } catch (err: any) {
      setUserReviewsError(err?.message || "Не удалось загрузить ваши отзывы");
    } finally {
      setUserReviewsLoading(false);
    }
  };

  const handleDeleteProfileReview = async (reviewId: number, objectId: string) => {
    if (!authToken) {
      setUserReviewsError("Войдите, чтобы управлять отзывами");
      return;
    }
    try {
      setDeletingProfileReviewId(reviewId);
      setUserReviewsError(null);
      await deleteReview(authToken, objectId, reviewId);
      setUserReviewsProfile((prev) => prev.filter((r) => r.id !== reviewId));
      await fetchMe(authToken);
    } catch (err: any) {
      const msg = err?.message || "Не удалось удалить отзыв";
      setUserReviewsError(
        msg.includes("(404)") ? "Отзыв не найден или уже удалён" : msg
      );
    } finally {
      setDeletingProfileReviewId(null);
    }
  };

  useEffect(() => {
    if (profileTab === "achievements" && currentUser) {
      loadUserReviewsProfile();
    }
    if (!currentUser) {
      setUserReviewsProfile([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileTab, currentUser]);

  const childAgeOptions = [
    "0–1 год",
    "1–3 года",
    "3–6 лет",
    "6–12 лет",
    "12–18 лет"
  ];

  const fetchMe = async (token: string) => {
    try {
      const res = await me(token);
      setCurrentUser(res.user);
      setUserStats(res.stats);
    } catch (err) {
      console.error(err);
      setCurrentUser(null);
      setUserStats(null);
      setAuthToken(null);
      localStorage.removeItem("auth_token");
    }
  };

  useEffect(() => {
    if (!authToken) {
      setCurrentUser(null);
      setUserStats(null);
      return;
    }
    fetchMe(authToken);
  }, [authToken]);

  const handleAuthSubmit = async () => {
    try {
      setAuthLoading(true);
      setAuthError(null);
      const nickname = authNickname.trim();
      const password = authPassword.trim();
      if (!nickname || !password) {
        setAuthError("Введите никнейм и пароль");
        setAuthLoading(false);
        return;
      }
      const action = authMode === "login" ? login : register;
      const res = await action(nickname, password);
      setAuthToken(res.token);
      localStorage.setItem("auth_token", res.token);
      setCurrentUser(res.user);
      setAuthPassword("");
      fetchMe(res.token);
    } catch (err: any) {
      setAuthError(err?.message || "Ошибка авторизации");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    setAuthToken(null);
    setCurrentUser(null);
    setUserStats(null);
    setUserReviewsProfile([]);
    setUserReviewsError(null);
    localStorage.removeItem("auth_token");
  };

  const toggleDisability = (type: DisabilityType) => {
    const next = new Set(selectedDisabilities);
    if (next.has(type)) {
      next.delete(type);
    } else {
      next.add(type);
    }
    setSelectedDisabilities(next);
  };

  const toggleCategory = (categoryId: string) => {
    const newCategories = new Set(selectedCategories);
    if (newCategories.has(categoryId)) {
      newCategories.delete(categoryId);
    } else {
      newCategories.add(categoryId);
    }
    setSelectedCategories(newCategories);
  };

  const handleAddChild = () => {
    if (noChildrenPregnant) return;
    setChildrenProfile((prev) => [...prev, ""]);
  };

  const handleChangeChildAge = (index: number, value: string) => {
    setChildrenProfile((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handleRemoveChild = (index: number) => {
    setChildrenProfile((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleNoChildrenPregnant = () => {
    setNoChildrenPregnant((prev) => {
      const next = !prev;
      if (next) {
        setChildrenProfile([]);
      } else {
        setPregnancyWeekProfile("");
      }
      return next;
    });
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
    <>
      <div className="app-root">
        <Routes>
          <Route
            path="/"
            element={
              <div className="map-page">
              <header className="app-header">
                <div className="app-header-inner">
                  {!isSearchOpen && (
                    <div
                      className="app-header-left"
                      onClick={() => {
                        setActiveTab("main");
                        setIsRouteCardOpen(false);
                        setIsSelectingFromMap(false);
                        setSelectedMapPoint(null);
                        setSelectedObjectId(null);
                      }}
                    >
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
                {activeTab !== "profile" ? (
                  <>
                    <YandexMap
                      selectedObjectId={selectedObjectId}
                      onSelectObject={setSelectedObjectId}
                      selectedCategories={selectedCategories}
                      selectedDisabilities={selectedDisabilities}
                      centerOnUserLocation={centerOnUserLocation}
                      onUserLocationCentered={() => setCenterOnUserLocation(false)}
                      isSelectingFromMap={isSelectingFromMap}
                      selectedMapPoint={selectedMapPoint}
                      onMapPointSelected={setSelectedMapPoint}
                      route={route}
                    />
                    <div className="map-filter-control filter-dropdown" ref={dropdownRef}>
                      <button
                        type="button"
                        className={`map-filter-button ${isDropdownOpen ? "active" : ""}`}
                        onClick={() => {
                          setActiveTab("main");
                          setIsRouteCardOpen(false);
                          setIsDropdownOpen((prev) => !prev);
                        }}
                        aria-label="Фильтры"
                        title="Фильтры"
                      >
                        <img src="/фильтр.png" alt="Фильтры" className="map-filter-icon" />
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
                                    ? "#273350"
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
                        selectedDisabilities={selectedDisabilities}
                        authToken={authToken}
                        currentUser={currentUser}
                        onRequireAuth={() => {
                          setActiveTab("profile");
                          setProfileTab("achievements");
                        }}
                        onReviewAdded={() => {
                          if (authToken) {
                            fetchMe(authToken);
                          }
                        }}
                        onUserReviewsUpdate={(list) =>
                          updateUserReviewsProfile(selectedObject.id, list)
                        }
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
                        onBuildRoute={(from, to, destinationName, aiComment) => {
                          setRoute({ from, to, destinationName, aiComment });
                          setIsRouteCardOpen(false);
                          setIsRouteInfoModalOpen(true);
                        }}
                        selectedDisabilities={selectedDisabilities}
                        selectedCategories={selectedCategories}
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
                  </>
                ) : (
                  <div className="profile-page">
                    {!currentUser && (
                      <div className="profile-auth-card">
                        <div className="profile-auth-header">
                          <div>
                            <div className="profile-auth-title">
                              Вход или регистрация
                            </div>
                            <div className="profile-auth-subtitle">
                              Прежде чем, оставлять отзывы
                            </div>
                          </div>
                        </div>
                        <div className="profile-auth-form">
                          <div className="profile-auth-fields">
                            <input
                              type="text"
                              placeholder="Никнейм"
                              value={authNickname}
                              onChange={(e) => setAuthNickname(e.target.value)}
                              autoComplete="username"
                            />
                            <input
                              type="password"
                              placeholder="Пароль"
                              value={authPassword}
                              onChange={(e) => setAuthPassword(e.target.value)}
                              autoComplete={authMode === "login" ? "current-password" : "new-password"}
                            />
                          </div>
                          {authError && <div className="profile-auth-error">{authError}</div>}
                          <button
                            className="profile-auth-button"
                            type="button"
                            onClick={handleAuthSubmit}
                            disabled={authLoading}
                          >
                            {authMode === "login" ? "Войти" : "Зарегистрироваться"}
                          </button>
                          <div className="profile-auth-switch">
                            {authMode === "login" ? (
                              <>
                                Нет аккаунта?
                                <button
                                  type="button"
                                  className="profile-auth-link"
                                  onClick={() => setAuthMode("register")}
                                >
                                  Зарегистрироваться
                                </button>
                              </>
                            ) : (
                              <>
                                Уже есть аккаунт?
                                <button
                                  type="button"
                                  className="profile-auth-link"
                                  onClick={() => setAuthMode("login")}
                                >
                                  Войти
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="profile-tabs">
                      <button
                        type="button"
                        className={`profile-tab-button ${
                          profileTab === "achievements" ? "active" : ""
                        }`}
                        onClick={() => setProfileTab("achievements")}
                      >
                        Моя активность
                      </button>
                      <button
                        type="button"
                        className={`profile-tab-button ${
                          profileTab === "settings" ? "active" : ""
                        }`}
                        onClick={() => setProfileTab("settings")}
                      >
                        Настройки
                      </button>
                    </div>

                    {profileTab === "settings" && (
                      <div className="profile-section">
                        <div className="route-card-label">
                          Отметьте ваши особенности здоровья
                        </div>
                        <div className="profile-tiles">
                          {disabilityCards.map((card) => (
                            <button
                              key={card.type}
                              type="button"
                              className={`profile-tile ${
                                selectedDisabilities.has(card.type) ? "active" : ""
                              }`}
                              onClick={() => toggleDisability(card.type)}
                            >
                              <div className="profile-tile-icon-wrapper">
                                <img
                                  src={card.icon}
                                  alt={card.label}
                                  className="profile-tile-icon"
                                />
                              </div>
                              <div className="profile-tile-label">{card.label}</div>
                            </button>
                          ))}
                        </div>
                        <div className="profile-context-fields">
                          <label className="profile-context-label">
                            Статус семьи
                            <select
                              value={familyStatusProfile}
                              onChange={(e) => setFamilyStatusProfile(e.target.value)}
                            >
                              <option value="">Выберите статус</option>
                              {familyStatusOptions.map((status) => (
                                <option key={status} value={status}>
                                  {status}
                                </option>
                              ))}
                            </select>
                          </label>
                          <label className="profile-context-label">
                            Доход семьи
                            <input
                              type="text"
                              value={familyIncomeProfile}
                              onChange={(e) => setFamilyIncomeProfile(e.target.value)}
                              placeholder="Например, 55 000 ₽ на семью"
                            />
                          </label>
                          <div className="profile-children-block">
                            <div className="profile-children-header">
                              <div className="profile-children-title">Дети</div>
                              <button
                                type="button"
                                className="profile-add-child-button"
                                onClick={handleAddChild}
                                disabled={noChildrenPregnant}
                              >
                                Добавить ребёнка
                              </button>
                            </div>
                            <div className="profile-children-list">
                              {childrenProfile.length === 0 && !noChildrenPregnant && (
                                <div className="profile-children-empty">Пока не добавлено</div>
                              )}
                              {childrenProfile.map((age, idx) => (
                                <div key={idx} className="profile-children-row">
                                  <select
                                    className="profile-child-select"
                                    value={age}
                                    onChange={(e) => handleChangeChildAge(idx, e.target.value)}
                                  >
                                    <option value="">Возраст ребёнка</option>
                                    {childAgeOptions.map((opt) => (
                                      <option key={opt} value={opt}>
                                        {opt}
                                      </option>
                                    ))}
                                  </select>
                                  <button
                                    type="button"
                                    className="profile-child-remove"
                                    onClick={() => handleRemoveChild(idx)}
                                  >
                                    Удалить
                                  </button>
                                </div>
                              ))}
                              {noChildrenPregnant && (
                                <div className="profile-children-empty">
                                  Детей нет, ожидаем ребёнка
                                </div>
                              )}
                            </div>
                            <label className="profile-checkbox">
                              <input
                                type="checkbox"
                                checked={noChildrenPregnant}
                                onChange={toggleNoChildrenPregnant}
                              />
                              Детей нет, но беременны
                            </label>
                          </div>
                            {noChildrenPregnant && (
                              <label className="profile-context-label">
                                Срок беременности
                                <input
                                  type="text"
                                  value={pregnancyWeekProfile}
                                  onChange={(e) => setPregnancyWeekProfile(e.target.value)}
                                  placeholder="Например, 18 недель"
                                />
                              </label>
                            )}
                        </div>
                      </div>
                    )}

                    {profileTab === "achievements" && (
                      <div className="profile-section">
                        <div className="activity-profile">
                            <div className="activity-avatar" />
                            <div className="activity-info">
                              <div className="activity-header">
                                <div>
                                  <div className="activity-nickname">
                                    {currentUser ? `@${currentUser.nickname}` : "Гость"}
                                  </div>
                                  <div className="activity-level">Уровень {level}</div>
                                </div>
                                {currentUser && (
                                  <button
                                    type="button"
                                    className="activity-logout-button"
                                    onClick={handleLogout}
                                    title="Выйти"
                                  >
                                    <ExitToAppIcon fontSize="small" />
                                  </button>
                                )}
                              </div>
                              <div className="activity-progress">
                                <div
                                  className="activity-progress-bar"
                                  style={{ width: `${levelProgress}%` }}
                                />
                              </div>
                              <div className="activity-progress-text">
                                {userStats ? `${levelProgress} / 100 поинтов` : "Войдите, чтобы копить поинты"} · 10 за отзыв
                              </div>
                            </div>
                        </div>
                        <div className="route-card-label">Достижения</div>
                        {currentUser ? (
                          <div className="achievements-grid">
                            {achievements.map((ach) => (
                              <div key={ach.id} className="achievement-item">
                                <div className="achievement-card">
                                  <div className="achievement-status">
                                    <CheckCircleIcon
                                      fontSize="small"
                                      className={ach.completed ? "achievement-status-icon done" : "achievement-status-icon"}
                                    />
                                  </div>
                                  <img src={ach.icon} alt={ach.title} className="achievement-icon" />
                                  <div className="achievement-title">{ach.title}</div>
                                </div>
                                <div className="achievement-condition">{ach.condition}</div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="achievement-guest-hint">
                            Вы увидите ачивки после авторизации
                          </div>
                        )}

                        <div className="route-card-label" style={{ marginTop: 16 }}>
                          Мои отзывы
                        </div>
                        {!currentUser ? (
                          <div className="achievement-guest-hint">
                            Войдите, чтобы увидеть ваши отзывы
                          </div>
                        ) : userReviewsLoading ? (
                          <div className="achievement-guest-hint">Загрузка отзывов...</div>
                        ) : userReviewsError ? (
                          <div className="achievement-guest-hint">{userReviewsError}</div>
                        ) : userReviewsProfile.length === 0 ? (
                          <div className="achievement-guest-hint">
                            Вы ещё не оставляли отзывы
                          </div>
                        ) : (
                          <div className="profile-reviews-list">
                            {userReviewsProfile.map((rev) => (
                              <div key={rev.id} className="profile-review-card">
                                <div className="profile-review-header">
                                  <div>
                                    <div className="profile-review-object">{rev.objectName}</div>
                                    <div className="profile-review-address">{rev.objectAddress}</div>
                                  </div>
                                  <div className="object-card-review-actions">
                                    <div className="profile-review-rating">
                                      <StarRateIcon className="object-card-star" fontSize="small" />
                                      {rev.rating}
                                    </div>
                                    <button
                                      type="button"
                                      className="object-card-delete-review"
                                      aria-label="Удалить отзыв"
                                      onClick={() => handleDeleteProfileReview(rev.id, rev.objectId)}
                                      disabled={deletingProfileReviewId === rev.id}
                                    >
                                      {deletingProfileReviewId === rev.id ? "Удаление..." : (
                                        <DeleteIcon fontSize="small" />
                                      )}
                                    </button>
                                  </div>
                                </div>
                                {rev.text && <div className="profile-review-text">{rev.text}</div>}
                                <div className="profile-review-date">
                                  {new Date(rev.created_at).toLocaleDateString()}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </main>

              <footer className="bottom-nav">
                <div className="bottom-nav-section bottom-nav-section-left">
                  <button
                    className={`bottom-nav-section bottom-nav-section-left bottom-nav-button ${activeTab === "route" ? "active" : ""}`}
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
                </div>

                <button
                  type="button"
                  className="bottom-nav-section bottom-nav-section-center bottom-nav-button bottom-nav-placeholder"
                  onClick={() => {
                    setIsChatOpen(true);
                    setActiveTab("chat");
                  }}
                  aria-label="Открыть чат с ИИ"
                >
                  <img
                    src="/gigachat.svg"
                    alt="GigaChat"
                    className="bottom-nav-icon"
                  />
                </button>

                <button 
                  className={`bottom-nav-section bottom-nav-section-right bottom-nav-button ${activeTab === "profile" ? "active" : ""}`}
                  onClick={() => {
                    setActiveTab("profile");
                    setIsRouteCardOpen(false);
                    setSelectedObjectId(null);
                        setProfileTab("achievements");
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
      {isChatOpen && (
        <ChatAssistant
          isOpen={isChatOpen}
          onClose={() => {
            setIsChatOpen(false);
            if (activeTab === "chat") {
              setActiveTab("main");
            }
          }}
          defaultRegion="Тульская область"
          relatedObjects={socialObjects}
          pregnancyWeek={pregnancyWeekProfile}
          familyStatus={familyStatusProfile}
          familyIncome={familyIncomeProfile}
        />
      )}
    </>
  );
}


