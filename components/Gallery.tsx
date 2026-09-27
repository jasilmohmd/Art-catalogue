"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";
import type { Artwork } from "@/data/artworks";
import ArtworkCard from "@/components/ArtworkCard";

const HIDE_DELAY_MS = 2000;

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

  const slides = useMemo(
    () =>
      artworks.map((a) => ({
        src: a.image,
        alt: a.name,
        name: a.name,
        price: a.price,
        available: a.available,
      })),
    [artworks]
  );

  return (
    <>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {artworks.map((a, i) => (
          <ArtworkCard key={a.id} artwork={a} onImageClick={() => setIndex(i)} />
        ))}
      </div>

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
