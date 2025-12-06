const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { URL } = require("url");

const JWT_SECRET = process.env.JWT_SECRET || "tulahack-secret";
const PORT = process.env.PORT || 4000;
const DB_PATH = process.env.DB_PATH || path.join(__dirname, "data.sqlite");
const GIGACHAT_API_KEY = process.env.GIGACHAT_API_KEY;
const GIGACHAT_URL =
  process.env.GIGACHAT_URL ||
  "https://foundation-models.api.cloud.ru/v1/chat/completions";

const app = express();
app.use(cors());
app.use(express.json());

const db = new sqlite3.Database(DB_PATH);

db.serialize(() => {
  db.run(
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nickname TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`
  );

  db.run(
    `CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      object_id TEXT NOT NULL,
      rating INTEGER NOT NULL,
      text TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )`
  );
});

function generateToken(user) {
  return jwt.sign({ id: user.id, nickname: user.nickname }, JWT_SECRET, {
    expiresIn: "7d",
  });
}

function authMiddleware(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Нет токена" });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Неверный токен" });
  }
}

function getUserByNickname(nickname) {
  return new Promise((resolve, reject) => {
    db.get(`SELECT * FROM users WHERE nickname = ?`, [nickname], (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

function getUserById(id) {
  return new Promise((resolve, reject) => {
    db.get(`SELECT id, nickname FROM users WHERE id = ?`, [id], (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

function countUserReviews(userId) {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT COUNT(*) as count FROM reviews WHERE user_id = ?`,
      [userId],
      (err, row) => {
        if (err) return reject(err);
        resolve(row?.count || 0);
      }
    );
  });
}

function deleteReviewById(reviewId, objectId, userId, res) {
  const whereClause = objectId ? "id = ? AND object_id = ?" : "id = ?";
  const params = objectId ? [reviewId, objectId] : [reviewId];

  db.get(
    `SELECT id, user_id, object_id FROM reviews WHERE ${whereClause}`,
    params,
    (err, row) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Ошибка поиска отзыва" });
      }
      if (!row) {
        return res.status(404).json({ error: "Отзыв не найден" });
      }
      if (row.user_id !== userId) {
        return res.status(403).json({ error: "Можно удалять только свои отзывы" });
      }

      db.run(`DELETE FROM reviews WHERE id = ?`, [reviewId], (delErr) => {
        if (delErr) {
          console.error(delErr);
          return res.status(500).json({ error: "Ошибка удаления отзыва" });
        }
        res.json({ success: true, deletedId: reviewId });
      });
    }
  );
}

app.post("/api/auth/register", async (req, res) => {
  try {
    const { nickname, password } = req.body || {};
    if (!nickname || !password) {
      return res.status(400).json({ error: "Никнейм и пароль обязательны" });
    }
    const existing = await getUserByNickname(nickname);
    if (existing) {
      return res.status(409).json({ error: "Никнейм уже занят" });
    }
    const hash = await bcrypt.hash(password, 10);
    db.run(
      `INSERT INTO users (nickname, password_hash) VALUES (?, ?)`,
      [nickname, hash],
      function (err) {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: "Ошибка создания пользователя" });
        }
        const user = { id: this.lastID, nickname };
        const token = generateToken(user);
        res.json({ token, user });
      }
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Внутренняя ошибка" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { nickname, password } = req.body || {};
    if (!nickname || !password) {
      return res.status(400).json({ error: "Никнейм и пароль обязательны" });
    }
    const user = await getUserByNickname(nickname);
    if (!user) {
      return res.status(401).json({ error: "Неверные данные" });
    }
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ error: "Неверные данные" });
    }
    const token = generateToken(user);
    res.json({ token, user: { id: user.id, nickname: user.nickname } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Внутренняя ошибка" });
  }
});

app.get("/api/auth/me", authMiddleware, async (req, res) => {
  try {
    const user = await getUserById(req.user.id);
    if (!user) return res.status(404).json({ error: "Пользователь не найден" });
    const reviewCount = await countUserReviews(user.id);
    res.json({ user, stats: { reviewCount, points: reviewCount * 10 } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Внутренняя ошибка" });
  }
});

app.get("/api/objects/:id/reviews", (req, res) => {
  const { id } = req.params;
  db.all(
    `SELECT r.id, r.rating, r.text, r.created_at, u.nickname 
     FROM reviews r 
     JOIN users u ON u.id = r.user_id 
     WHERE r.object_id = ?
     ORDER BY r.created_at DESC
     LIMIT 50`,
    [id],
    (err, rows) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Ошибка получения отзывов" });
      }
      res.json({ reviews: rows || [] });
    }
  );
});

app.get("/api/objects/:id/summary", (req, res) => {
  const { id } = req.params;
  db.get(
    `SELECT COUNT(*) as count, AVG(rating) as avgRating FROM reviews WHERE object_id = ?`,
    [id],
    (err, row) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Ошибка получения статистики" });
      }
      res.json({
        count: row?.count || 0,
        avgRating: row?.avgRating ? Number(row.avgRating.toFixed(2)) : 0,
      });
    }
  );
});

app.post("/api/objects/:id/reviews", authMiddleware, (req, res) => {
  const { id } = req.params;
  const { rating, text } = req.body || {};

  const numericRating = Number(rating);
  if (!numericRating || numericRating < 1 || numericRating > 5) {
    return res.status(400).json({ error: "Оценка должна быть от 1 до 5" });
  }

  db.run(
    `INSERT INTO reviews (user_id, object_id, rating, text) VALUES (?, ?, ?, ?)`,
    [req.user.id, id, numericRating, text || ""],
    function (err) {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Ошибка сохранения отзыва" });
      }
      res.json({
        id: this.lastID,
        rating: numericRating,
        text: text || "",
        objectId: id,
        created_at: new Date().toISOString(),
        user: { id: req.user.id, nickname: req.user.nickname },
      });
    }
  );
});

app.delete("/api/objects/:id/reviews/:reviewId", authMiddleware, (req, res) => {
  const { id: objectId, reviewId } = req.params;
  deleteReviewById(reviewId, objectId, req.user.id, res);
});

app.delete("/api/reviews/:reviewId", authMiddleware, (req, res) => {
  const { reviewId } = req.params;
  deleteReviewById(reviewId, null, req.user.id, res);
});

/**
 * Proxy для GigaChat, чтобы ключ не уходил в браузер и обойти CORS.
 */
app.post("/api/gigachat/v1/chat/completions", async (req, res) => {
  if (!GIGACHAT_API_KEY) {
    return res.status(500).json({ error: "GIGACHAT_API_KEY не задан" });
  }

  try {
    const upstream = await fetch(new URL(GIGACHAT_URL), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GIGACHAT_API_KEY}`,
      },
      body: JSON.stringify(req.body || {}),
    });

    const contentType = upstream.headers.get("content-type") || "";
    res.status(upstream.status);
    if (contentType.includes("application/json")) {
      const data = await upstream.json();
      return res.json(data);
    }
    const text = await upstream.text();
    return res.type("text/plain").send(text);
  } catch (err) {
    console.error("Gigachat proxy error:", err);
    return res.status(500).json({ error: "Ошибка запроса к GigaChat" });
  }
});

app.listen(PORT, () => {
  console.log(`API server listening on http://localhost:${PORT}`);
});

