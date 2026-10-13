import { embaralhar, entre, um } from "@/lib/jogo";
import type { Exercicio, Figura, Gerador, Nivel } from "@/lib/tipos";

/** Número no formato brasileiro: vírgula decimal e ponto de milhar. */
export const fmt = (n: number) => n.toLocaleString("pt-BR", { maximumFractionDigits: 3 });

const arredondar = (n: number) => Math.round(n * 1000) / 1000;

/**
 * Quatro alternativas numéricas, com a correta na frente. Usa primeiro os erros típicos passados em `erradas`
 * e completa com vizinhos da resposta quando eles se repetem ou não servem.
 */
export function alternativas(certa: number, erradas: number[], escrever: (n: number) => string = fmt): string[] {
  const lista = [arredondar(certa)];
  for (const e of erradas.map(arredondar)) {
    if (lista.length < 4 && e > 0 && !lista.includes(e)) lista.push(e);
  }
  const passo = certa >= 200 ? 10 : certa >= 40 ? 5 : certa >= 10 ? 2 : Number.isInteger(certa) ? 1 : 0.5;
  for (let k = 1; lista.length < 4; k++) {
    for (const vizinho of [certa + k * passo, certa - k * passo].map(arredondar)) {
      if (lista.length < 4 && vizinho > 0 && !lista.includes(vizinho)) lista.push(vizinho);
    }
  }
  return lista.map(escrever);
}

const escolha = (habilidade: string, enunciado: string, opcoes: string[], passos: string[], figura?: Figura): Exercicio => ({
  tipo: "escolha",
  habilidade,
  enunciado,
  alternativas: opcoes,
  passos,
  figura,
});

const digitar = (
  habilidade: string,
  enunciado: string,
  resposta: number,
  passos: string[],
  extra: { prefixo?: string; sufixo?: string; figura?: Figura } = {},
): Exercicio => ({ tipo: "digitar", habilidade, enunciado, resposta, passos, ...extra });

const pct = (n: number) => `${fmt(n)}%`;

/** Valor em reais ou em gemas, conforme a moeda do item. */
type Moeda = "R$" | "gemas";
const valor = (n: number, moeda: Moeda) => (moeda === "R$" ? `R$ ${fmt(n)}` : `${fmt(n)} gemas`);
const campo = (moeda: Moeda) => (moeda === "R$" ? { prefixo: "R$" } : { sufixo: "gemas" });

/* ---------- Como calcular p% de n de cabeça ---------- */

/** Passos do cálculo mental de `p`% de `n`, do jeito que se faz sem regra de três. */
export function passosDe(p: number, n: number): string[] {
  const r = fmt((p * n) / 100);
  const dez = fmt(n / 10);
  const um_ = fmt(n / 100);
  if (p === 100) return [`100% é o valor inteiro: ${fmt(n)}.`];
  if (p === 50) return ["50% é a metade.", `${fmt(n)} ÷ 2 = ${r}.`];
  if (p === 25) return ["25% é a metade da metade (dividir por 4).", `Metade de ${fmt(n)} é ${fmt(n / 2)}; metade de ${fmt(n / 2)} é ${r}.`];
  if (p === 75) return ["75% = 50% + 25%.", `50% de ${fmt(n)} é ${fmt(n / 2)} e 25% é ${fmt(n / 4)}.`, `${fmt(n / 2)} + ${fmt(n / 4)} = ${r}.`];
  if (p === 10) return ["10% é dividir por 10: a vírgula anda uma casa para a esquerda.", `${fmt(n)} ÷ 10 = ${r}.`];
  if (p === 1) return ["1% é dividir por 100: a vírgula anda duas casas para a esquerda.", `${fmt(n)} ÷ 100 = ${r}.`];
  if (p === 5) return [`Primeiro ache 10%: ${fmt(n)} ÷ 10 = ${dez}.`, `5% é a metade de 10%: ${dez} ÷ 2 = ${r}.`];
  if (p % 10 === 0) return [`Primeiro ache 10%: ${fmt(n)} ÷ 10 = ${dez}.`, `${p}% são ${p / 10} vezes 10%: ${p / 10} × ${dez} = ${r}.`];
  if (p % 5 === 0) {
    const dezenas = Math.floor(p / 10);
    return [
      `10% de ${fmt(n)} é ${dez}, e 5% é a metade disso: ${fmt(n / 20)}.`,
      `${p}% = ${dezenas} × 10% + 5% = ${fmt((dezenas * n) / 10)} + ${fmt(n / 20)} = ${r}.`,
    ];
  }
  const dezenas = Math.floor(p / 10);
  const unidades = p % 10;
  if (dezenas === 0) return [`1% de ${fmt(n)} é ${um_} (dividir por 100).`, `${p}% são ${p} vezes isso: ${p} × ${um_} = ${r}.`];
  return [
    `10% de ${fmt(n)} é ${dez} e 1% é ${um_}.`,
    `${p}% = ${dezenas} × 10% + ${unidades} × 1% = ${fmt((dezenas * n) / 10)} + ${fmt((unidades * n) / 100)} = ${r}.`,
  ];
}

