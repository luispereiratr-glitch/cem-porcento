"use client";

import { notFound, useParams, useRouter } from "next/navigation";
import { Casca } from "@/components/Casca";
import { Dicas } from "@/components/Dicas";
import { unidadeDe } from "@/conteudo/unidades";

function Dica() {
  const { unidade: id } = useParams<{ unidade: string }>();
  const router = useRouter();
  const unidade = unidadeDe(id);
  if (!unidade) notFound();
  return <Dicas unidade={unidade} sair="/" ultimo="Voltar à trilha" aoFim={() => router.push("/")} />;
}

export default function PaginaDica() {
  return (
    <Casca foco>
      <Dica />
    </Casca>
  );
}
