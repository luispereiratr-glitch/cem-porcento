"use client";

import { useState } from "react";
import { Botao, Casca, Emblema } from "@/components/Casca";
import { Icone, type NomeIcone } from "@/components/Icone";
import { HABILIDADES } from "@/conteudo/geradores";
import { UNIDADES } from "@/conteudo/unidades";
import { useApp } from "@/lib/app";
import { CORES } from "@/lib/cores";
import { EMBLEMAS, FASES, nivelDoXp, sequenciaAtiva, totais } from "@/lib/jogo";
import { JOGOS } from "@/lib/jogos";
import type { Progresso } from "@/lib/tipos";

function conquistas(p: Progresso): { nome: string; como: string; feita: boolean }[] {
  const fases = Object.keys(p.licoes).length;
  const perfeitas = Object.values(p.licoes).filter((n) => n === 3).length;
  const total = UNIDADES.length * FASES.length;
  return [
    { nome: "Primeiro passo", como: "Complete uma fase", feita: fases >= 1 },
    { nome: "Meio caminho", como: `Complete ${total / 2} fases`, feita: fases >= total / 2 },
    { nome: "Trilha zerada", como: `Complete as ${total} fases`, feita: fases >= total },
    { nome: "Perfeccionista", como: "Tire 3 estrelas em 10 fases", feita: perfeitas >= 10 },
    { nome: "Semana em chamas", como: "Jogue 7 dias seguidos", feita: p.dias.melhor >= 7 },
    { nome: "Centena", como: "Acerte 100 questões", feita: totais(p).acertos >= 100 },
    ...JOGOS.map((j) => ({ nome: j.conquista.nome, como: `${j.conquista.pontos} pontos em ${j.nome}`, feita: (p.recordes[j.id] ?? 0) >= j.conquista.pontos })),
  ];
}

function Numero({ icone, valor, rotulo, cor }: { icone: NomeIcone; valor: string | number; rotulo: string; cor: string }) {
  return (
    <div className="rounded-2xl border border-linha bg-cartao p-3">
      <Icone nome={icone} className={`size-5 ${cor}`} cheio />
      <p className="mt-1 font-titulo text-2xl font-bold tabular-nums">{valor}</p>
      <p className="text-xs font-semibold text-texto-2">{rotulo}</p>
    </div>
  );
}

const titulo = "mt-7 mb-3 text-sm font-bold tracking-wide text-texto-2 uppercase";