const CENARIOS: ((p: number, n: number) => string)[] = [
  (p, n) => `Sua mochila tem ${fmt(n)} espaços e está ${p}% cheia. Quantos espaços estão ocupados?`,
  (p, n) => `Um chefão tem ${fmt(n)} de vida. Seu golpe tira ${p}% dela. Quanto de dano você causou?`,
  (p, n) => `Você tem ${fmt(n)} gemas e vai gastar ${p}% delas. Quantas gemas vai gastar?`,
  (p, n) => `Um vídeo tem ${fmt(n)} minutos e você já assistiu ${p}%. Quantos minutos você já viu?`,
  (p, n) => `De ${fmt(n)} partidas, você venceu ${p}%. Quantas partidas você venceu?`,
  (p, n) => `Um álbum tem ${fmt(n)} figurinhas e você já colou ${p}% delas. Quantas você já colou?`,
  (p, n) => `Um jogo tem ${fmt(n)} fases e você já zerou ${p}% delas. Quantas fases você zerou?`,
  (p, n) => `A escola tem ${fmt(n)} alunos e ${p}% vão de ônibus. Quantos alunos vão de ônibus?`,
];

/** Exercício "quanto é p% de n": conta seca na metade das vezes, historinha na outra metade. */
function pctDe(habilidade: string, p: number, n: number): Exercicio {
  const r = (p * n) / 100;
  const inteiro = Number.isInteger(r);
  const enunciado = inteiro && Math.random() < 0.5 ? um(CENARIOS)(p, n) : `Quanto é ${p}% de ${fmt(n)}?`;
  if (inteiro) return digitar(habilidade, enunciado, r, passosDe(p, n));
  return escolha(habilidade, enunciado, alternativas(r, [r * 10, r / 10, n - r, p]), passosDe(p, n));
}

/* ---------- Unidade 1: o que é porcentagem ---------- */

const lerGrade: Gerador = (nivel) => {
  const n = nivel === 1 ? 10 * entre(1, 9) : nivel === 2 ? 5 * entre(1, 19) : entre(1, 99);
  const colunas = Math.floor(n / 10);
  return digitar(
    "ler-grade",
    "Quantos por cento da grade estão pintados?",
    n,
    [
      "A grade tem 100 quadradinhos, e cada coluna tem 10.",
      colunas === 0
        ? `Nenhuma coluna está cheia: são só ${n} quadradinhos.`
        : `São ${colunas} ${colunas === 1 ? "coluna cheia" : "colunas cheias"}${n % 10 ? ` e mais ${n % 10}` : ""}: ${n} quadradinhos.`,
      `${n} de 100 é ${n}%.`,
    ],
    { sufixo: "%", figura: { tipo: "grade", pintadas: n } },
  );
};

const FORMAS: [texto: string, p: number][] = [["metade", 50], ["1/4", 25], ["3/4", 75], ["1/10", 10], ["1/5", 20]];

const pintarGrade: Gerador = (nivel) => {
  if (nivel === 3) {
    const [texto, p] = um(FORMAS);
    return {
      tipo: "pintar",
      habilidade: "pintar-grade",
      enunciado: `Pinte ${texto} da grade.`,
      resposta: p,
      passos: [`${texto === "metade" ? "Metade" : texto} é o mesmo que ${p}%.`, `${p}% são ${p} dos 100 quadradinhos: ${fmt(p / 10)} colunas.`],
    };
  }
  const n = nivel === 1 ? 10 * entre(1, 9) : entre(11, 95);
  return {
    tipo: "pintar",
    habilidade: "pintar-grade",
    enunciado: `Pinte ${n}% da grade.`,
    resposta: n,
    passos: [
      `${n}% quer dizer ${n} de cada 100, e a grade tem exatamente 100 quadradinhos.`,
      `Cada coluna tem 10: são ${Math.floor(n / 10)} colunas cheias${n % 10 ? ` e mais ${n % 10} quadradinhos` : ""}.`,
    ],
  };
};

