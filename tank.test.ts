import { describe, expect, it } from "@jest/globals";
import { Tanque } from "./class/Tanque.ts";
import { TanqueLeve } from "./class/TanqueLeve.ts";
import { TanqueMedio } from "./class/TanqueMedio.ts";
import { TanquePesado } from "./class/TanquePesado.ts";
import { Equipamento } from "./class/Equipamento.ts";

function equipamento(): Equipamento {
    return new Equipamento("Ferramentas", "Úteis", 0);
}

describe("Tanques e herança", () => {
    it("Carrega munição e consome combustível", () => {
        const tanque: Tanque = new TanqueLeve(equipamento());
        tanque.carregarMunicao();
        expect(tanque.culatra).toBe(1);
        expect(tanque.municao).toBe(19);
        expect(tanque.combustivel).toBe(70);
    });

    it("Repara o tanque até o máximo", () => {
        const tanque = new TanqueMedio("M4 Sherman", equipamento());
        tanque.receberDano(40);
        expect(tanque.repararTanque()).toBe(40);
        expect(tanque.vida).toBe(80);
        expect(tanque.reparo).toBe(2);
    });

    it("Ataca quando o canhão está carregado", () => {
        const tanque = new TanquePesado(equipamento());
        tanque.carregarMunicao();
        expect(tanque.atacar()).toBeGreaterThan(0);
        expect(tanque.culatra).toBe(0);
    });

    it("Aplica a resistência do tanque pesado", () => {
        const tanque = new TanquePesado(equipamento());
        tanque.receberDano(50);
        expect(tanque.vida).toBe(80);
    });

    it("Aplica a vulnerabilidade do tanque leve", () => {
        const tanque = new TanqueLeve(equipamento());
        tanque.receberDano(20);
        expect(tanque.vida).toBe(41);
    });
});
