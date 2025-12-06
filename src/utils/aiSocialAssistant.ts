import { SocialObject } from "../types";

const API_URL = "/api/gigachat/v1/chat/completions";
const API_KEY = import.meta.env.VITE_CLOUD_RU_API_KEY as string | undefined;

export type ChatRole = "user" | "assistant";

export interface SocialChatMessage {
  role: ChatRole;
  content: string;
}

export interface SocialChatContext {
  region?: string;
  childAge?: string;
  pregnancyWeek?: string;
  relatedObjects?: SocialObject[];
  familyStatus?: string;
  familyIncome?: string;
}

const SYSTEM_PROMPT = `
Ты — умный русскоязычный помощник по государственным мерам поддержки семей с детьми и беременных женщин.
У тебя есть внутренняя база знаний (структурированные вопросы/ответы Минздрава, региональные регламенты, нормативные акты из предоставленного набора).
Требования:
- Отвечай строго по фактам из базы, не придумывай. Если данных не хватает — задай уточняющие вопросы, кроме региона проживания.
- Регион по умолчанию — Тульская область. Не уточняй регион, даже если он не указан в сообщении.
- Сначала выясни ключевой контекст (возраст/дата рождения ребёнка, срок беременности, гражданство, статус семьи, доходы, инвалидность, число детей).
- Тон: тёплый и дружелюбный, как живой человек. Пиши простыми короткими предложениями, без канцелярита, спецсимволов и эмодзи. Будь точным, но объясняй по-человечески.
- Формат ответа (коротко, но структурировано):
  1) Краткий вывод: кому и что положено.
  2) Что дают: выплаты/льготы/услуги.
  3) Условия и ограничения (сроки, возраст, проживание, доход).
  4) Документы и шаги подачи (онлайн/МФЦ/медорганизация).
  5) Нормативные ссылки (ФЗ, постановления, региональные приказы) из базы.
- Если вопрос вне тематики социальной поддержки — вежливо откажи и направь к официальным источникам.
`;

const FALLBACK_TEXT = `
Сейчас не могу подключиться к ИИ, поэтому даю краткий план.
1) Соберите контекст: регион, возраст ребёнка, срок беременности, доход семьи, число детей.
2) Проверьте федеральные меры (ЕДВ, маткапитал, пособия беременным, выплаты при рождении, льготы на медуслуги) и региональные программы.
3) Подайте заявление через Госуслуги или МФЦ; возьмите паспорт, СНИЛС, свидетельства о рождении, справки о доходах и меддокументы.
4) Когда появится ключ VITE_CLOUD_RU_API_KEY, повторите запрос — отвечу точнее и подробнее.
`;

export async function askSocialAssistant(
  messages: SocialChatMessage[],
  context: SocialChatContext
): Promise<string> {
  const contextPrompt = `
Контекст пользователя:
- Регион: ${context.region || "не указан"}
- Возраст/дата рождения ребёнка: ${context.childAge || "не указано"}
- Срок беременности: ${context.pregnancyWeek || "не указан"}
- Статус семьи: ${context.familyStatus || "не указан"}
- Доход: ${context.familyIncome || "не указан"}
- Количество доступных объектов: ${context.relatedObjects?.length ?? 0}
Если данных не хватает, сначала уточни их, затем отвечай.
`;

  const apiMessages = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "system", content: contextPrompt },
    ...messages,
  ];

  if (!API_KEY) {
    return FALLBACK_TEXT.trim();
  }

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "ai-sage/GigaChat3-10B-A1.8B",
        max_tokens: 800,
        temperature: 0.25,
        presence_penalty: 0,
        top_p: 0.9,
        messages: apiMessages,
      }),
    });

    if (!response.ok) {
      console.error("Social assistant error:", response.status, await response.text());
      return FALLBACK_TEXT.trim();
    }

    const data = await response.json();
    return (
      data?.choices?.[0]?.message?.content?.trim() ||
      "Не удалось получить ответ. Попробуйте уточнить вопрос или повторить позже."
    );
  } catch (error) {
    console.error("Social assistant exception:", error);
    return FALLBACK_TEXT.trim();
  }
}