const deCada100: Gerador = (nivel) => {
  if (nivel === 1) {
    const n = entre(12, 95);
    return digitar(
      "de-cada-100",
      um([
        `Em 100 partidas, você venceu ${n}. Qual é a sua porcentagem de vitórias?`,
        `De 100 tiros, ${n} acertaram o alvo. Qual foi a porcentagem de acerto?`,
        `Numa pesquisa com 100 alunos, ${n} disseram que preferem jogar no celular. Que porcentagem é essa?`,
      ]),
      n,
      ['"Por cento" quer dizer "de cada 100".', `${n} de 100 é ${n}%.`],
      { sufixo: "%" },
    );
  }
  if (nivel === 2) {
    const n = entre(12, 88);
    return digitar(
      "de-cada-100",
      um([
        `De cada 100 jogadores de um servidor, ${n} jogam no celular. Qual a porcentagem que NÃO joga no celular?`,
        `Em 100 partidas, você venceu ${n}. Em que porcentagem das partidas você NÃO venceu?`,
      ]),
      100 - n,
      [`${n} de 100 é ${n}%.`, `O total é sempre 100%. O resto é 100% − ${n}% = ${100 - n}%.`],
      { sufixo: "%" },
    );
  }
  const total = um([50, 200, 20]);
  const fator = 100 / total;
  const parte = total === 200 ? 2 * entre(11, 90) : entre(3, total - 2);
  return digitar(
    "de-cada-100",
    `Em ${total} partidas, você venceu ${parte}. Qual é a sua porcentagem de vitórias?`,
    parte * fator,
    fator > 1
      ? [`Porcentagem é sempre "de cada 100". Para ${total} virar 100, multiplique por ${fator}.`, `Faça o mesmo com as vitórias: ${parte} × ${fator} = ${parte * fator}.`, `${parte * fator} de 100 é ${parte * fator}%.`]
      : [`Porcentagem é sempre "de cada 100". Para 200 virar 100, divida por 2.`, `Faça o mesmo com as vitórias: ${parte} ÷ 2 = ${parte / 2}.`, `${parte / 2} de 100 é ${parte / 2}%.`],
    { sufixo: "%" },
  );
};

const falta100: Gerador = (nivel) => {
  if (nivel === 3) {
    const a = 5 * entre(3, 9);
    const b = 5 * entre(2, 8);
    const c = 100 - a - b;
    return digitar(
      "falta-100",
      `No começo da partida, ${a}% dos jogadores caíram na cidade, ${b}% no porto e o resto na floresta. Quantos por cento caíram na floresta?`,
      c,
      [`Juntando cidade e porto: ${a}% + ${b}% = ${a + b}%.`, `Todos os jogadores são 100%. Sobra para a floresta: 100% − ${a + b}% = ${c}%.`],
      { sufixo: "%" },
    );
  }
  const n = nivel === 1 ? 10 * entre(1, 9) : entre(11, 94);
  const [enunciado, figura] = um<[string, Figura | undefined]>([
    [`O download do jogo está em ${n}%. Quantos por cento ainda faltam?`, { tipo: "progresso", pct: n }],
    [`Você já gastou ${n}% das suas gemas. Quantos por cento sobraram?`, undefined],
    [`A bateria do celular está em ${n}%. Quantos por cento já foram gastos?`, { tipo: "progresso", pct: n }],
  ]);
  return digitar("falta-100", enunciado, 100 - n, ["O total é sempre 100%.", `100% − ${n}% = ${100 - n}%.`], { sufixo: "%", figura });
};

/* ---------- Unidade 2: fração, decimal e porcentagem ---------- */

/** Porcentagens que valem a pena saber de cor, com a fração simplificada. As primeiras são as mais fáceis. */
export const EQUIVALENTES: { p: number; fracao: string }[] = [
  { p: 50, fracao: "1/2" },
  { p: 25, fracao: "1/4" },
  { p: 10, fracao: "1/10" },
  { p: 75, fracao: "3/4" },
  { p: 20, fracao: "1/5" },
  { p: 1, fracao: "1/100" },
  { p: 40, fracao: "2/5" },
  { p: 60, fracao: "3/5" },
  { p: 30, fracao: "3/10" },
  { p: 80, fracao: "4/5" },
  { p: 5, fracao: "1/20" },
];

