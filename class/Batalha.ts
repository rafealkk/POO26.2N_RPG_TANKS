import { Tanque } from "./Tanque.ts";
import { GeradorFalas } from "./GeradorFalas.ts";

export class Batalha {
    private _jogador: Tanque;
    private _inimigo: Tanque;
    private _turno = 1;
    // Experimento: false desativa as falas dos capitães.
    public capitaoAtivo = false;
    private _turnoOrientado = 0;
    private _orientacaoCapitao = "";

    constructor(jogador: Tanque, inimigo: Tanque, private _geradorFalas = new GeradorFalas()) {
        this._jogador = jogador;
        this._inimigo = inimigo;
        this._jogador.iniciarTurno();
        this._inimigo.iniciarTurno();
    }

    public async mostrarOrientacaoCapitao(): Promise<void> {
        if (!this.capitaoAtivo || !this.batalhaAtiva()) return;
        if (this._turnoOrientado !== this._turno) {
            this._orientacaoCapitao = await this.orientar(this._jogador, this._inimigo);
            this._turnoOrientado = this._turno;
        }
        // Reexibe a mesma orientação após a limpeza, sem outra chamada à API.
        console.log(this._orientacaoCapitao);
    }

    private async orientar(tanque: Tanque, alvo: Tanque): Promise<string> {
        const lado = tanque === this._jogador ? "JOGADOR" : "INIMIGO";
        const acoesDisponiveis = ["finalizar turno"];
        if (tanque.culatra === 0 && tanque.municao > 0 && tanque.combustivel >= 30) acoesDisponiveis.push("carregar");
        if (tanque.culatra === 1 && tanque.combustivel >= 30) acoesDisponiveis.push("atacar");
        if (tanque.vida < tanque.vidaMaxima && tanque.reparo > 0 && tanque.combustivel >= 50) acoesDisponiveis.push("reparar");
        if (!tanque.emMovimento && tanque.combustivel >= 70) acoesDisponiveis.push("movimentar");
        const fala = await this._geradorFalas.gerarFalaCapitao({
            turno: this._turno, lado, tanque: tanque.modelo, alvo: alvo.modelo,
            vida: tanque.vida, vidaMaxima: tanque.vidaMaxima, vidaAlvo: alvo.vida,
            combustivel: tanque.combustivel, municao: tanque.municao,
            culatraCarregada: tanque.culatra === 1, reparos: tanque.reparo,
            emMovimento: tanque.emMovimento, alvoEmMovimento: alvo.emMovimento, acoesDisponiveis,
        });
        return `[${lado} | Capitão do ${tanque.modelo}]: ${fala}`;
    }

    public batalhaAtiva(): boolean {
        return this._jogador.estaVivo() && this._inimigo.estaVivo();
    }

    public mostrarStatus(): void {
        //console.clear();
        console.log(`\n========== TANK KOMBAT | TURNO ${this._turno} ==========`);
        for (const [nome, tanque] of [["JOGADOR", this._jogador], ["INIMIGO", this._inimigo]] as const) {
            console.log(`${nome}: ${tanque.modelo} (${tanque.classe})`);
            console.log(`Vida: ${tanque.vida.toFixed(2)}/${tanque.vidaMaxima} | Munição: ${tanque.municao} | Culatra: ${tanque.culatra ? "Carregada" : "Vazia"}`);
            console.log(`Combustível: ${tanque.combustivel}/100 | Reparos: ${tanque.reparo} | Movendo: ${tanque.emMovimento ? "Sim" : "Não"}`);
            console.log("----------------------------------------");
        }
    }

    private verificarAtiva(): void {
        if (!this.batalhaAtiva()) throw new Error("A batalha já terminou!");
    }

    public async carregarJogador(): Promise<void> {
        this.verificarAtiva();
        await this.carregar(this._jogador);
    }

    private async carregar(tanque: Tanque): Promise<void> {
        tanque.carregarMunicao();
        const lado = tanque === this._jogador ? "JOGADOR" : "INIMIGO";
        console.log(lado === "JOGADOR"
            ? "Canhão carregado! (-30 combustível)"
            : "Inimigo carregou o canhão. (-30 combustível)");
        const fala = await this._geradorFalas.gerarFalaMuniciador({
            turno: this._turno,
            lado,
            tanque: tanque.modelo,
            municaoRestante: tanque.municao,
        });
        console.log(`[${lado} | Municiador do ${tanque.modelo}]: ${fala}`);
    }

    public async movimentarJogador(): Promise<void> {
        this.verificarAtiva();
        await this.movimentar(this._jogador);
    }

