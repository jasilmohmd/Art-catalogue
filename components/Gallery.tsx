"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";
import type { Artwork } from "@/data/artworks";
import ArtworkCard from "@/components/ArtworkCard";
import SortMenu from "@/components/SortMenu";

const HIDE_DELAY_MS = 2000;

type SortOrder = "name" | "price-asc" | "price-desc";

const SORT_OPTIONS: { value: SortOrder; label: string }[] = [
  { value: "name", label: "Name A–Z" },
  { value: "price-asc", label: "Price: low → high" },
  { value: "price-desc", label: "Price: high → low" },
];

function compareArtworks(sort: SortOrder) {
  return (a: Artwork, b: Artwork) => {
    const byName = a.name.localeCompare(b.name);
    if (sort === "price-asc") return a.price - b.price || byName;
    if (sort === "price-desc") return b.price - a.price || byName;
    return byName;
  };
}

type ArtworkSlide = {
  src: string;
  alt: string;
  name: string;
  price: number;
  available: boolean;
};

function Caption({ slide, visible }: { slide: ArtworkSlide; visible: boolean }) {
  return (
    <div
      className={`pointer-events-none absolute bottom-4 left-4 z-20 max-w-[75%] transition-opacity duration-300 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <p className="font-display text-base text-white drop-shadow-md sm:text-lg">
        {slide.name}
      </p>
      <p className="text-sm text-white/80 drop-shadow-md">
        ₹{slide.price.toLocaleString("en-IN")}
        {!slide.available && " · Sold"}
      </p>
    </div>
  );
}

export default function Gallery({ artworks }: { artworks: Artwork[] }) {
  const [index, setIndex] = useState(-1);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [sort, setSort] = useState<SortOrder>("name");
  const [zoomed, setZoomed] = useState(false);
  const [timerVisible, setTimerVisible] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const bump = useCallback(() => {
    setTimerVisible(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setTimerVisible(false), HIDE_DELAY_MS);
  }, []);

  useEffect(() => {
    if (index >= 0) {
      setZoomed(false);
      bump();
    } else if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  }, [index, bump]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const visible = timerVisible && !zoomed;

  // The grid and lightbox share this list so slide indexes match the visible cards.
  const shown = useMemo(
    () =>
      (availableOnly ? artworks.filter((a) => a.available) : [...artworks]).sort(
        compareArtworks(sort)
      ),
    [artworks, availableOnly, sort]
  );

  const availableCount = useMemo(
    () => artworks.filter((a) => a.available).length,
    [artworks]
  );

  const segments = [
    { availableOnly: false, label: "All", count: artworks.length },
    { availableOnly: true, label: "Available", count: availableCount },
  ];

  const slides = useMemo(
    () =>
      shown.map((a) => ({
        src: a.image,
        alt: a.name,
        name: a.name,
        price: a.price,
        available: a.available,
      })),
    [shown]
  );

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p aria-live="polite" className="text-sm text-stone-400">
          {availableOnly
            ? `Showing ${shown.length} of ${artworks.length}`
            : `${artworks.length} ${artworks.length === 1 ? "artwork" : "artworks"}`}
        </p>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div
            role="radiogroup"
            aria-label="Filter artworks"
            className="relative grid h-10 w-full grid-cols-2 rounded-full border border-stone-200 bg-white p-1 shadow-sm sm:w-auto"
          >
            <span
              aria-hidden="true"
              className={`absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-full bg-stone-900 transition-transform duration-300 ease-out ${
                availableOnly ? "translate-x-full" : ""
              }`}
            />
            {segments.map((segment) => {
              const active = segment.availableOnly === availableOnly;
              return (
                <button
                  key={segment.label}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  tabIndex={active ? 0 : -1}
                  onClick={() => setAvailableOnly(segment.availableOnly)}
                  onKeyDown={(e) => {
                    // Radio-group keyboard pattern: arrows move between the two segments.
                    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) return;
                    e.preventDefault();
                    setAvailableOnly(!availableOnly);
                    const sibling = e.currentTarget.parentElement?.querySelector<HTMLButtonElement>(
                      '[role="radio"]:not([aria-checked="true"])'
                    );
                    sibling?.focus();
                  }}
                  className={`relative z-10 flex items-center justify-center gap-1.5 rounded-full px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 ${
                    active ? "text-white" : "text-stone-500 hover:text-stone-900"
                  }`}
                >
                  {segment.label}
                  <span className={`text-xs ${active ? "text-white/60" : "text-stone-400"}`}>
                    {segment.count}
                  </span>
                </button>
              );
            })}
          </div>

          <SortMenu options={SORT_OPTIONS} value={sort} onChange={setSort} />
        </div>
      </div>

      {shown.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((a, i) => (
            <ArtworkCard key={a.id} artwork={a} onImageClick={() => setIndex(i)} />
          ))}
        </div>
      ) : (
        <p className="py-20 text-center text-sm text-stone-400">
          Everything is sold right now — check back soon.
        </p>
      )}

      <Lightbox
        open={index >= 0}
        close={() => setIndex(-1)}
        index={index}
        slides={slides}
        plugins={[Zoom]}
        zoom={{ maxZoomPixelRatio: 3, scrollToZoom: true }}
        on={{
          view: () => {
            setZoomed(false);
            bump();
          },
          click: () => bump(),
          zoom: ({ zoom }) => setZoomed(zoom > 1.01),
        }}
        render={{
          slideFooter: ({ slide }) => (
            <Caption slide={slide as unknown as ArtworkSlide} visible={visible} />
          ),
          controls: () => (
            <style>{`
              .yarl__navigation_prev,
              .yarl__navigation_next {
                opacity: ${visible ? 1 : 0};
                transition: opacity 300ms ease;
                pointer-events: ${visible ? "auto" : "none"};
              }
            `}</style>
          ),
        }}
      />
    </>
  );
}