const pctFracao: Gerador = (nivel) => {
  const grupo = EQUIVALENTES.slice(0, nivel === 1 ? 4 : nivel === 2 ? 6 : EQUIVALENTES.length);
  const [certa, ...outras] = embaralhar(grupo);
  const passos = [`${certa.p}% é ${certa.p} de cada 100: ${certa.p}/100.`, `Simplificando a fração: ${certa.p}/100 = ${certa.fracao}.`];
  if (Math.random() < 0.5) {
    return escolha("pct-fracao", `Qual fração é igual a ${certa.p}%?`, [certa.fracao, ...outras.slice(0, 3).map((o) => o.fracao)], passos);
  }
  return escolha("pct-fracao", `A fração ${certa.fracao} é igual a quantos por cento?`, [pct(certa.p), ...outras.slice(0, 3).map((o) => pct(o.p))], passos);
};

const fracao100: Gerador = (nivel) => {
  if (nivel === 1) {
    const n = entre(3, 97);
    return digitar("fracao-100", `Escreva ${n}/100 como porcentagem.`, n, [`Fração com 100 embaixo já é porcentagem: ${n}/100 = ${n}%.`], { sufixo: "%" });
  }
  const embaixo = um(nivel === 2 ? [10, 5, 4, 2] : [20, 25, 50]);
  const fator = 100 / embaixo;
  const emCima = entre(1, embaixo - 1);
  return digitar(
    "fracao-100",
    `Escreva ${emCima}/${embaixo} como porcentagem.`,
    emCima * fator,
    [
      `Transforme em uma fração com 100 embaixo: ${embaixo} × ${fator} = 100.`,
      `O que faz embaixo, faz em cima: ${emCima} × ${fator} = ${emCima * fator}.`,
      `${emCima}/${embaixo} = ${emCima * fator}/100 = ${emCima * fator}%.`,
    ],
    { sufixo: "%" },
  );
};

const pctDecimal: Gerador = (nivel) => {
  const n = nivel === 1 ? um([12, 25, 37, 48, 63, 75, 86, 91]) : nivel === 2 ? um([3, 5, 7, 9, 20, 50, 60, 80]) : um([110, 125, 150, 200, 250, 4, 8, 2]);
  const decimal = fmt(n / 100);
  if (Math.random() < 0.5) {
    return escolha(
      "pct-decimal",
      `Como se escreve ${n}% em número decimal?`,
      alternativas(n / 100, [n / 10, n / 1000, n]),
      ["Por cento é dividir por 100: a vírgula anda duas casas para a esquerda.", `${n} ÷ 100 = ${decimal}.`],
    );
  }
  return digitar(
    "pct-decimal",
    `O número ${decimal} é igual a quantos por cento?`,
    n,
    ["Para virar porcentagem, multiplique por 100: a vírgula anda duas casas para a direita.", `${decimal} × 100 = ${n}, então ${decimal} = ${n}%.`],
    { sufixo: "%" },
  );
};

const barra: Gerador = (nivel) => {
  const partes = um(nivel === 1 ? [2, 4, 10] : nivel === 2 ? [5, 10, 4] : [20, 5]);
  const cheias = entre(1, partes - 1);
  const cada = 100 / partes;
  return digitar(
    "barra",
    `A barra de vida está dividida em ${partes} partes iguais e ${cheias} ${cheias === 1 ? "está cheia" : "estão cheias"}. Que porcentagem da vida você tem?`,
    cheias * cada,
    [`A barra inteira é 100%. Cada parte vale 100% ÷ ${partes} = ${cada}%.`, `${cheias} ${cheias === 1 ? "parte" : "partes"}: ${cheias} × ${cada}% = ${cheias * cada}%.`],
    { sufixo: "%", figura: { tipo: "barra", partes, cheias } },
  );
};

/* ---------- Unidade 3: atalhos ---------- */

const metade: Gerador = (nivel) => pctDe("metade", 50, nivel === 1 ? 2 * entre(4, 50) : nivel === 2 ? 20 * entre(6, 50) : 2 * entre(55, 480));

const quarto: Gerador = (nivel) => (nivel === 3 ? pctDe("quarto", 75, 4 * entre(5, 60)) : pctDe("quarto", 25, nivel === 1 ? 4 * entre(2, 25) : 20 * entre(3, 40)));

const dez: Gerador = (nivel) => pctDe("dez", 10, nivel === 1 ? 10 * entre(2, 30) : nivel === 2 ? 10 * entre(31, 250) : entre(12, 99));

const umPorCento: Gerador = (nivel) => pctDe("um", 1, nivel === 1 ? 100 * entre(2, 9) : nivel === 2 ? 100 * entre(10, 90) : 10 * entre(3, 95));

/* ---------- Unidade 4: montando qualquer porcentagem ---------- */

const multiplosDeDez: Gerador = (nivel) =>
  pctDe("multiplos-de-dez", um(nivel === 1 ? [20, 30] : [20, 30, 40, 60, 70, 80, 90]), nivel === 3 ? 10 * entre(11, 95) : 10 * entre(2, 20));

