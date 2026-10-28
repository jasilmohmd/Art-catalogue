import Image from "next/image";
import type { Artwork } from "@/data/artworks";
import BuyButton from "@/components/BuyButton";

type ArtworkCardProps = {
  artwork: Artwork;
  onImageClick?: () => void;
};

export default function ArtworkCard({ artwork, onImageClick }: ArtworkCardProps) {
  const { name, price, image, available } = artwork;

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm transition-shadow duration-300 hover:shadow-lg">
      <button
        type="button"
        onClick={onImageClick}
        aria-label={`View ${name} fullscreen`}
        className="relative block aspect-[4/5] w-full cursor-pointer overflow-hidden bg-stone-100"
      >
        <Image
          src={image}
          alt={name}
          fill
          className={`object-cover transition-transform duration-500 ${
            available ? "group-hover:scale-105" : "grayscale"
          }`}
          sizes="(min-width: 1280px) 280px, (min-width: 1024px) 33vw, 50vw"
        />
        {!available && (
          <div className="absolute inset-0 flex items-center justify-center bg-stone-900/40">
            <span className="rounded-full bg-stone-900/80 px-4 py-1.5 text-xs font-medium uppercase tracking-wide text-white">
              Sold
            </span>
          </div>
        )}
      </button>
      <div className="flex flex-1 flex-col gap-1 p-3 sm:p-5">
        <h2 className="font-display text-sm leading-snug text-stone-900 sm:text-lg">{name}</h2>
        <p className="text-xs font-medium text-stone-500 sm:text-sm">
          ₹{price.toLocaleString("en-IN")}
        </p>
        {/* mt-auto keeps buttons aligned along a row when titles wrap to different lengths. */}
        <div className="mt-auto pt-3 sm:pt-5">
          {available ? (
            <BuyButton artworkName={name} price={price} />
          ) : (
            <span className="block w-full rounded-full bg-stone-100 px-3 py-2 text-center text-xs font-medium text-stone-400 sm:px-4 sm:py-2.5 sm:text-sm">
              Not available
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
