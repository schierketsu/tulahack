import { DisabilityType, SocialCategory, SocialObject } from "../types";

// В dev уходим через прокси Vite (`/api/gigachat`) чтобы обойти CORS.
const API_URL = "/api/gigachat/v1/chat/completions";

// В Vite переменные окружения, доступные на клиенте, должны начинаться с VITE_
const API_KEY = import.meta.env.VITE_CLOUD_RU_API_KEY as string | undefined;

export interface AiRouteRequest {
  userLocation: [number, number]; // [lng, lat]
  disabilities: DisabilityType[];
  categories: SocialCategory[];
  userQuery: string;
  objects: SocialObject[];
}

export interface AiRouteResponse {
  comment: string;
}

/**
 * Вызывает модель Cloud.ru для генерации короткого комментария к построенному маршруту.
 * Маршрут (сам объект назначения) подбирается на стороне клиента, ИИ даёт пояснение.
 */
export async function getAiRouteComment(
  params: AiRouteRequest & { chosenObject: SocialObject; distanceKm: number }
): Promise<AiRouteResponse | null> {
  if (!API_KEY) {
    console.warn("VITE_CLOUD_RU_API_KEY is not set; AI helper is disabled.");
    return null;
  }

  const { userLocation, disabilities, categories, userQuery, objects, chosenObject, distanceKm } =
    params;

  const disabilityLabels: Record<DisabilityType, string> = {
    vision: "нарушения зрения",
    hearing: "нарушения слуха",
    wheelchair: "передвигается на кресле-коляске",
    mobility: "нарушения опорно-двигательного аппарата",
    mental: "умственные нарушения",
  };

  const selectedDisabilitiesText =
    disabilities.length === 0
      ? "особенности здоровья не указаны"
      : disabilities.map((d) => disabilityLabels[d]).join(", ");

  const categoriesText =
    categories.length === 0
      ? "категории объектов не выбраны"
      : categories.join(", ");

  const systemPrompt = `
Ты — краткий русскоязычный ИИ-помощник для навигации по социальной инфраструктуре.
Маршрут до объекта уже автоматически подобран по геоданным и доступности, выбирать объект не нужно.
Твоя задача — вежливо и очень коротко (1–2 предложения) объяснить пользователю, почему выбранный объект ему подходит.
Не упоминай никакой технической информации (координаты, ID, формулы, API и т.п.).
Не пиши больше двух предложений.
`;

  const userPrompt = `
Запрос пользователя: "${userQuery || "к ближайшему подходящему объекту"}".

Текущее местоположение (приблизительно): [${userLocation[1].toFixed(
    4
  )}° широты, ${userLocation[0].toFixed(4)}° долготы].
Особенности здоровья: ${selectedDisabilitiesText}.
Выбранные категории объектов: ${categoriesText}.

Список объектов (для контекста):
${objects
  .map(
    (o) =>
      `- ${o.name} (${o.category}), адрес: ${o.address}. Доступность: ` +
      `зрение=${o.accessibility.vision ? "да" : "нет"}, ` +
      `слух=${o.accessibility.hearing ? "да" : "нет"}, ` +
      `коляска=${o.accessibility.wheelchair ? "да" : "нет"}, ` +
      `опорно-двигательный аппарат=${o.accessibility.mobility ? "да" : "нет"}, ` +
      `умственные нарушения=${o.accessibility.mental ? "да" : "нет"}.`
  )
  .join("\n")}

Автоматически выбран объект:
- Название: ${chosenObject.name}
- Адрес: ${chosenObject.address}
- Категория: ${chosenObject.category}
- Ориентировочное расстояние: ${distanceKm.toFixed(1)} км
- Доступность по профилю пользователя: ${Object.entries(
    chosenObject.accessibility
  )
    .map(([k, v]) => `${k}=${v ? "да" : "нет"}`)
    .join(", ")}

Сформулируй для пользователя очень короткое пояснение, почему этот объект ему подойдёт, с учётом особенностей здоровья и того, что он находится недалеко.
`;

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "ai-sage/GigaChat3-10B-A1.8B",
        max_tokens: 400,
        temperature: 0.4,
        presence_penalty: 0,
        top_p: 0.95,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      console.error("AI route helper error:", response.status, await response.text());
      return null;
    }

    const data = await response.json();
    const content =
      data?.choices?.[0]?.message?.content?.trim() ||
      "Я подобрал для вас ближайший подходящий объект с учётом ваших особенностей здоровья.";

    return { comment: content };
  } catch (error) {
    console.error("AI route helper exception:", error);
    return null;
  }
}


