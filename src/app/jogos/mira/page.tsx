"use client";

import { useEffect, useRef, useState } from "react";
import { Casca } from "@/components/Casca";
import { Icone } from "@/components/Icone";
import { Abertura, BarraDeTempo, FimDeJogo, Placar, useContagem, usePartida } from "@/components/Jogo";
import { alternativas, EQUIVALENTES, fmt } from "@/conteudo/geradores";
import { embaralhar, entre, um, vibrar } from "@/lib/jogo";
import { tocar } from "@/lib/som";

const DURACAO = 45;
const MULTA = 3;
/** Lado do alvo, em pixels. */
const TAMANHO = 84;

type Alvo = { rotulo: string; certo: boolean };
type Rodada = { numero: number; pedido: string; alvos: Alvo[]; /** Fração da arena percorrida por segundo. */ velocidade: number };

const FORMAS = ["pct", "fracao", "decimal"] as const;
const escrever = (v: (typeof EQUIVALENTES)[number], forma: (typeof FORMAS)[number]) =>
  forma === "pct" ? `${v.p}%` : forma === "fracao" ? v.fracao : fmt(v.p / 100);

/** No começo só há equivalências fáceis; depois entram as outras e, de vez em quando, uma conta. */
function sortearRodada(numero: number, acertos: number): Rodada {
  const velocidade = Math.min(0.14 + acertos * 0.012, 0.42);
  if (acertos >= 6 && Math.random() < 0.4) {
    const p = um([10, 50, 25, 20]);
    const n = 20 * entre(1, 10);
    const r = (p * n) / 100;
    const [certa, ...erradas] = alternativas(r, [r * 2, n / 10, r + 10]);
    return {
      numero,
      pedido: `${p}% de ${n}`,
      alvos: embaralhar([{ rotulo: certa, certo: true }, ...erradas.map((rotulo) => ({ rotulo, certo: false }))]),
      velocidade,
    };
  }
  const [certa, ...outras] = embaralhar(EQUIVALENTES.slice(0, acertos < 4 ? 5 : EQUIVALENTES.length)).slice(0, 4);
  const pedida = um(FORMAS);
  const outraForma = () => um(FORMAS.filter((f) => f !== pedida));
  return {
    numero,
    pedido: escrever(certa, pedida),
    alvos: embaralhar([{ rotulo: escrever(certa, outraForma()), certo: true }, ...outras.map((v) => ({ rotulo: escrever(v, outraForma()), certo: false }))]),
    velocidade,
  };
}

