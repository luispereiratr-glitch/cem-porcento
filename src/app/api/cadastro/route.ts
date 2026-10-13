import { createClient } from "@supabase/supabase-js";
import { emailDe, normalizarUsuario, validarCadastro } from "@/lib/supabase";

export async function POST(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const chaveServico = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !chaveServico) {
    return Response.json({ erro: "Cadastro indisponível: servidor sem configuração." }, { status: 503 });
  }

  const corpo = await request.json().catch(() => null);
  const usuario = normalizarUsuario(String(corpo?.usuario ?? ""));
  const senha = String(corpo?.senha ?? "");
  const invalido = validarCadastro(usuario, senha);
  if (invalido) return Response.json({ erro: invalido }, { status: 400 });

  const admin = createClient(url, chaveServico, { auth: { persistSession: false } });
  const { data, error } = await admin.auth.admin.createUser({
    email: emailDe(usuario),
    password: senha,
    email_confirm: true,
    user_metadata: { usuario },
  });
  if (error || !data.user) {
    const jaExiste = error?.status === 422 || /already/i.test(error?.message ?? "");
    return Response.json(
      { erro: jaExiste ? "Esse nick já existe. Escolha outro." : "Não foi possível criar a conta." },
      { status: jaExiste ? 409 : 500 },
    );
  }
  return Response.json({ ok: true });
}
