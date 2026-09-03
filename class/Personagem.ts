import { Equipamento } from "./Equipamento.ts";

//classe
export class Tanque {
//campos/atributos
modelo: string       ;
classe: string       ;
vida: number         ;
dano: number         ;
equipamento: Equipamento ;

//métodos

constructor(modelo: string, classe: string,  equipamento: Equipamento ){
    this.modelo       = modelo; 
    this.classe       = classe;
    this.vida         = 100;
    this.dano         = 0;
    this.equipamento = equipamento;
}

}