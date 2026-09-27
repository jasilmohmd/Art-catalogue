import Image from "next/image";
import type { Artwork } from "@/data/artworks";
import BuyButton from "@/components/BuyButton";

export default function ArtworkCard({ artwork }: { artwork: Artwork }) {
  const { name, price, image, available } = artwork;

  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
      <div className="relative aspect-[4/5] w-full bg-neutral-100">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover"
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
        />
        {!available && (
          <span className="absolute right-2 top-2 rounded-full bg-neutral-900/80 px-3 py-1 text-xs font-medium text-white">
            Sold
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h2 className="text-base font-medium text-neutral-900">{name}</h2>
        <p className="text-sm text-neutral-600">₹{price.toLocaleString("en-IN")}</p>
        <div className="mt-auto pt-2">
          {available ? (
            <BuyButton artworkName={name} price={price} />
          ) : (
            <span className="block w-full rounded-md bg-neutral-100 px-4 py-2 text-center text-sm font-medium text-neutral-400">
              Not available
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
