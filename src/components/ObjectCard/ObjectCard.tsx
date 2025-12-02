import { SocialObject } from "../../types";

interface ObjectCardProps {
  object: SocialObject;
  onClose: () => void;
  onOpenDetails: (id: string) => void;
}

export function ObjectCard({ object, onClose, onOpenDetails }: ObjectCardProps) {
  return (
    <div className="object-card-overlay">
      <div className="object-card">
        <div className="object-card-header">
          <div>
            <div className="object-card-title">{object.name}</div>
            <div className="object-card-category">
              {object.category === "healthcare" && "Здравоохранение"}
              {object.category === "culture" && "Культура"}
              {object.category === "social" && "Социальная поддержка"}
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

        <div className="object-card-body">{object.description}</div>

        <div className="object-card-address">{object.address}</div>

        <div className="object-card-footer">
          <button
            type="button"
            className="object-card-button"
            onClick={() => onOpenDetails(object.id)}
          >
            Подробнее и маршруты
          </button>
          <div className="object-card-tagline">
            Оценки, отзывы и маршрут будут доступны на следующем шаге
          </div>
        </div>
      </div>
    </div>
  );
}


