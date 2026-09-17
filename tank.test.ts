import { describe, expect, it } from "@jest/globals";
import { Tanque } from "./class/Personagem.ts";
import { Equipamento } from "./class/Equipamento.ts";

describe("Quando manipular Tanque", () => {
    it("Deve carregar a munição na culatra", () => {
        // Cenário
        const equipamento: Equipamento = new Equipamento(
            "ferramentas",
            "uteis",
            0
        );
        const tanque: Tanque = new Tanque(
            "M4",
            "Medio",
            equipamento
        );
        // Execução
        tanque.carregarMunicao();
        // Validar
        expect(tanque.culatra).toBe(1);
        expect(tanque.municao).toBe(0);
    });

    it("Deve reparar o tanque", () => {
        // Cenário
        const equipamento: Equipamento = new Equipamento(
            "ferramentas",
            "uteis",
            0
        );
        const tanque: Tanque = new Tanque(
            "M4",
            "Medio",
            equipamento
        );
        tanque.vida = 40;
        // Execução
        tanque.repararTanque();
        // Validar
        expect(tanque.vida).toBe(90);
        expect(tanque.reparo).toBe(0);
    });

    it("Deve atacar quando houver munição na culatra", () => {
        // Cenário
        const equipamento: Equipamento = new Equipamento(
            "ferramentas",
            "uteis",
            0
        );
        const tanque: Tanque = new Tanque(
            "M4",
            "Medio",
            equipamento
        );
        tanque.carregarMunicao();
        // Execução
        tanque.atacar();
        // Validar
        expect(tanque.culatra).toBe(0);
    });

});