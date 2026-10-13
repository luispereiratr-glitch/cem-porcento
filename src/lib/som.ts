/** Efeitos sonoros feitos na hora com Web Audio: não há arquivo de som para baixar. */

type Nota = { freq: number; inicio: number; duracao: number; onda?: OscillatorType; volume?: number };

const SONS = {
  certo: [
    { freq: 660, inicio: 0, duracao: 0.09 },
    { freq: 990, inicio: 0.08, duracao: 0.16 },
  ],
  errado: [
    { freq: 220, inicio: 0, duracao: 0.12, onda: "sawtooth", volume: 0.12 },
    { freq: 165, inicio: 0.1, duracao: 0.2, onda: "sawtooth", volume: 0.12 },
  ],
  toque: [{ freq: 520, inicio: 0, duracao: 0.04, volume: 0.1 }],
  tiro: [{ freq: 880, inicio: 0, duracao: 0.06, onda: "square", volume: 0.1 }],
  vitoria: [
    { freq: 523, inicio: 0, duracao: 0.12 },
    { freq: 659, inicio: 0.11, duracao: 0.12 },
    { freq: 784, inicio: 0.22, duracao: 0.12 },
    { freq: 1047, inicio: 0.33, duracao: 0.3 },
  ],
} satisfies Record<string, Nota[]>;

export type Som = keyof typeof SONS;

let contexto: AudioContext | null = null;
let ligado = true;

/** Chamado pelo provedor do app sempre que a preferência de som muda. */
export function definirSom(valor: boolean) {
  ligado = valor;
}

export function tocar(som: Som) {
  if (!ligado || typeof window === "undefined") return;
  try {
    contexto ??= new AudioContext();
    if (contexto.state === "suspended") void contexto.resume();
    const agora = contexto.currentTime;
    for (const nota of SONS[som] as Nota[]) {
      const oscilador = contexto.createOscillator();
      const ganho = contexto.createGain();
      oscilador.type = nota.onda ?? "triangle";
      oscilador.frequency.value = nota.freq;
      ganho.gain.setValueAtTime(nota.volume ?? 0.18, agora + nota.inicio);
      ganho.gain.exponentialRampToValueAtTime(0.001, agora + nota.inicio + nota.duracao);
      oscilador.connect(ganho).connect(contexto.destination);
      oscilador.start(agora + nota.inicio);
      oscilador.stop(agora + nota.inicio + nota.duracao);
    }
  } catch {
    // Sem áudio no aparelho: o jogo segue mudo.
  }
}
