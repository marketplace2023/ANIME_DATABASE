import { useEffect } from "react";
import ImageWithFallback from "./ImageWithFallback";

const TYPE_LABELS = {
  TV: "TV",
  MOVIE: "Película",
  OVA: "OVA",
  ONA: "ONA",
  SPECIAL: "Especial",
  UNKNOWN: "Desconocido",
};

const STATUS_LABELS = {
  FINISHED: "Finalizado",
  ONGOING: "En emisión",
  UPCOMING: "Próximamente",
  UNKNOWN: "Desconocido",
};

function hostnameOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export default function DetailModal({ item, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!item) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="modal__close" onClick={onClose} aria-label="Cerrar">
          ×
        </button>

        <div className="modal__content">
          <ImageWithFallback
            className="modal__img"
            src={item.picture || item.thumbnail}
            alt={item.title}
          />

          <div className="modal__info">
            <h2>{item.title}</h2>
            <p className="modal__meta">
              {TYPE_LABELS[item.type] ?? item.type} · {item.episodes ?? "?"} episodios ·{" "}
              {item.season !== "UNDEFINED" ? `${item.season} ` : ""}
              {item.year ?? "?"} · {STATUS_LABELS[item.status] ?? item.status}
            </p>
            {item.score != null && (
              <p className="modal__score">★ {item.score.toFixed(2)} / 10</p>
            )}
            {item.duration != null && (
              <p className="modal__meta">Duración: {Math.round(item.duration / 60)} min/ep</p>
            )}

            {item.studios.length > 0 && (
              <p className="modal__meta">
                <strong>Estudios:</strong> {item.studios.join(", ")}
              </p>
            )}
            {item.producers.length > 0 && (
              <p className="modal__meta">
                <strong>Productores:</strong> {item.producers.join(", ")}
              </p>
            )}
            {item.synonyms.length > 0 && (
              <p className="modal__meta">
                <strong>También conocido como:</strong> {item.synonyms.join(", ")}
              </p>
            )}

            {item.tags.length > 0 && (
              <div className="chip-row">
                {item.tags.map((t) => (
                  <span key={t} className="chip">
                    {t}
                  </span>
                ))}
              </div>
            )}

            {item.sources.length > 0 && (
              <div className="modal__sources">
                <strong>Ver en:</strong>
                <div className="chip-row">
                  {item.sources.map((src) => (
                    <a key={src} href={src} target="_blank" rel="noreferrer" className="chip">
                      {hostnameOf(src)}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
