export type Artwork = {
  id: string;
  name: string;
  price: number; // in INR
  image: string; // path under /public/artworks
  available: boolean; // false = sold
};

export const artworks: Artwork[] = [
  {
    id: "sunset-over-hills",
    name: "Sunset Over Hills",
    price: 4500,
    image: "/artworks/sunset-over-hills.svg",
    available: true,
  },
  {
    id: "quiet-harbor",
    name: "Quiet Harbor",
    price: 6200,
    image: "/artworks/quiet-harbor.svg",
    available: true,
  },
  {
    id: "autumn-path",
    name: "Autumn Path",
    price: 3800,
    image: "/artworks/autumn-path.svg",
    available: false,
  },
];
