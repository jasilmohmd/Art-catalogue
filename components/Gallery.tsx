"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";
import type { Artwork } from "@/data/artworks";
import ArtworkCard from "@/components/ArtworkCard";
import SortMenu from "@/components/SortMenu";
import BuyButton from "@/components/BuyButton";

const HIDE_DELAY_MS = 2000;

type SortOrder = "name" | "price-asc" | "price-desc";

const SORT_OPTIONS: { value: SortOrder; label: string; short: string }[] = [
  { value: "name", label: "Name A–Z", short: "A–Z" },
  { value: "price-asc", label: "Price: low → high", short: "Price ↑" },
  { value: "price-desc", label: "Price: high → low", short: "Price ↓" },
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
      aria-hidden={!visible}
      className={`pointer-events-none absolute inset-x-0 bottom-0 z-20 transition-opacity duration-300 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Scrim keeps the white text and outlined button readable over light paintings. */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/60 to-transparent" />
      <div className="relative flex items-end justify-between gap-4 px-4 pb-4">
        <div className="min-w-0">
          <p className="font-display text-base text-white drop-shadow-md sm:text-lg">
            {slide.name}
          </p>
          <p className="text-sm text-white/80 drop-shadow-md">
            ₹{slide.price.toLocaleString("en-IN")}
          </p>
        </div>
        {/* Only clickable while shown, so a faded-out button can't be tapped by accident. */}
        <div className={`shrink-0 ${visible ? "pointer-events-auto" : ""}`}>
          {slide.available ? (
            <BuyButton
              tone="dark"
              artworkName={slide.name}
              price={slide.price}
              tabIndex={visible ? undefined : -1}
            />
          ) : (
            <span className="inline-block rounded-full border border-white/40 px-4 py-2 text-xs font-medium uppercase tracking-wide text-white/70">
              Sold
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Gallery({ artworks }: { artworks: Artwork[] }) {
  const [index, setIndex] = useState(-1);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [sort, setSort] = useState<SortOrder>("name");
  const [stuck, setStuck] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
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

  // The lightbox only reports clicks on the image itself, so any touch or click anywhere
  // on screen (including the dark backdrop) re-shows the caption and arrows.
  const lightboxOpen = index >= 0;
  useEffect(() => {
    if (!lightboxOpen) return;
    document.addEventListener("pointerdown", bump, true);
    return () => document.removeEventListener("pointerdown", bump, true);
  }, [lightboxOpen, bump]);

  // The toolbar is stuck once the zero-height marker above it scrolls out of view.
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    // The negative top margin matches the bar's `top-3` offset, so "stuck" flips exactly when it pins.
    const observer = new IntersectionObserver(([entry]) => setStuck(!entry.isIntersecting), {
      rootMargin: "-12px 0px 0px 0px",
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  // When the results change while scrolled deep into the grid, return to the first result.
  const scrollToResultsStart = () => {
    if (stuck) sentinelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const chooseAvailability = (value: boolean) => {
    setAvailableOnly(value);
    scrollToResultsStart();
  };

  const chooseSort = (value: SortOrder) => {
    setSort(value);
    scrollToResultsStart();
  };

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

  const countLabel = availableOnly
    ? `Showing ${shown.length} of ${artworks.length}`
    : `${artworks.length} ${artworks.length === 1 ? "artwork" : "artworks"}`;

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
      <p aria-live="polite" className="mb-2 text-sm text-stone-400 sm:hidden">
        {countLabel}
      </p>
      <div ref={sentinelRef} aria-hidden="true" className="h-px scroll-mt-10" />
      <div
        className={`sticky top-3 z-20 -mx-3 mb-6 flex items-center justify-between gap-3 rounded-2xl border px-3 py-2 transition-[background-color,border-color,box-shadow] duration-300 ${
          stuck
            ? "border-stone-200 bg-white/85 shadow-md backdrop-blur-md"
            : "border-transparent bg-transparent shadow-none"
        }`}
      >
        <p aria-live="polite" className="hidden text-sm text-stone-400 sm:block">
          {countLabel}
        </p>

        <div className="flex w-full items-center gap-2 sm:w-auto">
          <div
            role="radiogroup"
            aria-label="Filter artworks"
            className="relative grid h-10 flex-none grid-cols-2 rounded-full border border-stone-200 bg-white p-1 shadow-sm"
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
                  onClick={() => chooseAvailability(segment.availableOnly)}
                  onKeyDown={(e) => {
                    // Radio-group keyboard pattern: arrows move between the two segments.
                    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) return;
                    e.preventDefault();
                    chooseAvailability(!availableOnly);
                    const sibling = e.currentTarget.parentElement?.querySelector<HTMLButtonElement>(
                      '[role="radio"]:not([aria-checked="true"])'
                    );
                    sibling?.focus();
                  }}
                  className={`relative z-10 flex items-center justify-center gap-1.5 rounded-full px-3 text-sm font-medium sm:px-4 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 ${
                    active ? "text-white" : "text-stone-500 hover:text-stone-900"
                  }`}
                >
                  {segment.label}
                  <span
                    className={`hidden text-xs sm:inline ${active ? "text-white/60" : "text-stone-400"}`}
                  >
                    {segment.count}
                  </span>
                </button>
              );
            })}
          </div>

          <SortMenu options={SORT_OPTIONS} value={sort} onChange={chooseSort} />
        </div>
      </div>

      {shown.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3">
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
        open={lightboxOpen}
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
