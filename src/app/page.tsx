"use client";

import Link from "next/link";
import { Casca, Emblema } from "@/components/Casca";
import { Icone } from "@/components/Icone";
import { UNIDADES } from "@/conteudo/unidades";
import { useApp } from "@/lib/app";
import { CORES } from "@/lib/cores";
import { FASES, missoesDeHoje, nivelDoXp } from "@/lib/jogo";
import type { Progresso } from "@/lib/tipos";

/** A fase 1 abre quando a fase 1 da unidade anterior foi feita; as outras, quando a anterior da mesma unidade foi feita. */
function liberada(p: Progresso, unidade: number, nivel: number): boolean {
  if (nivel > 1) return Boolean(p.licoes[`${UNIDADES[unidade].id}:${nivel - 1}`]);
  return unidade === 0 || Boolean(p.licoes[`${UNIDADES[unidade - 1].id}:1`]);
}

/** Desvio lateral de cada bolinha, para a trilha fazer zigue-zague. */
const DESVIOS = [0, 52, 0, -52];

function Missoes() {
  const { progresso } = useApp();
  const missoes = missoesDeHoje(progresso);
  return (
    <section className="mt-3 rounded-2xl border border-linha bg-cartao p-4">
      <h2 className="mb-3 text-sm font-bold tracking-wide text-texto-2 uppercase">Missões de hoje</h2>
      <ul className="space-y-3">
        {missoes.map((m) => {
          const feita = m.feito >= m.alvo;
          return (
            <li key={m.id} className="flex items-center gap-3">
              <span className={`flex size-8 shrink-0 items-center justify-center rounded-full ${feita ? "bg-neon text-fundo" : "bg-cartao-2 text-texto-2"}`}>
                <Icone nome={feita ? "certo" : "alvo"} className="size-4" />
              </span>
              <div className="flex-1">
                <div className="flex items-baseline justify-between text-sm font-semibold">
                  <span className={feita ? "text-texto-2 line-through" : ""}>{m.texto}</span>
                  <span className="text-texto-2 tabular-nums">
                    {m.feito}/{m.alvo}
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-cartao-2">
                  <div className="h-full rounded-full bg-neon transition-all" style={{ width: `${(m.feito / m.alvo) * 100}%` }} />
                </div>
              </div>
              <span className={`flex items-center gap-0.5 text-sm font-bold tabular-nums ${feita ? "text-texto-2" : "text-ciano"}`}>
                <Icone nome="gema" className="size-4" />
                {m.gemas}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function Trilha() {
  const { usuario, progresso } = useApp();
  const { nivel, patente, fracao, falta } = nivelDoXp(progresso.xp);

  const nos = UNIDADES.flatMap((u, i) => FASES.map((f) => ({ chave: `${u.id}:${f.nivel}`, aberta: liberada(progresso, i, f.nivel) })));
  // A bolinha que chama para jogar: a primeira aberta ainda sem estrela.
  const atual = nos.find((n) => n.aberta && !progresso.licoes[n.chave])?.chave;

  return (
    <>
      <section className="mb-7">
        <div className="flex items-center gap-3 rounded-2xl border border-linha bg-cartao p-4">
          <Link href="/perfil" aria-label="Perfil">
            <Emblema id={progresso.emblema} className="size-14" />
          </Link>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-2">
              <h1 className="truncate text-xl font-bold">{usuario!.nome}</h1>
              <span className="shrink-0 text-sm font-bold text-ouro">
                {patente} · Nv {nivel}
              </span>
            </div>
            <div className="mt-2 h-3 overflow-hidden rounded-full bg-cartao-2">
              <div className="h-full rounded-full bg-ouro transition-all" style={{ width: `${fracao * 100}%` }} />
            </div>
            <p className="mt-1 text-xs font-semibold text-texto-2">faltam {falta} XP para o nível {nivel + 1}</p>
          </div>
        </div>
        <Missoes />
      </section>

      {UNIDADES.map((unidade, i) => {
        const cor = CORES[unidade.cor];
        return (
          <section key={unidade.id} className="mb-9">
            <div className={`flex items-center gap-3 rounded-2xl border-2 ${cor.borda} bg-cartao p-4`}>
              <span className={`flex size-12 shrink-0 items-center justify-center rounded-xl ${cor.suave}`}>
                <Icone nome={unidade.icone} className="size-7" />
              </span>
              <div className="min-w-0 flex-1">
                <p className={`text-xs font-bold tracking-wide uppercase ${cor.texto}`}>Unidade {i + 1}</p>
                <h2 className="text-lg leading-tight font-bold">{unidade.titulo}</h2>
                <p className="text-sm leading-snug text-texto-2">{unidade.descricao}</p>
              </div>
              <Link href={`/dica/${unidade.id}`} className="flex shrink-0 flex-col items-center gap-0.5 rounded-xl bg-cartao-2 px-3 py-2 text-[11px] font-bold text-texto-2">
                <Icone nome="lampada" className="size-5" />
                Dica
              </Link>
            </div>

            <ol className="mt-12 flex flex-col items-center gap-5">
              {FASES.map((fase, j) => {
                const chave = `${unidade.id}:${fase.nivel}`;
                const nota = progresso.licoes[chave] ?? 0;
                const aberta = liberada(progresso, i, fase.nivel);
                const desvio = { transform: `translateX(${DESVIOS[(i * 3 + j) % 4]}px)` };
                const bolinha = "relative flex size-[76px] items-center justify-center rounded-full";

                if (!aberta) {
                  return (
                    <li key={chave} style={desvio} className="flex flex-col items-center gap-1.5">
                      <span className={`${bolinha} bg-cartao-2 text-texto-2 shadow-[0_5px_0_var(--color-linha)]`} aria-label={`Fase ${fase.nome}: bloqueada`}>
                        <Icone nome="cadeado" className="size-7" />
                      </span>
                      <span className="text-xs font-bold text-texto-2">{fase.nome}</span>
                    </li>
                  );
                }
                return (
                  <li key={chave} style={desvio} className={`flex flex-col items-center gap-1.5 ${chave === atual && j > 0 ? "mt-8" : ""}`}>
                    <Link
                      href={`/licao/${unidade.id}/${fase.nivel}`}
                      aria-label={`Fase ${fase.nome}${nota ? `: ${nota} de 3 estrelas` : ""}`}
                      className={`${bolinha} ${cor.fundo} ${cor.sombra} text-fundo transition active:translate-y-[5px] active:shadow-none ${chave === atual ? "animate-flutuar" : ""}`}
                    >
                      {chave === atual && (
                        <span className={`absolute -top-9 rounded-xl border-2 ${cor.borda} bg-fundo px-2.5 py-1 font-titulo text-xs font-bold tracking-wide whitespace-nowrap uppercase ${cor.texto}`}>
                          Jogar
                        </span>
                      )}
                      <Icone nome={nota ? "certo" : unidade.icone} className="size-9" />
                    </Link>
                    <span className="flex items-center gap-1 text-xs font-bold text-texto-2">
                      {fase.nome}
                      {nota > 0 && (
                        <span className="flex">
                          {[1, 2, 3].map((n) => (
                            <span key={n} className={n <= nota ? "text-ouro" : "text-cartao-2"}>
                              <Icone nome="estrela" className="size-3.5" cheio />
                            </span>
                          ))}
                        </span>
                      )}
                    </span>
                  </li>
                );
              })}
            </ol>
          </section>
        );
      })}
    </>
  );
}

export default function Inicio() {
  return (
    <Casca>
      <Trilha />
    </Casca>
  );
}
