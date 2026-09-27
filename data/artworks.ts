export type Artwork = {
  id: string;
  name: string;
  price: number; // in INR
  image: string; // path under /public/artworks
  available: boolean; // false = sold
};

// Add, remove, or edit entries below to update the catalogue.
// price is a placeholder — update with the real price.
// image must point to a file placed under /public/artworks.
export const artworks: Artwork[] = [
  {
    id: "autumn-blossoms",
    name: "Autumn Blossoms",
    price: 1200,
    image: "/artworks/autumn.jpeg",
    available: true,
  },
  {
    id: "red-billed-hornbill",
    name: "Red-billed Hornbill",
    price: 2500,
    image: "/artworks/bird.jpeg",
    available: true,
  },
  {
    id: "moon-night",
    name: "Moon Night",
    price: 1800,
    image: "/artworks/moon-night.jpeg",
    available: true,
  },
  {
    id: "sailing-boat",
    name: "Sailing Boat",
    price: 3200,
    image: "/artworks/sailing-boat.jpeg",
    available: true,
  },
];