function Perfil() {
  const { usuario, progresso, modoLocal, usarEmblema, alternarSom, sair, zerar } = useApp();
  const [confirmando, setConfirmando] = useState(false);
  const { nivel, patente, fracao, falta } = nivelDoXp(progresso.xp);
  const { acertos, precisao } = totais(progresso);
  const lista = conquistas(progresso);

  return (
    <>
      <section className="flex items-center gap-4">
        <Emblema id={progresso.emblema} className="size-20" />
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-3xl font-bold">{usuario!.nome}</h1>
          <p className="font-bold text-ouro">
            {patente} · Nível {nivel}
          </p>
          <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-cartao-2">
            <div className="h-full rounded-full bg-ouro" style={{ width: `${fracao * 100}%` }} />
          </div>
          <p className="mt-1 text-xs font-semibold text-texto-2">
            {progresso.xp} XP · faltam {falta} para o próximo nível
          </p>
        </div>
      </section>

      <section className="mt-5 grid grid-cols-2 gap-3">
        <Numero icone="chama" valor={sequenciaAtiva(progresso)} rotulo="dias seguidos" cor="text-fogo" />
        <Numero icone="trofeu" valor={progresso.dias.melhor} rotulo="melhor sequência" cor="text-ouro" />
        <Numero icone="certo" valor={acertos} rotulo="questões certas" cor="text-neon" />
        <Numero icone="alvo" valor={precisao === null ? "–" : `${precisao}%`} rotulo="de acerto" cor="text-ciano" />
      </section>

      <h2 className={titulo}>Emblemas</h2>
      <ul className="grid grid-cols-3 gap-3">
        {EMBLEMAS.map((e) => {
          const meu = progresso.emblemas.includes(e.id);
          const emUso = progresso.emblema === e.id;
          const falta = e.preco - progresso.gemas;
          return (
            <li key={e.id}>
              <button
                onClick={() => usarEmblema(e.id)}
                disabled={emUso || (!meu && falta > 0)}
                aria-label={meu ? `Usar o emblema ${e.nome}` : `Comprar o emblema ${e.nome} por ${e.preco} gemas`}
                className={`flex w-full flex-col items-center gap-1.5 rounded-2xl border-2 bg-cartao p-3 ${emUso ? CORES[e.cor].borda : "border-linha"} ${!meu && falta > 0 ? "opacity-60" : ""}`}
              >
                <Emblema id={e.id} />
                <span className="text-sm font-bold">{e.nome}</span>
                {emUso ? (
                  <span className="text-xs font-bold text-neon">em uso</span>
                ) : meu ? (
                  <span className="text-xs font-bold text-texto-2">usar</span>
                ) : (
                  <span className="flex items-center gap-0.5 text-xs font-bold text-ciano">
                    <Icone nome="gema" className="size-3.5" />
                    {e.preco}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
      <p className="mt-2 text-xs text-texto-2">Gemas vêm das estrelas, das missões do dia e dos recordes nos jogos.</p>

      <h2 className={titulo}>
        Conquistas · {lista.filter((c) => c.feita).length}/{lista.length}
      </h2>
      <ul className="grid grid-cols-2 gap-2">
        {lista.map((c) => (
          <li key={c.nome} className={`rounded-2xl border bg-cartao p-3 ${c.feita ? "border-ouro" : "border-linha opacity-60"}`}>
            <p className={`flex items-center gap-1.5 text-sm font-bold ${c.feita ? "text-ouro" : ""}`}>
              <Icone nome={c.feita ? "trofeu" : "cadeado"} className="size-4 shrink-0" />
              {c.nome}
            </p>
            <p className="mt-0.5 text-xs leading-snug text-texto-2">{c.como}</p>
          </li>
        ))}
      </ul>

      <h2 className={titulo}>Seu mapa de habilidades</h2>
      <div className="space-y-4">
        {UNIDADES.map((u) => (
          <div key={u.id} className="rounded-2xl border border-linha bg-cartao p-4">
            <h3 className={`mb-2 font-bold ${CORES[u.cor].texto}`}>{u.titulo}</h3>
            <ul className="space-y-2.5">
              {u.habilidades.map((h) => {
                const r = progresso.habilidades[h];
                const taxa = r ? Math.round((100 * r.a) / (r.a + r.e)) : null;
                return (
                  <li key={h}>
                    <div className="flex items-baseline justify-between text-sm">
                      <span className="font-semibold">{HABILIDADES[h].nome}</span>
                      <span className="text-xs font-bold text-texto-2 tabular-nums">{taxa === null ? "ainda não jogou" : `${taxa}% · ${r!.a + r!.e} feitas`}</span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-cartao-2">
                      {taxa !== null && <div className={`h-full rounded-full ${taxa >= 80 ? "bg-neon" : taxa >= 50 ? "bg-ouro" : "bg-erro"}`} style={{ width: `${Math.max(taxa, 4)}%` }} />}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      <h2 className={titulo}>Ajustes</h2>
      <div className="space-y-3">
        <Botao variante="suave" onClick={alternarSom}>
          <span className="flex items-center justify-center gap-2">
            <Icone nome={progresso.som ? "som" : "mudo"} /> Som {progresso.som ? "ligado" : "desligado"}
          </span>
        </Botao>
        <Botao variante="suave" onClick={sair}>
          {modoLocal ? "Trocar de jogador" : "Sair da conta"}
        </Botao>
        {confirmando ? (
          <div className="rounded-2xl border-2 border-erro bg-erro/10 p-4">
            <p className="mb-3 font-semibold">Apagar todo o progresso? XP, estrelas, gemas e recordes voltam a zero e não dá para desfazer.</p>
            <div className="flex gap-3">
              <Botao variante="suave" onClick={() => setConfirmando(false)}>
                Cancelar
              </Botao>
              <Botao
                cor="rosa"
                onClick={() => {
                  zerar();
                  setConfirmando(false);
                }}
              >
                Apagar
              </Botao>
            </div>
          </div>
        ) : (
          <button onClick={() => setConfirmando(true)} className="w-full py-2 text-sm font-bold text-texto-2 underline underline-offset-4">
            Zerar progresso
          </button>
        )}
      </div>
    </>
  );
}

export default function PaginaPerfil() {
  return (
    <Casca>
      <Perfil />
    </Casca>
  );
}
