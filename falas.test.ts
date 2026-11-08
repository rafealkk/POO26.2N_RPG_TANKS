import { afterEach, describe, expect, it, jest } from "@jest/globals";
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { GeradorFalas, type ContextoDisparo } from "./class/GeradorFalas.ts";
import { Batalha } from "./class/Batalha.ts";
import { TanqueMedio } from "./class/TanqueMedio.ts";
import { Equipamento } from "./class/Equipamento.ts";

const contexto: ContextoDisparo = {
    turno: 1, lado: "JOGADOR", atacante: "M4 Sherman", alvo: "T-34",
    acertou: true, dano: 40, vidaRestante: 50,
};

afterEach(() => { jest.restoreAllMocks(); });

describe("Falas dos disparos", () => {
    it("oculta a chave e URLs nos logs de erro", async () => {
        const debugAnterior = process.env.GEMINI_DEBUG;
        process.env.GEMINI_DEBUG = "1";
        const logs = jest.spyOn(console, "info").mockImplementation(() => {});
        const chave = "segredo-ficticio-do-teste";
        const cliente = new GoogleGenAI({ apiKey: chave });
        jest.spyOn(cliente.models, "generateContent").mockRejectedValueOnce(
            new Error(`Falha com ${chave} em https://exemplo.test/?key=${chave}`),
        );
        try {
            await new GeradorFalas(chave, cliente).gerarFalaArtilheiro(contexto);
            const saida = logs.mock.calls.flat().join(" ");
            expect(saida).toContain("Chave configurada: true");
            expect(saida).toContain("Tipo: Error");
            expect(saida).not.toContain(chave);
            expect(saida).not.toContain("https://");
        } finally {
            if (debugAnterior === undefined) delete process.env.GEMINI_DEBUG;
            else process.env.GEMINI_DEBUG = debugAnterior;
        }
    });

    it("usa alternativas sem chave para acerto, erro e destruição", async () => {
        const gerador = new GeradorFalas("");
        expect(await gerador.gerarFalaArtilheiro(contexto)).toContain("Acertamos");
        expect(await gerador.gerarFalaArtilheiro({ ...contexto, acertou: false, dano: 0 })).toContain("Erramos");
        expect(await gerador.gerarFalaArtilheiro({ ...contexto, vidaRestante: 0 })).toContain("destruído");
    });

    it("trata resposta válida, vazia, longa e falha da API sem rede", async () => {
        const cliente = new GoogleGenAI({ apiKey: "chave-ficticia-para-teste" });
        function resposta(texto: string): GenerateContentResponse {
            const resultado = new GenerateContentResponse();
            resultado.candidates = [{ content: { parts: [{ text: texto }] } }];
            return resultado;
        }
        const chamada = jest.spyOn(cliente.models, "generateContent")
            .mockResolvedValueOnce(resposta("Na mosca!"))
            .mockResolvedValueOnce(resposta(""))
            .mockResolvedValueOnce(resposta("a".repeat(121)))
            .mockRejectedValueOnce(new Error("Falha simulada"));
        const gerador = new GeradorFalas("", cliente);
        expect(await gerador.gerarFalaArtilheiro(contexto)).toBe("Na mosca!");
        for (let i = 0; i < 3; i++) {
            expect(await gerador.gerarFalaArtilheiro(contexto)).toContain("Acertamos");
        }
        expect(chamada).toHaveBeenCalledTimes(4);
        expect(chamada).toHaveBeenCalledWith(expect.objectContaining({
            config: expect.objectContaining({ maxOutputTokens: 1024 }),
        }));
    });

    it.each([0, 0.99])("preserva recursos e informa o resultado com sorteio %s", async (sorteio) => {
        jest.spyOn(console, "log").mockImplementation(() => {});
        jest.spyOn(Math, "random").mockReturnValue(sorteio);
        const equipamento = new Equipamento("Ferramentas", "Úteis", 0);
        const jogador = new TanqueMedio("M4 Sherman", equipamento);
        const inimigo = new TanqueMedio("T-34", equipamento);
        const gerador = new GeradorFalas("");
        const fala = jest.spyOn(gerador, "gerarFalaArtilheiro");
        const batalha = new Batalha(jogador, inimigo, gerador);
        await batalha.carregarJogador();
        await batalha.atacarInimigo();
        expect(jogador.combustivel).toBe(40);
        expect(jogador.municao).toBe(19);
        expect(jogador.culatra).toBe(0);
        expect(inimigo.vida).toBe(sorteio === 0 ? 58 : 90);
        expect(fala).toHaveBeenCalledWith(expect.objectContaining({
            acertou: sorteio === 0, dano: sorteio === 0 ? 32 : 0,
            vidaRestante: inimigo.vida, lado: "JOGADOR",
        }));
    });

    it("não gera fala para ataque inválido e aguarda o disparo inimigo antes do novo turno", async () => {
        jest.spyOn(console, "log").mockImplementation(() => {});
        jest.spyOn(Math, "random").mockReturnValue(0.5);
        const equipamento = new Equipamento("Ferramentas", "Úteis", 0);
        const jogador = new TanqueMedio("M4 Sherman", equipamento);
        const inimigo = new TanqueMedio("T-34", equipamento);
        const gerador = new GeradorFalas("");
        const fala = jest.spyOn(gerador, "gerarFalaArtilheiro");
        const batalha = new Batalha(jogador, inimigo, gerador);
        await expect(batalha.atacarInimigo()).rejects.toThrow("culatra");
        expect(fala).not.toHaveBeenCalled();
        await batalha.carregarJogador();
        let concluir!: (fala: string) => void;
        let iniciouDisparo!: () => void;
        const disparoIniciado = new Promise<void>(resolve => { iniciouDisparo = resolve; });
        fala.mockImplementationOnce(() => {
            iniciouDisparo();
            return new Promise<string>(resolve => { concluir = resolve; });
        });
        const turno = batalha.finalizarTurno();
        await disparoIniciado;
        expect(jogador.combustivel).toBe(70);
        expect(jogador.vida).toBe(20);
        expect(fala).toHaveBeenCalledWith(expect.objectContaining({ lado: "INIMIGO", dano: 60 }));
        concluir("Acertamos!");
        await turno;
        expect(jogador.combustivel).toBe(100);
    });
});


