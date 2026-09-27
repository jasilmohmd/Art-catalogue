import { artworks } from "@/data/artworks";
import ArtworkCard from "@/components/ArtworkCard";

export default function Home() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-stone-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <h1 className="font-display text-3xl text-stone-900">Art Catalogue</h1>
          <p className="mt-1 text-sm text-stone-500">
            Original paintings, available for purchase via WhatsApp.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        {artworks.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {artworks.map((artwork) => (
              <ArtworkCard key={artwork.id} artwork={artwork} />
            ))}
          </div>
        ) : (
          <p className="py-20 text-center text-sm text-stone-400">
            No artworks listed yet — check back soon.
          </p>
        )}
      </main>

      <footer className="border-t border-stone-200 py-8">
        <p className="mx-auto max-w-6xl px-4 text-center text-xs text-stone-400 sm:px-6">
          © {new Date().getFullYear()} Art Catalogue. All artworks are originals.
        </p>
      </footer>
    </div>
  );
}
