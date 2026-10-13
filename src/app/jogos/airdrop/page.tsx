"use client";

import { useEffect, useRef, useState } from "react";
import { Casca } from "@/components/Casca";
import { Teclado } from "@/components/Figuras";
import { Icone } from "@/components/Icone";
import { Abertura, FimDeJogo, Placar, usePartida, Vidas } from "@/components/Jogo";
import { entre, um, vibrar } from "@/lib/jogo";
import { tocar } from "@/lib/som";

const MAXIMO_NA_TELA = 4;

type Caixa = {
  id: number;
  texto: string;
  valor: number;
  /** Posição horizontal, de 0 (esquerda) a 1 (direita). */
  x: number;
  /** Segundos até tocar o chão. */
  queda: number;
  /** Preenchido quando a caixa foi acertada: a altura em que ela estava, para estourar ali mesmo. */
  topo?: number;
};

/** Contas possíveis: [porcentagem, base], sempre com resultado inteiro. Entram contas novas conforme os acertos sobem. */
const CONTAS: (() => [number, number])[][] = [
  [() => [50, 2 * entre(2, 30)], () => [10, 10 * entre(1, 30)]],
  [() => [25, 4 * entre(1, 25)], () => [20, 10 * entre(1, 15)], () => [1, 100 * entre(1, 9)]],
  [() => [5, 20 * entre(1, 10)], () => [30, 10 * entre(1, 12)], () => [75, 4 * entre(1, 15)]],
];

/**
 * Sorteia uma caixa cujo resultado não começa igual ao de nenhuma outra na tela (nem o contrário):
 * assim, o que a pessoa digita nunca serve para duas caixas. Devolve `null` se não achar.
 */
function sortearCaixa(id: number, acertos: number, naTela: Caixa[]): Caixa | null {
  const contas = CONTAS.slice(0, acertos < 5 ? 1 : acertos < 12 ? 2 : 3).flat();
  for (let tentativa = 0; tentativa < 30; tentativa++) {
    const [p, n] = um(contas)();
    const valor = (p * n) / 100;
    const escrito = String(valor);
    if (naTela.some((c) => String(c.valor).startsWith(escrito) || escrito.startsWith(String(c.valor)))) continue;
    return { id, texto: `${p}% de ${n}`, valor, x: Math.random(), queda: Math.max(5.5, 11 - acertos * 0.18) };
  }
  return null;
}