const cinco: Gerador = (nivel) =>
  pctDe("cinco", nivel === 1 ? 5 : um(nivel === 2 ? [5, 15] : [15, 35, 45, 65]), nivel === 1 ? 20 * entre(1, 10) : 20 * entre(2, 30));

const soma: Gerador = (nivel) =>
  pctDe("soma", um(nivel === 1 ? [2, 3, 11] : nivel === 2 ? [11, 12, 21, 4] : [12, 13, 22, 31, 51]), nivel === 3 ? 50 * entre(2, 16) : 100 * entre(1, 9));

const setentaECinco: Gerador = (nivel) => pctDe("setenta-e-cinco", 75, nivel === 1 ? 4 * entre(2, 12) : nivel === 2 ? 20 * entre(2, 15) : 40 * entre(4, 30));

/* ---------- Unidades 5 e 6: desconto e aumento ---------- */

const ITENS: { nome: string; moeda: Moeda }[] = [
  { nome: "Uma skin lendária", moeda: "gemas" },
  { nome: "O passe de batalha", moeda: "gemas" },
  { nome: "Um pacote de emotes", moeda: "gemas" },
  { nome: "Um fone gamer", moeda: "R$" },
  { nome: "Um jogo novo", moeda: "R$" },
  { nome: "Um tênis", moeda: "R$" },
  { nome: "Uma camisa do seu time", moeda: "R$" },
  { nome: "Uma mochila", moeda: "R$" },
];

/** Porcentagens de desconto e de aumento por nível, sempre com resultado inteiro em preços múltiplos de 20. */
const TAXAS: Record<Nivel, number[]> = { 1: [10, 50, 25], 2: [10, 20, 30, 25, 5], 3: [15, 35, 40, 60, 5, 75] };
const preco = (nivel: Nivel) => 20 * (nivel === 1 ? entre(2, 10) : nivel === 2 ? entre(3, 25) : entre(4, 45));

const valorDoDesconto: Gerador = (nivel) => {
  const item = um(ITENS);
  const p = um(TAXAS[nivel]);
  const v = preco(nivel);
  return digitar(
    "valor-do-desconto",
    `${item.nome} custa ${valor(v, item.moeda)} e está com ${p}% de desconto. De quanto é o desconto?`,
    (p * v) / 100,
    [`O desconto é ${p}% do preço.`, ...passosDe(p, v)],
    campo(item.moeda),
  );
};

const precoFinal: Gerador = (nivel) => {
  const item = um(ITENS);
  const p = um(TAXAS[nivel]);
  const v = preco(nivel);
  const d = (p * v) / 100;
  return digitar(
    "preco-final",
    `${item.nome} custa ${valor(v, item.moeda)} e está com ${p}% de desconto. Quanto você paga?`,
    v - d,
    [...passosDe(p, v), `Esse é o desconto. Tire do preço: ${fmt(v)} − ${fmt(d)} = ${fmt(v - d)}.`],
    campo(item.moeda),
  );
};

const quantoPaga: Gerador = (nivel) => {
  const p = um(TAXAS[nivel]);
  if (nivel === 1) {
    return digitar(
      "quanto-paga",
      `Com ${p}% de desconto, você paga quantos por cento do preço original?`,
      100 - p,
      ["O preço cheio é 100%.", `Tirando o desconto: 100% − ${p}% = ${100 - p}%.`],
      { sufixo: "%" },
    );
  }
  const item = um(ITENS);
  const v = preco(nivel);
  return digitar(
    "quanto-paga",
    `${item.nome} custa ${valor(v, item.moeda)}. Na promoção, você paga só ${100 - p}% do preço. De quanto é o desconto?`,
    (p * v) / 100,
    [`Se você paga ${100 - p}%, o desconto é o que falta para 100%: ${p}%.`, ...passosDe(p, v)],
    campo(item.moeda),
  );
};

const SUBIDAS: { antes: (v: string, p: number) => string; pergunta: string; moeda: Moeda | null }[] = [
  { antes: (v, p) => `O passe de batalha custava ${v} e subiu ${p}%.`, pergunta: "Qual é o novo preço?", moeda: "gemas" },
  { antes: (v, p) => `Sua mesada era de ${v} e aumentou ${p}%.`, pergunta: "De quanto é a mesada agora?", moeda: "R$" },
  { antes: (v, p) => `Um lanche custava ${v} e ficou ${p}% mais caro.`, pergunta: "Qual é o novo preço?", moeda: "R$" },
  { antes: (v, p) => `Um canal tinha ${v} inscritos e cresceu ${p}%.`, pergunta: "Quantos inscritos tem agora?", moeda: null },
  { antes: (v, p) => `Seu personagem tinha ${v} de vida e um item aumentou a vida em ${p}%.`, pergunta: "Com quanto de vida ele ficou?", moeda: null },
];

