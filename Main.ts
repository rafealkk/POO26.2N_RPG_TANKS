import { Tanque } from "./class/Personagem.ts";
import { Equipamento } from "./class/Equipamento.ts";
import prompt from "prompt-sync"

const teclado = prompt()

teclado("Pressione alguma tecla para continuar...")


const equipamento: Equipamento = new Equipamento("ferramentas", "uteis", 0)

const sherman: Tanque = new Tanque("M4", "Medio", equipamento);
sherman.vida = 200;
sherman.dano = 85;

//console.table(sherman.map(p=>({modelo:p.modelo , classe:p.classe})));
console.table(sherman);
console.table(equipamento);




//Escolha nos Modelos de veículos; Classe; Equipamentos; Dano; Vida;