const TRACOS = {
  casa: "M4 11.5 12 5l8 6.5V20h-5.5v-5h-5v5H4z",
  raio: "M13 3 5 14h6l-1 7 8-11h-6z",
  perfil: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4.5 20.5a7.5 7.5 0 0 1 15 0",
  chama: "M12 3c1 3.5 5 5.5 5 10.5a5 5 0 0 1-10 0c0-2 1-3.2 2-4.2.4 1.4 1.2 2.2 2 2.2 0-3 .2-5.5 1-8.5z",
  estrela: "m12 3.5 2.6 5.4 5.9.8-4.3 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8-4.3-4.1 5.9-.8z",
  cadeado: "M7 11V8a5 5 0 0 1 10 0v3M5.5 11h13v9.5h-13z",
  seta: "M5 12h14M13 6l6 6-6 6",
  voltar: "M19 12H5M11 6l-6 6 6 6",
  certo: "m5 12.5 4.5 4.5L19 7.5",
  errado: "M6 6l12 12M18 6 6 18",
  trofeu: "M8 4h8v5a4 4 0 0 1-8 0zM8 6H4.5v1.5A3.5 3.5 0 0 0 8 11M16 6h3.5v1.5A3.5 3.5 0 0 1 16 11M12 13v4M8.5 20h7M10 17h4",
  relogio: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7.5V12l3 2",
  alvo: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 16.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9zM12 12.6a.6.6 0 1 0 0-1.2.6.6 0 0 0 0 1.2z",
  gema: "M7 4h10l4 5-9 11L3 9zM3 9h18M9.5 4 8 9l4 11 4-11-1.5-5",
  escudo: "M12 3l8 3v6c0 4.5-3.2 7.8-8 9-4.8-1.2-8-4.5-8-9V6z",
  coroa: "M4 18h16M4 18 3 8l5 4 4-7 4 7 5-4-1 10",
  foguete: "M12 3c3 2 5 5.5 5 9.5l-2 3.5H9l-2-3.5C7 8.500 9 5 12 3zM9 16l-1 4 4-2 4 2-1-4M12 11a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z",
  som: "M4 10v4h4l5 4V6l-5 4zM16.5 9a4 4 0 0 1 0 6M19 6.5a8 8 0 0 1 0 11",
  mudo: "M4 10v4h4l5 4V6l-5 4zM17 9.5l4 5M21 9.5l-4 5",
  etiqueta: "M3 12V4h8l10 10-8 8zM7.5 8.500a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z",
  espada: "M19 3h2v2L10 16l-2-2zM6 12l6 6M4 20l4-4",
  caixa: "M4 8l8-4 8 4v8l-8 4-8-4zM4 8l8 4 8-4M12 12v8",
  lapis: "M4 20l1-4L16 5l3 3L8 19zM14 7l3 3",
  lampada: "M9 17h6M10 20h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z",
  porcento: "M19 5 5 19M7.5 10a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM16.5 19a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z",
  apagar: "M9 6h11v12H9l-6-6zM12 10l4 4M16 10l-4 4",
  coracao: "M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.600-7 10-7 10z",
  pizza: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 3v9l6.400 6.400",
  virgula: "M3 12h7M14 8h7M14 16h7",
  balanca: "M12 4v16M8 20h8M5 7h14M5 7l-2.500 6a2.500 2.500 0 0 0 5 0zM19 7l-2.500 6a2.500 2.500 0 0 0 5 0z",
  caveira: "M12 3a7 7 0 0 0-4 12.700V19h8v-3.300A7 7 0 0 0 12 3zM9.500 12a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM14.500 12a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM10.500 19v-2M13.500 19v-2",
  cima: "M12 19V5M6 11l6-6 6 6",
} as const;

export type NomeIcone = keyof typeof TRACOS;

export function Icone({ nome, className = "size-5", cheio = false }: { nome: NomeIcone; className?: string; cheio?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill={cheio ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d={TRACOS[nome]} />
    </svg>
  );
}
