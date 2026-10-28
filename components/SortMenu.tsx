"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";

type SortMenuProps<T extends string> = {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
};

// A styled replacement for <select>, following the WAI-ARIA select-only combobox pattern.
export default function SortMenu<T extends string>({ options, value, onChange }: SortMenuProps<T>) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value)
  );

  useEffect(() => {
    if (!open) return;
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    return () => document.removeEventListener("pointerdown", closeOnOutsideClick);
  }, [open]);

  const openMenu = () => {
    setActiveIndex(selectedIndex);
    setOpen(true);
  };

  const choose = (index: number) => {
    onChange(options[index].value);
    setOpen(false);
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
        event.preventDefault();
        openMenu();
      }
      return;
    }
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, options.length - 1));
        break;
      case "ArrowUp":
        event.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
        break;
      case "Home":
        event.preventDefault();
        setActiveIndex(0);
        break;
      case "End":
        event.preventDefault();
        setActiveIndex(options.length - 1);
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        choose(activeIndex);
        break;
      case "Escape":
        event.preventDefault();
        setOpen(false);
        break;
      case "Tab":
        setOpen(false);
        break;
    }
  };

  return (
    <div ref={rootRef} className="relative w-full sm:w-52">
      <button
        type="button"
        role="combobox"
        aria-label="Sort artworks"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open ? `${listId}-${activeIndex}` : undefined}
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={onKeyDown}
        className={`flex h-10 w-full items-center gap-2 rounded-full border bg-white px-3.5 text-sm text-stone-700 shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 ${
          open ? "border-stone-400" : "border-stone-200 hover:border-stone-400"
        }`}
      >
        <svg
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="h-4 w-4 shrink-0 text-stone-400"
        >
          <path d="M6 3v14M3 6l3-3 3 3M14 17V3M11 14l3 3 3-3" />
        </svg>
        <span className="flex-1 truncate text-left">{options[selectedIndex].label}</span>
        <svg
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={`h-4 w-4 shrink-0 text-stone-400 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        >
          <path d="M5 8l5 5 5-5" />
        </svg>
      </button>

      <ul
        id={listId}
        role="listbox"
        aria-label="Sort artworks"
        className={`absolute right-0 z-30 mt-2 w-full origin-top rounded-2xl border border-stone-200 bg-white p-1.5 shadow-lg transition duration-150 ease-out ${
          open ? "visible scale-100 opacity-100" : "invisible scale-95 opacity-0"
        }`}
      >
        {options.map((option, index) => {
          const selected = index === selectedIndex;
          return (
            <li
              key={option.value}
              id={`${listId}-${index}`}
              role="option"
              aria-selected={selected}
              onPointerEnter={() => setActiveIndex(index)}
              onPointerDown={(event) => event.preventDefault()}
              onClick={() => choose(index)}
              className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm transition-colors ${
                index === activeIndex ? "bg-stone-100" : ""
              } ${selected ? "font-medium text-stone-900" : "text-stone-600"}`}
            >
              {option.label}
              {selected && (
                <svg
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  className="h-4 w-4 shrink-0 text-stone-900"
                >
                  <path d="M4.5 10.5l3.5 3.5 7.5-8" />
                </svg>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
