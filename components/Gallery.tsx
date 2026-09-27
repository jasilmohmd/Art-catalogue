"use client";

import { useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Captions from "yet-another-react-lightbox/plugins/captions";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/captions.css";
import type { Artwork } from "@/data/artworks";
import ArtworkCard from "@/components/ArtworkCard";

export default function Gallery({ artworks }: { artworks: Artwork[] }) {
  const [index, setIndex] = useState(-1);

  return (
    <>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {artworks.map((artwork, i) => (
          <ArtworkCard
            key={artwork.id}
            artwork={artwork}
            onImageClick={() => setIndex(i)}
          />
        ))}
      </div>

      <Lightbox
        open={index >= 0}
        close={() => setIndex(-1)}
        index={index}
        slides={artworks.map((artwork) => ({
          src: artwork.image,
          alt: artwork.name,
          title: artwork.name,
          description: `₹${artwork.price.toLocaleString("en-IN")}${
            artwork.available ? "" : " · Sold"
          }`,
        }))}
        plugins={[Zoom, Captions]}
        zoom={{ maxZoomPixelRatio: 3, scrollToZoom: true }}
      />
    </>
  );
}
