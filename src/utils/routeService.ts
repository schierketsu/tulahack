/**
 * Сервис для получения маршрута по дорогам
 * Использует различные методы: OSRM, GraphHopper
 */

const YANDEX_API_KEY = '28417a81-8db2-43b6-9705-9e36ddff5904';

declare global {
  interface Window {
    ymaps: any;
  }
}

/**
 * Получает маршрут через OSRM API
 */
async function getRouteViaOSRM(
  from: [number, number],
  to: [number, number]
): Promise<[number, number][] | null> {
  try {
    // OSRM ожидает формат: lng,lat
    const fromStr = `${from[0]},${from[1]}`;  // [lng, lat] уже в правильном формате
    const toStr = `${to[0]},${to[1]}`;
    
    // Используем несколько альтернативных серверов OSRM
    const servers = [
      `https://router.project-osrm.org/route/v1/driving/${fromStr};${toStr}?overview=full&geometries=geojson&steps=false&alternatives=false`,
      `https://routing.openstreetmap.de/routed-car/route/v1/driving/${fromStr};${toStr}?overview=full&geometries=geojson&steps=false&alternatives=false`,
    ];
    
    for (const url of servers) {
      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        });
        
        if (!response.ok) {
          continue; // Пробуем следующий сервер
        }
        
        const data = await response.json();
        
        if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          if (route.geometry && route.geometry.coordinates) {
            const coordinates = route.geometry.coordinates as number[][];
            if (coordinates && coordinates.length > 2) { // Минимум 3 точки для маршрута по дорогам
              console.log(`✅ OSRM: получен маршрут с ${coordinates.length} точками`);
              return coordinates.map(coord => [coord[0], coord[1]] as [number, number]);
            }
          }
        }
      } catch (err) {
        // Пробуем следующий сервер
        continue;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Ошибка OSRM:', error);
    return null;
  }
}

/**
 * Получает маршрут через GraphHopper API (альтернатива)
 */
async function getRouteViaGraphHopper(
  from: [number, number],
  to: [number, number]
): Promise<[number, number][] | null> {
  try {
    // Используем публичный демо-сервер GraphHopper
    const url = `https://graphhopper.com/api/1/route?point=${from[1]},${from[0]}&point=${to[1]},${to[0]}&vehicle=car&key=&type=json&instructions=false&calc_points=true&points_encoded=false`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    
    if (data.paths && data.paths.length > 0) {
      const path = data.paths[0];
      if (path.points && path.points.coordinates) {
        const coordinates = path.points.coordinates as number[][];
        if (coordinates && coordinates.length > 0) {
          // GraphHopper возвращает [lng, lat]
          return coordinates.map(coord => [coord[0], coord[1]] as [number, number]);
        }
      }
    }
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Получает маршрут через Яндекс API 2.1 MultiRouter
 */
async function getRouteViaYandexAPI(
  from: [number, number],
  to: [number, number]
): Promise<[number, number][] | null> {
  return new Promise((resolve) => {
    if (!window.ymaps) {
      resolve(null);
      return;
    }

    window.ymaps.ready(() => {
      let resolved = false;
      let timeoutId: number | null = null;

      try {
        // Создаем MultiRouter
        const multiRoute = new window.ymaps.multiRouter.MultiRoute(
          {
            referencePoints: [
              [from[1], from[0]], // [lat, lng] для API 2.1
              [to[1], to[0]]
            ],
            params: {
              routingMode: 'auto'
            }
          },
          {
            boundsAutoApply: false
          }
        );

        const successHandler = () => {
          if (resolved) return;
          
          try {
            const activeRoute = multiRoute.getActiveRoute();
            if (activeRoute) {
              const geometry = activeRoute.geometry;
              if (geometry) {
                const coords = geometry.getCoordinates();
                if (coords && Array.isArray(coords) && coords.length > 2) {
                  const coordinates = coords.map((coord: number[]) => 
                    [coord[1], coord[0]] as [number, number] // [lng, lat]
                  );
                  
                  resolved = true;
                  if (timeoutId) clearTimeout(timeoutId);
                  console.log(`✅ Яндекс API: получен маршрут с ${coordinates.length} точками`);
                  resolve(coordinates);
                  return;
                }
              }
            }
            
            if (!resolved) {
              resolved = true;
              if (timeoutId) clearTimeout(timeoutId);
              resolve(null);
            }
          } catch (error) {
            if (!resolved) {
              resolved = true;
              if (timeoutId) clearTimeout(timeoutId);
              resolve(null);
            }
          }
        };

        const errorHandler = () => {
          if (!resolved) {
            resolved = true;
            if (timeoutId) clearTimeout(timeoutId);
            resolve(null);
          }
        };

        multiRoute.model.events.add('requestsuccess', successHandler);
        multiRoute.model.events.add('requesterror', errorHandler);

        timeoutId = window.setTimeout(() => {
          if (!resolved) {
            resolved = true;
            resolve(null);
          }
        }, 5000);
      } catch (error) {
        if (!resolved) {
          resolved = true;
          resolve(null);
        }
      }
    });
  });
}

/**
 * Получает маршрут по дорогам между двумя точками
 * Пробует несколько методов: Яндекс API, OSRM, GraphHopper
 * @param from - Начальная точка [lng, lat]
 * @param to - Конечная точка [lng, lat]
 * @returns Promise с координатами маршрута или null при ошибке
 */
export async function getRoutePoints(
  from: [number, number],
  to: [number, number]
): Promise<[number, number][] | null> {
  console.log('🚗 Построение маршрута по дорогам от', from, 'до', to);
  
  // Сначала пробуем Яндекс API (самый надежный для России)
  if (window.ymaps) {
    const yandexRoute = await getRouteViaYandexAPI(from, to);
    if (yandexRoute && yandexRoute.length > 2) {
      return yandexRoute;
    }
  }
  
  // Если Яндекс API не сработал, пробуем OSRM
  console.log('Пробуем OSRM...');
  const osrmRoute = await getRouteViaOSRM(from, to);
  if (osrmRoute && osrmRoute.length > 2) {
    return osrmRoute;
  }
  
  // Если OSRM не сработал, пробуем GraphHopper
  console.log('Пробуем GraphHopper...');
  const ghRoute = await getRouteViaGraphHopper(from, to);
  if (ghRoute && ghRoute.length > 2) {
    return ghRoute;
  }
  
  console.warn('❌ Не удалось получить маршрут по дорогам');
  return null;
}
