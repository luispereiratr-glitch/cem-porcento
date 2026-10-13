"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useState } from "react";
import { Botao, Casca, estiloBotaoLink, estiloLinkSuave } from "@/components/Casca";
import { Dicas } from "@/components/Dicas";
import { Icone } from "@/components/Icone";
import { type Fim, Resultado, Sessao } from "@/components/Sessao";
import { montar } from "@/conteudo/geradores";
import { UNIDADES, unidadeDe } from "@/conteudo/unidades";
import { useApp } from "@/lib/app";
import { BONUS_FASE, estrelas, FASES, GEMAS_POR_ESTRELA, xpDoNivel } from "@/lib/jogo";
import type { Nivel } from "@/lib/tipos";

const POR_FASE = 8;

function Fase() {
  const { unidade: id, fase } = useParams<{ unidade: string; fase: string }>();
  const { progresso, concluirFase } = useApp();
  const unidade = unidadeDe(id);
  const dados = FASES.find((f) => String(f.nivel) === fase);
  const nivel = (dados?.nivel ?? 1) as Nivel;

  const sortear = () => (unidade ? montar(unidade.habilidades, nivel, POR_FASE) : []);
  const [exercicios, setExercicios] = useState(sortear);
  const [rodada, setRodada] = useState(0);
  // A explicação abre sozinha na primeira vez que a pessoa entra na unidade.
  const [naDica, setNaDica] = useState(() => nivel === 1 && !progresso.licoes[`${id}:1`]);
  const [fim, setFim] = useState<(Fim & { nota: number; gemas: number }) | null>(null);

  if (!unidade || !dados) notFound();

  const chave = `${unidade.id}:${nivel}`;

  function terminar(resultado: Fim) {
    const nota = estrelas(resultado.acertos, resultado.total);
    const gemas = Math.max(0, nota - (progresso.licoes[chave] ?? 0)) * GEMAS_POR_ESTRELA;
    concluirFase(chave, nota);
    setFim({ ...resultado, nota, gemas });
  }

  function repetir() {
    setExercicios(sortear());
    setFim(null);
    setRodada((r) => r + 1);
  }

  if (naDica) return <Dicas unidade={unidade} sair="/" ultimo="Bora jogar" aoFim={() => setNaDica(false)} />;

  if (fim) {
    const proxima = nivel < 3 ? `/licao/${unidade.id}/${nivel + 1}` : UNIDADES[UNIDADES.indexOf(unidade) + 1] && `/licao/${UNIDADES[UNIDADES.indexOf(unidade) + 1].id}/1`;
    return (
      <Resultado
        titulo={fim.nota === 3 ? "Fase perfeita" : "Fase concluída"}
        destaque={`${fim.acertos}/${fim.total}`}
        estrelas={fim.nota}
        detalhe={
          <p className="flex items-center justify-center gap-4 font-bold">
            <span className="text-ouro">+{fim.acertos * xpDoNivel(nivel) + BONUS_FASE} XP</span>
            {fim.gemas > 0 && (
              <span className="flex items-center gap-1 text-ciano">
                <Icone nome="gema" className="size-4" /> +{fim.gemas}
              </span>
            )}
          </p>
        }
        acoes={
          <>
            {proxima && (
              <Link href={proxima} className={estiloBotaoLink}>
                Próxima fase
              </Link>
            )}
            <Botao variante="suave" onClick={repetir}>
              {fim.nota < 3 ? "Tentar 3 estrelas" : "Jogar de novo"}
            </Botao>
            <Link href="/" className={estiloLinkSuave}>
              Voltar à trilha
            </Link>
          </>
        }
      />
    );
  }

  return <Sessao key={rodada} exercicios={exercicios} xp={dados.xp} sair="/" aoFim={terminar} />;
}

/** Trocar de fase pela URL recomeça tudo: exercícios novos e placar zerado. */
function FaseDaUrl() {
  const { unidade, fase } = useParams<{ unidade: string; fase: string }>();
  return <Fase key={`${unidade}:${fase}`} />;
}

export default function PaginaFase() {
  return (
    <Casca foco>
      <FaseDaUrl />
    </Casca>
  );
}
