import { Equipamento } from "./Equipamento.ts";

//classe
export class Tanque {
    //campos/atributos
    private _modelo: string;
    private _classe: string;
    private _vida: number;
    private _culatra: number;
    private _equipamento: Equipamento;
    private _municao: number;
    private _reparo: number;
    private _ataque: number;
    private _chanceAcerto: number;



    constructor(modelo: string, classe: string, equipamento: Equipamento) {
        this._modelo = modelo;
        this._classe = classe;
        this._vida = 25;
        this._culatra = 0;
        this._equipamento = equipamento;
        this._municao = 1;
        this._reparo = 1;
        this._ataque = 30;
        this._chanceAcerto = 10;

    }


    // getters e setters
    public get vida(): number {
        return this._vida;
    }

    public set vida(vida: number) {
        if (this._vida <= 0) {
            throw new Error("Seu Tanque está destruído? \nNão é possível ter essa vida");
        }
        if (this._vida <= 100) {
            this._vida = vida;
        } else {
            throw new Error("Impossível ser melhor que isso \nNão é possível a vida ser maior que 100");
        }
    }

    public get municao(): number {
        return this._municao;
    }

    public set municao(municao: number) {
        if (this._municao < 0) {
            throw new Error("Não é possível ter munição negativa");
        }
        if (this._municao <= 30) {
            this._municao = municao;
        } else {
            throw new Error("Isso que é prevenção, hein!? \nSem espaço para munição");
        }
    }

    public get reparo(): number {
        return this._reparo
    }

    public set reparo(reparo: number) {
        if (this._reparo < 0) {
            throw new Error("Não é possível dever reparos");
        }
        if (this._reparo <= 10) {
            this._reparo = reparo;
        } else {
            throw new Error("Tudo isso é medo? Não é possível ter tantos reparos");
        }
    }

    public get ataque(): number {
        return this._ataque
    }

    public set ataque(ataque: number) {
        this._ataque = ataque
    }

    //métodos
    public carregarMunicao(): void {
        if (this._culatra === 0 && this._municao > 0) {
            this._culatra += 1
            this.municao -= 1
        } else if (this._culatra > 0) {
            throw new Error("Canhao já está carregado Bisonho!")
        } else {
            throw new Error("Não temos mais muniçao!!! Recuar!!!!")
        }

    }

    public repararTanque(): void {
        if (this.vida < 100 && this.vida > 30 && this.reparo > 0) {
            this.vida = 100;
            this.reparo -= 1
        } else if (this.vida <= 50 && this.reparo > 0) {
            this.vida += 50;
            this.reparo -= 1
        } else {
            throw new Error("Não temos mais como reparar essa desgraça comandante.")
        }
    }

    public atacar(): void {
        if (this._culatra === 1) {
            this._culatra -= 1
            this._ataque = 1 + Math.floor(Math.random() * 20);
        } else {
            throw new Error("Sem munição na culatra")
        }
    }


}