"use client";

import { useEffect, useRef, useState } from "react";
import { Casca } from "@/components/Casca";
import { Icone } from "@/components/Icone";
import { Abertura, BarraDeTempo, FimDeJogo, Placar, useContagem, usePartida } from "@/components/Jogo";
import { fmt } from "@/conteudo/geradores";
import { embaralhar, entre, um, vibrar } from "@/lib/jogo";
import { tocar } from "@/lib/som";

const DURACAO = 60;

/** `taxa` negativa é desconto; positiva é taxa de entrega, que encarece. */
type Oferta = { nome: string; preco: number; taxa: number; final: number };

const NOMES = ["Skin Dragão", "Skin Neon", "Passe Elite", "Pacote Ninja", "Skin Gelo", "Emote Lendário", "Mochila Turbo", "Capa Sombria"];

function oferta(nome: string, preco: number, taxa: number): Oferta {
  return { nome, preco, taxa, final: preco + (preco * taxa) / 100 };
}

/** Duas ofertas com preços finais diferentes. A dificuldade sobe com os acertos. */
function sortearPar(acertos: number): [Oferta, Oferta] {
  const [nomeA, nomeB] = embaralhar(NOMES);
  // Preços múltiplos de 20 deixam todo desconto de 5 em 5 por cento inteiro.
  const preco = () => 20 * entre(2, acertos < 5 ? 10 : 20);
  for (;;) {
    let a: Oferta;
    let b: Oferta;
    if (acertos < 4) {
      // Aquecimento: uma oferta com desconto contra um preço cheio.
      a = oferta(nomeA, preco(), -um([10, 50, 25]));
      b = oferta(nomeB, preco(), 0);
    } else if (acertos < 10) {
      a = oferta(nomeA, preco(), -um([10, 20, 25, 50]));
      b = oferta(nomeB, preco(), -um([10, 20, 25, 50]));
    } else {
      a = oferta(nomeA, preco(), -um([5, 15, 30, 40, 60, 75]));
      b = oferta(nomeB, preco(), um([-10, -20, -35, 10, 20]));
    }
    // Depois dele, quase sempre a etiqueta mais barata não é a que sai mais barata no final.
    const enganosa = (a.preco - b.preco) * (a.final - b.final) <= 0;
    // No aquecimento, a oferta com desconto é sempre a de etiqueta mais cara: sem conta não dá para saber.
    if (a.final !== b.final && (acertos < 4 ? a.preco > b.preco : enganosa || Math.random() < 0.3)) {
      return Math.random() < 0.5 ? [a, b] : [b, a];
    }
  }
}

function Partida({ aoRepetir }: { aoRepetir: () => void }) {
  const { recorde, encerrar } = usePartida("ofertas");
  const [recordeAntes] = useState(recorde);
  const { tempo, acabou } = useContagem(DURACAO);
  const [par, setPar] = useState(() => sortearPar(0));
  const [numero, setNumero] = useState(0);
  const [marcada, setMarcada] = useState<number | null>(null);
  const [pontos, setPontos] = useState(0);
  const [acertos, setAcertos] = useState(0);
  const [combo, setCombo] = useState(0);
  const espera = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => void (espera.current && clearTimeout(espera.current)), []);

  useEffect(() => {
    if (acabou) encerrar(pontos);
    // Fecha a partida uma única vez, quando o tempo zera.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [acabou]);

  const barata = par[0].final < par[1].final ? 0 : 1;

  function escolher(i: number) {
    if (marcada !== null || acabou) return;
    const certa = i === barata;
    setMarcada(i);
    vibrar(certa);
    tocar(certa ? "certo" : "errado");
    if (certa) {
      setPontos((p) => p + 10 + Math.min(combo, 10));
      setCombo((c) => c + 1);
    } else setCombo(0);
    const feitos = acertos + (certa ? 1 : 0);
    setAcertos(feitos);
    espera.current = setTimeout(
      () => {
        setMarcada(null);
        setPar(sortearPar(feitos));
        setNumero((n) => n + 1);
      },
      certa ? 700 : 2200,
    );
  }

  if (acabou) {
    return <FimDeJogo titulo="Loja fechada" pontos={pontos} recorde={recordeAntes} detalhe={`${acertos} ${acertos === 1 ? "boa compra" : "boas compras"}`} aoRepetir={aoRepetir} />;
  }

  return (
    <div className="flex flex-1 flex-col">
      <Placar
        meio={
          <span className={tempo <= 10 ? "text-erro" : ""}>
            <Icone nome="relogio" className="mr-1 inline size-5" />
            {tempo}s
          </span>
        }
        pontos={pontos}
      />
      <BarraDeTempo tempo={tempo} duracao={DURACAO} />

      <p className="mb-4 flex items-center justify-center gap-2 text-center font-semibold text-texto-2">
        Qual sai mais barata?
        {combo >= 2 && <span className="rounded-full bg-fogo px-2.5 py-0.5 text-sm font-bold text-fundo">×{combo}</span>}
      </p>

      <div key={numero} className="animate-subir flex flex-1 flex-col gap-4 pb-2">
        {par.map((o, i) => {
          let estado = "border-linha bg-cartao";
          if (marcada !== null && i === barata) estado = "border-neon bg-neon/15";
          else if (marcada === i) estado = "border-erro bg-erro/15 animate-tremer";
          return (
            <button key={o.nome} onClick={() => escolher(i)} disabled={marcada !== null} className={`flex flex-1 flex-col items-center justify-center gap-1 rounded-3xl border-2 p-4 transition ${estado}`}>
              <span className="text-sm font-bold tracking-wide text-texto-2 uppercase">{o.nome}</span>
              <span className="flex items-center gap-2 font-titulo text-5xl font-bold">
                <Icone nome="gema" className="size-8 text-ciano" />
                {fmt(o.preco)}
              </span>
              {o.taxa === 0 ? (
                <span className="rounded-full bg-cartao-2 px-3 py-1 text-sm font-bold text-texto-2">sem desconto</span>
              ) : o.taxa < 0 ? (
                <span className="rounded-full bg-ouro px-3 py-1 font-titulo text-lg font-bold text-fundo">{-o.taxa}% OFF</span>
              ) : (
                <span className="rounded-full bg-rosa px-3 py-1 font-titulo text-lg font-bold text-fundo">+{o.taxa}% de taxa</span>
              )}
              <span className={`mt-1 font-titulo text-xl font-bold ${marcada === null ? "invisible" : i === barata ? "text-neon" : "text-texto-2"}`}>
                sai por {fmt(o.final)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Ofertas() {
  const [partida, setPartida] = useState(0);
  if (partida === 0) return <Abertura id="ofertas" aoComecar={() => setPartida(1)} />;
  return <Partida key={partida} aoRepetir={() => setPartida((n) => n + 1)} />;
}

export default function PaginaOfertas() {
  return (
    <Casca foco>
      <Ofertas />
    </Casca>
  );
}
