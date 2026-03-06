"use client";

import { useState, useEffect, useRef } from "react";

type Item = {
  id: string | number;
  label: string;
  value: any;
};

export default function SearchDropdown({
  items,
  placeholder = "Search...",
  onSelect,
}: {
  items: Item[];
  placeholder?: string;
  onSelect: (item: Item) => void;
}) {
  const [query, setQuery] = useState("");
  const [filtered, setFiltered] = useState<Item[]>(items);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query.toLowerCase();

    setFiltered(items.filter((item) => item.label.toLowerCase().includes(q)));

    setSelectedIndex(0);
  }, [query, items]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      setSelectedIndex((prev) => Math.min(prev + 1, filtered.length - 1));
    }

    if (e.key === "ArrowUp") {
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    }

    if (e.key === "Enter") {
      const item = filtered[selectedIndex];
      if (item) onSelect(item);
    }
  };

  return (
    <div
      ref={containerRef}
      className="w-full max-h-80 bg-white border rounded-lg shadow-lg overflow-y-auto overflow-x-hidden"
    >
      <div className="sticky top-0 bg-white border-b p-2">
        <input
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full text-sm outline-none px-2 py-1"
        />
      </div>

      {filtered.length === 0 && (
        <div className="p-4 text-sm text-gray-500">No results</div>
      )}

      {filtered.map((item, index) => (
        <button
          key={item.id}
          onClick={() => onSelect(item)}
          className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 truncate ${
            index === selectedIndex ? "bg-gray-100" : "hover:bg-gray-50"
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
