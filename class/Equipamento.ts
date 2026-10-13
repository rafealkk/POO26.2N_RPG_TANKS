
export class Equipamento {

    private _nome: string;
    private _tipo: string;
    private _bonus: number;

    constructor(nome: string, tipo: string, bonus: number) {
        this._nome = nome;
        this._tipo = tipo;
        this._bonus = bonus;
    }

    public get nome(): string {
        return this._nome;
    }

    public get tipo(): string {
        return this._tipo;
    }

    public get bonus(): number {
        return this._bonus;
    }
}
