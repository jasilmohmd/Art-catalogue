"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";
import type { Artwork } from "@/data/artworks";
import ArtworkCard from "@/components/ArtworkCard";

const HIDE_DELAY_MS = 2000;

function Caption({ artwork, visible }: { artwork: Artwork; visible: boolean }) {
  return (
    <div
      className={`pointer-events-none absolute bottom-4 left-4 z-20 max-w-[75%] transition-opacity duration-300 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <p className="font-display text-base text-white drop-shadow-md sm:text-lg">
        {artwork.name}
      </p>
      <p className="text-sm text-white/80 drop-shadow-md">
        ₹{artwork.price.toLocaleString("en-IN")}
        {!artwork.available && " · Sold"}
      </p>
    </div>
  );
}

export default function Gallery({ artworks }: { artworks: Artwork[] }) {
  const [index, setIndex] = useState(-1);
  const [currentIndex, setCurrentIndex] = useState(0);
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
      setCurrentIndex(index);
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

  const artwork = artworks[currentIndex];
  const visible = timerVisible && !zoomed;

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
        slides={artworks.map((a) => ({ src: a.image, alt: a.name }))}
        plugins={[Zoom]}
        zoom={{ maxZoomPixelRatio: 3, scrollToZoom: true }}
        on={{
          view: ({ index: i }) => {
            setCurrentIndex(i);
            setZoomed(false);
            bump();
          },
          click: () => bump(),
          zoom: ({ zoom }) => setZoomed(zoom > 1),
        }}
        render={{
          controls: () => (artwork ? <Caption artwork={artwork} visible={visible} /> : null),
        }}
      />
    </>
  );
}
