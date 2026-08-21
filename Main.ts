import { Tanque } from "./Personagem.ts";
import prompt from "prompt-sync"

const teclado = prompt()

teclado("Pressione alguma tecla para continuar...")


const p: Tanque = new Tanque();
p.modelo = "Edécio";
p.vida = 10;
p.classe = "Eunuco";
p.dano = "Livro de lógica - Bem legal";
p.equipamentos = 

console.table(p);