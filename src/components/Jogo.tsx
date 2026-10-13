"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useApp } from "@/lib/app";
import { CORES } from "@/lib/cores";
import { xpDaPartida } from "@/lib/jogo";
import { jogoDe } from "@/lib/jogos";
import type { IdJogo } from "@/lib/tipos";
import { Botao, estiloLinkSuave } from "./Casca";
import { Icone } from "./Icone";
import { Resultado } from "./Sessao";

/** O jogo, com o recorde atual e a função que fecha a partida (recorde, XP e missão do dia). */
export function usePartida(id: IdJogo) {
  const { progresso, encerrarPartida } = useApp();
  return {
    jogo: jogoDe(id),
    recorde: progresso.recordes[id],
    encerrar: (pontos: number) => encerrarPartida(id, pontos),
  };
}

/** Tela inicial de um jogo: explica a regra e espera o toque para começar. */
export function Abertura({ id, aoComecar }: { id: IdJogo; aoComecar: () => void }) {
  const { jogo, recorde } = usePartida(id);
  return (
    <div className="flex flex-1 flex-col justify-center text-center">
      <span className={`mx-auto mb-5 flex size-24 items-center justify-center rounded-3xl ${CORES[jogo.cor].fundo} text-fundo ${CORES[jogo.cor].sombra}`}>
        <Icone nome={jogo.icone} className="size-12" />
      </span>
      <h1 className="text-4xl font-bold uppercase">{jogo.nome}</h1>
      <p className="mx-auto mt-3 max-w-xs leading-relaxed text-texto-2">{jogo.regra}</p>
      {recorde !== undefined && (
        <p className="mt-4 flex items-center justify-center gap-1.5 font-bold text-ouro">
          <Icone nome="trofeu" /> Seu recorde: {recorde}
        </p>
      )}
      <div className="mt-8 space-y-3">
        <Botao cor={jogo.cor} onClick={aoComecar}>
          Começar
        </Botao>
        <Link href="/jogos" className={estiloLinkSuave}>
          Voltar
        </Link>
      </div>
    </div>
  );
}

/** Tela final de um jogo. `recorde` é o de antes da partida, para dizer se ele foi batido. */
export function FimDeJogo({ titulo, pontos, recorde, detalhe, aoRepetir }: { titulo: string; pontos: number; recorde: number | undefined; detalhe: string; aoRepetir: () => void }) {
  const bateu = recorde !== undefined && pontos > recorde;
  return (
    <Resultado
      titulo={bateu ? "Novo recorde!" : titulo}
      destaque={`${pontos} pts`}
      detalhe={
        <>
          <p>{detalhe}</p>
          <p className="mt-1 font-bold">
            <span className="text-ouro">+{xpDaPartida(pontos)} XP</span>
            <span className="text-texto-2"> · recorde {Math.max(pontos, recorde ?? 0)}</span>
          </p>
        </>
      }
      acoes={
        <>
          <Botao onClick={aoRepetir}>Jogar de novo</Botao>
          <Link href="/jogos" className={estiloLinkSuave}>
            Outros jogos
          </Link>
        </>
      }
    />
  );
}

/** Linha do topo de uma partida: sair, o que está no meio (rodada, tempo, vidas) e os pontos. */
export function Placar({ meio, pontos }: { meio: React.ReactNode; pontos: number }) {
  return (
    <div className="mb-4 flex items-center justify-between font-bold tabular-nums">
      <Link href="/jogos" aria-label="Sair" className="text-texto-2">
        <Icone nome="errado" className="size-6" />
      </Link>
      <span className="flex items-center gap-1.5">{meio}</span>
      <span className="font-titulo text-lg text-ouro">{pontos} pts</span>
    </div>
  );
}

export function Vidas({ vidas, total = 3 }: { vidas: number; total?: number }) {
  return (
    <span className="flex gap-0.5" aria-label={`${vidas} de ${total} vidas`}>
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={i < vidas ? "text-erro" : "text-cartao-2"}>
          <Icone nome="coracao" className="size-6" cheio />
        </span>
      ))}
    </span>
  );
}

/** Contagem regressiva em segundos; `perder` tira segundos como punição. */
export function useContagem(duracao: number) {
  const [tempo, setTempo] = useState(duracao);
  const acabou = tempo <= 0;
  useEffect(() => {
    if (acabou) return;
    const relogio = setInterval(() => setTempo((t) => t - 1), 1000);
    return () => clearInterval(relogio);
  }, [acabou]);
  return { tempo: Math.max(tempo, 0), acabou, perder: (segundos: number) => setTempo((t) => t - segundos) };
}

/** Barra de tempo dos jogos cronometrados. */
export function BarraDeTempo({ tempo, duracao }: { tempo: number; duracao: number }) {
  return (
    <div className="mb-4 h-2 overflow-hidden rounded-full bg-cartao-2">
      <div
        className={`h-full rounded-full transition-all duration-1000 ease-linear ${tempo <= 10 ? "bg-erro" : "bg-ciano"}`}
        style={{ width: `${(tempo / duracao) * 100}%` }}
      />
    </div>
  );
}