describe("Municiador", () => {
    it("usa uma fala local sem chave e aceita uma resposta do Gemini", async () => {
        const contexto = { turno: 1, lado: "JOGADOR" as const, tanque: "M4 Sherman", municaoRestante: 19 };
        expect(await new GeradorFalas("").gerarFalaMuniciador(contexto)).toContain("Munição carregada");
        const cliente = new GoogleGenAI({ apiKey: "chave-ficticia" });
        const resposta = new GenerateContentResponse();
        resposta.candidates = [{ content: { parts: [{ text: "Pronto para disparar, comandante!" }] } }];
        const chamada = jest.spyOn(cliente.models, "generateContent").mockResolvedValueOnce(resposta);
        expect(await new GeradorFalas("", cliente).gerarFalaMuniciador(contexto)).toBe("Pronto para disparar, comandante!");
        expect(chamada).toHaveBeenCalledWith(expect.objectContaining({
            contents: JSON.stringify(contexto),
            config: expect.objectContaining({ systemInstruction: expect.stringContaining("Você é o municiador") }),
        }));
    });

    it("aguarda a fala após carregar e não anuncia carregamento inválido", async () => {
        const logs = jest.spyOn(console, "log").mockImplementation(() => {});
        const equipamento = new Equipamento("Ferramentas", "Úteis", 0);
        const jogador = new TanqueMedio("M4 Sherman", equipamento);
        const inimigo = new TanqueMedio("T-34", equipamento);
        const gerador = new GeradorFalas("");
        let concluir!: (fala: string) => void;
        const fala = jest.spyOn(gerador, "gerarFalaMuniciador").mockImplementationOnce(
            () => new Promise<string>(resolve => { concluir = resolve; }),
        );
        const batalha = new Batalha(jogador, inimigo, gerador);
        let terminou = false;
        const carregamento = batalha.carregarJogador().then(() => { terminou = true; });
        await new Promise<void>(resolve => setImmediate(resolve));
        expect(terminou).toBe(false);
        expect(jogador.culatra).toBe(1);
        expect(jogador.municao).toBe(19);
        expect(jogador.combustivel).toBe(70);
        expect(fala).toHaveBeenCalledWith({ turno: 1, lado: "JOGADOR", tanque: "M4 Sherman", municaoRestante: 19 });
        concluir("Canhão pronto!");
        await carregamento;
        expect(logs).toHaveBeenCalledWith("[JOGADOR | Municiador do M4 Sherman]: Canhão pronto!");
        await expect(batalha.carregarJogador()).rejects.toThrow("já está carregado");
        expect(fala).toHaveBeenCalledTimes(1);
        expect(jogador.combustivel).toBe(70);
    });
});

