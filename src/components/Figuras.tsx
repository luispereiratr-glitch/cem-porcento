"use client";

import type { Figura as TipoFigura } from "@/lib/tipos";

/**
 * Grade 10 × 10 preenchida coluna por coluna, para cada coluna cheia valer 10%.
 * Com `aoMudar`, vira um campo de resposta: tocar num quadradinho pinta até ele.
 */
export function Grade({ pintadas, aoMudar, certas }: { pintadas: number; aoMudar?: (n: number) => void; certas?: number }) {
  return (
    <div
      className="mx-auto grid aspect-square w-full max-w-[19rem] grid-flow-col grid-cols-10 grid-rows-10 gap-[3px] rounded-2xl border border-linha bg-cartao p-2.5"
      role={aoMudar ? "group" : "img"}
      aria-label={aoMudar ? "Grade de 100 quadradinhos para pintar" : `Grade de 100 quadradinhos com ${pintadas} pintados`}
    >
      {Array.from({ length: 100 }, (_, i) => {
        const cor = i < pintadas ? "bg-ciano" : certas !== undefined && i < certas ? "bg-neon/40" : "bg-cartao-2";
        if (!aoMudar) return <span key={i} className={`rounded-[3px] ${cor}`} />;
        return (
          <button
            key={i}
            type="button"
            aria-label={`Pintar ${i + 1} quadradinhos`}
            // Tocar no último pintado apaga só ele, para dar para corrigir um a mais.
            onClick={() => aoMudar(i + 1 === pintadas ? i : i + 1)}
            className={`rounded-[3px] ${cor}`}
          />
        );
      })}
    </div>
  );
}

export function Figura({ figura, className = "" }: { figura?: TipoFigura; className?: string }) {
  if (!figura) return null;
  if (figura.tipo === "grade") {
    return (
      <div className={className}>
        <Grade pintadas={figura.pintadas} />
      </div>
    );
  }
  if (figura.tipo === "barra") {
    return (
      <div
        className={`flex h-12 gap-1 rounded-2xl border border-linha bg-cartao p-1.5 ${className}`}
        role="img"
        aria-label={`Barra com ${figura.partes} partes, ${figura.cheias} cheias`}
      >
        {Array.from({ length: figura.partes }, (_, i) => (
          <span key={i} className={`flex-1 rounded-lg ${i < figura.cheias ? "bg-neon" : "bg-cartao-2"}`} />
        ))}
      </div>
    );
  }
  return (
    <div className={`h-9 overflow-hidden rounded-full border border-linha bg-cartao p-1 ${className}`} role="img" aria-label="Barra de carregamento">
      <div className="h-full rounded-full bg-ciano" style={{ width: `${figura.pct}%` }} />
    </div>
  );
}

/** Teclado numérico na tela, para não abrir o teclado do celular por cima da questão. */
export function Teclado({ aoDigitar, aoApagar, compacto = false }: { aoDigitar: (d: string) => void; aoApagar: () => void; compacto?: boolean }) {
  const tecla = `rounded-xl border-2 border-linha bg-cartao font-titulo font-bold active:bg-cartao-2 ${compacto ? "py-2 text-xl" : "py-3 text-2xl"}`;
  return (
    <div className={`grid gap-2 ${compacto ? "grid-cols-6" : "grid-cols-3"}`}>
      {(compacto ? ["1", "2", "3", "4", "5", "", "6", "7", "8", "9", "0"] : ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0"]).map((d, i) =>
        d ? (
          <button key={d} type="button" onClick={() => aoDigitar(d)} className={tecla}>
            {d}
          </button>
        ) : compacto ? null : (
          <span key={`vazio-${i}`} />
        ),
      )}
      <button type="button" onClick={aoApagar} aria-label="Apagar" className={`${tecla} flex items-center justify-center text-texto-2 ${compacto ? "col-start-6 row-span-2 row-start-1" : ""}`}>
        <svg viewBox="0 0 24 24" className="size-7" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M9 6h11v12H9l-6-6zM12 10l4 4M16 10l-4 4" />
        </svg>
      </button>
    </div>
  );
}
