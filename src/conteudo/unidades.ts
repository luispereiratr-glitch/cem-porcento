import type { Unidade } from "@/lib/tipos";

/** A trilha, na ordem. Cada unidade tem três fases (fácil, médio e difícil) com as mesmas habilidades. */
export const UNIDADES: Unidade[] = [
  {
    id: "base",
    titulo: "O que é porcentagem",
    descricao: "Por cento quer dizer: de cada 100",
    icone: "porcento",
    cor: "ciano",
    habilidades: ["ler-grade", "pintar-grade", "de-cada-100", "falta-100"],
    dicas: [
      {
        titulo: "Por cento = de cada 100",
        texto: "O símbolo % quer dizer \"de cada 100\". Se você venceu 30% das partidas, venceu 30 de cada 100.",
        figura: { tipo: "grade", pintadas: 30 },
      },
      {
        titulo: "A grade de 100",
        texto: "Esta grade tem 100 quadradinhos, 10 em cada coluna. Cada quadradinho vale 1%, e cada coluna cheia vale 10%. Aqui estão pintados 47%.",
        figura: { tipo: "grade", pintadas: 47 },
      },
      {
        titulo: "100% é tudo",
        texto: "O total é sempre 100%. Se o download está em 80%, faltam 20%, porque 80 + 20 = 100.",
        figura: { tipo: "progresso", pct: 80 },
      },
    ],
  },
  {
    id: "formas",
    titulo: "Três jeitos de escrever",
    descricao: "Fração, decimal e porcentagem são a mesma coisa",
    icone: "virgula",
    cor: "roxo",
    habilidades: ["pct-fracao", "fracao-100", "pct-decimal", "barra"],
    dicas: [
      {
        titulo: "O mesmo valor, três roupas",
        texto: "Metade da barra de vida pode ser escrita como 1/2, como 0,5 ou como 50%. Muda a escrita, o valor é o mesmo.",
        figura: { tipo: "barra", partes: 2, cheias: 1 },
      },
      {
        titulo: "De porcentagem para fração",
        texto: "25% é 25 de cada 100, ou seja, 25/100. Simplificando, vira 1/4. Vale decorar: 50% = 1/2, 25% = 1/4, 10% = 1/10 e 75% = 3/4.",
        figura: { tipo: "barra", partes: 4, cheias: 1 },
      },
      {
        titulo: "De porcentagem para decimal",
        texto: "Por cento é dividir por 100, então a vírgula anda duas casas para a esquerda: 37% = 0,37 e 7% = 0,07. Cuidado: 0,7 é 70%, não 7%.",
      },
    ],
  },
  {
    id: "atalhos",
    titulo: "Os quatro atalhos",
    descricao: "50%, 25%, 10% e 1% de cabeça",
    icone: "raio",
    cor: "ouro",
    habilidades: ["metade", "quarto", "dez", "um"],
    dicas: [
      {
        titulo: "50% é a metade",
        texto: "Para achar 50% de qualquer número, divida por 2. 50% de 80 é 40.",
        figura: { tipo: "barra", partes: 2, cheias: 1 },
      },
      {
        titulo: "25% é a metade da metade",
        texto: "Divida por 2 e depois por 2 de novo. 25% de 80: metade é 40, metade de 40 é 20.",
        figura: { tipo: "barra", partes: 4, cheias: 1 },
      },
      {
        titulo: "10% é dividir por 10",
        texto: "A vírgula anda uma casa para a esquerda. 10% de 250 é 25. E 10% de 45 é 4,5.",
        figura: { tipo: "barra", partes: 10, cheias: 1 },
      },
      {
        titulo: "1% é dividir por 100",
        texto: "A vírgula anda duas casas. 1% de 300 é 3. Com 10% e 1% na mão, dá para montar qualquer porcentagem.",
      },
    ],
  },
  {
    id: "montar",
    titulo: "Montando qualquer porcentagem",
    descricao: "Junte os atalhos como peças",
    icone: "caixa",
    cor: "neon",
    habilidades: ["multiplos-de-dez", "cinco", "soma", "setenta-e-cinco"],
    dicas: [
      {
        titulo: "30% são três vezes 10%",
        texto: "Ache 10% e multiplique. 30% de 200: 10% é 20, então 30% é 3 × 20 = 60.",
        figura: { tipo: "barra", partes: 10, cheias: 3 },
      },
      {
        titulo: "5% é a metade de 10%",
        texto: "5% de 200: 10% é 20, metade é 10. E 15% é 10% + 5%: 20 + 10 = 30.",
      },
      {
        titulo: "Qualquer porcentagem",
        texto: "12% é 10% + 1% + 1%. Em 300: 30 + 3 + 3 = 36. E 75% é 50% + 25%. Quebre a porcentagem em pedaços que você sabe.",
      },
    ],
  },
  {
    id: "desconto",
    titulo: "Desconto",
    descricao: "Quanto sai e quanto você paga",
    icone: "etiqueta",
    cor: "rosa",
    habilidades: ["valor-do-desconto", "preco-final", "quanto-paga"],
    dicas: [
      {
        titulo: "Desconto é uma parte do preço",
        texto: "20% de desconto em uma skin de 150 gemas: 10% é 15, então 20% é 30. O desconto é de 30 gemas.",
      },
      {
        titulo: "O que você paga",
        texto: "Tire o desconto do preço: 150 − 30 = 120 gemas. São dois passos: achar o desconto e depois subtrair.",
      },
      {
        titulo: "O outro jeito de pensar",
        texto: "O preço cheio é 100%. Com 20% de desconto, você paga 80% do preço.",
        figura: { tipo: "barra", partes: 10, cheias: 8 },
      },
    ],
  },
  {
    id: "aumento",
    titulo: "Aumento",
    descricao: "Quando o valor sobe",
    icone: "cima",
    cor: "fogo",
    habilidades: ["valor-do-aumento", "novo-valor", "vira-quanto"],
    dicas: [
      {
        titulo: "Aumento também é uma parte",
        texto: "A mesada de R$ 60 aumentou 10%. O aumento é 10% de 60, que dá R$ 6.",
      },
      {
        titulo: "O novo valor",
        texto: "Some o aumento ao valor antigo: 60 + 6 = R$ 66. No desconto você subtrai; no aumento você soma.",
      },
      {
        titulo: "Mais que 100%",
        texto: "O valor antigo é 100%. Depois de um aumento de 10%, o novo valor é 110% do antigo. Porcentagem pode passar de 100.",
      },
    ],
  },
  {
    id: "parte",
    titulo: "Que porcentagem é?",
    descricao: "Da parte e do todo para a porcentagem",
    icone: "alvo",
    cor: "ciano",
    habilidades: ["parte-de-100", "parte-fracao", "maior-taxa"],
    dicas: [
      {
        titulo: "Leve para 100",
        texto: "Você acertou 18 de 20 tiros. Para 20 virar 100, multiplique por 5. Faça o mesmo com os acertos: 18 × 5 = 90. Foram 90% de acerto.",
      },
      {
        titulo: "Ou simplifique a fração",
        texto: "15 de 60 é a fração 15/60. Dividindo os dois por 15, vira 1/4, e 1/4 é 25%.",
        figura: { tipo: "barra", partes: 4, cheias: 1 },
      },
      {
        titulo: "Para comparar, use porcentagem",
        texto: "Quem tem a melhor pontaria: 7 de 10 ou 30 de 50? Em porcentagem fica fácil: 70% contra 60%. Quem deu menos tiros levou a melhor.",
      },
    ],
  },
  {
    id: "chefe",
    titulo: "Chefão",
    descricao: "Problemas de dois passos e de trás para frente",
    icone: "caveira",
    cor: "rosa",
    habilidades: ["achar-o-todo", "dois-passos", "preco-final", "novo-valor", "parte-fracao", "soma"],
    dicas: [
      {
        titulo: "De trás para frente",
        texto: "Se 25% de um número é 30, o número inteiro são quatro pedaços desses, porque 25% cabe 4 vezes em 100%. O número é 4 × 30 = 120.",
        figura: { tipo: "barra", partes: 4, cheias: 1 },
      },
      {
        titulo: "Um passo de cada vez",
        texto: "Nos problemas grandes, faça uma conta por vez: primeiro a porcentagem, depois o desconto ou o aumento, depois o que vier. Sem pressa.",
      },
    ],
  },
];

export const unidadeDe = (id: string) => UNIDADES.find((u) => u.id === id);

/** Ids de todas as habilidades da trilha, sem repetição. */
export const TODAS_HABILIDADES = [...new Set(UNIDADES.flatMap((u) => u.habilidades))];
