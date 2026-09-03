import { Tanque } from "./class/Personagem.ts";
import { Equipamento } from "./class/Equipamento.ts";
import prompt from "prompt-sync"

const teclado = prompt()

teclado("Pressione alguma tecla para continuar...")


const equipamento: Equipamento = new Equipamento("ferramentas", "uteis", 0)

const sherman: Tanque = new Tanque("M4", "Medio", equipamento);



//console.table(sherman.map(p=>({modelo:p.modelo , classe:p.classe})));
//console.table(sherman);
//console.table(equipamento);


let escolha
do {
    console.log("\n\n\nTa ta-ra -raaaaaaaaaaaaaaaaa!!!!\n\n")
    console.log("1.carregar canhao")
    console.log("2.reparar")
    console.log("3.Status")
    console.log("4.Atacar")
    escolha=+teclado("\n\nEscolha uma opção: ")

    
    switch (escolha) {

    case 1: //carregar canhao
        try{
            sherman.carregarMunicao();
        }catch(e){
            console.log((e as Error).message);            
        }
    break;
        
    case 2:  //reparar
        try{
            sherman.repararTanque();
        }catch(e){
            console.log((e as Error).message);
        }
    break;

    case 3:  //status
        try{
            console.table(sherman);
        }catch(e){
            console.log((e as Error).message);
        }
        
    break;

    case 4: //atacar
        try{
            sherman.atacar()
            console.log("BOOOOOMMMMMMMMM!!!!!!!!!!!!!")
        }catch(e){
            console.log((e as Error).message);
        }
        
        
    default:
    break;

    }

    
} while (escolha < 9);



//Escolha nos Modelos de veículos; Classe; Equipamentos; Dano; Vida;