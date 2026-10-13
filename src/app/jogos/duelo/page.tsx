"use client";

import { useEffect, useRef, useState } from "react";
import { Casca } from "@/components/Casca";
import { Icone } from "@/components/Icone";
import { Abertura, FimDeJogo, Placar, usePartida, Vidas } from "@/components/Jogo";
import { fmt } from "@/conteudo/geradores";
import { CORES } from "@/lib/cores";
import { entre, um, vibrar } from "@/lib/jogo";
import { tocar } from "@/lib/som";
import type { Cor } from "@/lib/tipos";

const CHEFES: { nome: string; cor: Cor }[] = [
  { nome: "Sucata", cor: "ciano" },
  { nome: "Víbora", cor: "neon" },
  { nome: "Titã", cor: "ouro" },
  { nome: "Fantasma", cor: "roxo" },
  { nome: "Ômega", cor: "rosa" },
];

/** Porcentagens dos golpes: ficam menos redondas a cada chefão. */
const TAXAS = [[50, 10, 25], [50, 10, 25, 20, 30, 75], [5, 15, 20, 30, 40, 60, 75, 25]];

const PONTOS_CRITICO = 30;
const PONTOS_GOLPE = 10;
const PONTOS_CHEFE = 50;

type Carta = { texto: string; valor: number };

const vidaDoChefe = (chefe: number) => 120 + 80 * chefe;
const segundosDoTurno = (chefe: number) => Math.max(7, 13 - chefe);

/** Três golpes com danos diferentes, sempre inteiros (a base é múltipla de 20). */
function sortearCartas(chefe: number): Carta[] {
  const dificuldade = Math.min(chefe, TAXAS.length - 1);
  const cartas: Carta[] = [];
  while (cartas.length < 3) {
    const p = um(TAXAS[dificuldade]);
    const n = 20 * entre(2, 8 + 4 * dificuldade);
    const valor = (p * n) / 100;
    if (!cartas.some((c) => c.valor === valor)) cartas.push({ texto: `${p}% de ${fmt(n)}`, valor });
  }
  return cartas;
}