describe("Mecânico", () => {
    it.each(["JOGADOR", "INIMIGO"] as const)("repara e aguarda a fala do %s com os dados corretos", async (lado) => {
        const logs = jest.spyOn(console, "log").mockImplementation(() => {});
        jest.spyOn(Math, "random").mockReturnValue(0.5);
        const equipamento = new Equipamento("Ferramentas", "Úteis", 0);
        const jogador = new TanqueMedio("M4 Sherman", equipamento);
        const inimigo = new TanqueMedio("T-34", equipamento);
        const tanque = lado === "JOGADOR" ? jogador : inimigo;
        tanque.receberDano(60);
        const reparosAntes = tanque.reparo;
        const gerador = new GeradorFalas("");
        let concluir!: (fala: string) => void;
        const fala = jest.spyOn(gerador, "gerarFalaMecanico").mockImplementationOnce(
            () => new Promise<string>(resolve => { concluir = resolve; }),
        );
        const batalha = new Batalha(jogador, inimigo, gerador);
        let terminou = false;
        const acao = (lado === "JOGADOR" ? batalha.repararJogador() : batalha.turnoInimigo())
            .then(() => { terminou = true; });
        await new Promise<void>(resolve => setImmediate(resolve));
        expect(terminou).toBe(false);
        expect(tanque.combustivel).toBe(50);
        expect(tanque.vida).toBe(tanque.vidaMaxima - 10);
        expect(tanque.reparo).toBe(reparosAntes - 1);
        expect(fala).toHaveBeenCalledWith({ turno: 1, lado, tanque: tanque.modelo,
            vidaRestante: tanque.vida, reparosRestantes: tanque.reparo });
        concluir("Reparo concluído!");
        await acao;
        expect(logs).toHaveBeenCalledWith(`[${lado} | Mecânico do ${tanque.modelo}]: Reparo concluído!`);
    });

    it("não chama o mecânico quando o reparo é inválido", async () => {
        const equipamento = new Equipamento("Ferramentas", "Úteis", 0);
        const jogador = new TanqueMedio("M4 Sherman", equipamento);
        const inimigo = new TanqueMedio("T-34", equipamento);
        const gerador = new GeradorFalas("");
        const fala = jest.spyOn(gerador, "gerarFalaMecanico");
        const batalha = new Batalha(jogador, inimigo, gerador);
        await expect(batalha.repararJogador()).rejects.toThrow("vida máxima");
        expect(fala).not.toHaveBeenCalled();
        expect(jogador.combustivel).toBe(100);
        expect(jogador.reparo).toBe(3);
    });
});

