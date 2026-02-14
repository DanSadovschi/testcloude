import { useState, useRef, useEffect } from 'react';
import type { Tag } from '../types';

interface TagSelectorProps {
  tags: Tag[];
  selected: string[];
  onChange: (tagIds: string[]) => void;
}

export default function TagSelector({ tags, selected, onChange }: TagSelectorProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const toggle = (id: string) => {
    onChange(
      selected.includes(id)
        ? selected.filter((s) => s !== id)
        : [...selected, id]
    );
  };

  const selectedTags = tags.filter((t) => selected.includes(t.id));

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 rounded-md border border-gray-300 dark:border-gray-600 px-2 py-1.5 text-sm bg-white dark:bg-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 min-w-[80px]"
      >
        {selectedTags.length === 0 ? (
          <span className="text-gray-400 dark:text-gray-500">Tags</span>
        ) : (
          <span className="flex gap-1 flex-wrap">
            {selectedTags.map((t) => (
              <span
                key={t.id}
                className="inline-flex items-center rounded-full px-2 py-0.5 text-xs text-white"
                style={{ backgroundColor: t.color }}
              >
                {t.name}
              </span>
            ))}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute z-10 mt-1 w-48 rounded-md border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-lg py-1">
          {tags.length === 0 ? (
            <p className="px-3 py-2 text-sm text-gray-400">No tags yet</p>
          ) : (
            tags.map((tag) => (
              <label
                key={tag.id}
                className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(tag.id)}
                  onChange={() => toggle(tag.id)}
                  className="rounded text-indigo-600"
                />
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: tag.color }}
                />
                <span className="text-sm dark:text-gray-200">{tag.name}</span>
              </label>
            ))
          )}
        </div>
      )}
    </div>
  );
}
