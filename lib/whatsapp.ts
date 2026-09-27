export const WHATSAPP_NUMBER = "919495993440";

export function buildWhatsAppLink(artworkName: string, price: number): string {
  const message = `Hi, I'm interested in "${artworkName}" priced at ₹${price.toLocaleString(
    "en-IN"
  )}.`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
