"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useApp } from "@/lib/app";
import { CORES } from "@/lib/cores";
import { EMBLEMAS, nivelDoXp, sequenciaAtiva } from "@/lib/jogo";
import type { Cor } from "@/lib/tipos";
import { Icone, type NomeIcone } from "./Icone";

const ABAS: { href: string; nome: string; icone: NomeIcone }[] = [
  { href: "/", nome: "Trilha", icone: "casa" },
  { href: "/jogos", nome: "Jogos", icone: "raio" },
  { href: "/questoes", nome: "Questões", icone: "lapis" },
  { href: "/perfil", nome: "Perfil", icone: "perfil" },
];

export function Carregando() {
  return (
    <div className="flex flex-1 items-center justify-center text-texto-2" role="status">
      Carregando…
    </div>
  );
}

export function Logo({ className = "text-2xl" }: { className?: string }) {
  return (
    <span className={`font-titulo font-bold tracking-wide ${className}`}>
      CEM<span className="text-fogo">%</span>
    </span>
  );
}

/** O emblema escolhido no perfil, dentro de um losango colorido. */
export function Emblema({ id, className = "size-12" }: { id: string; className?: string }) {
  const emblema = EMBLEMAS.find((e) => e.id === id) ?? EMBLEMAS[0];
  return (
    <span className={`flex shrink-0 items-center justify-center rounded-2xl ${CORES[emblema.cor].fundo} text-fundo ${className}`}>
      <Icone nome={emblema.icone} className="size-3/5" />
    </span>
  );
}

/** Moldura das páginas logadas. `foco` esconde a navegação (fases e jogos em andamento). */
export function Casca({ children, foco = false }: { children: React.ReactNode; foco?: boolean }) {
  const { pronto, usuario, carregado, progresso } = useApp();
  const router = useRouter();
  const caminho = usePathname();

  useEffect(() => {
    if (pronto && !usuario) router.replace("/entrar");
  }, [pronto, usuario, router]);

  if (!pronto || !usuario || !carregado) return <Carregando />;

  const sequencia = sequenciaAtiva(progresso);
  const { nivel } = nivelDoXp(progresso.xp);

  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col">
      {!foco && (
        <header className="flex items-center justify-between px-5 pt-5 pb-2">
          <Link href="/" aria-label="Cem%: início">
            <Logo />
          </Link>
          <div className="flex items-center gap-2 text-sm font-bold tabular-nums">
            <span
              className={`flex items-center gap-1 rounded-full px-2.5 py-1 ${sequencia ? "bg-fogo/15 text-fogo" : "bg-cartao-2 text-texto-2"}`}
              title="Dias seguidos jogando"
            >
              <Icone nome="chama" className="size-4" cheio={sequencia > 0} />
              {sequencia}
            </span>
            <span className="flex items-center gap-1 rounded-full bg-ciano/15 px-2.5 py-1 text-ciano" title="Gemas">
              <Icone nome="gema" className="size-4" />
              {progresso.gemas}
            </span>
            <span className="rounded-full bg-ouro/15 px-2.5 py-1 text-ouro" title={`${progresso.xp} XP`}>
              Nv {nivel}
            </span>
          </div>
        </header>
      )}

      <main className={`flex flex-1 flex-col px-5 ${foco ? "py-5" : "pt-3 pb-28"}`}>{children}</main>

      {!foco && (
        <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-linha bg-fundo-2/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
          <ul className="mx-auto flex max-w-xl">
            {ABAS.map((aba) => {
              const ativa = aba.href === "/" ? caminho === "/" : caminho.startsWith(aba.href);
              return (
                <li key={aba.href} className="flex-1">
                  <Link
                    href={aba.href}
                    aria-current={ativa ? "page" : undefined}
                    className={`flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-bold ${ativa ? "text-fogo" : "text-texto-2"}`}
                  >
                    <Icone nome={aba.icone} className="size-6" />
                    {aba.nome}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </div>
  );
}

const baseBotao = "w-full rounded-2xl px-5 py-3.5 text-center font-titulo text-lg font-bold tracking-wide uppercase transition";
const estiloSuave = `${baseBotao} block border-2 border-linha bg-cartao text-texto`;

/** Botão "de apertar": a sombra embaixo some quando ele é pressionado. */
const estiloCheio = (cor: Cor) =>
  `${baseBotao} block ${CORES[cor].fundo} text-fundo ${CORES[cor].sombra} active:translate-y-[5px] active:shadow-none disabled:bg-cartao-2 disabled:text-texto-2 disabled:shadow-none`;

export function Botao({
  children,
  variante = "primario",
  cor = "neon",
  className = "",
  ...resto
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variante?: "primario" | "suave"; cor?: Cor }) {
  return (
    <button {...resto} className={`${variante === "primario" ? estiloCheio(cor) : estiloSuave} ${className}`}>
      {children}
    </button>
  );
}

export const estiloBotaoLink = estiloCheio("neon");
export const estiloLinkSuave = estiloSuave;

export function Topo({ titulo, voltar }: { titulo: string; voltar: string }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <Link href={voltar} aria-label="Voltar" className="rounded-full border border-linha bg-cartao p-2 text-texto-2">
        <Icone nome="voltar" />
      </Link>
      <h1 className="text-xl font-bold">{titulo}</h1>
    </div>
  );
}
