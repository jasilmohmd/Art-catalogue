// TODO: replace with your real WhatsApp number, country code + number, digits only
// e.g. "919876543210" for a +91 98765 43210 number. No "+", no spaces, no dashes.
export const WHATSAPP_NUMBER = "YOUR_NUMBER_HERE";

export function buildWhatsAppLink(artworkName: string, price: number): string {
  const message = `Hi, I'm interested in "${artworkName}" priced at ₹${price.toLocaleString(
    "en-IN"
  )}.`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
