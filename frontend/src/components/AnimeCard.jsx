import ImageWithFallback from "./ImageWithFallback";

const TYPE_LABELS = {
  TV: "TV",
  MOVIE: "Película",
  OVA: "OVA",
  ONA: "ONA",
  SPECIAL: "Especial",
  UNKNOWN: "?",
};

export default function AnimeCard({ item, onSelect }) {
  return (
    <button type="button" className="anime-card" onClick={() => onSelect(item)}>
      <ImageWithFallback className="anime-card__img" src={item.thumbnail} alt={item.title} />
      <div className="anime-card__body">
        <p className="anime-card__title" title={item.title}>
          {item.title}
        </p>
        <p className="anime-card__meta">
          {TYPE_LABELS[item.type] ?? item.type} · {item.episodes ?? "?"} ep ·{" "}
          {item.year ?? "?"}
        </p>
        <p className="anime-card__score">{item.score ? item.score.toFixed(2) : "—"}</p>
      </div>
    </button>
  );
}
