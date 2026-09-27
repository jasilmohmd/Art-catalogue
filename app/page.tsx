import { artworks } from "@/data/artworks";
import ArtworkCard from "@/components/ArtworkCard";

export default function Home() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold text-neutral-900">Art Catalogue</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Original paintings, available for purchase via WhatsApp.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {artworks.map((artwork) => (
          <ArtworkCard key={artwork.id} artwork={artwork} />
        ))}
      </div>
    </main>
  );
}
