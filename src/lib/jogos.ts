import type { NomeIcone } from "@/components/Icone";
import type { Cor, IdJogo } from "./tipos";

/** Os jogos, na ordem do painel. O `id` é a pasta em `/jogos`. */
export const JOGOS: {
  id: IdJogo;
  nome: string;
  descricao: string;
  regra: string;
  icone: NomeIcone;
  cor: Cor;
  /** Conquista do perfil: fazer `pontos` em uma partida. */
  conquista: { nome: string; pontos: number };
}[] = [
  {
    id: "duelo",
    nome: "Duelo de Dano",
    descricao: "Escolha o golpe mais forte e derrube os chefões",
    regra: "Cada carta é um golpe, e o dano é o resultado da conta. Escolha o mais forte: se acertar, é crítico e vale em dobro. Se errar ou demorar, o chefão revida e você perde uma vida.",
    icone: "espada",
    cor: "rosa",
    conquista: { nome: "Caça-chefão", pontos: 300 },
  },
  {
    id: "airdrop",
    nome: "Chuva de Caixas",
    descricao: "Digite o resultado antes que a caixa caia",
    regra: "As caixas caem com uma conta escrita. Digite o resultado para estourar a caixa. Cada caixa que tocar o chão custa uma vida, e elas vão ficando mais rápidas.",
    icone: "caixa",
    cor: "fogo",
    conquista: { nome: "Céu limpo", pontos: 250 },
  },
  {
    id: "mira",
    nome: "Mira Certa",
    descricao: "Acerte o alvo que vale o mesmo que o pedido",
    regra: "Aparece um valor no topo, como 1/4. Atire no alvo que vale a mesma coisa, como 25%. São 45 segundos, os alvos não param quietos e tiro errado custa 3 segundos.",
    icone: "alvo",
    cor: "ciano",
    conquista: { nome: "Olho de águia", pontos: 250 },
  },
  {
    id: "zona",
    nome: "Trava na Zona",
    descricao: "Pare a barra exatamente na porcentagem pedida",
    regra: "A barra enche e esvazia sem parar. Aperte TRAVAR quando ela estiver na porcentagem pedida. Quanto mais perto, mais pontos. São 8 rodadas, cada uma mais rápida e com menos marcas para ajudar.",
    icone: "relogio",
    cor: "neon",
    conquista: { nome: "Mão firme", pontos: 600 },
  },
  {
    id: "ofertas",
    nome: "Caça-Ofertas",
    descricao: "Qual das duas sai mais barata?",
    regra: "Duas ofertas na loja, cada uma com seu preço e seu desconto. Toque na que sai mais barata no final. São 60 segundos, e nem sempre o maior desconto ganha.",
    icone: "etiqueta",
    cor: "ouro",
    conquista: { nome: "Rei da pechincha", pontos: 200 },
  },
];

export const jogoDe = (id: IdJogo) => JOGOS.find((j) => j.id === id)!;
