import type { Cor } from "./tipos";

/** Classes de cada cor de destaque. Ficam escritas por extenso para o Tailwind encontrá-las. */
export const CORES: Record<Cor, { fundo: string; texto: string; suave: string; borda: string; sombra: string }> = {
  fogo: { fundo: "bg-fogo", texto: "text-fogo", suave: "bg-fogo/15 text-fogo", borda: "border-fogo", sombra: "shadow-[0_5px_0_var(--color-fogo-escuro)]" },
  ciano: { fundo: "bg-ciano", texto: "text-ciano", suave: "bg-ciano/15 text-ciano", borda: "border-ciano", sombra: "shadow-[0_5px_0_var(--color-ciano-escuro)]" },
  neon: { fundo: "bg-neon", texto: "text-neon", suave: "bg-neon/15 text-neon", borda: "border-neon", sombra: "shadow-[0_5px_0_var(--color-neon-escuro)]" },
  ouro: { fundo: "bg-ouro", texto: "text-ouro", suave: "bg-ouro/15 text-ouro", borda: "border-ouro", sombra: "shadow-[0_5px_0_var(--color-ouro-escuro)]" },
  rosa: { fundo: "bg-rosa", texto: "text-rosa", suave: "bg-rosa/15 text-rosa", borda: "border-rosa", sombra: "shadow-[0_5px_0_var(--color-rosa-escuro)]" },
  roxo: { fundo: "bg-roxo", texto: "text-roxo", suave: "bg-roxo/15 text-roxo", borda: "border-roxo", sombra: "shadow-[0_5px_0_var(--color-roxo-escuro)]" },
};
