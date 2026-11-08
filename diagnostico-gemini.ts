import { GeradorFalas } from "./class/GeradorFalas.ts";

// Executar com --env-file=.env. Não imprime chave, resposta ou objeto de erro.
process.env.GEMINI_DEBUG = "1";
const gerador = new GeradorFalas();
await gerador.gerarFalaArtilheiro({
    turno: 1, lado: "JOGADOR", atacante: "M4 Sherman", alvo: "T-34",
    acertou: true, dano: 40, vidaRestante: 50,
});
