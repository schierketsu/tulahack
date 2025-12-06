import { Review, ReviewSummary, User, UserStats } from "./types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const jsonHeaders = (token?: string) => ({
  "Content-Type": "application/json",
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

export async function register(nickname: string, password: string) {
  const res = await fetch(`${API_URL}/api/auth/register`, {
    method: "POST",
    headers: jsonHeaders(),
    body: JSON.stringify({ nickname, password }),
  });
  if (!res.ok) throw new Error((await res.json()).error || "Ошибка регистрации");
  return res.json() as Promise<{ token: string; user: User }>;
}

export async function login(nickname: string, password: string) {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: jsonHeaders(),
    body: JSON.stringify({ nickname, password }),
  });
  if (!res.ok) throw new Error((await res.json()).error || "Ошибка входа");
  return res.json() as Promise<{ token: string; user: User }>;
}

export async function me(token: string) {
  const res = await fetch(`${API_URL}/api/auth/me`, {
    headers: jsonHeaders(token),
  });
  if (!res.ok) throw new Error((await res.json()).error || "Ошибка профиля");
  return res.json() as Promise<{ user: User; stats: UserStats }>;
}

export async function getObjectReviews(objectId: string) {
  const res = await fetch(`${API_URL}/api/objects/${objectId}/reviews`);
  if (!res.ok) throw new Error("Не удалось загрузить отзывы");
  return res.json() as Promise<{ reviews: Review[] }>;
}

export async function getObjectSummary(objectId: string) {
  const res = await fetch(`${API_URL}/api/objects/${objectId}/summary`);
  if (!res.ok) throw new Error("Не удалось загрузить рейтинг");
  return res.json() as Promise<ReviewSummary>;
}

export async function createReview(
  token: string,
  objectId: string,
  rating: number,
  text: string
) {
  const res = await fetch(`${API_URL}/api/objects/${objectId}/reviews`, {
    method: "POST",
    headers: jsonHeaders(token),
    body: JSON.stringify({ rating, text }),
  });
  if (!res.ok) throw new Error((await res.json()).error || "Не удалось сохранить отзыв");
  return res.json() as Promise<any>;
}

export async function deleteReview(token: string, objectId: string, reviewId: number) {
  const attempt = async (url: string) => {
    const res = await fetch(url, {
      method: "DELETE",
      headers: jsonHeaders(token),
    });
    const contentType = res.headers.get("content-type") || "";
    if (!res.ok) {
      const prefix = `(${res.status}) `;
      if (contentType.includes("application/json")) {
        const data = await res.json();
        throw new Error(prefix + (data?.error || "Не удалось удалить отзыв"));
      }
      const text = await res.text();
      throw new Error(prefix + (text || "Не удалось удалить отзыв"));
    }
    if (contentType.includes("application/json")) {
      return res.json() as Promise<any>;
    }
    return {} as any;
  };

  try {
    return await attempt(`${API_URL}/api/objects/${objectId}/reviews/${reviewId}`);
  } catch (err: any) {
    if (String(err?.message || "").includes("(404)")) {
      return await attempt(`${API_URL}/api/reviews/${reviewId}`);
    }
    throw err;
  }
}