function Partida({ aoRepetir }: { aoRepetir: () => void }) {
  const { recorde, encerrar } = usePartida("duelo");
  const [recordeAntes] = useState(recorde);
  const [chefe, setChefe] = useState(0);
  const [vidaChefe, setVidaChefe] = useState(vidaDoChefe(0));
  const [vidas, setVidas] = useState(3);
  const [turno, setTurno] = useState(0);
  const [cartas, setCartas] = useState(() => sortearCartas(0));
  /** Índice da carta escolhida; -1 quando o tempo acabou sem escolha. */
  const [escolhida, setEscolhida] = useState<number | null>(null);
  const [pontos, setPontos] = useState(0);
  const [fim, setFim] = useState(false);
  const espera = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => void (espera.current && clearTimeout(espera.current)), []);

  const dados = CHEFES[chefe % CHEFES.length];
  const melhor = Math.max(...cartas.map((c) => c.valor));
  const critico = escolhida !== null && escolhida >= 0 && cartas[escolhida].valor === melhor;
  const dano = escolhida !== null && escolhida >= 0 ? cartas[escolhida].valor * (critico ? 2 : 1) : 0;

  /** Depois de mostrar o resultado do turno: fim de jogo, próximo chefão ou próximo turno. */
  function avancar(vidaRestante: number, vidasRestantes: number, total: number) {
    if (vidasRestantes <= 0) {
      encerrar(total);
      setFim(true);
      return;
    }
    const proximo = vidaRestante <= 0 ? chefe + 1 : chefe;
    if (proximo !== chefe) {
      tocar("vitoria");
      setPontos(total + PONTOS_CHEFE);
      setChefe(proximo);
      setVidaChefe(vidaDoChefe(proximo));
    }
    setCartas(sortearCartas(proximo));
    setEscolhida(null);
    setTurno((t) => t + 1);
  }

  function resolver(indice: number) {
    if (escolhida !== null || fim) return;
    const acertou = indice >= 0 && cartas[indice].valor === melhor;
    const golpe = indice < 0 ? 0 : cartas[indice].valor * (acertou ? 2 : 1);
    const vidaRestante = Math.max(0, vidaChefe - golpe);
    const vidasRestantes = acertou ? vidas : vidas - 1;
    const total = pontos + (indice < 0 ? 0 : acertou ? PONTOS_CRITICO : PONTOS_GOLPE);
    setEscolhida(indice);
    setVidaChefe(vidaRestante);
    setVidas(vidasRestantes);
    setPontos(total);
    vibrar(acertou);
    tocar(acertou ? "certo" : "errado");
    espera.current = setTimeout(() => avancar(vidaRestante, vidasRestantes, total), acertou ? 1300 : 2400);
  }

  useEffect(() => {
    if (escolhida !== null || fim) return;
    const relogio = setTimeout(() => resolver(-1), segundosDoTurno(chefe) * 1000);
    return () => clearTimeout(relogio);
    // O relógio é do turno: recomeça quando o turno muda e para quando a pessoa escolhe.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turno, escolhida, fim]);

  if (fim) {
    return (
      <FimDeJogo
        titulo="Fim do duelo"
        pontos={pontos}
        recorde={recordeAntes}
        detalhe={chefe === 0 ? "Nenhum chefão derrotado ainda" : `${chefe} ${chefe === 1 ? "chefão derrotado" : "chefões derrotados"}`}
        aoRepetir={aoRepetir}
      />
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <Placar meio={<Vidas vidas={vidas} />} pontos={pontos} />

      <div className="relative mb-4 rounded-3xl border border-linha bg-cartao p-4">
        <div className="flex items-center gap-4">
          <span
            key={`${turno}-${escolhida !== null && dano > 0}`}
            className={`flex size-20 shrink-0 items-center justify-center rounded-2xl ${CORES[dados.cor].fundo} text-fundo ${escolhida !== null && dano > 0 ? "animate-tremer" : "animate-flutuar"}`}
          >
            <Icone nome="caveira" className="size-12" />
          </span>
          <div className="flex-1">
            <p className="text-xs font-bold tracking-wide text-texto-2 uppercase">Chefão {chefe + 1}</p>
            <h2 className={`text-2xl font-bold ${CORES[dados.cor].texto}`}>{dados.nome}</h2>
            <div className="mt-2 h-4 overflow-hidden rounded-full bg-cartao-2">
              <div className="h-full rounded-full bg-erro transition-all duration-500" style={{ width: `${(vidaChefe / vidaDoChefe(chefe)) * 100}%` }} />
            </div>
            <p className="mt-1 text-xs font-bold text-texto-2 tabular-nums">
              {vidaChefe} / {vidaDoChefe(chefe)} de vida
            </p>
          </div>
        </div>
        {escolhida !== null && dano > 0 && (
          <span className={`animate-voar pointer-events-none absolute top-3 right-4 font-titulo text-3xl font-bold ${critico ? "text-ouro" : "text-texto"}`}>−{dano}</span>
        )}
      </div>

      <div className="mb-3 h-2 overflow-hidden rounded-full bg-cartao-2">
        {escolhida === null && (
          <div key={turno} data-jogo className="h-full rounded-full bg-fogo" style={{ animation: `esvaziar ${segundosDoTurno(chefe)}s linear both` }} />
        )}
      </div>

      <p className="mb-3 min-h-12 text-center leading-snug font-semibold" aria-live="polite">
        {escolhida === null ? (
          <span className="text-texto-2">Qual golpe tira mais vida?</span>
        ) : critico ? (
          <span className="font-titulo text-xl font-bold text-ouro">Crítico! Dano em dobro</span>
        ) : (
          <span className="text-erro">{escolhida < 0 ? "Demorou demais." : `O mais forte tirava ${melhor}.`} O chefão revidou e você perdeu uma vida.</span>
        )}
      </p>

      <div key={turno} className="animate-subir mt-auto space-y-3 pb-2">
        {cartas.map((carta, i) => {
          let estado = "border-linha bg-cartao";
          if (escolhida !== null && carta.valor === melhor) estado = "border-neon bg-neon/15";
          else if (escolhida === i) estado = "border-erro bg-erro/15 animate-tremer";
          else if (escolhida !== null) estado = "border-linha bg-cartao opacity-50";
          return (
            <button
              key={carta.texto}
              disabled={escolhida !== null}
              onClick={() => resolver(i)}
              className={`flex w-full items-center gap-3 rounded-2xl border-2 px-4 py-4 text-left transition ${estado}`}
            >
              <Icone nome="espada" className="size-6 text-texto-2" />
              <span className="flex-1 font-titulo text-2xl font-bold">{carta.texto}</span>
              {escolhida !== null && <span className="font-titulo text-2xl font-bold text-texto-2">= {fmt(carta.valor)}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Duelo() {
  const [partida, setPartida] = useState(0);
  if (partida === 0) return <Abertura id="duelo" aoComecar={() => setPartida(1)} />;
  return <Partida key={partida} aoRepetir={() => setPartida((n) => n + 1)} />;
}

export default function PaginaDuelo() {
  return (
    <Casca foco>
      <Duelo />
    </Casca>
  );
}