function subida(nivel: Nivel) {
  const cena = um(SUBIDAS);
  const p = um(TAXAS[nivel]);
  const v = preco(nivel);
  const escrito = cena.moeda ? valor(v, cena.moeda) : fmt(v);
  return { cena, p, v, a: (p * v) / 100, texto: cena.antes(escrito, p), campo: cena.moeda ? campo(cena.moeda) : {} };
}

const valorDoAumento: Gerador = (nivel) => {
  const s = subida(nivel);
  return digitar("valor-do-aumento", `${s.texto} De quanto foi o aumento?`, s.a, [`O aumento é ${s.p}% do valor antigo.`, ...passosDe(s.p, s.v)], s.campo);
};

const novoValor: Gerador = (nivel) => {
  const s = subida(nivel);
  return digitar(
    "novo-valor",
    `${s.texto} ${s.cena.pergunta}`,
    s.v + s.a,
    [...passosDe(s.p, s.v), `Esse é o aumento. Some ao valor antigo: ${fmt(s.v)} + ${fmt(s.a)} = ${fmt(s.v + s.a)}.`],
    s.campo,
  );
};

const viraQuanto: Gerador = (nivel) => {
  const p = um(TAXAS[nivel]);
  if (nivel === 1) {
    return digitar(
      "vira-quanto",
      `Depois de um aumento de ${p}%, o novo valor é quantos por cento do valor antigo?`,
      100 + p,
      ["O valor antigo é 100%.", `Somando o aumento: 100% + ${p}% = ${100 + p}%.`],
      { sufixo: "%" },
    );
  }
  const v = preco(nivel);
  const depois = v + (p * v) / 100;
  return escolha(
    "vira-quanto",
    `Um jogo custava R$ ${fmt(v)}. O preço subiu ${p}% e depois a loja deu R$ ${fmt((p * v) / 100)} de desconto. Quanto ele custa agora?`,
    alternativas(v, [depois, v - (p * v) / 100, depois + (p * v) / 100], (n) => `R$ ${fmt(n)}`),
    [`O aumento foi de ${p}% de ${fmt(v)}, que dá ${fmt((p * v) / 100)}. O preço foi para R$ ${fmt(depois)}.`, `O desconto tirou exatamente esse valor: R$ ${fmt(depois)} − R$ ${fmt((p * v) / 100)} = R$ ${fmt(v)}.`],
  );
};

/* ---------- Unidade 7: que porcentagem é? ---------- */

const PLACARES: ((parte: number, todo: number) => string)[] = [
  (a, t) => `Você acertou ${a} de ${t} tiros no treino. Qual foi a sua porcentagem de acerto?`,
  (a, t) => `Numa prova de ${t} questões, você acertou ${a}. Qual foi a sua porcentagem de acerto?`,
  (a, t) => `Você completou ${a} das ${t} missões da semana. Que porcentagem das missões você completou?`,
  (a, t) => `Dos ${t} jogadores da sala, ${a} são do seu esquadrão. Que porcentagem da sala é do seu esquadrão?`,
  (a, t) => `Um time fez ${t} jogos e ganhou ${a}. Qual a porcentagem de vitórias?`,
];

const parteDe100: Gerador = (nivel) => {
  const todo = um(nivel === 1 ? [10, 50, 20] : nivel === 2 ? [25, 20, 50, 200] : [200, 500, 1000, 25]);
  const fator = 100 / todo;
  const p = todo >= 200 ? entre(6, 95) : 0;
  const parte = todo >= 200 ? (p * todo) / 100 : entre(1, todo - 1);
  const resposta = todo >= 200 ? p : parte * fator;
  return digitar(
    "parte-de-100",
    um(PLACARES)(parte, todo),
    resposta,
    fator >= 1
      ? [`Leve tudo para "de cada 100": ${todo} × ${fator} = 100.`, `Faça o mesmo com a parte: ${parte} × ${fator} = ${resposta}.`, `${resposta} de 100 é ${resposta}%.`]
      : [`Leve tudo para "de cada 100": ${fmt(todo)} ÷ ${todo / 100} = 100.`, `Faça o mesmo com a parte: ${parte} ÷ ${todo / 100} = ${resposta}.`, `${resposta} de 100 é ${resposta}%.`],
    { sufixo: "%" },
  );
};

