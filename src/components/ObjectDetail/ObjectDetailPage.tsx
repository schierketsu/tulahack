import { useNavigate, useParams } from "react-router-dom";
import { socialObjects } from "../../data/socialObjects";

export function ObjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const object = socialObjects.find((o) => o.id === id);

  if (!object) {
    return (
      <div className="detail-page">
        <div className="detail-back" onClick={() => navigate("/")}>
          ← На карту
        </div>
        <div className="detail-title">Объект не найден</div>
      </div>
    );
  }

  const categoryLabel =
    object.category === "healthcare"
      ? "Здравоохранение"
      : object.category === "culture"
      ? "Культура"
      : "Социальная поддержка";

  return (
    <div className="detail-page">
      <div className="detail-back" onClick={() => navigate(-1)}>
        ← Назад
      </div>
      <div className="detail-title">{object.name}</div>
      <div className="detail-category">
        {categoryLabel} • {object.address}
      </div>

      <section className="detail-section">
        <div className="detail-label">Описание</div>
        <div>{object.description}</div>
      </section>

      <section className="detail-section">
        <div className="detail-label">Доступная среда</div>
        <ul>
          {object.accessibilityNotes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </section>

      <section className="detail-section">
        <div className="detail-label">Геймификация (концепция)</div>
        <div className="detail-badge-row">
          <div className="detail-badge">Уровни за посещения объектов</div>
          <div className="detail-badge">Ачивки за отзывы</div>
          <div className="detail-badge">
            Баллы за посещение разных категорий
          </div>
          <div className="detail-badge">
            Значки «Посол доступности» для активных пользователей
          </div>
        </div>
      </section>

      <section className="detail-section">
        <div className="detail-label">Маршруты</div>
        <div>
          На этом этапе карта уже фокусируется на Тульской области. В
          следующих итерациях здесь появится построение маршрутов для людей на
          колясках с учётом доступности тротуаров, бордюров и подъемов.
        </div>
      </section>
    </div>
  );
}


