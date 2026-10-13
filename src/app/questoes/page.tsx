"use client";

import { useState } from "react";
import { Botao, Casca } from "@/components/Casca";
import { Icone, type NomeIcone } from "@/components/Icone";
import { type Fim, Resultado, Sessao } from "@/components/Sessao";
import { montar } from "@/conteudo/geradores";
import { TODAS_HABILIDADES, UNIDADES } from "@/conteudo/unidades";
import { useApp } from "@/lib/app";
import { CORES } from "@/lib/cores";
import { FASES, xpDoNivel } from "@/lib/jogo";
import type { Cor, Exercicio, Nivel, Progresso } from "@/lib/tipos";

const QUANTAS = 10;

/** As habilidades com mais erro, da pior para a melhor. Vazio enquanto a pessoa não errou nada. */
function pontosFracos(p: Progresso): string[] {
  return TODAS_HABILIDADES.filter((h) => (p.habilidades[h]?.e ?? 0) > 0)
    .sort((x, y) => {
      const taxa = (h: string) => p.habilidades[h].e / (p.habilidades[h].a + p.habilidades[h].e);
      return taxa(y) - taxa(x);
    })
    .slice(0, 5);
}

/** `aoFocar` avisa a página para esconder a navegação enquanto há questões na tela. */
function Treino({ aoFocar }: { aoFocar: (foco: boolean) => void }) {
  const { progresso } = useApp();
  const [tema, setTema] = useState("tudo");
  const [nivel, setNivel] = useState<Nivel>(1);
  const [exercicios, setExercicios] = useState<Exercicio[] | null>(null);
  const [rodada, setRodada] = useState(0);
  const [fim, setFim] = useState<Fim | null>(null);

  const fracos = pontosFracos(progresso);
  const temas: { id: string; nome: string; icone: NomeIcone; cor: Cor; habilidades: string[]; aviso?: string }[] = [
    { id: "tudo", nome: "Tudo misturado", icone: "porcento", cor: "fogo", habilidades: TODAS_HABILIDADES },
    {
      id: "fracos",
      nome: "Meus pontos fracos",
      icone: "alvo",
      cor: "rosa",
      habilidades: fracos,
      aviso: fracos.length ? undefined : "Aparece depois dos primeiros erros",
    },
    ...UNIDADES.map((u) => ({ id: u.id, nome: u.titulo, icone: u.icone, cor: u.cor, habilidades: u.habilidades })),
  ];
  const escolhido = temas.find((t) => t.id === tema)!;

  function comecar() {
    setExercicios(montar(escolhido.habilidades, nivel, QUANTAS));
    setFim(null);
    setRodada((r) => r + 1);
    aoFocar(true);
  }

  function voltar() {
    setExercicios(null);
    setFim(null);
    aoFocar(false);
  }

  if (fim) {
    return (
      <Resultado
        titulo="Treino concluído"
        destaque={`${fim.acertos}/${fim.total}`}
        detalhe={<p className="font-bold text-ouro">+{fim.acertos * xpDoNivel(nivel)} XP</p>}
        acoes={
          <>
            <Botao onClick={comecar}>Mais {QUANTAS} questões</Botao>
            <Botao variante="suave" onClick={voltar}>
              Escolher outro tema
            </Botao>
          </>
        }
      />
    );
  }

  if (exercicios) return <Sessao key={rodada} exercicios={exercicios} xp={xpDoNivel(nivel)} sair={voltar} aoFim={setFim} />;

  return (
    <div className="flex flex-1 flex-col">
      <h1 className="mb-1 text-[28px] font-bold">Questões</h1>
      <p className="mb-5 text-texto-2">Treino livre: {QUANTAS} questões do tema que você escolher, com a resolução de cada uma.</p>

      <h2 className="mb-2 text-sm font-bold tracking-wide text-texto-2 uppercase">Tema</h2>
      <ul className="mb-6 space-y-2">
        {temas.map((t) => {
          const marcado = t.id === tema;
          return (
            <li key={t.id}>
              <button
                disabled={t.habilidades.length === 0}
                onClick={() => setTema(t.id)}
                aria-pressed={marcado}
                className={`flex w-full items-center gap-3 rounded-2xl border-2 bg-cartao p-3 text-left transition disabled:opacity-50 ${marcado ? CORES[t.cor].borda : "border-linha"}`}
              >
                <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${CORES[t.cor].suave}`}>
                  <Icone nome={t.icone} className="size-6" />
                </span>
                <span className="flex-1">
                  <span className="block font-bold">{t.nome}</span>
                  {t.aviso && <span className="block text-xs text-texto-2">{t.aviso}</span>}
                </span>
                {marcado && <Icone nome="certo" className={`size-6 ${CORES[t.cor].texto}`} />}
              </button>
            </li>
          );
        })}
      </ul>

      <h2 className="mb-2 text-sm font-bold tracking-wide text-texto-2 uppercase">Dificuldade</h2>
      <div className="mb-6 grid grid-cols-3 gap-2">
        {FASES.map((f) => (
          <button
            key={f.nivel}
            onClick={() => setNivel(f.nivel)}
            aria-pressed={f.nivel === nivel}
            className={`rounded-2xl border-2 bg-cartao py-3 font-bold ${f.nivel === nivel ? "border-ouro text-ouro" : "border-linha text-texto-2"}`}
          >
            {f.nome}
            <span className="block text-xs font-semibold">{f.xp} XP</span>
          </button>
        ))}
      </div>

      <div className="sticky bottom-24 mt-auto">
        <Botao onClick={comecar}>Começar treino</Botao>
      </div>
    </div>
  );
}

export default function PaginaQuestoes() {
  const [foco, setFoco] = useState(false);
  return (
    <Casca foco={foco}>
      <Treino aoFocar={setFoco} />
    </Casca>
  );
}
