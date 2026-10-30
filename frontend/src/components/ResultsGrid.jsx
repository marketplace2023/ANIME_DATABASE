import { List } from "react-window";
import { useContainerWidth } from "../hooks/useContainerWidth";
import AnimeCard from "./AnimeCard";

const CARD_WIDTH = 200;
const CARD_HEIGHT = 290;
const GAP = 16;

function Row({ index, style, items, columns, onSelect }) {
  const start = index * columns;
  const rowItems = items.slice(start, start + columns);
  return (
    <div
      style={{
        ...style,
        display: "grid",
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: GAP,
        padding: `0 ${GAP}px ${GAP}px`,
        boxSizing: "border-box",
      }}
    >
      {rowItems.map((item) => (
        <AnimeCard key={item.id} item={item} onSelect={onSelect} />
      ))}
    </div>
  );
}

export default function ResultsGrid({ items, onSelect }) {
  const [ref, width] = useContainerWidth();
  const columns = Math.max(1, Math.floor(width / (CARD_WIDTH + GAP)));
  const rowCount = Math.ceil(items.length / columns);

  return (
    <div className="results-grid" ref={ref}>
      {width > 0 && (
        <List
          style={{ height: "100%", width: "100%" }}
          rowCount={rowCount}
          rowHeight={CARD_HEIGHT + GAP}
          rowComponent={Row}
          rowProps={{ items, columns, onSelect }}
        />
      )}
    </div>
  );
}
