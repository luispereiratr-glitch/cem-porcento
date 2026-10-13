import type { NomeIcone } from "@/components/Icone";

/** Dificuldade de um exercício: é também o número da fase dentro da unidade. */
export type Nivel = 1 | 2 | 3;

/** Desenho que acompanha o enunciado. */
export type Figura =
  /** Grade 10 × 10 com `pintadas` quadradinhos coloridos. */
  | { tipo: "grade"; pintadas: number }
  /** Barra dividida em `partes` iguais, com `cheias` preenchidas. */
  | { tipo: "barra"; partes: number; cheias: number }
  /** Barra de carregamento, sem divisões. */
  | { tipo: "progresso"; pct: number };

type Base = {
  /** Id da habilidade treinada: é por ele que o progresso guarda acertos e erros. */
  habilidade: string;
  enunciado: string;
  figura?: Figura;
  /** Resolução passo a passo, mostrada depois da resposta. */
  passos: string[];
};

export type Exercicio = Base &
  (
    | { tipo: "escolha"; /** A primeira alternativa é sempre a correta; a ordem é embaralhada na tela. */ alternativas: string[] }
    | { tipo: "digitar"; resposta: number; prefixo?: string; sufixo?: string }
    | { tipo: "pintar"; /** Quantos quadradinhos da grade devem ser pintados. */ resposta: number }
  );

export type Gerador = (nivel: Nivel) => Exercicio;

export type Cor = "fogo" | "ciano" | "neon" | "ouro" | "rosa" | "roxo";

/** Cartão de explicação mostrado antes da primeira fase de uma unidade. */
export type Dica = { titulo: string; texto: string; figura?: Figura };

export type Unidade = {
  id: string;
  titulo: string;
  descricao: string;
  icone: NomeIcone;
  cor: Cor;
  dicas: Dica[];
  /** Ids das habilidades sorteadas nas fases da unidade. */
  habilidades: string[];
};

export type IdJogo = "zona" | "mira" | "duelo" | "airdrop" | "ofertas";

export type Progresso = {
  xp: number;
  gemas: number;
  dias: { ultimo: string | null; sequencia: number; melhor: number };
  /** chave `unidade:fase` → melhor número de estrelas (1 a 3) */
  licoes: Record<string, number>;
  /** Acertos e erros por habilidade. */
  habilidades: Record<string, { a: number; e: number }>;
  /** Melhor pontuação por jogo. */
  recordes: Partial<Record<IdJogo, number>>;
  /** Contadores das missões do dia `dia`; zeram quando o dia muda. */
  missoes: { dia: string; feito: Record<string, number> };
  emblema: string;
  /** Emblemas já comprados. */
  emblemas: string[];
  som: boolean;
};
