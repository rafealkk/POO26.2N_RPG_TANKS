import { Tanque } from "./Tanque.ts";
import { Equipamento } from "./Equipamento.ts";

export class TanqueLeve extends Tanque {

    constructor(equipamento: Equipamento) {
        super("M2", "Leve", equipamento);
    }

    public receberDano(dano: number): void {
        const danoAumentado = dano * 1.2;
        super.receberDano(danoAumentado);
    }

    public atacar(): number {
        const dano = super.atacar();
        return Math.round(dano * 1.5);
    }
}
