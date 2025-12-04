import { SocialObject, DisabilityType } from "../../types";

interface ObjectCardProps {
  object: SocialObject;
  onClose: () => void;
  onBuildRoute: (id: string) => void;
  selectedDisabilities?: Set<DisabilityType>;
}

export function ObjectCard({ object, onClose, onBuildRoute, selectedDisabilities }: ObjectCardProps) {
  const isAccessibleForProfile = (() => {
    if (!selectedDisabilities || selectedDisabilities.size === 0) return null;
    const a = object.accessibility;
    for (const d of selectedDisabilities) {
      if (!a[d]) return false;
    }
    return true;
  })();

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