describe("Motorista e municiador inimigo", () => {
    it.each([0.1, 0.9])("gera as falas do inimigo nas ações realizadas com sorteio %s", async sorteio => {
        jest.spyOn(console, "log").mockImplementation(() => {});
        jest.spyOn(Math, "random").mockReturnValue(sorteio);
        const equipamento = new Equipamento("Ferramentas", "Úteis", 0);
        const jogador = new TanqueMedio("M4 Sherman", equipamento);
        const inimigo = new TanqueMedio("T-34", equipamento);
        const gerador = new GeradorFalas("");
        const motorista = jest.spyOn(gerador, "gerarFalaMotorista");
        const municiador = jest.spyOn(gerador, "gerarFalaMuniciador");
        await new Batalha(jogador, inimigo, gerador).turnoInimigo();
        expect(municiador).toHaveBeenCalledWith({ turno: 1, lado: "INIMIGO", tanque: "T-34", municaoRestante: 19 });
        if (sorteio < 0.4) {
            expect(motorista).toHaveBeenCalledWith({ turno: 1, lado: "INIMIGO", tanque: "T-34", combustivelRestante: 30, emMovimento: true });
            expect(inimigo.combustivel).toBe(0);
            expect(inimigo.culatra).toBe(1);
        } else {
            expect(motorista).not.toHaveBeenCalled();
            expect(inimigo.combustivel).toBe(40);
            expect(inimigo.culatra).toBe(0);
        }
    });

    it("aguarda o motorista do jogador e não anuncia manobra inválida", async () => {
        const logs = jest.spyOn(console, "log").mockImplementation(() => {});
        const equipamento = new Equipamento("Ferramentas", "Úteis", 0);
        const jogador = new TanqueMedio("M4 Sherman", equipamento);
        const inimigo = new TanqueMedio("T-34", equipamento);
        const gerador = new GeradorFalas("");
        let concluir!: (texto: string) => void;
        const fala = jest.spyOn(gerador, "gerarFalaMotorista").mockImplementationOnce(
            () => new Promise<string>(resolve => { concluir = resolve; }),
        );
        const batalha = new Batalha(jogador, inimigo, gerador);
        let terminou = false;
        const acao = batalha.movimentarJogador().then(() => { terminou = true; });
        await new Promise<void>(resolve => setImmediate(resolve));
        expect(terminou).toBe(false);
        expect(jogador.combustivel).toBe(30);
        expect(jogador.emMovimento).toBe(true);
        expect(fala).toHaveBeenCalledWith({ turno: 1, lado: "JOGADOR", tanque: "M4 Sherman", combustivelRestante: 30, emMovimento: true });
        concluir("Manobra concluída!");
        await acao;
        expect(logs).toHaveBeenCalledWith("[JOGADOR | Motorista do M4 Sherman]: Manobra concluída!");
        await expect(batalha.movimentarJogador()).rejects.toThrow();
        expect(fala).toHaveBeenCalledTimes(1);
    });
});

describe("Capitão experimental", () => {
    it("orienta uma vez por turno, preserva recursos e pode ser desativado", async () => {
        jest.spyOn(console, "log").mockImplementation(() => {});
        jest.spyOn(Math, "random").mockReturnValue(0.1);
        const equipamento = new Equipamento("Ferramentas", "Úteis", 0);
        const jogador = new TanqueMedio("M4 Sherman", equipamento);
        const inimigo = new TanqueMedio("T-34", equipamento);
        const gerador = new GeradorFalas("");
        const fala = jest.spyOn(gerador, "gerarFalaCapitao");
        const batalha = new Batalha(jogador, inimigo, gerador);
        await batalha.mostrarOrientacaoCapitao();
        await batalha.mostrarOrientacaoCapitao();
        expect(fala).toHaveBeenCalledTimes(1);
        expect(fala).toHaveBeenCalledWith(expect.objectContaining({ lado: "JOGADOR", turno: 1,
            acoesDisponiveis: ["finalizar turno", "carregar", "movimentar"] }));
        expect(jogador.combustivel).toBe(100);
        expect(jogador.municao).toBe(20);
        await batalha.finalizarTurno();
        expect(fala).toHaveBeenCalledWith(expect.objectContaining({ lado: "INIMIGO", turno: 1 }));
        await batalha.mostrarOrientacaoCapitao();
        expect(fala).toHaveBeenCalledWith(expect.objectContaining({ lado: "JOGADOR", turno: 2 }));
        expect(fala).toHaveBeenCalledTimes(3);
        batalha.capitaoAtivo = false;
        await batalha.mostrarOrientacaoCapitao();
        await batalha.turnoInimigo();
        expect(fala).toHaveBeenCalledTimes(3);
    });
});
