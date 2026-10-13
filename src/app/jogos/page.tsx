"use client";

import Link from "next/link";
import { Casca } from "@/components/Casca";
import { Icone } from "@/components/Icone";
import { useApp } from "@/lib/app";
import { CORES } from "@/lib/cores";
import { JOGOS } from "@/lib/jogos";

function Lista() {
  const { progresso } = useApp();
  return (
    <>
      <h1 className="mb-1 text-[28px] font-bold">Jogos</h1>
      <p className="mb-5 text-texto-2">Partidas curtas. Todas rendem XP e contam para a sequência de dias.</p>
      <ul className="space-y-3">
        {JOGOS.map((jogo) => {
          const recorde = progresso.recordes[jogo.id];
          return (
            <li key={jogo.id}>
              <Link href={`/jogos/${jogo.id}`} className="flex items-center gap-4 rounded-2xl border border-linha bg-cartao p-4 transition active:scale-[0.98]">
                <span className={`flex size-16 shrink-0 items-center justify-center rounded-2xl ${CORES[jogo.cor].fundo} text-fundo ${CORES[jogo.cor].sombra}`}>
                  <Icone nome={jogo.icone} className="size-8" />
                </span>
                <span className="flex-1">
                  <span className="block font-titulo text-xl font-bold">{jogo.nome}</span>
                  <span className="block text-sm leading-snug text-texto-2">{jogo.descricao}</span>
                  {recorde !== undefined && (
                    <span className="mt-1 flex items-center gap-1 text-xs font-bold text-ouro">
                      <Icone nome="trofeu" className="size-4" /> Recorde: {recorde}
                    </span>
                  )}
                </span>
                <Icone nome="seta" className="size-5 text-texto-2" />
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}

export default function Jogos() {
  return (
    <Casca>
      <Lista />
    </Casca>
  );
}
