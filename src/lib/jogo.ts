import type { NomeIcone } from "@/components/Icone";
import type { Cor, IdJogo, Nivel, Progresso } from "./tipos";

export const FASES: { nivel: Nivel; nome: string; xp: number }[] = [
  { nivel: 1, nome: "Fácil", xp: 10 },
  { nivel: 2, nome: "Médio", xp: 15 },
  { nivel: 3, nome: "Difícil", xp: 20 },
];

export const xpDoNivel = (nivel: Nivel) => FASES[nivel - 1].xp;

/** XP extra por terminar uma fase da trilha. */
export const BONUS_FASE = 20;
/** Gemas ganhas por estrela nova em uma fase. */
export const GEMAS_POR_ESTRELA = 5;
/** Gemas por bater o próprio recorde em um jogo. */
export const GEMAS_RECORDE = 5;

export const MISSOES = [
  { id: "licao", texto: "Complete 1 fase da trilha", alvo: 1, gemas: 10 },
  { id: "acertos", texto: "Acerte 15 questões", alvo: 15, gemas: 10 },
  { id: "jogo", texto: "Jogue 2 partidas", alvo: 2, gemas: 10 },
] as const;

export type IdMissao = (typeof MISSOES)[number]["id"];

export const EMBLEMAS: { id: string; nome: string; icone: NomeIcone; cor: Cor; preco: number }[] = [
  { id: "recruta", nome: "Recruta", icone: "alvo", cor: "ciano", preco: 0 },
  { id: "faisca", nome: "Faísca", icone: "raio", cor: "ouro", preco: 30 },
  { id: "escudo", nome: "Blindado", icone: "escudo", cor: "neon", preco: 60 },
  { id: "chama", nome: "Em chamas", icone: "chama", cor: "fogo", preco: 100 },
  { id: "foguete", nome: "Foguete", icone: "foguete", cor: "rosa", preco: 150 },
  { id: "coroa", nome: "Lenda", icone: "coroa", cor: "roxo", preco: 250 },
];

export const VAZIO: Progresso = {
  xp: 0,
  gemas: 0,
  dias: { ultimo: null, sequencia: 0, melhor: 0 },
  licoes: {},
  habilidades: {},
  recordes: {},
  missoes: { dia: "", feito: {} },
  emblema: "recruta",
  emblemas: ["recruta"],
  som: true,
};

/** Completa um progresso salvo por uma versão anterior, que pode não ter todos os campos. */
export const completar = (dados: Partial<Progresso>): Progresso => ({ ...VAZIO, ...dados });

/** Data `AAAA-MM-DD` no fuso do aparelho. Com `base`, conta os dias a partir dela e não de hoje. */
export function dia(deslocamento = 0, base?: string): string {
  const d = base ? new Date(`${base}T12:00:00`) : new Date();
  d.setDate(d.getDate() + deslocamento);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function embaralhar<T>(lista: readonly T[]): T[] {
  const r = [...lista];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

export const um = <T>(lista: readonly T[]): T => lista[Math.floor(Math.random() * lista.length)];

/** Inteiro sorteado entre `a` e `b`, incluindo os dois. */
export const entre = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1));

const PATENTES = ["Bronze", "Prata", "Ouro", "Platina", "Diamante", "Mestre"];

export function nivelDoXp(xp: number) {
  const nivel = Math.floor(Math.sqrt(xp / 60)) + 1;
  const base = 60 * (nivel - 1) ** 2;
  const proximo = 60 * nivel ** 2;
  // A cada 3 níveis sobe uma patente.
  const patente = PATENTES[Math.min(Math.floor((nivel - 1) / 3), PATENTES.length - 1)];
  return { nivel, patente, fracao: (xp - base) / (proximo - base), falta: proximo - xp };
}

function marcarDia(p: Progresso): Progresso["dias"] {
  const hoje = dia();
  if (p.dias.ultimo === hoje) return p.dias;
  const sequencia = p.dias.ultimo === dia(-1) ? p.dias.sequencia + 1 : 1;
  return { ultimo: hoje, sequencia, melhor: Math.max(p.dias.melhor, sequencia) };
}