const RAZOES: [emCima: number, embaixo: number][] = [[1, 2], [1, 4], [3, 4], [1, 5], [1, 10], [2, 5], [3, 5], [3, 10], [4, 5]];

const parteFracao: Gerador = (nivel) => {
  const [emCima, embaixo] = um(RAZOES.slice(0, nivel === 1 ? 3 : nivel === 2 ? 5 : RAZOES.length));
  const vezes = entre(3, nivel === 3 ? 15 : 9);
  const parte = emCima * vezes;
  const todo = embaixo * vezes;
  const resposta = (100 * emCima) / embaixo;
  return escolha(
    "parte-fracao",
    um(PLACARES)(parte, todo),
    alternativas(resposta, [100 - resposta, parte, 100 / embaixo, todo], pct),
    [`Escreva como fração: ${parte}/${todo}.`, `Dividindo em cima e embaixo por ${vezes}: ${emCima}/${embaixo}.`, `${emCima}/${embaixo} é ${resposta}%.`],
  );
};

const JOGADORES = ["Kaio", "Bia", "Theo", "Malu", "Davi", "Lara", "Nico", "Sofia"];

const maiorTaxa: Gerador = (nivel) => {
  const todos = nivel === 1 ? [10, 20, 50] : [10, 20, 25, 50];
  const [a, b] = embaralhar(JOGADORES);
  for (;;) {
    const [t1, t2] = embaralhar(todos);
    const p1 = entre(2, t1 - 1);
    const p2 = entre(2, t2 - 1);
    const taxa1 = (100 * p1) / t1;
    const taxa2 = (100 * p2) / t2;
    // Empate só aparece no nível difícil; nos outros, sorteia de novo.
    if (taxa1 === taxa2 && nivel < 3) continue;
    // Se quem acertou mais tiros também tem a maior taxa, não é preciso calcular nada: sorteia de novo.
    if (nivel > 1 && (p1 - p2) * (taxa1 - taxa2) > 0) continue;
    const melhor = taxa1 === taxa2 ? "Empataram" : taxa1 > taxa2 ? a : b;
    return escolha(
      "maior-taxa",
      `${a} acertou ${p1} de ${t1} tiros. ${b} acertou ${p2} de ${t2}. Quem teve a melhor pontaria?`,
      [melhor, ...[a, b, "Empataram"].filter((o) => o !== melhor)],
      [`${a}: ${p1} de ${t1} é ${taxa1}%.`, `${b}: ${p2} de ${t2} é ${taxa2}%.`, taxa1 === taxa2 ? "As duas porcentagens são iguais." : `${Math.max(taxa1, taxa2)}% é maior: ${melhor} levou a melhor, mesmo sem olhar quem deu mais tiros.`],
    );
  }
};

/* ---------- Unidade 8: chefão ---------- */

const acharOTodo: Gerador = (nivel) => {
  const p = um(nivel === 1 ? [50, 10, 25] : nivel === 2 ? [10, 20, 25, 50] : [20, 5, 1, 25]);
  const vezes = 100 / p;
  const parte = nivel === 1 ? entre(3, 20) : entre(6, 45);
  const todo = parte * vezes;
  const [enunciado, extra] = um<[string, { prefixo?: string; sufixo?: string }]>([
    [`${p}% de um número é ${parte}. Que número é esse?`, {}],
    [`Você já baixou ${parte} MB, e isso é ${p}% do jogo. Qual é o tamanho total do jogo?`, { sufixo: "MB" }],
    [`Você gastou ${parte} gemas, que eram ${p}% do que você tinha. Quantas gemas você tinha?`, { sufixo: "gemas" }],
    [`Seu golpe tirou ${parte} de vida do chefão, e isso foi ${p}% da vida dele. Quanto de vida o chefão tinha?`, {}],
  ]);
  return digitar("achar-o-todo", enunciado, todo, [`${p}% cabe ${vezes} vezes em 100%.`, `Então o todo é ${vezes} vezes a parte: ${vezes} × ${parte} = ${fmt(todo)}.`], extra);
};

