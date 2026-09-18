import { Tanque } from "./class/Tanque.ts";
import { Equipamento } from "./class/Equipamento.ts";
import prompt from "prompt-sync"

const teclado = prompt()
teclado("Bem-vindo ao Tank kombat\n\nPressione alguma tecla para Iniciar")

const equipamento: Equipamento = new Equipamento("ferramentas", "uteis", 0)
const sherman: Tanque = new Tanque("M4", "Medio", equipamento);

//console.table(sherman.map(p=>({modelo:p.modelo , classe:p.classe})));
//console.table(sherman);
//console.table(equipamento);

let escolha
do {
    console.log("\n\n\nTa ta-ra -raaaaaaaaaaaaaaaaa!!!!\n\n")
    console.log("1.Carregar Canhão")
    console.log("2.Reparar")
    console.log("3.Status")
    console.log("4.Atacar")
    console.log("\n99.Sair")

    escolha = +teclado("Escolha uma opção: ")

    switch (escolha) {

        case 1: //carregar canhao
            try {
                sherman.carregarMunicao();
                console.log("\n\n\n\n\nBala Neles!!!")
            } catch (e) {
                console.log((e as Error).message);
            }
            break;

        case 2:  //reparar
            try {
                sherman.repararTanque();
            } catch (e) {
                console.log((e as Error).message);
            }
            break;

        case 3:  //status
            try {
                console.table(sherman);
            } catch (e) {
                console.log((e as Error).message);
            }
            break;

        case 4: //atacar
            try {
                sherman.atacar()
                console.log("BOOOOOMMMMMMMMM!!!!!!!!!!!!!")
            } catch (e) {
                console.log((e as Error).message);
            }
            break;

        case 99: //sair
            console.log("\nSaindo do jogo...")
            break;

        default:
            console.log("\nOpção inválida!")
            break;
    }
} while (escolha !== 99);



//Escolha nos Modelos de veículos; Classe; Equipamentos; Dano; Vida;