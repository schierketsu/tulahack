import { useEffect, useRef, useState } from "react";
import { socialObjects } from "../../data/socialObjects";
import { CATEGORY_COLORS, CATEGORY_ICONS, TULA_CENTER } from "../../utils/mapConfig";

declare global {
  interface Window {
    ymaps3: any;
    ymaps: any;
  }
}

interface YandexMapProps {
  selectedObjectId: string | null;
  onSelectObject: (id: string | null) => void;
  selectedCategories: Set<string>;
}

export function YandexMap({ selectedObjectId, onSelectObject, selectedCategories }: YandexMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const clustererRef = useRef<any>(null);
  const featuresRef = useRef<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let destroyed = false;

    async function initMap() {
      if (!window.ymaps3 || !mapContainerRef.current || destroyed) return;

      try {
        // Ждем готовности API v3
        if (window.ymaps3.ready) {
          if (typeof window.ymaps3.ready.then === 'function') {
            await window.ymaps3.ready;
          } else if (typeof window.ymaps3.ready === 'function') {
            await new Promise((resolve) => {
              window.ymaps3.ready(resolve);
            });
          }
        }
        
        if (destroyed || !mapContainerRef.current) return;

        const { YMap, YMapDefaultSchemeLayer, YMapDefaultFeaturesLayer, YMapMarker, YMapFeature, YMapListener, YMapCollection } = window.ymaps3;

        // Инициализируем карту
        // В API v3 координаты в формате [lng, lat]
        const map = new YMap(
          mapContainerRef.current,
          {
            location: {
              center: [TULA_CENTER[1], TULA_CENTER[0]], // [lng, lat]
              zoom: 6
            }
          }
        );

        mapRef.current = map;

        // Добавляем базовые слои
        map.addChild(new YMapDefaultSchemeLayer());
        const featuresLayer = new YMapDefaultFeaturesLayer({ zIndex: 1800 });
        map.addChild(featuresLayer);

        // Функция для скрытия элементов Яндекс Карт после загрузки
        const hideYandexElements = () => {
          if (!mapContainerRef.current) return;
          
          const selectors = [
            'a[href*="yandex.ru/legal"]',
            'a[href*="yandex.com/legal"]',
            'a[href*="maps.yandex.ru"]',
            'a[href*="maps.yandex.com"]',
            // Слои копирайтов в API v3
            '[class*="copyright"]',
            '[class*="Copyright"]'
          ];
          
          selectors.forEach(selector => {
            try {
              const elements = mapContainerRef.current!.querySelectorAll(selector);
              elements.forEach((el) => {
                (el as HTMLElement).style.display = 'none';
                (el as HTMLElement).style.visibility = 'hidden';
                (el as HTMLElement).style.opacity = '0';
                (el as HTMLElement).style.pointerEvents = 'none';
              });
            } catch (e) {
              // Игнорируем ошибки
            }
          });

          // Дополнительно скрываем любые небольшие элементы с текстом "Яндекс"
          try {
            const textElements = mapContainerRef.current.querySelectorAll('div, span, a');
            textElements.forEach((el) => {
              const text = (el.textContent || '').trim();
              if (!text) return;

              // Если в тексте есть слово "Яндекс", скрываем элемент
              if (/яндекс/i.test(text)) {
                const elHtml = el as HTMLElement;
                // Не трогаем корневой контейнер карты
                if (elHtml === mapContainerRef.current) return;
                
                elHtml.style.display = 'none';
                elHtml.style.visibility = 'hidden';
                elHtml.style.opacity = '0';
                elHtml.style.pointerEvents = 'none';
              }
            });
          } catch (e) {
            // Игнорируем ошибки
          }

          // На всякий случай добавляем глобальный стиль для копирайтов v3
          if (!document.getElementById('yandex-map-hide-copyright')) {
            const style = document.createElement('style');
            style.id = 'yandex-map-hide-copyright';
            style.textContent = `
              [class*="copyright"],
              [class*="Copyright"] {
                display: none !important;
                visibility: hidden !important;
                opacity: 0 !important;
                pointer-events: none !important;
              }
            `;
            document.head.appendChild(style);
          }
        };

        // Ждем, пока подгрузится API 2.1 (ymaps) с границами регионов
        const waitForYmapsBorders = async (timeoutMs = 6000): Promise<boolean> => {
          const start = Date.now();
          return new Promise((resolve) => {
            const check = () => {
              if (window.ymaps && window.ymaps.borders) {
                resolve(true);
                return;
              }
              if (Date.now() - start > timeoutMs) {
                resolve(false);
                return;
              }
              setTimeout(check, 150);
            };
            check();
          });
        };

        // Загружаем реальные границы регионов РФ через API 2.1 и рисуем их в API v3
        const loadRegions = async () => {
          const ready = await waitForYmapsBorders();
          if (!ready || !window.ymaps || !window.ymaps.borders) {
            return null;
          }

          // Ждем готовности API 2.1 (после того, как появился ymaps)
          await new Promise<void>((resolve) => {
            window.ymaps.ready(resolve);
          });

          const borders = await window.ymaps.borders.load("RU", {
            lang: "ru_RU",
            quality: 2
          });

          let tulaBounds: [[number, number], [number, number]] | null = null;

          const expandBounds = (
            bounds: [[number, number], [number, number]] | null,
            lng: number,
            lat: number
          ) => {
            if (!bounds) {
              return [
                [lng, lat],
                [lng, lat]
              ] as [[number, number], [number, number]];
            }
            const [[minLng, minLat], [maxLng, maxLat]] = bounds;
            return [
              [Math.min(minLng, lng), Math.min(minLat, lat)],
              [Math.max(maxLng, lng), Math.max(maxLat, lat)]
            ] as [[number, number], [number, number]];
          };

          // Преобразование координат из формата [lat, lng] (API 2.1 borders) в [lng, lat] (API v3)
          const convertGeometry = (geometry: any) => {
            if (!geometry) return geometry;
            const type = geometry.type;
            const coords = geometry.coordinates;

            if (type === "Polygon") {
              return {
                type: "Polygon",
                coordinates: coords.map((ring: number[][]) =>
                  ring.map(([lat, lng]) => {
                    // Обновляем границы Тулы по ходу
                    return [lng, lat];
                  })
                )
              };
            }

            if (type === "MultiPolygon") {
              return {
                type: "MultiPolygon",
                coordinates: coords.map((polygon: number[][][]) =>
                  polygon.map((ring: number[][]) =>
                    ring.map(([lat, lng]) => [lng, lat])
                  )
                )
              };
            }

            return geometry;
          };

          borders.features.forEach((feature: any) => {
            const iso =
              feature.properties.iso3166 ||
              feature.properties["iso3166"] ||
              feature.properties.ISO3166;

            const isTula = iso === "RU-TUL";

            const convertedGeometry = convertGeometry(feature.geometry);

            // Если это Тульская область, считаем реальные границы по всем координатам
            if (isTula && convertedGeometry) {
              const geom = convertedGeometry;
              const processPoint = (lng: number, lat: number) => {
                tulaBounds = expandBounds(tulaBounds, lng, lat);
              };

              if (geom.type === "Polygon") {
                geom.coordinates.forEach((ring: number[][]) =>
                  ring.forEach(([lng, lat]) => processPoint(lng, lat))
                );
              } else if (geom.type === "MultiPolygon") {
                geom.coordinates.forEach((poly: number[][][]) =>
                  poly.forEach((ring: number[][]) =>
                    ring.forEach(([lng, lat]) => processPoint(lng, lat))
                  )
                );
              }
            }

            const regionFeature = new YMapFeature({
              geometry: convertedGeometry,
              style: isTula
                ? {
                    fill: "rgba(255,255,255,0)",
                    stroke: [{ width: 3, color: "#ff4b4b" }]
                  }
                : {
                    fill: "rgba(255,255,255,1)",
                    stroke: [{ width: 1, color: "#cccccc" }]
                  }
            });

            map.addChild(regionFeature);
            featuresRef.current.push(regionFeature);
          });

          return tulaBounds;
        };

        // Пытаемся загрузить реальные границы; если не выйдет — используем приблизительные
        let tulaBounds: [[number, number], [number, number]] | null = null;
        try {
          tulaBounds = await loadRegions();
        } catch (e) {
          // игнорируем и используем fallback
        }

        if (!tulaBounds) {
          // Fallback: приблизительный прямоугольник
          tulaBounds = [
            [35.5, 53.0],
            [39.5, 54.8]
          ];
        }

        // Устанавливаем границы карты по реальной (или приблизительной) Туле
        map.setLocation({
          bounds: tulaBounds,
          duration: 500
        });

        // Сохраняем настройки после установки границ
        const setDefaultZoom = () => {
          // На v3 жесткое ограничение области и зума даёт дёргания при перетаскивании,
          // поэтому оставляем только начальную установку границ, а дальше даём карте
          // свободно двигаться и масштабироваться.
          // Карта полностью настроена
          setIsLoaded(true);
          
          setTimeout(() => {
            hideYandexElements();
          }, 500);
        };

        // Вызываем функцию после установки границ
        setTimeout(() => {
          setDefaultZoom();
        }, 700);

        // Инициализируем кластеризатор, если доступен
        let Clusterer: any = null;
        try {
          // Пытаемся загрузить кластеризатор через динамический импорт
          // В браузере это может не работать, поэтому используем fallback на YMapCollection
          if (typeof window !== 'undefined' && (window as any).require) {
            // Если есть система модулей
            const clustererModule = await import('@yandex/ymaps3-clusterer');
            Clusterer = clustererModule?.YMapClusterer || clustererModule?.default?.YMapClusterer;
          }
        } catch (e) {
          // Игнорируем ошибки, используем YMapCollection
        }

        // Создаем коллекцию для маркеров
        const markersCollection = Clusterer 
          ? new Clusterer({})
          : new YMapCollection({});
        
        clustererRef.current = markersCollection;
        featuresLayer.addChild(markersCollection);

        // Функция для обновления маркеров на основе выбранных категорий
        const updateMarkers = () => {
          if (!mapRef.current || !clustererRef.current) return;
          
          // Удаляем старые маркеры
          markersRef.current.forEach(marker => {
            try {
              clustererRef.current.removeChild(marker);
            } catch (e) {
              // Игнорируем ошибки
            }
          });
          markersRef.current = [];
          
          // Группируем объекты по координатам для добавления смещения
          const coordinatesMap = new Map<string, number[]>();
          
          // Добавляем маркеры только для выбранных категорий
          socialObjects
            .filter((obj) => selectedCategories.has(obj.category))
            .forEach((obj) => {
              const iconPath = CATEGORY_ICONS[obj.category] || '';
              const color = CATEGORY_COLORS[obj.category] ?? "#ffffff";
              
              if (!iconPath) {
                return;
              }

              // Создаем ключ для координат
              const coordKey = `${obj.coordinates[0]}_${obj.coordinates[1]}`;
              
              // Если объекты с такими же координатами уже есть, добавляем небольшое смещение
              if (!coordinatesMap.has(coordKey)) {
                coordinatesMap.set(coordKey, [0, 0]);
              } else {
                const offset = coordinatesMap.get(coordKey)!;
                offset[0] += 0.0001;
                offset[1] += 0.0001;
                coordinatesMap.set(coordKey, offset);
              }
              
              const offset = coordinatesMap.get(coordKey)!;
              // В API v3 координаты в формате [lng, lat], а в данных у нас [lat, lng]
              const adjustedCoords: [number, number] = [
                obj.coordinates[1] + offset[1], // lng
                obj.coordinates[0] + offset[0]   // lat
              ];

              // Создаем кастомный HTML элемент для маркера
              const markerElement = document.createElement('div');
              markerElement.className = 'custom-marker-clickable';
              markerElement.setAttribute('data-obj-id', obj.id);
              markerElement.style.cssText = 'width: 48px; height: 48px; cursor: pointer; position: absolute; left: -24px; top: -24px; pointer-events: auto !important; z-index: 1000; user-select: none; transform-origin: center center;';
              
              const innerDiv = document.createElement('div');
              innerDiv.style.cssText = `width: 48px; height: 48px; border-radius: 50%; background-color: ${color}; box-shadow: 0 2px 8px rgba(0,0,0,0.2), 0 0 0 2px rgba(255,255,255,0.8); display: flex; align-items: center; justify-content: center; position: relative; pointer-events: auto !important;`;
              
              const img = document.createElement('img');
              img.src = iconPath;
              img.style.cssText = 'width: 28px; height: 28px; object-fit: contain; pointer-events: none; filter: brightness(0) invert(1);';
              img.alt = 'marker';
              
              innerDiv.appendChild(img);
              markerElement.appendChild(innerDiv);

              const marker = new YMapMarker(
                {
                  coordinates: adjustedCoords,
                  properties: {
                    category: obj.category,
                    name: obj.name,
                    description: obj.description,
                    address: obj.address
                  }
                },
                markerElement
              );

              // Добавляем обработчик клика
              markerElement.addEventListener('click', (e) => {
                e.stopPropagation();
                onSelectObject(obj.id);
              });

              clustererRef.current.addChild(marker);
              markersRef.current.push(marker);
            });
        };
        
        // Инициализируем маркеры
        updateMarkers();
        
        // Добавляем обработчик клика на карту
        const mapClickListener = new YMapListener({
          layerId: 'any',
          onClick: (event: any) => {
            // Проверяем, был ли клик по маркеру
            const target = event.details?.originalEvent?.target as HTMLElement;
            if (target) {
              const markerElement = target.closest('.custom-marker-clickable');
              if (markerElement) {
                const objId = (markerElement as HTMLElement).dataset.objId;
                if (objId) {
                  onSelectObject(objId);
                  return;
                }
              }
            }
            
            // Альтернативный способ - проверяем ближайший маркер по координатам
            if (event.coordinates) {
              const coords = event.coordinates; // [lng, lat] в API v3
              let minDistance = Infinity;
              let closestObject: any = null;
              
              socialObjects
                .filter((obj) => selectedCategories.has(obj.category))
                .forEach((obj) => {
                  // obj.coordinates в формате [lat, lng], нужно преобразовать
                  const distance = Math.sqrt(
                    Math.pow(coords[0] - obj.coordinates[1], 2) + // lng
                    Math.pow(coords[1] - obj.coordinates[0], 2)   // lat
                  );
                  
                  if (distance < 0.01 && distance < minDistance) {
                    minDistance = distance;
                    closestObject = obj;
                  }
                });
              
              if (closestObject) {
                onSelectObject(closestObject.id);
              }
            }
          }
        });
        map.addChild(mapClickListener);
        
        // Скрываем элементы Яндекс Карт периодически
        setTimeout(() => {
          hideYandexElements();
        }, 1500);
      } catch (error) {
        console.error('Ошибка инициализации карты:', error);
        setIsLoaded(true);
      }
    }

    if (window.ymaps3) {
      initMap();
    } else {
      const interval = setInterval(() => {
        if (window.ymaps3) {
          clearInterval(interval);
          initMap();
        }
      }, 200);
      return () => clearInterval(interval);
    }

    return () => {
      destroyed = true;
      if (clustererRef.current && mapRef.current) {
        try {
          markersRef.current.forEach(marker => {
            try {
              clustererRef.current.removeChild(marker);
            } catch (e) {
              // Игнорируем ошибки
            }
          });
          if (mapRef.current) {
            featuresRef.current.forEach(feature => {
              try {
                mapRef.current.removeChild(feature);
              } catch (e) {
                // Игнорируем ошибки
              }
            });
          }
        } catch (e) {
          // Игнорируем ошибки при очистке
        }
        markersRef.current = [];
        featuresRef.current = [];
        clustererRef.current = null;
      }
      if (mapRef.current) {
        try {
          mapRef.current.destroy();
        } catch (e) {
          // Игнорируем ошибки
        }
        mapRef.current = null;
      }
    };
  }, [onSelectObject]);

  // Обновляем маркеры при изменении выбранных категорий
  useEffect(() => {
    if (!mapRef.current || !isLoaded || !clustererRef.current) return;
    
    // Удаляем старые маркеры
    markersRef.current.forEach(marker => {
      try {
        clustererRef.current.removeChild(marker);
      } catch (e) {
        // Игнорируем ошибки
      }
    });
    markersRef.current = [];
    
    if (!window.ymaps3) return;
    const { YMapMarker } = window.ymaps3;
    
    // Группируем объекты по координатам для добавления смещения
    const coordinatesMap = new Map<string, number[]>();
    
    // Добавляем маркеры только для выбранных категорий
    socialObjects
      .filter((obj) => selectedCategories.has(obj.category))
      .forEach((obj) => {
        const iconPath = CATEGORY_ICONS[obj.category] || '';
        const color = CATEGORY_COLORS[obj.category] ?? "#ffffff";
        
        if (!iconPath) {
          return;
        }

        // Создаем ключ для координат
        const coordKey = `${obj.coordinates[0]}_${obj.coordinates[1]}`;
        
        // Если объекты с такими же координатами уже есть, добавляем небольшое смещение
        if (!coordinatesMap.has(coordKey)) {
          coordinatesMap.set(coordKey, [0, 0]);
        } else {
          const offset = coordinatesMap.get(coordKey)!;
          offset[0] += 0.0001;
          offset[1] += 0.0001;
          coordinatesMap.set(coordKey, offset);
        }
        
        const offset = coordinatesMap.get(coordKey)!;
        // В API v3 координаты в формате [lng, lat], а в данных у нас [lat, lng]
        const adjustedCoords: [number, number] = [
          obj.coordinates[1] + offset[1], // lng
          obj.coordinates[0] + offset[0]  // lat
        ];

        // Создаем кастомный HTML элемент для маркера
        const markerElement = document.createElement('div');
        markerElement.className = 'custom-marker-clickable';
        markerElement.setAttribute('data-obj-id', obj.id);
        markerElement.style.cssText = 'width: 48px; height: 48px; cursor: pointer; position: absolute; left: -24px; top: -24px; pointer-events: auto !important; z-index: 1000; user-select: none; transform-origin: center center;';
        
        const innerDiv = document.createElement('div');
        innerDiv.style.cssText = `width: 48px; height: 48px; border-radius: 50%; background-color: ${color}; box-shadow: 0 2px 8px rgba(0,0,0,0.2), 0 0 0 2px rgba(255,255,255,0.8); display: flex; align-items: center; justify-content: center; position: relative; pointer-events: auto !important;`;
        
        const img = document.createElement('img');
        img.src = iconPath;
        img.style.cssText = 'width: 28px; height: 28px; object-fit: contain; pointer-events: none; filter: brightness(0) invert(1);';
        img.alt = 'marker';
        
        innerDiv.appendChild(img);
        markerElement.appendChild(innerDiv);

        const marker = new YMapMarker(
          {
            coordinates: adjustedCoords,
            properties: {
              category: obj.category,
              name: obj.name,
              description: obj.description,
              address: obj.address
            }
          },
          markerElement
        );

        // Добавляем обработчик клика
        markerElement.addEventListener('click', (e) => {
          e.stopPropagation();
          onSelectObject(obj.id);
        });

        clustererRef.current.addChild(marker);
        markersRef.current.push(marker);
      });
  }, [selectedCategories, isLoaded, onSelectObject]);

  // Приближаем карту к выбранному объекту
  useEffect(() => {
    if (!selectedObjectId || !mapRef.current || !isLoaded) return;

    const selectedObject = socialObjects.find(obj => obj.id === selectedObjectId);
    if (!selectedObject) return;

    // Координаты в формате [lat, lng], нужно преобразовать в [lng, lat] для API v3
    const [lat, lng] = selectedObject.coordinates;
    const coordinates = [lng, lat];

    // Устанавливаем центр карты на выбранный объект с максимальным зумом
    mapRef.current.setLocation({
      center: coordinates,
      zoom: 18, // Максимальный зум для детального просмотра
      duration: 500
    });
  }, [selectedObjectId, isLoaded]);

  return (
    <div 
      ref={mapContainerRef} 
      className="map-root" 
      style={{ 
        opacity: isLoaded ? 1 : 0,
        transition: 'opacity 0.3s ease-in-out',
        pointerEvents: isLoaded ? 'auto' : 'none'
      }} 
    />
  );
}