function Partida({ aoRepetir }: { aoRepetir: () => void }) {
  const { recorde, encerrar } = usePartida("mira");
  const [recordeAntes] = useState(recorde);
  const { tempo, acabou, perder } = useContagem(DURACAO);
  const [rodada, setRodada] = useState(() => sortearRodada(0, 0));
  const [errados, setErrados] = useState<number[]>([]);
  const [pontos, setPontos] = useState(0);
  const [acertos, setAcertos] = useState(0);
  const [combo, setCombo] = useState(0);
  const arena = useRef<HTMLDivElement>(null);
  const botoes = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    if (acabou) encerrar(pontos);
    // Fecha a partida uma única vez, quando o tempo zera.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [acabou]);

  // Os alvos andam em linha reta e quicam nas bordas. A posição vai direto para o estilo, sem passar pelo React.
  useEffect(() => {
    if (acabou) return;
    const corpos = rodada.alvos.map((_, i) => {
      const angulo = Math.random() * 2 * Math.PI;
      // Cada alvo nasce num canto diferente, para não começarem empilhados.
      return { x: (i % 2) * 0.6 + Math.random() * 0.3, y: Math.floor(i / 2) * 0.6 + Math.random() * 0.3, vx: Math.cos(angulo), vy: Math.sin(angulo) };
    });
    let quadro = 0;
    let antes = performance.now();
    const passo = (agora: number) => {
      const dt = Math.min((agora - antes) / 1000, 0.05);
      antes = agora;
      const largura = (arena.current?.clientWidth ?? TAMANHO) - TAMANHO;
      const altura = (arena.current?.clientHeight ?? TAMANHO) - TAMANHO;
      corpos.forEach((c, i) => {
        c.x += c.vx * rodada.velocidade * dt;
        c.y += c.vy * rodada.velocidade * dt;
        if (c.x < 0 || c.x > 1) c.vx = c.x < 0 ? Math.abs(c.vx) : -Math.abs(c.vx);
        if (c.y < 0 || c.y > 1) c.vy = c.y < 0 ? Math.abs(c.vy) : -Math.abs(c.vy);
        const botao = botoes.current[i];
        if (botao) botao.style.transform = `translate(${Math.min(Math.max(c.x, 0), 1) * largura}px, ${Math.min(Math.max(c.y, 0), 1) * altura}px)`;
      });
      quadro = requestAnimationFrame(passo);
    };
    passo(antes);
    return () => cancelAnimationFrame(quadro);
  }, [rodada, acabou]);

  function atirar(i: number) {
    if (acabou || errados.includes(i)) return;
    const certo = rodada.alvos[i].certo;
    vibrar(certo);
    tocar(certo ? "tiro" : "errado");
    if (!certo) {
      setErrados((lista) => [...lista, i]);
      setCombo(0);
      perder(MULTA);
      return;
    }
    setPontos((p) => p + 10 + Math.min(combo, 10));
    setAcertos(acertos + 1);
    setCombo((c) => c + 1);
    setErrados([]);
    setRodada(sortearRodada(rodada.numero + 1, acertos + 1));
  }

  if (acabou) {
    return <FimDeJogo titulo="Tempo esgotado" pontos={pontos} recorde={recordeAntes} detalhe={`${acertos} ${acertos === 1 ? "alvo abatido" : "alvos abatidos"}`} aoRepetir={aoRepetir} />;
  }

  return (
    <div className="flex flex-1 flex-col">
      <Placar
        meio={
          <span className={tempo <= 10 ? "text-erro" : ""}>
            <Icone nome="relogio" className="mr-1 inline size-5" />
            {tempo}s
          </span>
        }
        pontos={pontos}
      />
      <BarraDeTempo tempo={tempo} duracao={DURACAO} />

      <div className="mb-3 flex items-center justify-center gap-3">
        <span className="text-sm font-bold tracking-wide text-texto-2 uppercase">Acerte</span>
        <span key={rodada.numero} className="animate-pulo rounded-2xl border-2 border-ciano bg-ciano/15 px-5 py-2 font-titulo text-4xl font-bold text-ciano">
          {rodada.pedido}
        </span>
        {combo >= 2 && <span className="rounded-full bg-fogo px-2.5 py-1 text-sm font-bold text-fundo">×{combo}</span>}
      </div>

      <div ref={arena} className={`relative min-h-80 flex-1 touch-none overflow-hidden rounded-3xl border-2 bg-cartao/60 ${errados.length ? "border-erro/60" : "border-linha"}`}>
        {rodada.alvos.map((alvo, i) => (
          <button
            key={`${rodada.numero}-${i}`}
            ref={(el) => {
              botoes.current[i] = el;
            }}
            data-jogo
            disabled={errados.includes(i)}
            onPointerDown={() => atirar(i)}
            className="absolute top-0 left-0 flex items-center justify-center rounded-full border-4 border-rosa bg-fundo font-titulo text-xl font-bold shadow-[0_0_0_6px_var(--color-fundo),0_0_0_9px_var(--color-rosa)] disabled:opacity-25"
            style={{ width: TAMANHO, height: TAMANHO }}
          >
            {alvo.rotulo}
          </button>
        ))}
      </div>
      <p className="mt-2 text-center text-xs font-semibold text-texto-2">Tiro errado: −{MULTA}s</p>
    </div>
  );
}

function Mira() {
  const [partida, setPartida] = useState(0);
  if (partida === 0) return <Abertura id="mira" aoComecar={() => setPartida(1)} />;
  return <Partida key={partida} aoRepetir={() => setPartida((n) => n + 1)} />;
}

export default function PaginaMira() {
  return (
    <Casca foco>
      <Mira />
    </Casca>
  );
}
