"use client";

import Link from "next/link";
import { useState } from "react";
import { CORES } from "@/lib/cores";
import type { Unidade } from "@/lib/tipos";
import { Botao } from "./Casca";
import { Figura } from "./Figuras";
import { Icone } from "./Icone";

/** Os cartões de explicação de uma unidade, um por vez. */
export function Dicas({ unidade, sair, ultimo, aoFim }: { unidade: Unidade; sair: string; ultimo: string; aoFim: () => void }) {
  const [indice, setIndice] = useState(0);
  const dica = unidade.dicas[indice];
  const cor = CORES[unidade.cor];
  const fim = indice + 1 === unidade.dicas.length;

  return (
    <div className="flex flex-1 flex-col">
      <div className="mb-5 flex items-center gap-3">
        <Link href={sair} aria-label="Sair" className="text-texto-2">
          <Icone nome="errado" className="size-6" />
        </Link>
        <div className="flex flex-1 gap-1.5">
          {unidade.dicas.map((_, i) => (
            <span key={i} className={`h-1.5 flex-1 rounded-full ${i <= indice ? cor.fundo : "bg-cartao-2"}`} />
          ))}
        </div>
      </div>

      <div key={indice} className="animate-subir flex flex-1 flex-col justify-center">
        <p className={`mb-2 flex items-center gap-1.5 text-xs font-bold tracking-wide uppercase ${cor.texto}`}>
          <Icone nome="lampada" className="size-4" /> {unidade.titulo}
        </p>
        <h1 className="mb-4 text-3xl leading-tight font-bold">{dica.titulo}</h1>
        <Figura figura={dica.figura} className="mb-5" />
        <p className="text-lg leading-relaxed text-texto">{dica.texto}</p>
      </div>

      <div className="flex gap-3 pt-5 pb-2">
        {indice > 0 && (
          <Botao variante="suave" className="!w-auto" onClick={() => setIndice(indice - 1)} aria-label="Voltar">
            <Icone nome="voltar" className="size-6" />
          </Botao>
        )}
        <Botao cor={unidade.cor} onClick={() => (fim ? aoFim() : setIndice(indice + 1))}>
          {fim ? ultimo : "Entendi"}
        </Botao>
      </div>
    </div>
  );
}
