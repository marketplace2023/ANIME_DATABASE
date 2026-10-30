import { useState } from "react";
import { useAnimeData } from "./hooks/useAnimeData";
import FilterPanel from "./components/FilterPanel";
import ResultsGrid from "./components/ResultsGrid";
import DetailModal from "./components/DetailModal";
import "./App.css";

function formatBytes(n) {
  if (!n) return "0 MB";
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

export default function App() {
  const {
    status,
    progress,
    errorMessage,
    facets,
    totalRecords,
    filters,
    updateFilters,
    setPage,
    results,
    pageCount,
  } = useAnimeData();

  const [selected, setSelected] = useState(null);

  if (status === "error") {
    return (
      <div className="state-screen">
        <h1>Ocurrió un error</h1>
        <p>{errorMessage}</p>
      </div>
    );
  }

  if (status === "loading") {
    const pct = progress.total ? Math.round((progress.loaded / progress.total) * 100) : 0;
    return (
      <div className="state-screen">
        <h1>Cargando base de datos de anime…</h1>
        <div className="progress-bar">
          <div className="progress-bar__fill" style={{ width: `${pct}%` }} />
        </div>
        <p>
          {formatBytes(progress.loaded)} {progress.total ? `/ ${formatBytes(progress.total)}` : ""}
        </p>
      </div>
    );
  }

  return (
    <div className="app">
      <FilterPanel
        facets={facets}
        filters={filters}
        updateFilters={updateFilters}
        totalRecords={totalRecords}
        matchCount={results.total}
      />

      <main className="results-panel">
        <ResultsGrid items={results.items} onSelect={setSelected} />
        <div className="pagination">
          <button disabled={filters.page <= 0} onClick={() => setPage(filters.page - 1)}>
            Anterior
          </button>
          <span>
            Página {filters.page + 1} de {pageCount}
          </span>
          <button
            disabled={filters.page >= pageCount - 1}
            onClick={() => setPage(filters.page + 1)}
          >
            Siguiente
          </button>
        </div>
      </main>

      <DetailModal item={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
