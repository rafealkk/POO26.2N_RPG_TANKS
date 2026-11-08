import { GoogleGenAI } from "@google/genai";

export interface ContextoDisparo {
    turno: number;
    lado: "JOGADOR" | "INIMIGO";
    atacante: string;
    alvo: string;
    acertou: boolean;
    dano: number;
    vidaRestante: number;
}

export interface ContextoCarregamento {
    turno: number;
    lado: "JOGADOR" | "INIMIGO";
    tanque: string;
    municaoRestante: number;
}

export interface contextoReparo {
    turno: number;
    lado: "JOGADOR" | "INIMIGO";
    tanque: string;
    vidaRestante: number;
    reparosRestantes: number;
}

export interface ContextoMovimento {
    turno: number;
    lado: "JOGADOR" | "INIMIGO";
    tanque: string;
    combustivelRestante: number;
    emMovimento: boolean;
}

export interface ContextoCapitao {
    turno: number;
    lado: "JOGADOR" | "INIMIGO";
    tanque: string;
    alvo: string;
    vida: number;
    vidaMaxima: number;
    vidaAlvo: number;
    combustivel: number;
    municao: number;
    culatraCarregada: boolean;
    reparos: number;
    emMovimento: boolean;
    alvoEmMovimento: boolean;
    acoesDisponiveis: string[];
}

export class GeradorFalas {
    private _cliente: GoogleGenAI | undefined;
    private _ocultarSegredos: (texto: string) => string;

    private diagnostico(mensagem: string): void {
        if (process.env.GEMINI_DEBUG === "1") {
            console.info(`[Gemini] ${this._ocultarSegredos(mensagem)}`);
        }
    }

