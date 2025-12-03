import { SocialObject } from "../../types";

interface ObjectCardProps {
  object: SocialObject;
  onClose: () => void;
  onBuildRoute: (id: string) => void;
}

export function ObjectCard({ object, onClose, onBuildRoute }: ObjectCardProps) {
  return (
    <div className="object-card-overlay">
      <div className="object-card">
        <div className="object-card-header">
          <div className="object-card-title">{object.name}</div>
          <button
            className="object-card-close"
            type="button"
            aria-label="Закрыть"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div className="object-card-address">{object.address}</div>

        <div className="object-card-body">{object.description}</div>

        <div className="object-card-footer">
          <button
            type="button"
            className="object-card-button"
            onClick={() => onBuildRoute(object.id)}
          >
            Проложить маршрут
          </button>
        </div>
      </div>
    </div>
  );
}


