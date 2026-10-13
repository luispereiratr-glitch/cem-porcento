import type { Metadata, Viewport } from "next";
import { Chakra_Petch, Nunito } from "next/font/google";
import { AppProvider } from "@/lib/app";
import "./globals.css";

const titulo = Chakra_Petch({ variable: "--fonte-titulo", subsets: ["latin"], weight: ["500", "600", "700"] });
const corpo = Nunito({ variable: "--fonte-corpo", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Cem%",
  description: "Porcentagem com trilha, questões e jogos.",
};

export const viewport: Viewport = {
  themeColor: "#090d18",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${titulo.variable} ${corpo.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
