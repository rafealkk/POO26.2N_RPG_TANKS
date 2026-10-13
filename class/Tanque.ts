import { Equipamento } from "./Equipamento.ts";

export class Tanque {
    private _modelo: string;
    private _classe: string;
    private _vida: number;
    private _vidaMaxima: number;
    private _culatra = 0;
    private _equipamento: Equipamento;
    private _municao: number;
    private _reparo: number;
    private _ataque: number;
    private _chanceAcerto: number;
    private _combustivel = 100;
    private _emMovimento = false;

    constructor(modelo: string, _classe: string, equipamento: Equipamento) {
        this._modelo = modelo;
        this._equipamento = equipamento;
        const modelos: Record<string, { classe: string; vida: number; municao: number; reparo: number; ataque: number; chance: number }> = {
            "M4 Sherman": { classe: "Médio", vida: 80, municao: 20, reparo: 3, ataque: 40, chance: 90 },
            "Tiger I": { classe: "Pesado", vida: 120, municao: 20, reparo: 2, ataque: 70, chance: 80 },
            "T-34": { classe: "Médio", vida: 90, municao: 20, reparo: 4, ataque: 60, chance: 70 }
        };
        const dados = modelos[modelo];
        if (!dados) throw new Error(`Modelo de tanque inválido: ${modelo}`);
        this._classe = dados.classe;
        this._vida = dados.vida;
        this._vidaMaxima = dados.vida;
        this._municao = dados.municao;
        this._reparo = dados.reparo;
        this._ataque = dados.ataque;
        this._chanceAcerto = dados.chance;
    }

    public get modelo(): string { return this._modelo; }
    public get classe(): string { return this._classe; }
    public get vida(): number { return this._vida; }
    public get vidaMaxima(): number { return this._vidaMaxima; }
    public get culatra(): number { return this._culatra; }
    public get equipamento(): Equipamento { return this._equipamento; }
    public get municao(): number { return this._municao; }
    public get reparo(): number { return this._reparo; }
    public get ataque(): number { return this._ataque; }
    public get chanceAcerto(): number { return this._chanceAcerto; }
    public get combustivel(): number { return this._combustivel; }
    public get emMovimento(): boolean { return this._emMovimento; }

    public consumirCombustivel(valor: number): void {
        if (!Number.isFinite(valor) || valor < 0) throw new Error("Custo de combustível inválido.");
        if (this._combustivel < valor) throw new Error(`Combustível insuficiente! Disponível: ${this._combustivel}. Necessário: ${valor}.`);
        this._combustivel -= valor;
    }

    public iniciarTurno(): void {
        this._combustivel = 100;
        this._emMovimento = false;
    }

    public movimentar(): void {
        if (!this.estaVivo()) throw new Error("Tanque destruído não pode se movimentar.");
        if (this._emMovimento) throw new Error("O tanque já se movimentou neste turno.");
        this.consumirCombustivel(70);
        this._emMovimento = true;
    }

    public carregarMunicao(): void {
        if (!this.estaVivo()) throw new Error("Tanque destruído não pode carregar.");
        if (this._culatra !== 0) throw new Error("Canhão já está carregado!");
        if (this._municao <= 0) throw new Error("Sem munição de reserva!");
        this.consumirCombustivel(30);
        this._culatra = 1;
        this._municao--;
    }

    public repararTanque(): number {
        if (!this.estaVivo()) throw new Error("Tanque destruído não pode ser reparado durante a batalha.");
        if (this._reparo <= 0) throw new Error("Não restam kits de reparo!");
        if (this._vida >= this._vidaMaxima) throw new Error("O tanque já está com a vida máxima!");
        this.consumirCombustivel(50);
        const recuperado = Math.min(50, this._vidaMaxima - this._vida);
        this._vida += recuperado;
        this._reparo--;
        return recuperado;
    }

    // Consome um disparo e retorna o dano potencial, sem decidir se acertou.
    public atacar(): number {
        if (!this.estaVivo()) throw new Error("Tanque destruído não pode atacar.");
        if (this._culatra !== 1) throw new Error("Sem munição na culatra!");
        this.consumirCombustivel(30);
        this._culatra = 0;
        const variacao = 0.8 + Math.random() * 0.4;
        return Math.max(1, Math.round((this._ataque + this._equipamento.bonus) * variacao));
    }

    public receberDano(dano: number): void {
        if (!Number.isFinite(dano) || dano < 0) throw new Error("Dano inválido.");
        this._vida = Math.max(0, this._vida - dano);
    }

    public estaVivo(): boolean { return this._vida > 0; }
}
