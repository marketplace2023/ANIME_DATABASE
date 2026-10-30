import { get, set } from "idb-keyval";

const DATA_URL = "/data/anime-offline-database-minified.json";
const CACHE_KEY = "anime-db-cache-v1";

/** @type {any[]} */
let records = [];
let facets = null;

function normalize(raw) {
  return raw.map((a, i) => ({
    id: i,
    title: a.title,
    synonymsLower: (a.synonyms || []).join(" ␟ ").toLowerCase(),
    titleLower: a.title.toLowerCase(),
    type: a.type,
    episodes: a.episodes,
    status: a.status,
    season: a.animeSeason?.season ?? "UNDEFINED",
    year: a.animeSeason?.year ?? null,
    picture: a.picture,
    thumbnail: a.thumbnail,
    duration: a.duration?.value ?? null,
    score: a.score?.arithmeticMean ?? null,
    tags: a.tags || [],
    studios: a.studios || [],
    producers: a.producers || [],
    synonyms: a.synonyms || [],
    sources: a.sources || [],
    url: a.sources?.[0] ?? null,
  }));
}

function buildFacets(items) {
  const tagCounts = new Map();
  const studioCounts = new Map();
  const types = new Set();
  const statuses = new Set();
  const seasons = new Set();
  let yearMin = Infinity;
  let yearMax = -Infinity;

  for (const it of items) {
    types.add(it.type);
    statuses.add(it.status);
    seasons.add(it.season);
    if (it.year != null) {
      if (it.year < yearMin) yearMin = it.year;
      if (it.year > yearMax) yearMax = it.year;
    }
    for (const t of it.tags) tagCounts.set(t, (tagCounts.get(t) || 0) + 1);
    for (const s of it.studios) studioCounts.set(s, (studioCounts.get(s) || 0) + 1);
  }

  const sortedTags = [...tagCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }));
  const sortedStudios = [...studioCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }));

  return {
    types: [...types].sort(),
    statuses: [...statuses].sort(),
    seasons: [...seasons].sort(),
    yearMin: Number.isFinite(yearMin) ? yearMin : null,
    yearMax: Number.isFinite(yearMax) ? yearMax : null,
    tags: sortedTags,
    studios: sortedStudios,
  };
}

async function fetchWithProgress(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} al descargar el dataset`);
  const total = Number(res.headers.get("content-length")) || 0;
  const reader = res.body.getReader();
  const chunks = [];
  let loaded = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    loaded += value.length;
    postMessage({ type: "progress", loaded, total });
  }

  const blob = new Blob(chunks);
  const text = await blob.text();
  return JSON.parse(text);
}

async function init() {
  try {
    const cached = await get(CACHE_KEY);
    let raw;
    if (cached) {
      postMessage({ type: "progress", loaded: 1, total: 1 });
      raw = cached;
    } else {
      const json = await fetchWithProgress(DATA_URL);
      raw = json.data;
      set(CACHE_KEY, raw).catch(() => {});
    }

    records = normalize(raw);
    facets = buildFacets(records);

    postMessage({ type: "ready", facets, total: records.length });
  } catch (err) {
    postMessage({ type: "error", message: err.message || String(err) });
  }
}

function matches(item, f) {
  if (f.search) {
    const q = f.search;
    if (!item.titleLower.includes(q) && !item.synonymsLower.includes(q)) return false;
  }
  if (f.types.length && !f.types.includes(item.type)) return false;
  if (f.statuses.length && !f.statuses.includes(item.status)) return false;
  if (f.seasons.length && !f.seasons.includes(item.season)) return false;
  if (f.yearMin != null && (item.year == null || item.year < f.yearMin)) return false;
  if (f.yearMax != null && (item.year == null || item.year > f.yearMax)) return false;
  if (f.scoreMin != null && (item.score == null || item.score < f.scoreMin)) return false;
  if (f.tags.length && !f.tags.every((t) => item.tags.includes(t))) return false;
  if (f.studio && !item.studios.includes(f.studio)) return false;
  return true;
}

function compare(a, b, sort) {
  switch (sort) {
    case "score-desc":
      return (b.score ?? -1) - (a.score ?? -1);
    case "score-asc":
      return (a.score ?? 999) - (b.score ?? 999);
    case "year-desc":
      return (b.year ?? -1) - (a.year ?? -1);
    case "year-asc":
      return (a.year ?? 9999) - (b.year ?? 9999);
    case "title-asc":
      return a.title.localeCompare(b.title);
    default:
      return 0;
  }
}

function runFilter(f) {
  const filtered = records.filter((item) => matches(item, f));
  filtered.sort((a, b) => compare(a, b, f.sort));

  const start = f.page * f.pageSize;
  const items = filtered.slice(start, start + f.pageSize).map((it) => ({
    id: it.id,
    title: it.title,
    type: it.type,
    episodes: it.episodes,
    status: it.status,
    season: it.season,
    year: it.year,
    picture: it.picture,
    thumbnail: it.thumbnail,
    duration: it.duration,
    score: it.score,
    tags: it.tags,
    studios: it.studios,
    producers: it.producers,
    synonyms: it.synonyms,
    sources: it.sources,
    url: it.url,
  }));

  postMessage({ type: "results", items, total: filtered.length, page: f.page });
}

onmessage = (e) => {
  const msg = e.data;
  if (msg.type === "init") init();
  else if (msg.type === "filter") runFilter(msg.payload);
};
