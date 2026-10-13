"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useApp } from "@/lib/app";
import { embaralhar, um, vibrar } from "@/lib/jogo";
import { tocar } from "@/lib/som";
import type { Exercicio } from "@/lib/tipos";
import { Botao } from "./Casca";
import { Figura, Grade, Teclado } from "./Figuras";
import { Icone } from "./Icone";

export type Fim = { acertos: number; total: number };

const ELOGIOS = ["Na mosca!", "Mandou bem!", "Isso aí!", "Boa!", "Certeiro!"];
const CONSOLOS = ["Quase!", "Não foi dessa vez", "Olha só como faz"];

type Resposta = { acertou: boolean; titulo: string };

function Escolha({ ex, respondida, aoResponder }: { ex: Extract<Exercicio, { tipo: "escolha" }>; respondida: boolean; aoResponder: (acertou: boolean) => void }) {
  const opcoes = useMemo(() => embaralhar(ex.alternativas.map((texto, i) => ({ texto, certa: i === 0 }))), [ex]);
  const [escolha, setEscolha] = useState<number | null>(null);
  return (
    <div className={opcoes.every((o) => o.texto.length <= 9) ? "grid grid-cols-2 gap-2.5" : "space-y-2.5"}>
      {opcoes.map((op, i) => {
        let estado = "border-linha bg-cartao";
        if (respondida && op.certa) estado = "border-neon bg-neon/15 animate-pulo";
        else if (respondida && i === escolha) estado = "border-erro bg-erro/15 animate-tremer";
        else if (respondida) estado = "border-linha bg-cartao opacity-50";
        return (
          <button
            key={op.texto}
            disabled={respondida}
            onClick={() => {
              setEscolha(i);
              aoResponder(op.certa);
            }}
            className={`w-full rounded-2xl border-2 px-4 py-4 text-center font-titulo text-xl font-semibold transition ${estado}`}
          >
            {op.texto}
          </button>
        );
      })}
    </div>
  );
}