function Partida({ aoRepetir }: { aoRepetir: () => void }) {
  const { recorde, encerrar } = usePartida("airdrop");
  const [recordeAntes] = useState(recorde);
  const [caixas, setCaixas] = useState<Caixa[]>([]);
  const [digitado, setDigitado] = useState("");
  const [vidas, setVidas] = useState(3);
  const [pontos, setPontos] = useState(0);
  const [acertos, setAcertos] = useState(0);
  const [combo, setCombo] = useState(0);
  const [errou, setErrou] = useState(0);
  const [nascidas, setNascidas] = useState(0);
  const [fim, setFim] = useState(false);
  const elementos = useRef(new Map<number, HTMLDivElement>());

  // Uma caixa nova de tempos em tempos, cada vez mais depressa.
  useEffect(() => {
    if (fim) return;
    const relogio = setTimeout(
      () => {
        setCaixas((atuais) => {
          if (atuais.length >= MAXIMO_NA_TELA) return atuais;
          const nova = sortearCaixa(nascidas, acertos, atuais);
          return nova ? [...atuais, nova] : atuais;
        });
        setNascidas((n) => n + 1);
      },
      nascidas === 0 ? 500 : Math.max(1500, 2800 - acertos * 70),
    );
    return () => clearTimeout(relogio);
    // O intervalo é contado a partir da última caixa; um acerto no meio não reinicia a espera.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nascidas, fim]);

  function tocouOChao(id: number) {
    setCaixas((atuais) => atuais.filter((c) => c.id !== id));
    setDigitado("");
    setCombo(0);
    vibrar(false);
    tocar("errado");
    if (vidas - 1 <= 0) {
      encerrar(pontos);
      setFim(true);
    }
    setVidas(vidas - 1);
  }

  function digitar(d: string) {
    if (fim) return;
    const novo = digitado + d;
    const vivas = caixas.filter((c) => c.topo === undefined);
    const alvo = vivas.find((c) => String(c.valor) === novo);
    if (alvo) {
      const topo = elementos.current.get(alvo.id)?.offsetTop ?? 0;
      setCaixas((atuais) => atuais.map((c) => (c.id === alvo.id ? { ...c, topo } : c)));
      setPontos((p) => p + 10 + Math.min(combo, 10));
      setAcertos((n) => n + 1);
      setCombo((n) => n + 1);
      setDigitado("");
      vibrar(true);
      tocar("certo");
    } else if (vivas.some((c) => String(c.valor).startsWith(novo))) {
      setDigitado(novo);
      tocar("toque");
    } else {
      // Nenhuma caixa começa assim: o número está errado.
      setDigitado("");
      setCombo(0);
      setErrou((n) => n + 1);
      tocar("errado");
    }
  }

  // Teclado físico, para quem joga no computador.
  useEffect(() => {
    const tecla = (e: KeyboardEvent) => {
      if (/^\d$/.test(e.key)) digitar(e.key);
      else if (e.key === "Backspace") setDigitado((t) => t.slice(0, -1));
    };
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  });

  if (fim) {
    return <FimDeJogo titulo="As caixas venceram" pontos={pontos} recorde={recordeAntes} detalhe={`${acertos} ${acertos === 1 ? "caixa estourada" : "caixas estouradas"}`} aoRepetir={aoRepetir} />;
  }

  return (
    <div className="flex flex-1 flex-col">
      <Placar meio={<Vidas vidas={vidas} />} pontos={pontos} />

      <div className="relative min-h-64 flex-1 overflow-hidden rounded-3xl border-2 border-linha border-b-erro bg-cartao/60">
        {caixas.map((caixa) => (
          <div
            key={caixa.id}
            ref={(el) => {
              if (el) elementos.current.set(caixa.id, el);
              else elementos.current.delete(caixa.id);
            }}
            data-jogo
            onAnimationEnd={(e) => {
              if (e.animationName === "cair") tocouOChao(caixa.id);
              else setCaixas((atuais) => atuais.filter((c) => c.id !== caixa.id));
            }}
            className={`absolute flex w-36 flex-col items-center ${caixa.topo === undefined ? "" : "animate-estourar"}`}
            style={{
              left: `calc(${caixa.x} * (100% - 9rem))`,
              ...(caixa.topo === undefined ? { animation: `cair ${caixa.queda}s linear both` } : { top: caixa.topo }),
            }}
          >
            <Icone nome="cima" className="size-5 rotate-180 text-texto-2" />
            <span className={`w-full rounded-xl border-2 py-2 text-center font-titulo text-lg font-bold ${caixa.topo === undefined ? "border-fogo bg-fundo text-texto" : "border-neon bg-neon text-fundo"}`}>
              {caixa.texto}
            </span>
          </div>
        ))}
        {combo >= 2 && <span className="absolute top-3 right-3 rounded-full bg-fogo px-2.5 py-1 text-sm font-bold text-fundo">×{combo}</span>}
      </div>

      <div
        key={errou}
        className={`my-3 flex h-14 items-center justify-center rounded-2xl border-2 bg-cartao font-titulo text-3xl font-bold ${errou ? "animate-tremer border-erro" : "border-linha"}`}
        aria-live="polite"
        onAnimationEnd={() => setErrou(0)}
      >
        {digitado || <span className="text-base font-semibold text-texto-2">digite o resultado</span>}
      </div>
      <Teclado compacto aoDigitar={digitar} aoApagar={() => setDigitado((t) => t.slice(0, -1))} />
    </div>
  );
}

function Airdrop() {
  const [partida, setPartida] = useState(0);
  if (partida === 0) return <Abertura id="airdrop" aoComecar={() => setPartida(1)} />;
  return <Partida key={partida} aoRepetir={() => setPartida((n) => n + 1)} />;
}

export default function PaginaAirdrop() {
  return (
    <Casca foco>
      <Airdrop />
    </Casca>
  );
}
