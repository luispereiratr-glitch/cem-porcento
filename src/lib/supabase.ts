import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const chave = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** `null` quando as variáveis não estão configuradas: o app roda em modo local. */
export const supabase = url && chave ? createClient(url, chave) : null;

/** O login é só usuário e senha; o Supabase exige um e-mail, então montamos um interno. */
export const emailDe = (usuario: string) => `${usuario}@estudos.invalid`;

export const normalizarUsuario = (texto: string) => texto.trim().toLowerCase();

export function validarCadastro(usuario: string, senha: string): string | null {
  if (!/^[a-z0-9_.]{3,20}$/.test(usuario)) {
    return "O nick precisa ter de 3 a 20 caracteres: letras, números, ponto ou _.";
  }
  if (senha.length < 6) return "A senha precisa ter pelo menos 6 caracteres.";
  return null;
}