function Digitar({ ex, respondida, aoResponder }: { ex: Extract<Exercicio, { tipo: "digitar" }>; respondida: boolean; aoResponder: (acertou: boolean) => void }) {
  const [texto, setTexto] = useState("");

  useEffect(() => {
    if (respondida) return;
    const tecla = (e: KeyboardEvent) => {
      if (/^\d$/.test(e.key)) setTexto((t) => (t.length < 6 ? t + e.key : t));
      else if (e.key === "Backspace") setTexto((t) => t.slice(0, -1));
      else if (e.key === "Enter" && texto) aoResponder(Number(texto) === ex.resposta);
    };
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, [respondida, texto, ex, aoResponder]);

  return (
    <div className="mt-auto space-y-3">
      <div className="flex items-baseline justify-center gap-2 rounded-2xl border-2 border-linha bg-cartao px-4 py-3 font-titulo text-3xl font-bold" aria-live="polite">
        {ex.prefixo && <span className="text-xl text-texto-2">{ex.prefixo}</span>}
        <span className={texto ? "" : "text-linha"}>{texto || "?"}</span>
        {ex.sufixo && <span className="text-xl text-texto-2">{ex.sufixo}</span>}
      </div>
      {!respondida && (
        <>
          <Teclado aoDigitar={(d) => setTexto((t) => (t.length < 6 ? t + d : t))} aoApagar={() => setTexto((t) => t.slice(0, -1))} />
          <Botao disabled={!texto} onClick={() => aoResponder(Number(texto) === ex.resposta)}>
            Conferir
          </Botao>
        </>
      )}
    </div>
  );
}

function Pintar({ ex, respondida, aoResponder }: { ex: Extract<Exercicio, { tipo: "pintar" }>; respondida: boolean; aoResponder: (acertou: boolean) => void }) {
  const [pintadas, setPintadas] = useState(0);
  return (
    <div className="flex flex-1 flex-col gap-4">
      <Grade pintadas={pintadas} aoMudar={respondida ? undefined : setPintadas} certas={respondida ? ex.resposta : undefined} />
      {!respondida && (
        <>
          <p className="text-center text-sm text-texto-2">Toque num quadradinho para pintar até ele.</p>
          <div className="mt-auto">
            <Botao disabled={pintadas === 0} onClick={() => aoResponder(pintadas === ex.resposta)}>
              Conferir
            </Botao>
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Roda uma lista de exercícios, um por vez, com a resolução depois de cada resposta.
 * O que for errado volta no fim da fila até ser acertado; para as estrelas conta só a primeira tentativa.
 */
export function Sessao({ exercicios, xp, sair, aoFim }: { exercicios: Exercicio[]; xp: number; /** Rota para onde o X leva, ou o que ele faz. */ sair: string | (() => void); aoFim: (fim: Fim) => void }) {
  const { responder } = useApp();
  const [fila, setFila] = useState(exercicios);
  const [indice, setIndice] = useState(0);
  const [resposta, setResposta] = useState<Resposta | null>(null);
  const [acertos, setAcertos] = useState(0);
  const [resolvidos, setResolvidos] = useState(0);
  const [seguidas, setSeguidas] = useState(0);

  const total = exercicios.length;
  const ex = fila[indice];
  const repetida = indice >= total;

  function conferir(acertou: boolean) {
    if (resposta) return;
    setResposta({ acertou, titulo: um(acertou ? ELOGIOS : CONSOLOS) });
    // Na segunda chance o exercício não rende XP nem conta de novo nas estatísticas.
    if (!repetida) responder(ex.habilidade, acertou, xp);
    vibrar(acertou);
    tocar(acertou ? "certo" : "errado");
    if (acertou) {
      setResolvidos((n) => n + 1);
      setSeguidas((n) => n + 1);
      if (!repetida) setAcertos((n) => n + 1);
    } else {
      setSeguidas(0);
      setFila((f) => [...f, ex]);
    }
  }

  function continuar() {
    if (indice + 1 < fila.length) {
      setIndice(indice + 1);
      setResposta(null);
    } else {
      aoFim({ acertos, total });
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="mb-5 flex items-center gap-3">
        {typeof sair === "string" ? (
          <Link href={sair} aria-label="Sair" className="text-texto-2">
            <Icone nome="errado" className="size-6" />
          </Link>
        ) : (
          <button onClick={sair} aria-label="Sair" className="text-texto-2">
            <Icone nome="errado" className="size-6" />
          </button>
        )}
        <div className="h-4 flex-1 overflow-hidden rounded-full bg-cartao-2">
          <div className="h-full rounded-full bg-neon transition-all duration-300" style={{ width: `${(resolvidos / total) * 100}%` }} />
        </div>
        {seguidas >= 3 ? (
          <span key={seguidas} className="animate-pulo flex items-center gap-1 text-sm font-bold text-fogo tabular-nums">
            <Icone nome="chama" className="size-4" cheio /> {seguidas}
          </span>
        ) : (
          <span className="text-sm font-bold text-texto-2 tabular-nums">
            {resolvidos}/{total}
          </span>
        )}
      </div>

      <div key={indice} className="animate-subir flex flex-1 flex-col">
        {repetida && <p className="mb-2 text-xs font-bold tracking-wide text-fogo uppercase">Segunda chance</p>}
        <h2 className="mb-5 text-[21px] leading-snug font-semibold">{ex.enunciado}</h2>
        <Figura figura={ex.figura} className="mb-5" />
        {ex.tipo === "escolha" && <Escolha ex={ex} respondida={resposta !== null} aoResponder={conferir} />}
        {ex.tipo === "digitar" && <Digitar ex={ex} respondida={resposta !== null} aoResponder={conferir} />}
        {ex.tipo === "pintar" && <Pintar ex={ex} respondida={resposta !== null} aoResponder={conferir} />}

        {resposta && (
          <div
            className={`animate-subir mt-5 rounded-2xl border-2 p-4 ${resposta.acertou ? "border-neon/40 bg-neon/10" : "border-erro/40 bg-erro/10"}`}
            aria-live="polite"
          >
            <p className={`mb-2 flex items-center gap-2 font-titulo text-xl font-bold ${resposta.acertou ? "text-neon" : "text-erro"}`}>
              <Icone nome={resposta.acertou ? "certo" : "errado"} className="size-6" />
              {resposta.titulo}
            </p>
            {ex.tipo === "digitar" && !resposta.acertou && (
              <p className="mb-2 font-semibold">
                Resposta certa: {ex.prefixo} {ex.resposta.toLocaleString("pt-BR")} {ex.sufixo}
              </p>
            )}
            {ex.tipo === "pintar" && !resposta.acertou && <p className="mb-2 font-semibold">O certo eram {ex.resposta} quadradinhos (em verde).</p>}
            <ol className="space-y-1 text-[15px] leading-relaxed text-texto">
              {ex.passos.map((passo, i) => (
                <li key={i} className="flex gap-2">
                  <span className="font-bold text-texto-2">{i + 1}.</span>
                  <span>{passo}</span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>

      {resposta && (
        <div className="sticky bottom-0 -mx-5 mt-5 bg-gradient-to-t from-fundo from-70% px-5 pt-4 pb-5">
          <Botao onClick={continuar} autoFocus cor={resposta.acertou ? "neon" : "fogo"}>
            {indice + 1 < fila.length ? "Continuar" : "Ver resultado"}
          </Botao>
        </div>
      )}
    </div>
  );
}

export function Resultado({
  titulo,
  destaque,
  detalhe,
  estrelas,
  acoes,
}: {
  titulo: string;
  destaque: string;
  detalhe?: React.ReactNode;
  estrelas?: number;
  acoes: React.ReactNode;
}) {
  useEffect(() => tocar("vitoria"), []);
  return (
    <div className="animate-subir flex flex-1 flex-col">
      <div className="flex flex-1 flex-col justify-center py-8 text-center">
        {estrelas !== undefined && (
          <div className="mb-5 flex justify-center gap-2">
            {[1, 2, 3].map((n) => (
              <span key={n} className={`animate-pulo ${n <= estrelas ? "text-ouro" : "text-cartao-2"} ${n === 2 ? "-translate-y-2" : ""}`} style={{ animationDelay: `${n * 0.15}s` }}>
                <Icone nome="estrela" className="size-14" cheio />
              </span>
            ))}
          </div>
        )}
        <h1 className="text-2xl font-bold uppercase">{titulo}</h1>
        <p className="mt-2 font-titulo text-6xl font-bold text-neon">{destaque}</p>
        {detalhe && <div className="mt-3 text-texto-2">{detalhe}</div>}
      </div>
      <div className="space-y-3 pb-2">{acoes}</div>
    </div>
  );
}