    constructor(chave = process.env.GEMINI_API_KEY, cliente?: GoogleGenAI) {
        this._ocultarSegredos = (texto) => {
            for (const segredo of [chave, process.env.GEMINI_API_KEY, process.env.GOOGLE_API_KEY]) {
                if (segredo) texto = texto.split(segredo).join("[OCULTO]");
            }
            return texto.replace(/AIza[\w-]+/g, "[OCULTO]")
                .replace(/https?:\/\/[^\s"\\]+/g, "[URL OCULTA]")
                .replace(/Bearer\s+[^\s",]+/gi, "Bearer [OCULTO]")
                .replace(/[\u0000-\u001f\u007f-\u009f]/g, " ");
        };
        this.diagnostico(`Chave configurada: ${Boolean(chave?.trim())}`);
        this._cliente = cliente;
        if (!this._cliente && chave?.trim()) {
            this._cliente = new GoogleGenAI({ apiKey: chave });
        }
        this.diagnostico(`Cliente inicializado: ${Boolean(this._cliente)}`);
    }

    public async gerarFalaArtilheiro(contexto: ContextoDisparo): Promise<string> {
        let alternativa: string;

        if (!contexto.acertou) {
            alternativa = "Erramos! Vamos corrigir a mira! (Sem API)";
        } else if (contexto.vidaRestante === 0) {
            alternativa = "Alvo destruído! Bom trabalho, equipe! (Sem API)";
        } else {
            alternativa = "Acertamos! O alvo ainda está de pé! (Sem API)";
        }
        return this.gerar(contexto, alternativa,
            "Você é o artilheiro do tanque atacante em um jogo de RPG. " +
            "Reaja ao resultado informado: erro, acerto ou destruição do alvo. " +
            "Não invente acontecimentos, números ou destruição se a vida restante for maior que zero. " +
            "Não invente nomes de armas nem nada do tipo." +
            "Você não recarrega o tanque, só atira, então não fale recarregando, você pode sugerir para recarregar, mas recarregar em sí não.");
    }

    public async gerarFalaMuniciador(contexto: ContextoCarregamento): Promise<string> {
        return this.gerar(contexto, "Munição carregada! Canhão pronto para disparar!",
            "Você é o municiador do tanque informado em um jogo de RPG. " +
            "O carregamento foi concluído com sucesso. Avise que o canhão está pronto para disparar. " +
            "municaoRestante é a reserva após carregar; zero não significa que o canhão está vazio. " +
            "Não invente disparos, acertos, danos ou ações do inimigo. ");
    }

    public async gerarFalaMecanico(contexto: contextoReparo): Promise<string> {
        return this.gerar(contexto, "Tanque reparado! Vida restaurada.",
            "Você é o reparador do tanque informado em um jogo de RPG. " +
            "O tanque foi reparado com sucesso. Avise que a vida foi restaurada. " +
            "Não invente danos, acertos ou ações do inimigo. " +
            "Não fale sobre % de vida, e diga numero de reparos no final sempre");
    }

    public async gerarFalaMotorista(contexto: ContextoMovimento): Promise<string> {
        return this.gerar(contexto, "Manobra evasiva realizada! Tanque em movimento!",
            "Você é o motorista do tanque informado em um jogo de RPG. " +
            "A manobra evasiva foi realizada com sucesso e o tanque está em movimento. " +
            "Reaja à manobra usando apenas os dados informados. " +
            "O combustível informado é o restante após a manobra; zero não desfaz a ação concluída. " +
            "Não invente destinos, terreno, disparos, danos ou garantia de desviar do próximo ataque. ");
    }

    public async gerarFalaCapitao(contexto: ContextoCapitao): Promise<string> {
        let alternativa = "Equipe, mantenham a atenção e preservem nossos recursos!";
        if (contexto.vida <= contexto.vidaMaxima * 0.4 && contexto.acoesDisponiveis.includes("reparar")) {
            alternativa = "Mecânico, priorize os reparos! Precisamos manter o tanque em combate!";
        } else if (contexto.acoesDisponiveis.includes("atacar")) {
            alternativa = "Artilheiro, prepare o disparo! Avalie a mira antes de atacar!";
        } else if (contexto.acoesDisponiveis.includes("carregar")) {
            alternativa = "Municiador, carregue o canhão! Vamos preparar o próximo disparo!";
        }
        return this.gerar(contexto, alternativa,
            "Você é o capitão do tanque informado em um RPG. Dê uma ordem ou sugestão tática breve à sua equipe. " +
            "Use o estado atual e sugira somente ações de acoesDisponiveis. Nunca diga que a ordem já foi executada. " +
            "Carregar custa 30 de combustível e uma munição; atacar custa 30 e exige culatra carregada; " +
            "reparar custa 50 e um reparo, recuperando até 50 de vida; movimentar custa 70, reduz nossa precisão em 20 pontos " +
            "e a precisão dos ataques contra nós em 30 pontos. Combustível volta a 100 no próximo turno. " +
            "Não proponha uma sequência cujo custo exceda o combustível. " +
            "Não invente terreno, armas, reforços, ações extras ou garantia de acerto. " +
            "Seja direto e varie a fala conforme a situação. ");
    }

    private async gerar(
        contexto: ContextoDisparo | ContextoCarregamento | contextoReparo | ContextoMovimento | ContextoCapitao,
        alternativa: string,
        instrucao: string,
    ): Promise<string> {
        if (!this._cliente) {
            this.diagnostico("Alternativa: cliente não configurado.");
            return alternativa;
        }

        try {
            this.diagnostico("Iniciando requisição generateContent (timeout de 60000 ms).");
            const resposta = await this._cliente.models.generateContent({
                model: process.env.GEMINI_MODEL || "gemini-3.5-flash-lite",
                contents: JSON.stringify(contexto),
                config: {
                    systemInstruction: instrucao +
                        "Gere apenas uma fala curta em português brasileiro, com no máximo 120 caracteres. " +
                        "Não inclua rótulos, explicações ou quebras de linha.",
                    maxOutputTokens: 1024,
                    httpOptions: { timeout: 60000 },
                },
            });
            const fala = resposta.text?.replace(/[\u0000-\u001f\u007f-\u009f]/g, " ").trim();
            this.diagnostico(`Resposta recebida. Caracteres: ${fala?.length ?? 0}. ` +
                `Resultado: ${!fala ? "descartada por estar vazia" : fala.length > 120 ? "descartada por ultrapassar 120 caracteres" : "aceita"}.`);
            return fala && fala.length <= 120 ? fala : alternativa;
        } catch (erro) {
            // Não registrar o objeto do erro: pode conter requisição e autenticação.
            let mensagem = erro instanceof Error ? erro.message : "Erro sem mensagem disponível";
            // Erros da API podem trazer JSON com metadados. Extrair somente a mensagem.
            try {
                const dados = JSON.parse(mensagem);
                mensagem = typeof dados.error?.message === "string" ? dados.error.message : "Erro retornado pela API";
            } catch { /* Mensagem simples, sem JSON. */ }
            this.diagnostico(`Falha em generateContent. Tipo: ${erro instanceof Error ? erro.name : typeof erro}. Mensagem: ${mensagem}`);
            return alternativa;
        }
    }
}

