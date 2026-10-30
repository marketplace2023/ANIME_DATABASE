import { useEffect, useMemo, useRef, useState } from "react";

export const DEFAULT_FILTERS = {
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
  page: 0,
  pageSize: 100,
};

export function useAnimeData() {
  const workerRef = useRef(null);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [progress, setProgress] = useState({ loaded: 0, total: 0 });
  const [errorMessage, setErrorMessage] = useState("");
  const [facets, setFacets] = useState(null);
  const [totalRecords, setTotalRecords] = useState(0);

  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [results, setResults] = useState({ items: [], total: 0, page: 0 });
  const debounceRef = useRef(null);

  useEffect(() => {
    const worker = new Worker(new URL("../worker/animeWorker.js", import.meta.url), {
      type: "module",
    });
    workerRef.current = worker;

    worker.onmessage = (e) => {
      const msg = e.data;
      if (msg.type === "progress") {
        setProgress({ loaded: msg.loaded, total: msg.total });
      } else if (msg.type === "ready") {
        setFacets(msg.facets);
        setTotalRecords(msg.total);
        setStatus("ready");
      } else if (msg.type === "results") {
        setResults(msg);
      } else if (msg.type === "error") {
        setErrorMessage(msg.message);
        setStatus("error");
      }
    };

    worker.postMessage({ type: "init" });
    return () => worker.terminate();
  }, []);

  useEffect(() => {
    if (status !== "ready") return;
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      workerRef.current?.postMessage({
        type: "filter",
        payload: { ...filters, search: filters.search.trim().toLowerCase() },
      });
    }, 150);
    return () => clearTimeout(debounceRef.current);
  }, [filters, status]);

  const updateFilters = (patch) => {
    setFilters((prev) => ({
      ...prev,
      ...patch,
      page: patch.page !== undefined ? patch.page : 0,
    }));
  };

  const setPage = (page) => setFilters((prev) => ({ ...prev, page }));

  const pageCount = useMemo(
    () => Math.max(1, Math.ceil(results.total / filters.pageSize)),
    [results.total, filters.pageSize]
  );

  return {
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
  };
}
