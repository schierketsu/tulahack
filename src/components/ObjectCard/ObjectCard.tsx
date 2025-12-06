import { useEffect, useState } from "react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ThumbsUpDownIcon from "@mui/icons-material/ThumbsUpDown";
import StarRateIcon from "@mui/icons-material/StarRate";
import DeleteIcon from "@mui/icons-material/Delete";
import { SocialObject, DisabilityType, Review, ReviewSummary, User } from "../../types";
import {
  getObjectReviews,
  getObjectSummary,
  createReview,
  deleteReview,
} from "../../api";

interface ObjectCardProps {
  object: SocialObject;
  onClose: () => void;
  onBuildRoute: (id: string) => void;
  selectedDisabilities?: Set<DisabilityType>;
  authToken?: string | null;
  currentUser?: User | null;
  onRequireAuth?: () => void;
  onReviewAdded?: () => void;
  onUserReviewsUpdate?: (
    reviews: {
      id: number;
      objectId: string;
      objectName: string;
      objectAddress: string;
      rating: number;
      text?: string;
      created_at: string;
    }[]
  ) => void;
}

export function ObjectCard({
  object,
  onClose,
  onBuildRoute,
  selectedDisabilities,
  authToken,
  currentUser,
  onRequireAuth,
  onReviewAdded,
  onUserReviewsUpdate,
}: ObjectCardProps) {
  const [summary, setSummary] = useState<ReviewSummary | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [reviewsError, setReviewsError] = useState<string | null>(null);
  const [ratingValue, setRatingValue] = useState<number>(5);
  const [textValue, setTextValue] = useState<string>("");
  const [sendingReview, setSendingReview] = useState(false);
  const [isReviewsMode, setIsReviewsMode] = useState(false);
  const [deletingReviewId, setDeletingReviewId] = useState<number | null>(null);

  const syncUserReviews = (list: Review[]) => {
    if (!onUserReviewsUpdate) return;
    if (!currentUser) {
      onUserReviewsUpdate([]);
      return;
    }
    const own = list
      .filter((rev) => rev.nickname === currentUser.nickname)
      .map((rev) => ({
        id: rev.id,
        objectId: object.id,
        objectName: object.name,
        objectAddress: object.address,
        rating: rev.rating,
        text: rev.text,
        created_at: rev.created_at,
      }));
    onUserReviewsUpdate(own);
  };

  const loadReviews = async () => {
    try {
      setLoadingReviews(true);
      setReviewsError(null);
      const [summaryRes, reviewsRes] = await Promise.all([
        getObjectSummary(object.id),
        getObjectReviews(object.id),
      ]);
      setSummary(summaryRes);
      setReviews(reviewsRes.reviews || []);
      syncUserReviews(reviewsRes.reviews || []);
    } catch (err) {
      // На старте не показываем пользовательское сообщение, чтобы не мешать открытию блока
      console.error("Load reviews error", err);
    } finally {
      setLoadingReviews(false);
    }
  };

  useEffect(() => {
    loadReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [object.id]);

  const handleSendReview = async () => {
    if (!authToken) {
      onRequireAuth?.();
      return;
    }
    if (ratingValue < 1 || ratingValue > 5) {
      setReviewsError("Оценка должна быть от 1 до 5");
      return;
    }
    try {
      setSendingReview(true);
      setReviewsError(null);
      await createReview(authToken, object.id, ratingValue, textValue.trim());
      setTextValue("");
      setRatingValue(5);
      await loadReviews();
      onReviewAdded?.();
    } catch (err: any) {
      setReviewsError(err?.message || "Ошибка отправки отзыва");
    } finally {
      setSendingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId: number) => {
    if (!authToken) {
      onRequireAuth?.();
      return;
    }
    try {
      setDeletingReviewId(reviewId);
      setReviewsError(null);
      await deleteReview(authToken, object.id, reviewId);
      await loadReviews();
      onReviewAdded?.();
    } catch (err: any) {
      const msg = err?.message || "Не удалось удалить отзыв";
      setReviewsError(msg.includes("(404)") ? "Отзыв не найден или уже удалён" : msg);
    } finally {
      setDeletingReviewId(null);
    }
  };

  const isAccessibleForProfile = (() => {
    if (!selectedDisabilities || selectedDisabilities.size === 0) return null;
    const a = object.accessibility;
    for (const d of selectedDisabilities) {
      if (!a[d]) return false;
    }
    return true;
  })();

  const cleanedDescription = (() => {
    const desc = (object.description || "").trim();
    if (!desc) return "";
    const name = (object.name || "").trim();
    if (!name) return desc;

    // Нормализуем для сравнения
    const normalize = (val: string) =>
      val
        .toLowerCase()
        .replace(/^[«"'\s-–—]+|[»"'\s]+$/g, "")
        .trim();

    const normDesc = normalize(desc);
    const normName = normalize(name);

    // Если описание целиком совпадает с названием — не показываем
    if (normDesc === normName) return "";

    // Если описание начинается с названия — убираем дублирующую часть
    if (normDesc.startsWith(normName)) {
      const trimmed = desc
        .slice(name.length)
        .replace(/^[-–—,.:;\s]+/, "")
        .trim();
      return trimmed;
    }

    return desc;
  })();

  return (
    <div className="object-card-overlay">
      <div className="object-card">
        <div className="object-card-header">
          <div className="object-card-title-block">
            <div className="object-card-title">
              {isReviewsMode ? "Отзывы об организации" : object.name}
            </div>
            <div className="object-card-rating-inline">
              <StarRateIcon className="object-card-star" fontSize="small" />
              {summary ? summary.avgRating.toFixed(1) : "—"}{" "}
              <span className="object-card-rating-count">
                ({summary ? summary.count : 0})
              </span>
            </div>
          </div>
          <button
            className="object-card-close"
            type="button"
            aria-label="Закрыть"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {!isReviewsMode && <div className="object-card-address">{object.address}</div>}

        {isReviewsMode && (
          <div className="object-card-body" style={{ marginTop: 12 }}>
            <div className="object-card-reviews-header" />
            {reviewsError && <div className="object-card-error">{reviewsError}</div>}
            <div className="object-card-reviews">
              {loadingReviews && <div className="object-card-muted">Загрузка...</div>}
              {!loadingReviews && reviews.length === 0 && (
                <div className="object-card-muted">Отзывов пока нет</div>
              )}
              {!loadingReviews &&
                reviews.map((rev) => (
                  <div key={rev.id} className="object-card-review">
                    <div className="object-card-review-header">
                      <div className="object-card-review-author">
                        <div className="avatar-placeholder" />
                        <div>
                          <div className="object-card-review-name">
                            {rev.nickname || "Аноним"}
                          </div>
                          <div className="object-card-review-date">
                            {new Date(rev.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="object-card-review-actions">
                        <div className="object-card-review-rating">
                          <StarRateIcon className="object-card-star" fontSize="small" />
                          {rev.rating}
                        </div>
                        {currentUser && rev.nickname === currentUser.nickname && (
                          <button
                            className="object-card-delete-review"
                            type="button"
                            onClick={() => handleDeleteReview(rev.id)}
                            disabled={deletingReviewId === rev.id}
                          >
                            {deletingReviewId === rev.id ? "Удаление..." : <DeleteIcon fontSize="small" />}
                          </button>
                        )}
                      </div>
                    </div>
                    {rev.text && <div className="object-card-review-text">{rev.text}</div>}
                  </div>
                ))}
            </div>
            <div className="object-card-review-form">
              <div className="object-card-form-row">
                <label className="object-card-form-field">
                  Оценка
                  <select
                    value={ratingValue}
                    onChange={(e) => setRatingValue(Number(e.target.value))}
                  >
                    {[5, 4, 3, 2, 1].map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <textarea
                className="object-card-textarea"
                placeholder={
                  currentUser
                    ? "Расскажите о доступности и впечатлениях..."
                    : "Войдите, чтобы оставить отзыв"
                }
                value={textValue}
                onChange={(e) => setTextValue(e.target.value)}
                disabled={!authToken || sendingReview}
                rows={3}
              />
              <div className="object-card-form-actions">
                <button
                  className="object-card-button"
                  type="button"
                  onClick={handleSendReview}
                  disabled={sendingReview}
                >
                  {currentUser ? "Опубликовать отзыв" : "Войти, чтобы оставить отзыв"}
                </button>
                <button
                  className="object-card-button secondary narrow"
                  type="button"
                  onClick={() => setIsReviewsMode(false)}
                  aria-label="К описанию"
                >
                  <ArrowBackIcon fontSize="small" />
                </button>
              </div>
            </div>
          </div>
        )}

        {isAccessibleForProfile !== null && (
          <div
            className="object-card-body"
            style={{
              marginTop: 8,
              color: isAccessibleForProfile ? "#2e7d32" : "#c62828",
              fontWeight: 500
            }}
          >
            {isAccessibleForProfile
              ? "Объект доступен с учётом выбранных особенностей."
              : "Могут быть сложности с посещением с учётом выбранных особенностей."}
          </div>
        )}

        {!isReviewsMode && (
          <div className="object-card-footer">
            <button
              type="button"
              className="object-card-button"
              onClick={() => onBuildRoute(object.id)}
            >
              Проложить маршрут
            </button>
            <button
              className="object-card-button secondary narrow"
              type="button"
              onClick={() => setIsReviewsMode(true)}
              aria-label="К отзывам"
            >
              <ThumbsUpDownIcon fontSize="small" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}


