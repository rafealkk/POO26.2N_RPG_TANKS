import { Equipamento } from "./Equipamento.ts";

//classe
export class Tanque {
//campos/atributos
modelo: string       ;
classe: string       ;
vida: number         ;
culatra: number         ;
equipamento: Equipamento ;
municao: number;
reparo: number;
ataque: number;
chanceAcerto: number;

//métodos

constructor(modelo: string, classe: string,  equipamento: Equipamento ){
    this.modelo       = modelo; 
    this.classe       = classe;
    this.vida         = 25;
    this.culatra      = 0;
    this.equipamento  = equipamento;
    this.municao      = 1;
    this.reparo       = 1;
    this.ataque       = 30;
    this.chanceAcerto = 10;
    
}

carregarMunicao(): void {
    if(this.culatra == 0 && this.municao > 0){
        this.culatra += 1
        this.municao -= 1       
    }else if( this.culatra > 0){
        throw new Error("Canhao já está carregado Bisonho!")
    }else{
        throw new Error("Não temos mais muniçao!!! Recuar!!!!")
    }
         
}

repararTanque(): void{
    if (this.vida<100 && this.vida > 50 && this.reparo > 0){
        this.vida = 100;
        this.reparo -= 1
    }else if (this.vida <= 50 && this.reparo > 0){
        this.vida += 50;
         this.reparo -= 1
    }else{
        throw new Error("Não temos mais como reparar essa desgraça comandante.")
    }
}

atacar(): void{
    if(this.culatra == 1){
        this.culatra -= 1
        this.ataque == 1 + Math.floor(Math.random() * 20); 
    }else{
        throw new Error("Sem munição na culatra")
    }
}


}