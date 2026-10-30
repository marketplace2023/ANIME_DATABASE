import { useState } from "react";

const SORT_OPTIONS = [
  { value: "score-desc", label: "Puntuación (mayor a menor)" },
  { value: "score-asc", label: "Puntuación (menor a mayor)" },
  { value: "year-desc", label: "Año (más reciente)" },
  { value: "year-asc", label: "Año (más antiguo)" },
  { value: "title-asc", label: "Título (A-Z)" },
];

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

function toggleValue(arr, value) {
  return arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
}

export default function FilterPanel({ facets, filters, updateFilters, totalRecords, matchCount }) {
  const [tagQuery, setTagQuery] = useState("");

  const visibleTags = facets.tags
    .filter((t) => t.name.includes(tagQuery.toLowerCase()))
    .slice(0, 40);

  const resetAll = () =>
    updateFilters({
      search: "",
      types: [],
      statuses: [],
      seasons: [],
      yearMin: null,
      yearMax: null,
      scoreMin: null,
      tags: [],
      studio: "",
      sort: "score-desc",
    });

  return (
    <aside className="filter-panel">
      <div className="filter-panel__header">
        <h2>Filtros</h2>
        <button type="button" className="link-btn" onClick={resetAll}>
          Limpiar
        </button>
      </div>

      <p className="filter-panel__count">
        {matchCount.toLocaleString("es")} de {totalRecords.toLocaleString("es")} animes
      </p>

      <div className="filter-group">
        <label htmlFor="search">Buscar por título</label>
        <input
          id="search"
          type="text"
          placeholder="ej. Death Note"
          value={filters.search}
          onChange={(e) => updateFilters({ search: e.target.value })}
        />
      </div>

      <div className="filter-group">
        <span className="filter-group__label">Tipo</span>
        <div className="chip-row">
          {facets.types.map((t) => (
            <button
              key={t}
              type="button"
              className={`chip ${filters.types.includes(t) ? "chip--active" : ""}`}
              onClick={() => updateFilters({ types: toggleValue(filters.types, t) })}
            >
              {TYPE_LABELS[t] ?? t}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <span className="filter-group__label">Estado</span>
        <div className="chip-row">
          {facets.statuses.map((s) => (
            <button
              key={s}
              type="button"
              className={`chip ${filters.statuses.includes(s) ? "chip--active" : ""}`}
              onClick={() => updateFilters({ statuses: toggleValue(filters.statuses, s) })}
            >
              {STATUS_LABELS[s] ?? s}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <span className="filter-group__label">Temporada</span>
        <div className="chip-row">
          {facets.seasons.map((s) => (
            <button
              key={s}
              type="button"
              className={`chip ${filters.seasons.includes(s) ? "chip--active" : ""}`}
              onClick={() => updateFilters({ seasons: toggleValue(filters.seasons, s) })}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-group filter-group--row">
        <div>
          <label htmlFor="yearMin">Año desde</label>
          <input
            id="yearMin"
            type="number"
            min={facets.yearMin ?? undefined}
            max={facets.yearMax ?? undefined}
            placeholder={String(facets.yearMin ?? "")}
            value={filters.yearMin ?? ""}
            onChange={(e) =>
              updateFilters({ yearMin: e.target.value ? Number(e.target.value) : null })
            }
          />
        </div>
        <div>
          <label htmlFor="yearMax">Año hasta</label>
          <input
            id="yearMax"
            type="number"
            min={facets.yearMin ?? undefined}
            max={facets.yearMax ?? undefined}
            placeholder={String(facets.yearMax ?? "")}
            value={filters.yearMax ?? ""}
            onChange={(e) =>
              updateFilters({ yearMax: e.target.value ? Number(e.target.value) : null })
            }
          />
        </div>
      </div>

      <div className="filter-group">
        <label htmlFor="scoreMin">
          Puntuación mínima {filters.scoreMin != null ? `(${filters.scoreMin.toFixed(1)})` : ""}
        </label>
        <input
          id="scoreMin"
          type="range"
          min="1"
          max="10"
          step="0.5"
          value={filters.scoreMin ?? 1}
          onChange={(e) => updateFilters({ scoreMin: Number(e.target.value) })}
        />
      </div>

      <div className="filter-group">
        <label htmlFor="studio">Estudio</label>
        <input
          id="studio"
          list="studio-options"
          type="text"
          placeholder="ej. madhouse"
          value={filters.studio}
          onChange={(e) => updateFilters({ studio: e.target.value.toLowerCase() })}
        />
        <datalist id="studio-options">
          {facets.studios.slice(0, 200).map((s) => (
            <option key={s.name} value={s.name} />
          ))}
        </datalist>
      </div>

      <div className="filter-group">
        <span className="filter-group__label">
          Tags {filters.tags.length > 0 ? `(${filters.tags.length} seleccionados)` : ""}
        </span>
        <input
          type="text"
          placeholder="Buscar tag..."
          value={tagQuery}
          onChange={(e) => setTagQuery(e.target.value)}
        />
        <div className="chip-row chip-row--scroll">
          {visibleTags.map((t) => (
            <button
              key={t.name}
              type="button"
              className={`chip ${filters.tags.includes(t.name) ? "chip--active" : ""}`}
              onClick={() => updateFilters({ tags: toggleValue(filters.tags, t.name) })}
            >
              {t.name} <span className="chip__count">{t.count}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <label htmlFor="sort">Ordenar por</label>
        <select
          id="sort"
          value={filters.sort}
          onChange={(e) => updateFilters({ sort: e.target.value })}
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </aside>
  );
}