    private async movimentar(tanque: Tanque): Promise<void> {
        tanque.movimentar();
        const lado = tanque === this._jogador ? "JOGADOR" : "INIMIGO";
        console.log(lado === "JOGADOR"
            ? "Manobra evasiva! (-70 combustível)"
            : "Inimigo realizou uma manobra evasiva. (-70 combustível)");
        const fala = await this._geradorFalas.gerarFalaMotorista({
            turno: this._turno,
            lado,
            tanque: tanque.modelo,
            combustivelRestante: tanque.combustivel,
            emMovimento: tanque.emMovimento,
        });
        console.log(`[${lado} | Motorista do ${tanque.modelo}]: ${fala}`);
    }

    public async repararJogador(): Promise<void> {
        this.verificarAtiva();
        await this.reparar(this._jogador);
    }

    private async reparar(tanque: Tanque): Promise<void> {
        const pontos = tanque.repararTanque();
        const lado = tanque === this._jogador ? "JOGADOR" : "INIMIGO";
        if (lado === "JOGADOR") {
            console.log(`Tanque reparado: +${pontos} de vida! (-50 combustível)`);
        } else {
            console.log(`Inimigo reparou ${pontos} de vida. (-50 combustível)`);
        }
        const fala = await this._geradorFalas.gerarFalaMecanico({
            turno: this._turno,
            lado,
            tanque: tanque.modelo,
            vidaRestante: tanque.vida,
            reparosRestantes: tanque.reparo,
        });
        console.log(`[${lado} | Mecânico do ${tanque.modelo}]: ${fala}`);
    }

    private async disparar(atacante: Tanque, alvo: Tanque): Promise<void> {
        const dano = atacante.atacar();
        const penalidadeMovimento = atacante.emMovimento ? 20 : 0;
        const evasaoAlvo = alvo.emMovimento ? 30 : 0;
        const chance = Math.max(0, Math.min(100, atacante.chanceAcerto - penalidadeMovimento - evasaoAlvo));
        console.log(`${atacante.modelo} dispara contra ${alvo.modelo}! (Chance: ${chance}%)`);
        const acertou = Math.random() * 100 < chance;
        let danoReal = 0;
        if (acertou) {
            const vidaAnterior = alvo.vida;
            alvo.receberDano(dano);
            danoReal = vidaAnterior - alvo.vida;
            console.log(`BOOOOM! Acertou e causou ${danoReal.toFixed(2)} de dano! Vida do alvo: ${alvo.vida.toFixed(2)}`);
        } else {
            console.log("O disparo ERROU o alvo!");
        }
        const lado = atacante === this._jogador ? "JOGADOR" : "INIMIGO";
        const fala = await this._geradorFalas.gerarFalaArtilheiro({
            turno: this._turno,
            lado, 
            atacante: atacante.modelo,
            alvo: alvo.modelo,
            acertou, 
            dano: danoReal,
            vidaRestante: alvo.vida,
        });
        console.log(`[${lado} | Artilheiro do ${atacante.modelo}]: ${fala}`);
    }

    public async atacarInimigo(): Promise<void> {
        this.verificarAtiva();
        await this.disparar(this._jogador, this._inimigo);
        if (!this._inimigo.estaVivo()) console.log("\nVITÓRIA! Tanque inimigo destruído!");
    }

    public async turnoInimigo(): Promise<void> {
        if (!this.batalhaAtiva()) return;
        console.log("\n========== TURNO DO INIMIGO ==========");
        this._inimigo.iniciarTurno();
        if (this.capitaoAtivo) console.log(await this.orientar(this._inimigo, this._jogador));

        // IA simples: tenta se reparar se estiver muito danificado.
        if (this._inimigo.vida <= this._inimigo.vidaMaxima * 0.4 && this._inimigo.reparo > 0) {
            try {
                await this.reparar(this._inimigo);
            } catch (erro) {
                console.log((erro as Error).message);
            }
        }

        // Decide entre movimento evasivo e posição de tiro.
        const querMover = Math.random() < 0.4;
        if (querMover && this._inimigo.combustivel >= 70) {
            await this.movimentar(this._inimigo);
        }

        if (this._inimigo.culatra === 0 && this._inimigo.municao > 0 && this._inimigo.combustivel >= 30) {
            await this.carregar(this._inimigo);
        }

        if (this._inimigo.culatra === 1 && this._inimigo.combustivel >= 30) {
            await this.disparar(this._inimigo, this._jogador);
        } else {
            console.log("Inimigo encerrou seu turno sem disparar.");
        }

        if (!this._jogador.estaVivo()) console.log("\nGAME OVER! Seu tanque foi destruído!");
    }

    public async finalizarTurno(): Promise<void> {
        this.verificarAtiva();
        await this.turnoInimigo();
        if (this.batalhaAtiva()) {
            this._turno++;
            this._jogador.iniciarTurno();
            console.log(`\nTurno ${this._turno}: combustível do jogador restaurado para 100.`);
        }
    }
}
