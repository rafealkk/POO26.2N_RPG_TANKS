import { Tanque } from "./Tanque.ts";

export class Batalha {
    private _jogador: Tanque;
    private _inimigo: Tanque;
    private _turno = 1;

    constructor(jogador: Tanque, inimigo: Tanque) {
        this._jogador = jogador;
        this._inimigo = inimigo;
        this._jogador.iniciarTurno();
        this._inimigo.iniciarTurno();
    }

    public batalhaAtiva(): boolean {
        return this._jogador.estaVivo() && this._inimigo.estaVivo();
    }

    public mostrarStatus(): void {
        //console.clear();
        console.log(`\n========== TANK KOMBAT | TURNO ${this._turno} ==========`);
        for (const [nome, tanque] of [["JOGADOR", this._jogador], ["INIMIGO", this._inimigo]] as const) {
            console.log(`${nome}: ${tanque.modelo} (${tanque.classe})`);
            console.log(`Vida: ${tanque.vida}/${tanque.vidaMaxima} | Munição: ${tanque.municao} | Culatra: ${tanque.culatra ? "Carregada" : "Vazia"}`);
            console.log(`Combustível: ${tanque.combustivel}/100 | Reparos: ${tanque.reparo} | Movendo: ${tanque.emMovimento ? "Sim" : "Não"}`);
            console.log("----------------------------------------");
        }
    }

    private verificarAtiva(): void {
        if (!this.batalhaAtiva()) throw new Error("A batalha já terminou!");
    }

    public carregarJogador(): void {
        this.verificarAtiva();
        this._jogador.carregarMunicao();
        console.log("Canhão carregado! (-30 combustível)");
    }

    public movimentarJogador(): void {
        this.verificarAtiva();
        this._jogador.movimentar();
        console.log("Manobra evasiva! (-70 combustível)");
    }

    public repararJogador(): void {
        this.verificarAtiva();
        const pontos = this._jogador.repararTanque();
        console.log(`Tanque reparado: +${pontos} de vida! (-50 combustível)`);
    }

    private disparar(atacante: Tanque, alvo: Tanque): void {
        const dano = atacante.atacar();
        const penalidadeMovimento = atacante.emMovimento ? 20 : 0;
        const evasaoAlvo = alvo.emMovimento ? 30 : 0;
        const chance = Math.max(0, Math.min(100, atacante.chanceAcerto - penalidadeMovimento - evasaoAlvo));
        console.log(`${atacante.modelo} dispara contra ${alvo.modelo}! (Chance: ${chance}%)`);
        if (Math.random() * 100 < chance) {
            alvo.receberDano(dano);
            console.log(`BOOOOM! Acertou e causou ${dano} de dano! Vida do alvo: ${alvo.vida}`);
        } else {
            console.log("O disparo ERROU o alvo!");
        }
    }

    public atacarInimigo(): void {
        this.verificarAtiva();
        this.disparar(this._jogador, this._inimigo);
        if (!this._inimigo.estaVivo()) console.log("\nVITÓRIA! Tanque inimigo destruído!");
    }

    public turnoInimigo(): void {
        if (!this.batalhaAtiva()) return;
        console.log("\n========== TURNO DO INIMIGO ==========");
        this._inimigo.iniciarTurno();

        // IA simples: tenta se reparar se estiver muito danificado.
        if (this._inimigo.vida <= this._inimigo.vidaMaxima * 0.4 && this._inimigo.reparo > 0) {
            try {
                const recuperado = this._inimigo.repararTanque();
                console.log(`Inimigo reparou ${recuperado} de vida. (-50 combustível)`);
            } catch (erro) {
                console.log((erro as Error).message);
            }
        }

        // Decide entre movimento evasivo e posição de tiro.
        const querMover = Math.random() < 0.4;
        if (querMover && this._inimigo.combustivel >= 70) {
            this._inimigo.movimentar();
            console.log("Inimigo realizou uma manobra evasiva. (-70 combustível)");
        }

        if (this._inimigo.culatra === 0 && this._inimigo.municao > 0 && this._inimigo.combustivel >= 30) {
            this._inimigo.carregarMunicao();
            console.log("Inimigo carregou o canhão. (-30 combustível)");
        }

        if (this._inimigo.culatra === 1 && this._inimigo.combustivel >= 30) {
            this.disparar(this._inimigo, this._jogador);
        } else {
            console.log("Inimigo encerrou seu turno sem disparar.");
        }

        if (!this._jogador.estaVivo()) console.log("\nGAME OVER! Seu tanque foi destruído!");
    }

    public finalizarTurno(): void {
        this.verificarAtiva();
        this.turnoInimigo();
        if (this.batalhaAtiva()) {
            this._turno++;
            this._jogador.iniciarTurno();
            console.log(`\nTurno ${this._turno}: combustível do jogador restaurado para 100.`);
        }
    }
}
