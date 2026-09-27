import Image from "next/image";
import type { Artwork } from "@/data/artworks";
import BuyButton from "@/components/BuyButton";

export default function ArtworkCard({ artwork }: { artwork: Artwork }) {
  const { name, price, image, available } = artwork;

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm transition-shadow duration-300 hover:shadow-lg">
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-stone-100">
        <Image
          src={image}
          alt={name}
          fill
          className={`object-cover transition-transform duration-500 ${
            available ? "group-hover:scale-105" : "grayscale"
          }`}
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
        />
        {!available && (
          <div className="absolute inset-0 flex items-center justify-center bg-stone-900/40">
            <span className="rounded-full bg-stone-900/80 px-4 py-1.5 text-xs font-medium uppercase tracking-wide text-white">
              Sold
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-5">
        <h2 className="font-display text-lg leading-snug text-stone-900">{name}</h2>
        <p className="text-sm font-medium text-stone-500">
          ₹{price.toLocaleString("en-IN")}
        </p>
        <div className="mt-4 pt-1">
          {available ? (
            <BuyButton artworkName={name} price={price} />
          ) : (
            <span className="block w-full rounded-full bg-stone-100 px-4 py-2.5 text-center text-sm font-medium text-stone-400">
              Not available
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
