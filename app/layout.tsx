import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Art Catalogue",
  description: "A simple catalogue of paintings for sale",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
