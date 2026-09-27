import { buildWhatsAppLink } from "@/lib/whatsapp";

type BuyButtonProps = {
  artworkName: string;
  price: number;
};

export default function BuyButton({ artworkName, price }: BuyButtonProps) {
  const href = buildWhatsAppLink(artworkName, price);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-block w-full rounded-md bg-[#25D366] px-4 py-2 text-center text-sm font-medium text-white transition hover:bg-[#1ebe5b]"
    >
      Buy on WhatsApp
    </a>
  );
}
