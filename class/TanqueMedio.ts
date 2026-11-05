import { Tanque } from "./Tanque.ts";
import { Equipamento } from "./Equipamento.ts";

export class TanqueMedio extends Tanque {
    constructor(modelo: "M4 Sherman" | "T-34", equipamento: Equipamento) {
        super(modelo, "Médio", equipamento);
    }
}
