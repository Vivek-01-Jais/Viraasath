import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Viraasat — Ethnic Women's Kurtis",
    short_name: "Viraasat",
    description: "Discover traditional and contemporary kurtis for women. Viraasat brings you ethnic elegance.",
    start_url: "/",
    display: "standalone",
    background_color: "#F8F8FF",
    theme_color: "#800020",
  icons: [
    { src: "/favicon.ico", sizes: "48x48", type: "image/x-icon" },
  ],
  }
}