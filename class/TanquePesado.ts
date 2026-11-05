import { Tanque } from "./Tanque.ts";
import { Equipamento } from "./Equipamento.ts";

export class TanquePesado extends Tanque {

    constructor(equipamento: Equipamento) {
        super("Tiger I", "Pesado", equipamento);
    }

    public receberDano(dano: number): void {
        const danoReduzido = dano * 0.8;
        super.receberDano(danoReduzido);
    }

    public atacar(): number {
        const dano = super.atacar();
        return Math.round(dano * 1.2);
    }
}
