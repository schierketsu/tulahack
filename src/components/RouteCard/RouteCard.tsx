import { useState, useEffect } from "react";
import { DisabilityType, SocialCategory, SocialObject } from "../../types";
import { socialObjects } from "../../data/socialObjects";
import { getAiRouteComment } from "../../utils/aiRouteAssistant";

interface RouteCardProps {
  onClose: () => void;
  onSelectFromMap?: (enabled: boolean) => void;
  selectedMapPoint?: [number, number] | null;
  onSelectPoint?: () => void;
  onBuildRoute?: (
    from: [number, number],
    to: [number, number],
    destinationName: string,
    aiComment?: string
  ) => void;
  selectedDisabilities?: Set<DisabilityType>;
  selectedCategories?: Set<SocialCategory | string>;
}

export function RouteCard({
  onClose,
  onSelectFromMap,
  selectedMapPoint,
  onSelectPoint,
  onBuildRoute,
  selectedDisabilities,
  selectedCategories,
}: RouteCardProps) {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [locationAddress, setLocationAddress] = useState<string>("Определяется...");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

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

  // Вычисление расстояния (приблизительно, как в RouteInfoModal)
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

  const isObjectAccessibleForProfile = (obj: SocialObject): boolean => {
    if (!selectedDisabilities || selectedDisabilities.size === 0) {
      return true;
    }
    const a = obj.accessibility;
    for (const d of selectedDisabilities) {
      if (!a[d]) return false;
    }
    return true;
  };

  const handleAiRoute = async (queryOverride?: string) => {
    if (!onBuildRoute) return;

    setAiError(null);
    setIsAiLoading(true);

    try {
      // Определяем или запрашиваем местоположение пользователя
      let fromCoords = userLocation;

      if (!fromCoords) {
        if (!navigator.geolocation) {
          setAiError("Геолокация не поддерживается вашим браузером.");
          setIsAiLoading(false);
          return;
        }

        fromCoords = await new Promise<[number, number]>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const coords: [number, number] = [
                position.coords.longitude,
                position.coords.latitude,
              ];
              resolve(coords);
            },
            (error) => {
              reject(error);
            }
          );
        });

        setUserLocation(fromCoords);
      }

      const normalizedQuery = (queryOverride ?? searchQuery).trim().toLowerCase();
      const tokens = normalizedQuery
        .split(/[^a-zA-Zа-яА-ЯёЁ0-9]+/)
        .map((t) => t.trim())
        .filter((t) => t.length >= 3 && !["к", "до", "на", "в", "по", "из", "от"].includes(t));

      const categoryLexicon: Record<SocialCategory, string[]> = {
        healthcare: [
          "больниц",
          "поликлиник",
          "клиник",
          "стоматолог",
          "стоматологич",
          "зуб",
          "врач",
          "доктор",
          "мед",
          "здоров",
          "терапевт",
          "педиатр",
          "хирург",
        ],
        culture: [
          "библиотек",
          "книга",
          "книг",
          "читать",
          "чтен",
          "культура",
          "музей",
          "театр",
          "концерт",
          "творч",
          "клуб",
          "досуг",
        ],
        social: [
          "соц",
          "социальн",
          "поддержк",
          "пособие",
          "центр развития",
          "соцзащ",
          "служба",
          "опека",
        ],
        market: [
          "магазин",
          "рынок",
          "покупк",
          "товар",
          "услуг",
          "супермаркет",
          "торгов",
        ],
      };

      const detectCategories = (query: string, tokenList: string[]): Set<SocialCategory> => {
        const q = query.toLowerCase();
        const res = new Set<SocialCategory>();
        (Object.keys(categoryLexicon) as SocialCategory[]).forEach((cat) => {
          const terms = categoryLexicon[cat];
          for (const term of terms) {
            if (q.includes(term)) {
              res.add(cat);
              return;
            }
          }
          for (const t of tokenList) {
            if (terms.some((term) => t.startsWith(term) || term.startsWith(t))) {
              res.add(cat);
              return;
            }
          }
        });
        return res;
      };

      // Дополнительные интенты (приоритетные подтипы внутри категорий)
      type IntentKey = "dental" | "library";
      const intentLexicon: Record<IntentKey, string[]> = {
        dental: ["зуб", "зубы", "стоматолог", "стоматологич", "пломб", "кариес"],
        library: ["библиотек", "книга", "книг", "читать", "чтени", "читаль"],
      };

      const detectIntents = (query: string, tokenList: string[]): Set<IntentKey> => {
        const q = query.toLowerCase();
        const intents = new Set<IntentKey>();
        (Object.keys(intentLexicon) as IntentKey[]).forEach((intent) => {
          const terms = intentLexicon[intent];
          for (const term of terms) {
            if (q.includes(term)) {
              intents.add(intent);
              return;
            }
          }
          for (const t of tokenList) {
            if (terms.some((term) => t.startsWith(term) || term.startsWith(t))) {
              intents.add(intent);
              return;
            }
          }
        });
        return intents;
      };

      const makeVariants = (token: string) => {
        const variants = new Set<string>();
        variants.add(token);
        if (token.length > 5) variants.add(token.slice(0, token.length - 1));
        if (token.length > 6) variants.add(token.slice(0, token.length - 2));
        return Array.from(variants);
      };

      const textMatchesTokens = (text: string) => {
        if (tokens.length === 0) return 0;
        const lower = text.toLowerCase();
        let score = 0;
        tokens.forEach((token) => {
          makeVariants(token).forEach((v) => {
            if (v && lower.includes(v)) {
              score += 1;
            }
          });
        });
        return score;
      };

      const intentsDetected = detectIntents(normalizedQuery, tokens);

      const objectMatchesIntent = (obj: SocialObject, intents: Set<IntentKey>): boolean => {
        if (intents.size === 0) return false;
        const text = `${obj.name} ${obj.address} ${obj.description}`.toLowerCase();
        if (intents.has("dental")) {
          if (["зуб", "стоматолог", "стоматологич", "кариес", "пломб"].some((t) => text.includes(t))) {
            return true;
          }
        }
        if (intents.has("library")) {
          if (["библиотек", "книга", "читаль", "чтен"].some((t) => text.includes(t))) {
            return true;
          }
        }
        return false;
      };

      const scoreObject = (obj: SocialObject): number => {
        if (tokens.length === 0 && !normalizedQuery) return 0;
        const nameScore = textMatchesTokens(obj.name) * 3;
        const addrScore = textMatchesTokens(obj.address) * 2;
        const descScore = textMatchesTokens(obj.description);
        const intentBonus = objectMatchesIntent(obj, intentsDetected) ? 10 : 0;
        return nameScore + addrScore + descScore + intentBonus;
      };

      // Фильтруем по категориям, доступности и (если есть) текстовому запросу пользователя
      const detectedCategories = detectCategories(normalizedQuery, tokens);
      const baseCategories =
        selectedCategories && selectedCategories.size > 0
          ? selectedCategories
          : new Set<SocialCategory | string>(["healthcare", "culture", "social", "market"]);
      const allowedCategories =
        detectedCategories.size > 0
          ? (detectedCategories as Set<SocialCategory | string>)
          : baseCategories;

      const base = socialObjects.filter((obj) => allowedCategories.has(obj.category));

      // Если есть явный интент (например, dental), сначала пробуем оставить только объекты, которые ему соответствуют
      const intentFiltered =
        intentsDetected.size > 0
          ? base.filter((obj) => objectMatchesIntent(obj, intentsDetected))
          : base;
      const usedBase = intentFiltered.length > 0 ? intentFiltered : base;

      const tier1 = usedBase.filter((obj) => isObjectAccessibleForProfile(obj) && scoreObject(obj) > 0);
      const tier2 = usedBase.filter((obj) => scoreObject(obj) > 0);
      const tier3 = usedBase.filter((obj) => isObjectAccessibleForProfile(obj));
      const tier4 = usedBase;

      const pickFrom = tier1.length ? tier1 : tier2.length ? tier2 : tier3.length ? tier3 : tier4;

      if (pickFrom.length === 0) {
        setAiError("Не удалось найти подходящий объект с учётом вашего профиля.");
        setIsAiLoading(false);
        return;
      }

      let best: { obj: SocialObject; distance: number; score: number } | null = null;

      pickFrom.forEach((obj) => {
        const toCoords: [number, number] = [obj.coordinates[1], obj.coordinates[0]]; // [lng, lat]
        const distance = calculateDistance(fromCoords!, toCoords);
        const score = scoreObject(obj);

        if (!best) {
          best = { obj, distance, score };
          return;
        }

        // Приоритет: выше текстовый балл, затем меньшая дистанция
        if (score > best.score || (score === best.score && distance < best.distance)) {
          best = { obj, distance, score };
        }
      });

      if (!best) {
        setAiError("Не удалось подобрать ближайший объект.");
        setIsAiLoading(false);
        return;
      }

      const bestObj = best as { obj: SocialObject; distance: number; score: number };

      const destinationCoords: [number, number] = [
        bestObj.obj.coordinates[1],
        bestObj.obj.coordinates[0],
      ];

      // Запрашиваем короткий комментарий у ИИ
      const aiResult = await getAiRouteComment({
        userLocation: fromCoords!,
        disabilities: selectedDisabilities ? Array.from(selectedDisabilities) : [],
        categories: Array.from(
          allowedCategories
        ) as SocialCategory[],
        userQuery: queryOverride ?? searchQuery,
        objects: socialObjects,
        chosenObject: bestObj.obj,
        distanceKm: bestObj.distance,
      });

      const aiComment = aiResult?.comment;

      onBuildRoute(fromCoords!, destinationCoords, bestObj.obj.name, aiComment);
    } catch (error) {
      console.error("Ошибка работы ИИ-помощника:", error);
      setAiError("Произошла ошибка при обращении к ИИ-помощнику. Попробуйте ещё раз позже.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleBuildButton = () => {
    const effectiveQuery = searchQuery.trim();

    if (effectiveQuery.length > 0) {
      handleAiRoute(effectiveQuery);
      return;
    }

    setAiError("Введите запрос для ИИ-помощника.");
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
            <div className="route-card-label">Воспользуйтесь ИИ-помощником</div>
            <div className="route-card-input-wrapper">
              <input
                type="text"
                className="route-card-input"
                placeholder="Пример: лечить зубы или к библиотеке"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {aiError && (
            <div className="route-card-row">
              <div className="route-card-label" />
              <div className="route-card-value" style={{ color: "#c62828", fontSize: 12 }}>
                {aiError}
              </div>
            </div>
          )}
        </div>

        <div className="route-card-footer">
          <button
            type="button"
            className="route-card-build-button"
            onClick={handleBuildButton}
            disabled={isAiLoading || !searchQuery.trim()}
            style={{
              background: searchQuery.trim() ? "#ffffff" : "",
              color: searchQuery.trim() ? "#000000" : "",
              border: searchQuery.trim() ? "2px solid #4BAF50" : "2px solid transparent",
              boxShadow: searchQuery.trim() ? "0 0 8px rgba(75, 175, 80, 0.5)" : "none",
            }}
          >
            Построить маршрут ⨯&nbsp;
            {isAiLoading ? (
              <span className="route-card-ai-spinner" aria-hidden="true" />
            ) : (
              <img
                src="/giga2.svg"
                alt="Giga"
                width={18}
                height={18}
                style={{
                  display: "inline-block",
                  verticalAlign: "middle",
                  width: "18px",
                  height: "18px",
                  transform: "scale(4)",
                  transformOrigin: "center",
                  flexShrink: 0,
                  marginLeft: "28px",
                }}
              />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

