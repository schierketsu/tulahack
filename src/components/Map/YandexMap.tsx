import { useEffect, useRef, useState } from "react";
import { socialObjects } from "../../data/socialObjects";
import { CATEGORY_COLORS, CATEGORY_ICONS, INITIAL_ZOOM, TULA_CENTER } from "../../utils/mapConfig";

declare global {
  interface Window {
    ymaps: any;
  }
}

interface YandexMapProps {
  selectedObjectId: string | null;
  onSelectObject: (id: string | null) => void;
  selectedCategories: Set<string>;
}

export function YandexMap({ onSelectObject, selectedCategories }: YandexMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const placemarksRef = useRef<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let destroyed = false;

    function initMap() {
      if (!window.ymaps || !mapContainerRef.current || destroyed) return;

      window.ymaps.ready(async () => {
        if (destroyed || !mapContainerRef.current) return;

        try {
          // Функция для скрытия элементов Яндекс Карт после загрузки
          const hideYandexElements = () => {
            if (!mapContainerRef.current) return;
            
            // Скрываем только ссылки и маленькие элементы, не контейнеры карты
            const selectors = [
              'a[href*="yandex.ru/legal"]',
              'a[href*="yandex.com/legal"]',
              'a[href*="maps.yandex.ru"]',
              'a[href*="maps.yandex.com"]',
              '.ymaps-2-1-79-copyrights-pane',
              '.ymaps-2-1-79-copyright'
            ];
            
            selectors.forEach(selector => {
              try {
                const elements = mapContainerRef.current!.querySelectorAll(selector);
                elements.forEach((el) => {
                  // Проверяем, что это не основной контейнер карты
                  if (el !== mapContainerRef.current && 
                      !el.classList.contains('ymaps-2-1-79-map') &&
                      !el.classList.contains('ymaps-2-1-79-inner-panes')) {
                    (el as HTMLElement).style.display = 'none';
                    (el as HTMLElement).style.visibility = 'hidden';
                    (el as HTMLElement).style.opacity = '0';
                    (el as HTMLElement).style.pointerEvents = 'none';
                  }
                });
              } catch (e) {
                // Игнорируем ошибки
              }
            });
            
            // Скрываем элементы по тексту (только маленькие элементы)
            const hideTexts = [
              'Условия использования',
              'Terms of Use',
              'Открыть в яндекс картах',
              'Open in Yandex Maps'
            ];
            
            // Ищем только ссылки и маленькие элементы
            const linksAndSmallElements = mapContainerRef.current.querySelectorAll('a, span, div[class*="copyright"], div[class*="terms"]');
            linksAndSmallElements.forEach((el) => {
              // Пропускаем основные контейнеры карты
              if (el.classList.contains('ymaps-2-1-79-map') || 
                  el.classList.contains('ymaps-2-1-79-inner-panes') ||
                  el === mapContainerRef.current) {
                return;
              }
              
              const text = el.textContent || '';
              if (hideTexts.some(hideText => text.includes(hideText))) {
                (el as HTMLElement).style.display = 'none';
                (el as HTMLElement).style.visibility = 'hidden';
                (el as HTMLElement).style.opacity = '0';
                (el as HTMLElement).style.pointerEvents = 'none';
              }
            });
          };

          // Инициализируем карту с центром Тульской области и минимальным зумом
          // Реальный масштаб установится после загрузки границ
          const map = new window.ymaps.Map(mapContainerRef.current, {
            center: TULA_CENTER,
            zoom: 6, // Начальный зум (более отдаленный), будет изменен после загрузки границ
            controls: ["zoomControl"],
            type: "yandex#map",
            // Включаем все необходимые поведения при инициализации
            behaviors: ["default", "scrollZoom"]
          });

          mapRef.current = map;
          
          // Добавляем обработчик клика на карту для обработки кликов по маркерам
          map.events.add('click', (e: any) => {
            const coords = e.get('coords');
            const originalEvent = e.get('originalEvent');
            
            // Проверяем, был ли клик по элементу маркера
            if (originalEvent && originalEvent.target) {
              const target = originalEvent.target as HTMLElement;
              const markerElement = target.closest('.custom-marker-clickable');
              
              if (markerElement) {
                const objId = (markerElement as HTMLElement).dataset.objId;
                if (objId) {
                  console.log("Клик по маркеру через карту (data-obj-id):", objId);
                  onSelectObject(objId);
                  return;
                }
              }
            }
            
            // Альтернативный способ - проверяем ближайший маркер по координатам
            let minDistance = Infinity;
            let closestObject: any = null;
            
            socialObjects
              .filter((obj) => selectedCategories.has(obj.category))
              .forEach((obj) => {
                const distance = Math.sqrt(
                  Math.pow(coords[0] - obj.coordinates[0], 2) +
                  Math.pow(coords[1] - obj.coordinates[1], 2)
                );
                
                // Если клик был в пределах 0.01 градуса от маркера (примерно 1 км)
                if (distance < 0.01 && distance < minDistance) {
                  minDistance = distance;
                  closestObject = obj;
                }
              });
            
            if (closestObject) {
              console.log("Клик по маркеру через координаты:", closestObject.name);
              onSelectObject(closestObject.id);
            }
          });
          
          // Явно включаем scrollZoom сразу после инициализации для работы колесика мыши
          try {
            map.behaviors.enable("scrollZoom");
            console.log("scrollZoom включен сразу после инициализации");
          } catch (error) {
            console.warn("Не удалось включить scrollZoom сразу:", error);
          }
          
          // Явно включаем все необходимые поведения для навигации
          // Используем setTimeout, чтобы убедиться, что карта полностью инициализирована
          setTimeout(() => {
            try {
              map.behaviors.enable([
                "drag",
                "scrollZoom",
                "dblClickZoom",
                "multiTouch"
              ]);
              console.log("Поведения карты включены: drag, scrollZoom, dblClickZoom, multiTouch");
            } catch (error) {
              console.warn("Ошибка при включении поведений:", error);
              // Пробуем включить по одному
              try {
                map.behaviors.enable("drag");
                map.behaviors.enable("scrollZoom");
              } catch (e) {
                console.error("Не удалось включить поведения:", e);
              }
            }
            
            // Проверяем, что контейнер карты не блокирует события
            if (mapContainerRef.current) {
              mapContainerRef.current.style.pointerEvents = "auto";
              console.log("Pointer-events установлены для контейнера карты");
            }
          }, 100);

          // Загрузка границ регионов РФ
          let borders;
          try {
            borders = await window.ymaps.borders.load("RU", {
              lang: "ru_RU",
              quality: 2
            });
            console.log("Границы загружены, регионов:", borders.features.length);
          } catch (error) {
            console.error("Ошибка загрузки границ:", error);
            // Если не удалось загрузить границы, используем приблизительные координаты
            const approximateBounds = [
              [53.0, 35.5], // Юго-запад
              [54.8, 39.5]  // Северо-восток
            ];
            const tulaPolygon = new window.ymaps.Polygon([
              [
                [54.8, 35.5],
                [54.8, 39.5],
                [53.0, 39.5],
                [53.0, 35.5],
                [54.8, 35.5]
              ]
            ], {}, {
              fillColor: "rgba(255, 75, 75, 0.18)",
              strokeColor: "#ff4b4b",
              strokeWidth: 3,
              fillOpacity: 0.4
            });
            map.geoObjects.add(tulaPolygon);
            // Устанавливаем границы так, чтобы область занимала весь квадрат
            map.setBounds(approximateBounds, {
              checkZoomRange: true,
              zoomMargin: 0, // Без отступов, чтобы границы занимали весь квадрат
              duration: 500
            });

            // Сохраняем начальный зум и ограничиваем его
            const defaultZoom = map.getZoom();
            map.events.add("zoomchange", () => {
              const currentZoom = map.getZoom();
              if (currentZoom < defaultZoom) {
                map.setZoom(defaultZoom, { duration: 200 });
              }
            });
            map.events.add("actionend", () => {
              const currentZoom = map.getZoom();
              if (currentZoom < defaultZoom) {
                map.setZoom(defaultZoom, { duration: 200 });
              }
            });
            
            // Карта загружена (даже с приблизительными границами)
            setTimeout(() => {
              setIsLoaded(true);
              console.log("Карта загружена с приблизительными границами");
            }, 600);
            return;
          }

          let tulaBounds: any = null;
          let tulaGeoObject: any = null;
          let tulaFound = false;
          const visibleRegions: any[] = [];

          // Добавляем большой белый полигон поверх базовой карты, чтобы скрыть базовые границы регионов
          // Он будет под нашими регионами, чтобы они были видны поверх
          const whiteBackground = new window.ymaps.Polygon([
            [
              [90, -180],
              [90, 180],
              [-90, 180],
              [-90, -180],
              [90, -180]
            ]
          ], {}, {
            fillColor: "#ffffff",
            fillOpacity: 1,
            strokeWidth: 0,
            interactivityModel: "default#silent",
            cursor: "default",
            zIndex: 1
          });
          
          // Добавляем белый фон первым, чтобы он был под нашими регионами
          map.geoObjects.add(whiteBackground);
          
          // Отключаем pointer-events для белого фона, чтобы он не блокировал навигацию
          setTimeout(() => {
            try {
              const overlays = whiteBackground.getOverlays();
              if (overlays && overlays.length > 0) {
                overlays.forEach((overlay: any) => {
                  const element = overlay.getElement();
                  if (element) {
                    element.style.pointerEvents = "none";
                  }
                });
              }
            } catch (e) {
              // Игнорируем ошибки
            }
          }, 100);

          // Список соседних областей Тульской области
          const neighborRegions = new Set([
            "RU-TUL",  // Тульская область
            "RU-MOS",  // Московская область
            "RU-KLU",  // Калужская область
            "RU-ORL",  // Орловская область
            "RU-LIP",  // Липецкая область
            "RU-RYA"   // Рязанская область
          ]);

          console.log(`Обрабатываем все регионы РФ: ${borders.features.length}`);

          // Добавляем все регионы РФ: Тульская - красные границы, остальные - белые
          borders.features.forEach((feature: any) => {
            // В данных границ свойства обычно лежат как plain-object
            const iso =
              feature.properties.iso3166 ||
              feature.properties["iso3166"] ||
              feature.properties.ISO3166;

            const isTula = iso === "RU-TUL";
            
            if (isTula) {
              tulaFound = true;
              console.log("Тульская область найдена:", iso);
            }

            const geoObject = new window.ymaps.GeoObject(
              {
                geometry: feature.geometry,
                properties: feature.properties
              },
              {
                // Тульская область - только красные границы, без заливки
                // Все остальные регионы РФ - белый фон полностью залитый
                fillColor: isTula ? "#ffffff" : "#ffffff",
                strokeColor: isTula ? "#ff4b4b" : "#cccccc",
                strokeWidth: isTula ? 3 : 1,
                fillOpacity: isTula ? 0 : 1, // Белый фон полностью залитый для всех регионов кроме Тульской
                strokeOpacity: isTula ? 1 : 0.3,
                interactivityModel: "default#silent", // Полностью отключаем интерактивность, чтобы не блокировать события мыши
                cursor: "default"
              }
            );

            map.geoObjects.add(geoObject);
            visibleRegions.push(feature.geometry);

            if (isTula) {
              tulaGeoObject = geoObject;
              tulaBounds = geoObject.geometry.getBounds();
            }
          });

          // Отключаем pointer-events для всех геообъектов (регионов), чтобы они не блокировали навигацию карты
          setTimeout(() => {
            try {
              map.geoObjects.each((geoObject: any) => {
                // Пропускаем маркеры (placemarks) - они должны быть кликабельными
                if (geoObject.getType && geoObject.getType() === "Placemark") {
                  return;
                }
                
                // Отключаем pointer-events для полигонов через их overlay
                try {
                  const overlays = geoObject.getOverlays();
                  if (overlays && overlays.length > 0) {
                    overlays.forEach((overlay: any) => {
                      const element = overlay.getElement();
                      if (element) {
                        element.style.pointerEvents = "none";
                      }
                    });
                  }
                } catch (e) {
                  // Игнорируем ошибки
                }
              });
              console.log("Pointer-events отключены для геообъектов (регионов)");
            } catch (error) {
              console.warn("Не удалось отключить pointer-events для геообъектов:", error);
            }
          }, 200);

          // Убеждаемся, что наши добавленные регионы видны поверх базовой карты
          // И что они не блокируют события мыши для карты
          // Также скрываем базовые границы регионов на карте
          if (!document.getElementById("yandex-map-custom-style")) {
            const style = document.createElement("style");
            style.id = "yandex-map-custom-style";
            style.textContent = `
              /* Убеждаемся, что наши добавленные регионы (красная Тульская и белые соседи) видны поверх */
              .ymaps-2-1-79-geo-objects-pane {
                z-index: 100 !important;
              }
              /* Отключаем pointer-events для полигонов (регионов), чтобы они не блокировали навигацию карты */
              .ymaps-2-1-79-polygon,
              .ymaps-2-1-79-polygon-overlay,
              .ymaps-2-1-79-polygon-path {
                pointer-events: none !important;
              }
              /* Включаем pointer-events для маркеров (placemarks), чтобы они были кликабельными */
              .ymaps-2-1-79-placemark,
              .ymaps-2-1-79-placemark-overlay,
              .custom-marker-clickable {
                pointer-events: auto !important;
              }
              .custom-marker-clickable * {
                pointer-events: auto !important;
              }
            `;
            document.head.appendChild(style);
          }

          if (!tulaFound) {
            console.warn("Тульская область не найдена в данных границ!");
          }

          // Ограничиваем начальный вид картой только Тульской областью,
          // но НЕ блокируем перемещение — пользователь может двигаться мышкой
          if (tulaBounds) {
            console.log("Границы Тульской области установлены");

            // Подгоняем карту под границы области с одинаковыми отступами по краям
            // чтобы границы не были впритык к краям экрана
            const isMobile = window.innerWidth < 768;
            const margin = isMobile ? 40 : 50; // Отступы в пикселях для мобильных и десктопов
            
            map.setBounds(tulaBounds, {
              checkZoomRange: true,
              zoomMargin: [margin, margin, margin, margin], // [top, right, bottom, left] - одинаковые отступы со всех сторон
              duration: 500 // Плавная анимация
            });

            // Сохраняем начальный зум (значение по умолчанию) и границы видимой области
            // Используем событие actionend для гарантии, что setBounds завершился
            const setDefaultZoom = () => {
              const defaultZoom = map.getZoom(); // Сохраняем текущий зум без изменений
              const defaultBounds = map.getBounds(); // Границы видимой области при начальном зуме
              
              console.log("Начальный зум установлен:", defaultZoom);
              console.log("Границы видимой области при начальном зуме:", defaultBounds);

              // Ограничиваем область перемещения карты границами, видимыми при начальном зуме
              map.options.set("restrictMapArea", defaultBounds);

              // Ограничиваем зум - нельзя отдалиться (уменьшить зум) меньше начального значения
              // Можно только увеличить или уменьшить до значения по умолчанию
              map.events.add("zoomchange", () => {
                const currentZoom = map.getZoom();
                if (currentZoom < defaultZoom) {
                  // Если зум меньше начального, возвращаем к начальному значению
                  map.setZoom(defaultZoom, { duration: 200 });
                }
              });

              // Ограничиваем перемещение карты границами видимой области при начальном зуме
              const enforceBounds = () => {
                if (!defaultBounds) return;
                
                try {
                  const center = map.getCenter();
                  
                  // Проверяем, не вышли ли мы за границы видимой области при начальном зуме
                  if (defaultBounds.contains && !defaultBounds.contains(center)) {
                    // Если центр вышел за границы, возвращаем его в допустимую область
                    const safeCenter = defaultBounds.getCenter();
                    if (safeCenter) {
                      map.setCenter(safeCenter, { duration: 200 });
                    }
                  }
                } catch (error) {
                  console.warn("Ошибка при проверке границ:", error);
                }
              };

              // Также ограничиваем при действиях пользователя
              map.events.add("actionend", () => {
                const currentZoom = map.getZoom();
                if (currentZoom < defaultZoom) {
                  map.setZoom(defaultZoom, { duration: 200 });
                }
                enforceBounds();
              });

              map.events.add("boundschange", enforceBounds);
              
              // Карта полностью настроена - показываем её
              setIsLoaded(true);
              console.log("Карта полностью загружена и настроена");
              
              // Скрываем элементы Яндекс Карт после того, как карта отображена
              setTimeout(() => {
                hideYandexElements();
              }, 500);
            };

            // Вызываем функцию после завершения setBounds
            let zoomSet = false;
            const setZoomHandler = () => {
              if (!zoomSet) {
                zoomSet = true;
                setTimeout(setDefaultZoom, 100);
                map.events.remove("actionend", setZoomHandler);
              }
            };
            map.events.add("actionend", setZoomHandler);
            
            // Также используем setTimeout как запасной вариант
            setTimeout(() => {
              if (!zoomSet) {
                zoomSet = true;
                setDefaultZoom();
              }
            }, 700);
            
            // Убеждаемся, что все поведения включены после установки границ
            // Особое внимание к scrollZoom для работы колесика мыши
            setTimeout(() => {
              try {
                // Сначала отключаем, потом включаем, чтобы убедиться, что все работает
                map.behaviors.disable("scrollZoom");
                map.behaviors.enable("scrollZoom");
                
                map.behaviors.enable([
                  "drag",
                  "scrollZoom",
                  "dblClickZoom",
                  "multiTouch"
                ]);
                
                // Проверяем, что scrollZoom включен
                console.log("Поведения карты проверены после установки границ");
                console.log("scrollZoom должен быть включен для работы колесика мыши");
                
                // Убеждаемся, что контейнер карты не блокирует события колесика
                if (mapContainerRef.current) {
                  mapContainerRef.current.style.overflow = "visible";
                  // Убеждаемся, что события колесика проходят
                  const mapElement = mapContainerRef.current.querySelector(".ymaps-2-1-79-map");
                  if (mapElement) {
                    (mapElement as HTMLElement).style.pointerEvents = "auto";
                  }
                }
              } catch (error) {
                console.warn("Ошибка при повторном включении поведений:", error);
              }
            }, 700);
          }

          // Функция для обновления маркеров на основе выбранных категорий
          const updateMarkers = () => {
            if (!mapRef.current) return;
            
            // Удаляем старые маркеры
            placemarksRef.current.forEach((placemark) => {
              mapRef.current.geoObjects.remove(placemark);
            });
            placemarksRef.current = [];
            
            // Добавляем маркеры только для выбранных категорий
            socialObjects
              .filter((obj) => selectedCategories.has(obj.category))
              .forEach((obj) => {
                const iconPath = CATEGORY_ICONS[obj.category] || '';
                const color = CATEGORY_COLORS[obj.category] ?? "#ffffff";
                
                if (!iconPath) {
                  console.warn(`Иконка не найдена для категории: ${obj.category}`);
                  return;
                }

                // Создаем кастомный layout в стиле YMapDefaultMarker - цветной круг с белой иконкой
                const markerObjId = obj.id;
                const iconLayout = window.ymaps.templateLayoutFactory.createClass(
                  `<div class="custom-marker-clickable" data-obj-id="${markerObjId}" style="width: 48px; height: 48px; cursor: pointer; position: relative; pointer-events: auto !important; z-index: 1000; user-select: none;">
                    <div style="width: 48px; height: 48px; border-radius: 50%; background-color: ${color}; box-shadow: 0 2px 8px rgba(0,0,0,0.2), 0 0 0 2px rgba(255,255,255,0.8); display: flex; align-items: center; justify-content: center; position: relative; pointer-events: auto !important;">
                      <img src="${iconPath}" style="width: 28px; height: 28px; object-fit: contain; pointer-events: none; filter: brightness(0) invert(1);" alt="marker" />
                    </div>
                  </div>`
                );

                const placemark = new window.ymaps.Placemark(
                  obj.coordinates,
                  {
                    hintContent: obj.name,
                    balloonContentHeader: obj.name,
                    balloonContentBody: `<div>${obj.description}</div><div style="margin-top:4px;font-size:12px;color:#999">${obj.address}</div>`
                  },
                  {
                    iconLayout: iconLayout,
                    iconImageSize: [48, 48],
                    iconImageOffset: [-24, -24],
                    cursor: 'pointer',
                    interactivityModel: 'default#layer'
                  }
                );

                // Добавляем обработчик клика через события Яндекс Карт
                placemark.events.add("click", (e: any) => {
                  e.stopPropagation();
                  console.log("Click по маркеру через events:", obj.name);
                  onSelectObject(obj.id);
                });

                mapRef.current.geoObjects.add(placemark);
                placemarksRef.current.push(placemark);
              });
          };
          
          // Инициализируем маркеры
          updateMarkers();
          
          // Скрываем элементы Яндекс Карт периодически после добавления маркеров
          // (основное скрытие произойдет в setDefaultZoom после setIsLoaded(true))
          setTimeout(() => {
            hideYandexElements();
          }, 1500);
        } catch (error) {
          console.error("Ошибка инициализации карты:", error);
          // Даже при ошибке показываем карту, чтобы пользователь видел что-то
          setIsLoaded(true);
          setTimeout(() => {
            hideYandexElements();
          }, 500);
        }
      });
    }

    if (window.ymaps) {
      initMap();
    } else {
      const interval = setInterval(() => {
        if (window.ymaps) {
          clearInterval(interval);
          initMap();
        }
      }, 200);
      return () => clearInterval(interval);
    }

    return () => {
      destroyed = true;
      if (mapRef.current) {
        mapRef.current.destroy();
        mapRef.current = null;
      }
    };
  }, [onSelectObject]);

  // Обновляем маркеры при изменении выбранных категорий
  useEffect(() => {
    if (!mapRef.current || !isLoaded) return;
    
    // Удаляем старые маркеры
    placemarksRef.current.forEach((placemark) => {
      mapRef.current.geoObjects.remove(placemark);
    });
    placemarksRef.current = [];
    
    // Добавляем маркеры только для выбранных категорий
    socialObjects
      .filter((obj) => selectedCategories.has(obj.category))
      .forEach((obj) => {
        const iconPath = CATEGORY_ICONS[obj.category] || '';
        const color = CATEGORY_COLORS[obj.category] ?? "#ffffff";
        
        if (!iconPath) {
          console.warn(`Иконка не найдена для категории: ${obj.category}`);
          return;
        }

        // Создаем кастомный layout в стиле YMapDefaultMarker - цветной круг с белой иконкой
        const markerObjId = obj.id;
        const iconLayout = window.ymaps.templateLayoutFactory.createClass(
          `<div class="custom-marker-clickable" data-obj-id="${markerObjId}" style="width: 48px; height: 48px; cursor: pointer; position: relative; pointer-events: auto !important; z-index: 1000; user-select: none;">
            <div style="width: 48px; height: 48px; border-radius: 50%; background-color: ${color}; box-shadow: 0 2px 8px rgba(0,0,0,0.2), 0 0 0 2px rgba(255,255,255,0.8); display: flex; align-items: center; justify-content: center; position: relative; pointer-events: auto !important;">
              <img src="${iconPath}" style="width: 28px; height: 28px; object-fit: contain; pointer-events: none; filter: brightness(0) invert(1);" alt="marker" />
            </div>
          </div>`
        );

        const placemark = new window.ymaps.Placemark(
          obj.coordinates,
          {
            hintContent: obj.name,
            balloonContentHeader: obj.name,
            balloonContentBody: `<div>${obj.description}</div><div style="margin-top:4px;font-size:12px;color:#999">${obj.address}</div>`
          },
          {
            iconLayout: iconLayout,
            iconImageSize: [48, 48],
            iconImageOffset: [-24, -24],
            cursor: 'pointer',
            interactivityModel: 'default#layer'
          }
        );

        // Добавляем обработчик клика через события Яндекс Карт
        placemark.events.add("click", (e: any) => {
          e.stopPropagation();
          console.log("Click по маркеру через events:", obj.name);
          onSelectObject(obj.id);
        });

        mapRef.current.geoObjects.add(placemark);
        placemarksRef.current.push(placemark);
      });
  }, [selectedCategories, isLoaded, onSelectObject]);

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


