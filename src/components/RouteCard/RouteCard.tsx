import { useState, useEffect } from "react";
import KeyboardVoiceIcon from "@mui/icons-material/KeyboardVoice";
import { DisabilityType, SocialCategory, SocialObject } from "../../types";
import { socialObjects } from "../../data/socialObjects";
import { getAiRouteComment } from "../../utils/aiRouteAssistant";
import { TULA_CENTER } from "../../utils/mapConfig";

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
  const [isListening, setIsListening] = useState(false);

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

      // Нормализуем старт: если мы вне Тулы или гео далёкое — ставим центр Тулы
      const isInTulaBounds = (coords: [number, number]) => {
        const [lng, lat] = coords;
        return lng >= 35.5 && lng <= 39.5 && lat >= 53.0 && lat <= 54.8;
      };
      if (!isInTulaBounds(fromCoords)) {
        fromCoords = [TULA_CENTER[1], TULA_CENTER[0]]; // [lng, lat]
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
      type IntentKey = "dental" | "library" | "headache" | "clinic";
      const intentLexicon: Record<IntentKey, string[]> = {
        dental: ["зуб", "зубы", "стоматолог", "стоматологич", "пломб", "кариес"],
        library: ["библиотек", "книга", "книг", "читать", "чтени", "читаль"],
        headache: ["головн", "голова", "мигрен", "температур", "тошн", "головокруж"],
        clinic: ["поликлиник", "больниц", "врач", "доктор", "медцентр", "больцу", "больцу", "больца", "к врачу"],
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
        const isDental = ["зуб", "стоматолог", "стоматологич", "кариес", "пломб", "ортодонт"].some((t) =>
          text.includes(t)
        );
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
        if (intents.has("headache")) {
          // Для головной боли — предпочитаем любые мед. учреждения, кроме стоматологии
          if (obj.category === "healthcare" && !isDental) {
            return true;
          }
        }
        if (intents.has("clinic")) {
          if (obj.category === "healthcare") {
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
        const isDental = ["зуб", "стоматолог", "стоматологич", "кариес", "пломб", "ортодонт"].some((t) =>
          `${obj.name} ${obj.address} ${obj.description}`.toLowerCase().includes(t)
        );
        const matchesIntent = objectMatchesIntent(obj, intentsDetected);
        let intentBonus = matchesIntent ? 10 : 0;
        // При головной боли/запросе врача штрафуем стоматологию, поощряем медучреждения
        if (intentsDetected.has("headache") || intentsDetected.has("clinic")) {
          if (isDental) intentBonus -= 8;
          if (obj.category === "healthcare" && !isDental) intentBonus += 4;
        }
        return nameScore + addrScore + descScore + intentBonus;
      };

      // Фильтруем по категориям, доступности и (если есть) текстовому запросу пользователя
      const detectedCategories = detectCategories(normalizedQuery, tokens);
      let allowedCategories: Set<SocialCategory | string>;

      // Для головной боли/запроса врача — принудительно только healthcare
      if (intentsDetected.has("headache") || intentsDetected.has("clinic")) {
        allowedCategories = new Set<SocialCategory | string>(["healthcare"]);
      } else {
        const baseCategories =
          selectedCategories && selectedCategories.size > 0
            ? selectedCategories
            : new Set<SocialCategory | string>(["healthcare", "culture", "social", "market"]);
        allowedCategories =
          detectedCategories.size > 0
            ? (detectedCategories as Set<SocialCategory | string>)
            : baseCategories;
      }

      const base = socialObjects.filter((obj) => allowedCategories.has(obj.category));

      // Если есть явный интент (например, dental), сначала пробуем оставить только объекты, которые ему соответствуют
      let intentFiltered: SocialObject[] = base;
      if (intentsDetected.size > 0) {
        if (intentsDetected.has("headache") || intentsDetected.has("clinic")) {
          const nonDentalHealthcare = base.filter(
            (obj) =>
              obj.category === "healthcare" &&
              !["зуб", "стоматолог", "стоматологич", "кариес", "пломб", "ортодонт"].some((t) =>
                `${obj.name} ${obj.address} ${obj.description}`.toLowerCase().includes(t)
              )
          );
          // Если есть не-стоматологические медучреждения — используем только их,
          // иначе — любые healthcare, иначе — fallback ко всем base
          if (nonDentalHealthcare.length > 0) {
            intentFiltered = nonDentalHealthcare;
          } else {
            const anyHealthcare = base.filter((obj) => obj.category === "healthcare");
            intentFiltered = anyHealthcare.length > 0 ? anyHealthcare : base;
          }
        } else {
          const matched = base.filter((obj) => objectMatchesIntent(obj, intentsDetected));
          intentFiltered = matched.length > 0 ? matched : base;
        }
      }
      const usedBase = intentFiltered.length > 0 ? intentFiltered : base;

      // Если указаны особенности здоровья — работаем только с доступными объектами
      const accessiblePool =
        selectedDisabilities && selectedDisabilities.size > 0
          ? usedBase.filter(isObjectAccessibleForProfile)
          : usedBase;

      if (selectedDisabilities && selectedDisabilities.size > 0 && accessiblePool.length === 0) {
        setAiError("Нет доступных объектов с учётом выбранных особенностей.");
        setIsAiLoading(false);
        return;
      }

      const tier1 = accessiblePool.filter((obj) => isObjectAccessibleForProfile(obj) && scoreObject(obj) > 0);
      const tier2 = accessiblePool.filter((obj) => scoreObject(obj) > 0);
      const tier3 = accessiblePool.filter((obj) => isObjectAccessibleForProfile(obj));
      const tier4 = accessiblePool;

      // Для головной боли и запросов врача используем весь usedBase, чтобы не отсечь близкие варианты
      const pickFrom =
        intentsDetected.has("headache") || intentsDetected.has("clinic")
          ? accessiblePool
          : tier1.length
          ? tier1
          : tier2.length
          ? tier2
          : tier3.length
          ? tier3
          : tier4;

      if (pickFrom.length === 0) {
        setAiError("Не удалось найти подходящий объект с учётом вашего профиля.");
        setIsAiLoading(false);
        return;
      }

      let best: { obj: SocialObject; distance: number; score: number } | null = null;

      // Если интент — головная боль или запрос "к врачу/в больницу/поликлинику", берём строго ближайшее по дистанции
      if ((intentsDetected.has("headache") || intentsDetected.has("clinic")) && pickFrom.length > 0) {
        const candidates = pickFrom.map((obj) => {
          const toCoords: [number, number] = [obj.coordinates[1], obj.coordinates[0]];
          const distance = calculateDistance(fromCoords!, toCoords);
          return { obj, distance, score: 0 };
        });
        candidates.sort((a, b) => a.distance - b.distance);
        best = candidates[0];
      } else {
        pickFrom.forEach((obj) => {
          const toCoords: [number, number] = [obj.coordinates[1], obj.coordinates[0]]; // [lng, lat]
          const distance = calculateDistance(fromCoords!, toCoords);
          const score = scoreObject(obj);

          if (!best) {
            best = { obj, distance, score };
            return;
          }

          const scoreDiff = score - best.score;
          // Допускаем приоритет расстояния, если разница в скоре небольшая
          const isDistancePreferable = Math.abs(scoreDiff) <= 1.0 && distance < best.distance - 0.2;

          if (score > best.score || isDistancePreferable) {
            best = { obj, distance, score };
          }
        });
      }

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

  const handleVoiceInput = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setAiError("Голосовой ввод не поддерживается вашим браузером.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "ru-RU";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      const transcript = event?.results?.[0]?.[0]?.transcript || "";
      if (transcript) {
        setSearchQuery(transcript);
        setAiError(null);
      }
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
      setAiError("Не удалось распознать речь.");
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    setIsListening(true);
    recognition.start();
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
              <button
                type="button"
                className="route-card-voice-button"
                onClick={handleVoiceInput}
                disabled={isListening || isAiLoading}
                aria-label="Голосовой ввод"
                title="Голосовой ввод"
              >
                <KeyboardVoiceIcon
                  sx={{
                    color: isListening ? "#4BAF50" : "currentColor",
                    fontSize: 22,
                  }}
                />
              </button>
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
                src="/giga21.png"
                alt="Giga"
                width={18}
                height={18}
                style={{
                  display: "inline-block",
                  verticalAlign: "middle",
                  width: "18px",
                  height: "18px",
                  objectFit: "contain",
                  transform: "scale(2.6)",
                  transformOrigin: "center",
                  flexShrink: 0,
                  marginLeft: "18px",
                }}
              />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

