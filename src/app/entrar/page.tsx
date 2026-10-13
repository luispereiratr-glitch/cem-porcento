"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Botao, Logo } from "@/components/Casca";
import { useApp } from "@/lib/app";

export default function Entrar() {
  const { pronto, usuario, entrar, cadastrar, modoLocal } = useApp();
  const router = useRouter();
  const [novo, setNovo] = useState(false);
  const [nome, setNome] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (pronto && usuario) router.replace("/");
  }, [pronto, usuario, router]);

  async function enviar(evento: React.FormEvent) {
    evento.preventDefault();
    setEnviando(true);
    setErro(await (novo ? cadastrar(nome, senha) : entrar(nome, senha)));
    setEnviando(false);
  }

  const campo = "w-full rounded-2xl border-2 border-linha bg-cartao px-4 py-3.5 text-base font-semibold outline-none focus:border-ciano";

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-6 py-10">
      <Logo className="text-6xl" />
      <p className="mt-3 mb-9 text-lg leading-snug text-texto-2">Porcentagem em modo jogo: trilha, partidas rápidas e questões para ficar craque.</p>

      <form onSubmit={enviar} className="space-y-3">
        <label className="block">
          <span className="mb-1.5 block text-sm font-bold">Seu nick</span>
          <input
            className={campo}
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            autoCapitalize="none"
            autoCorrect="off"
            autoComplete="username"
            maxLength={20}
            required
          />
        </label>
        {!modoLocal && (
          <label className="block">
            <span className="mb-1.5 block text-sm font-bold">Senha</span>
            <input
              className={campo}
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              autoComplete={novo ? "new-password" : "current-password"}
              required
            />
          </label>
        )}

        {erro && (
          <p role="alert" className="rounded-xl bg-erro/15 px-3 py-2 text-sm font-semibold text-erro">
            {erro}
          </p>
        )}

        <Botao type="submit" disabled={enviando} className="!mt-5">
          {enviando ? "Um instante…" : modoLocal ? "Começar" : novo ? "Criar conta" : "Entrar"}
        </Botao>
      </form>

      {modoLocal ? (
        <p className="mt-6 text-sm leading-relaxed text-texto-2">
          Modo local: o progresso fica salvo só neste aparelho. Contas com senha aparecem quando o banco de dados for configurado.
        </p>
      ) : (
        <button
          onClick={() => {
            setNovo(!novo);
            setErro(null);
          }}
          className="mt-6 text-sm font-bold text-ciano underline underline-offset-4"
        >
          {novo ? "Já tenho conta" : "Criar uma conta nova"}
        </button>
      )}
      {!modoLocal && novo && (
        <p className="mt-3 text-sm leading-relaxed text-texto-2">Não pedimos e-mail. Guarde bem a senha: sem e-mail, não há como recuperá-la sozinho.</p>
      )}
    </main>
  );
}