const doisPassos: Gerador = (nivel) => {
  const p = um(TAXAS[nivel]);
  const v = preco(nivel);
  const d = (p * v) / 100;
  const variante = entre(0, 2);
  if (variante === 0) {
    const cupom = um([5, 10, 15].filter((c) => c < v - d));
    return digitar(
      "dois-passos",
      `Um fone gamer custa R$ ${fmt(v)}. A loja dá ${p}% de desconto e você ainda tem um cupom de R$ ${cupom}. Quanto você paga?`,
      v - d - cupom,
      [...passosDe(p, v), `Com o desconto: ${fmt(v)} − ${fmt(d)} = ${fmt(v - d)}.`, `Agora o cupom: ${fmt(v - d)} − ${cupom} = ${fmt(v - d - cupom)}.`],
      { prefixo: "R$" },
    );
  }
  if (variante === 1) {
    const ganho = 10 * entre(2, 12);
    return digitar(
      "dois-passos",
      `Você tinha ${fmt(v)} gemas. Gastou ${p}% numa skin e depois ganhou ${ganho} numa missão. Com quantas gemas ficou?`,
      v - d + ganho,
      [...passosDe(p, v), `Depois da skin: ${fmt(v)} − ${fmt(d)} = ${fmt(v - d)}.`, `Com a missão: ${fmt(v - d)} + ${ganho} = ${fmt(v - d + ganho)}.`],
      { sufixo: "gemas" },
    );
  }
  return digitar(
    "dois-passos",
    `Dois amigos compram um jogo de R$ ${fmt(v)} cada. Levando os dois, a loja dá ${p}% de desconto no total. Quanto eles pagam juntos?`,
    2 * (v - d),
    [`Sem desconto, os dois jogos custam 2 × ${fmt(v)} = ${fmt(2 * v)}.`, ...passosDe(p, 2 * v), `Com o desconto: ${fmt(2 * v)} − ${fmt(2 * d)} = ${fmt(2 * (v - d))}.`],
    { prefixo: "R$" },
  );
};

/** Todas as habilidades, com o nome que aparece no perfil. */
export const HABILIDADES: Record<string, { nome: string; gerar: Gerador }> = {
  "ler-grade": { nome: "Ler a grade de 100", gerar: lerGrade },
  "pintar-grade": { nome: "Pintar a grade", gerar: pintarGrade },
  "de-cada-100": { nome: "De cada 100", gerar: deCada100 },
  "falta-100": { nome: "Quanto falta para 100%", gerar: falta100 },
  "pct-fracao": { nome: "Porcentagem e fração", gerar: pctFracao },
  "fracao-100": { nome: "Fração para porcentagem", gerar: fracao100 },
  "pct-decimal": { nome: "Porcentagem e decimal", gerar: pctDecimal },
  barra: { nome: "Barra dividida", gerar: barra },
  metade: { nome: "50% (metade)", gerar: metade },
  quarto: { nome: "25% (metade da metade)", gerar: quarto },
  dez: { nome: "10% (dividir por 10)", gerar: dez },
  um: { nome: "1% (dividir por 100)", gerar: umPorCento },
  "multiplos-de-dez": { nome: "20%, 30%, 40%…", gerar: multiplosDeDez },
  cinco: { nome: "5% e 15%", gerar: cinco },
  soma: { nome: "Somando 10% e 1%", gerar: soma },
  "setenta-e-cinco": { nome: "75%", gerar: setentaECinco },
  "valor-do-desconto": { nome: "Valor do desconto", gerar: valorDoDesconto },
  "preco-final": { nome: "Preço com desconto", gerar: precoFinal },
  "quanto-paga": { nome: "Quanto você paga", gerar: quantoPaga },
  "valor-do-aumento": { nome: "Valor do aumento", gerar: valorDoAumento },
  "novo-valor": { nome: "Valor depois do aumento", gerar: novoValor },
  "vira-quanto": { nome: "Aumento e 100%", gerar: viraQuanto },
  "parte-de-100": { nome: "Levar para 100", gerar: parteDe100 },
  "parte-fracao": { nome: "Simplificar a fração", gerar: parteFracao },
  "maior-taxa": { nome: "Comparar porcentagens", gerar: maiorTaxa },
  "achar-o-todo": { nome: "Achar o todo", gerar: acharOTodo },
  "dois-passos": { nome: "Problemas de dois passos", gerar: doisPassos },
};

/** Sorteia `quantos` exercícios, passando pelas habilidades em rodízio e sem repetir enunciado. */
export function montar(habilidades: string[], nivel: Nivel, quantos: number): Exercicio[] {
  const lista: Exercicio[] = [];
  let fila: string[] = [];
  for (let tentativas = 0; lista.length < quantos && tentativas < quantos * 20; tentativas++) {
    if (fila.length === 0) fila = embaralhar(habilidades);
    const novo = HABILIDADES[fila.pop()!].gerar(nivel);
    if (!lista.some((e) => e.enunciado === novo.enunciado && e.figura === undefined)) lista.push(novo);
  }
  return lista;
}
