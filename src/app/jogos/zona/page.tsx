"use client";

import { useEffect, useRef, useState } from "react";
import { Botao, Casca } from "@/components/Casca";
import { Abertura, FimDeJogo, Placar, usePartida } from "@/components/Jogo";
import { entre, um, vibrar } from "@/lib/jogo";
import { tocar } from "@/lib/som";

const RODADAS = 8;

type Alvo = { texto: string; pct: number; /** De quantos em quantos por cento há uma marca na barra. */ marcas: number };

const OUTRAS_FORMAS: [string, number][] = [["1/2", 50], ["1/4", 25], ["3/4", 75], ["1/10", 10], ["1/5", 20], ["0,3", 30], ["0,6", 60], ["0,9", 90], ["2/5", 40]];

/** Começa com porcentagens redondas e a barra toda marcada; depois vêm frações e decimais, e por fim quase sem marcas. */
function sortearAlvo(rodada: number): Alvo {
  if (rodada < 3) {
    const pct = um([50, 25, 75, 10, 90, 20, 80, 40]);
    return { texto: `${pct}%`, pct, marcas: 10 };
  }
  if (rodada < 6) {
    const [texto, pct] = um(OUTRAS_FORMAS);
    return { texto, pct, marcas: 25 };
  }
  const pct = 5 * entre(3, 17);
  return { texto: `${pct}%`, pct, marcas: 50 };
}

const pontosDe = (erro: number) => (erro <= 2 ? 100 : Math.max(0, Math.round(100 - erro * 6)));

function Partida({ aoRepetir }: { aoRepetir: () => void }) {
  const { recorde, encerrar } = usePartida("zona");
  const [recordeAntes] = useState(recorde);
  const [rodada, setRodada] = useState(0);
  const [alvo, setAlvo] = useState(() => sortearAlvo(0));
  const [parou, setParou] = useState<number | null>(null);
  const [pontos, setPontos] = useState(0);
  const [perfeitas, setPerfeitas] = useState(0);
  const [fim, setFim] = useState(false);
  const barra = useRef<HTMLDivElement>(null);
  const posicao = useRef(0);

  useEffect(() => {
    if (parou !== null || fim) return;
    let quadro = 0;
    const inicio = performance.now();
    const velocidade = 45 + rodada * 9; // por cento por segundo
    const passo = (agora: number) => {
      const andou = (((agora - inicio) / 1000) * velocidade) % 200;
      posicao.current = andou <= 100 ? andou : 200 - andou;
      if (barra.current) barra.current.style.width = `${posicao.current}%`;
      quadro = requestAnimationFrame(passo);
    };
    quadro = requestAnimationFrame(passo);
    return () => cancelAnimationFrame(quadro);
  }, [rodada, parou, fim]);

  const erro = parou === null ? 0 : Math.abs(parou - alvo.pct);

  function travar() {
    const onde = Math.round(posicao.current);
    const ganho = pontosDe(Math.abs(onde - alvo.pct));
    setParou(onde);
    setPontos((p) => p + ganho);
    if (ganho === 100) setPerfeitas((n) => n + 1);
    vibrar(ganho >= 70);
    tocar(ganho >= 70 ? "certo" : "errado");
  }

  function proxima() {
    if (rodada + 1 === RODADAS) {
      encerrar(pontos);
      setFim(true);
      return;
    }
    setAlvo(sortearAlvo(rodada + 1));
    setRodada(rodada + 1);
    setParou(null);
  }

  if (fim) {
    return (
      <FimDeJogo
        titulo="Zona fechada"
        pontos={pontos}
        recorde={recordeAntes}
        detalhe={`${perfeitas} ${perfeitas === 1 ? "trava perfeita" : "travas perfeitas"} em ${RODADAS} rodadas`}
        aoRepetir={aoRepetir}
      />
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <Placar meio={`Rodada ${rodada + 1}/${RODADAS}`} pontos={pontos} />

      <div key={rodada} className="animate-subir flex flex-1 flex-col justify-center">
        <p className="text-center text-sm font-bold tracking-wide text-texto-2 uppercase">Trave a zona em</p>
        <p className="mb-8 text-center font-titulo text-7xl font-bold text-neon">{alvo.texto}</p>

        <div className="relative h-20 overflow-hidden rounded-2xl border-2 border-linha bg-cartao">
          <div ref={barra} data-jogo className={`h-full ${parou === null ? "bg-neon" : erro <= 2 ? "bg-neon" : erro <= 10 ? "bg-ouro" : "bg-erro"}`} />
          {Array.from({ length: 100 / alvo.marcas - 1 }, (_, i) => (
            <span key={i} className="absolute inset-y-0 w-0.5 bg-fundo/40" style={{ left: `${(i + 1) * alvo.marcas}%` }} />
          ))}
          {parou !== null && <span className="absolute inset-y-0 w-1 -translate-x-1/2 bg-texto" style={{ left: `${alvo.pct}%` }} />}
        </div>
        <div className="mt-1.5 flex justify-between text-xs font-bold text-texto-2">
          <span>0%</span>
          <span>100%</span>
        </div>

        <p className="mt-6 min-h-16 text-center" aria-live="polite">
          {parou !== null && (
            <>
              <span className={`block font-titulo text-2xl font-bold ${erro <= 2 ? "text-neon" : erro <= 10 ? "text-ouro" : "text-erro"}`}>
                {erro <= 2 ? "Perfeito!" : erro <= 10 ? "Perto!" : "Longe…"} +{pontosDe(erro)}
              </span>
              <span className="text-texto-2">
                Você travou em {parou}%. {alvo.texto.includes("%") ? `O alvo era ${alvo.pct}%.` : `${alvo.texto} é ${alvo.pct}%.`}
              </span>
            </>
          )}
        </p>
      </div>

      <div className="pb-2">
        {parou === null ? (
          <Botao key="travar" cor="fogo" className="!py-6 !text-2xl" onClick={travar}>
            Travar
          </Botao>
        ) : (
          <Botao key="proxima" onClick={proxima}>
            {rodada + 1 === RODADAS ? "Ver resultado" : "Próxima zona"}
          </Botao>
        )}
      </div>
    </div>
  );
}

function Zona() {
  const [partida, setPartida] = useState(0);
  if (partida === 0) return <Abertura id="zona" aoComecar={() => setPartida(1)} />;
  return <Partida key={partida} aoRepetir={() => setPartida((n) => n + 1)} />;
}

export default function PaginaZona() {
  return (
    <Casca foco>
      <Zona />
    </Casca>
  );
}
