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
      className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#1ebe5b] hover:shadow-md active:scale-[0.98]"
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="h-4 w-4 shrink-0 fill-current"
      >
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.297-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.693.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
        <path d="M12.012 2C6.499 2 2.014 6.486 2.014 12c0 1.802.47 3.545 1.362 5.084L2 22l5.03-1.35A9.94 9.94 0 0 0 12.012 22C17.526 22 22.01 17.514 22.01 12S17.526 2 12.012 2Zm0 18.06a8.02 8.02 0 0 1-4.363-1.278l-.313-.187-3.045.817.81-3.043-.196-.318A8.02 8.02 0 0 1 3.976 12c0-4.428 3.607-8.035 8.036-8.035S20.048 7.572 20.048 12s-3.607 8.06-8.036 8.06Z" />
      </svg>
      Buy on WhatsApp
    </a>
  );
}
