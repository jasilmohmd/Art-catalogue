import { artworks } from "@/data/artworks";
import ArtworkCard from "@/components/ArtworkCard";

export default function Home() {
  return (
    <div className="min-h-screen">
      <section className="border-b border-stone-200 bg-gradient-to-b from-stone-100 to-white">
        <div className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-6 sm:py-28">
          <h1 className="font-display text-5xl text-stone-900 sm:text-6xl">
            Sneha sparsham
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-stone-500 sm:text-lg">
            A collection of original paintings, brought to life with warmth and care.
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="mb-8 border-b border-stone-200 pb-6">
          <h2 className="font-display text-2xl text-stone-900">Art Catalogue</h2>
          <p className="mt-1 text-sm text-stone-500">
            Original paintings, available for purchase via WhatsApp.
          </p>
        </div>

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
          © {new Date().getFullYear()} Sneha sparsham. All artworks are originals.
        </p>
      </footer>
    </div>
  );
}
