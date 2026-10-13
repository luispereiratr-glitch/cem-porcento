import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Cem%",
    short_name: "Cem%",
    description: "Porcentagem com trilha, questões e jogos.",
    start_url: "/",
    display: "standalone",
    background_color: "#090d18",
    theme_color: "#090d18",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