/** Sequência só vale se a pessoa estudou hoje ou ontem. */
export function sequenciaAtiva(p: Progresso, hoje = dia()): number {
  return p.dias.ultimo === hoje || p.dias.ultimo === dia(-1, hoje) ? p.dias.sequencia : 0;
}

export const somarXp = (p: Progresso, xp: number): Progresso => ({ ...p, xp: p.xp + xp, dias: marcarDia(p) });

/** Quanto de cada missão já foi feito hoje. */
export function missoesDeHoje(p: Progresso, hoje = dia()) {
  const feito = p.missoes.dia === hoje ? p.missoes.feito : {};
  return MISSOES.map((m) => ({ ...m, feito: Math.min(feito[m.id] ?? 0, m.alvo) }));
}

/** Avança uma missão do dia e paga as gemas no momento em que ela é cumprida. */
function contarMissao(p: Progresso, id: IdMissao, n = 1): Progresso {
  const hoje = dia();
  const feito = p.missoes.dia === hoje ? p.missoes.feito : {};
  const missao = MISSOES.find((m) => m.id === id)!;
  const antes = feito[id] ?? 0;
  const cumpriu = antes < missao.alvo && antes + n >= missao.alvo;
  return {
    ...p,
    gemas: p.gemas + (cumpriu ? missao.gemas : 0),
    missoes: { dia: hoje, feito: { ...feito, [id]: antes + n } },
  };
}

export function registrarResposta(p: Progresso, habilidade: string, acertou: boolean, xp: number): Progresso {
  const antes = p.habilidades[habilidade] ?? { a: 0, e: 0 };
  const registro = { a: antes.a + (acertou ? 1 : 0), e: antes.e + (acertou ? 0 : 1) };
  const novo = { ...somarXp(p, acertou ? xp : 0), habilidades: { ...p.habilidades, [habilidade]: registro } };
  return acertou ? contarMissao(novo, "acertos") : novo;
}

export function registrarFase(p: Progresso, chave: string, estrelas: number): Progresso {
  const antes = p.licoes[chave] ?? 0;
  const novo = contarMissao(somarXp(p, BONUS_FASE), "licao");
  if (estrelas <= antes) return novo;
  return {
    ...novo,
    gemas: novo.gemas + (estrelas - antes) * GEMAS_POR_ESTRELA,
    licoes: { ...p.licoes, [chave]: estrelas },
  };
}

/** XP de uma partida: cresce com os pontos, com teto para os jogos não renderem mais que a trilha. */
export const xpDaPartida = (pontos: number) => Math.min(60, Math.round(pontos / 12));

export function registrarPartida(p: Progresso, jogo: IdJogo, pontos: number): Progresso {
  const novo = contarMissao(somarXp(p, xpDaPartida(pontos)), "jogo");
  const recorde = p.recordes[jogo];
  if (pontos <= (recorde ?? 0)) return novo;
  return {
    ...novo,
    // A primeira partida não "bate" recorde nenhum.
    gemas: novo.gemas + (recorde === undefined ? 0 : GEMAS_RECORDE),
    recordes: { ...p.recordes, [jogo]: pontos },
  };
}

/** Terminar a fase já vale uma estrela: os erros voltam até serem acertados. */
export function estrelas(acertos: number, total: number): number {
  const taxa = total ? acertos / total : 0;
  return taxa >= 0.9 ? 3 : taxa >= 0.7 ? 2 : 1;
}

export function totais(p: Progresso) {
  const registros = Object.values(p.habilidades);
  const acertos = registros.reduce((s, r) => s + r.a, 0);
  const tentativas = registros.reduce((s, r) => s + r.a + r.e, 0);
  return { acertos, tentativas, precisao: tentativas ? Math.round((100 * acertos) / tentativas) : null };
}

export function vibrar(acertou: boolean) {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(acertou ? 30 : [60, 40, 60]);
  }
}
