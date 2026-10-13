import { Tanque } from "./class/Tanque.ts";
import { Equipamento } from "./class/Equipamento.ts";
import prompt from "prompt-sync"

const teclado = prompt()
teclado("Bem-vindo ao Tank kombat\n\nPressione alguma tecla para Iniciar")


console.clear();

console.log(`
=========================================
             TANK KOMBAT
=========================================

             __.---.___
        ___/__\\_O_/___\\___
       /___\\__________/___\\
       |===|\\________/|===|
_______|===|__________|===|______

    PREPARE-SE PARA A GUERRA!

=========================================
`);

let modelo = "";
let escolhaTanque: number;

do {
    console.clear();

    console.log("================================");
    console.log("       ESCOLHA SEU TANQUE");
    console.log("================================");

    console.log("1 - M4 Sherman");
    console.log("    Médio | Vida: 80 | Ataque: 30");

    console.log("2 - Tiger I");
    console.log("    Pesado | Vida: 100 | Ataque: 50");

    console.log("3 - T-34");
    console.log("    Médio | Vida: 90 | Ataque: 35");

    escolhaTanque = Number(teclado("\nEscolha: "));

    switch (escolhaTanque) {
        case 1:
            modelo = "M4 Sherman";
            break;

        case 2:
            modelo = "Tiger I";
            break;

        case 3:
            modelo = "T-34";
            break;

        default:
            console.log("\nOpção inválida!");
            teclado("Pressione ENTER para tentar novamente...");
    }

} while (escolhaTanque < 1 || escolhaTanque > 3);

const equipamento = new Equipamento("Ferramentas", "Úteis", 0);

const tanqueJogador = new Tanque(modelo, "", equipamento);

console.clear();

console.log("================================");
console.log("       TANQUE PREPARADO!");
console.log("================================");

console.table(tanqueJogador);

teclado("\nPressione ENTER para entrar em combate...");



/*
const equipamento: Equipamento = new Equipamento("ferramentas", "uteis", 0)
const sherman: Tanque = new Tanque("M4", "Medio", equipamento);
*/
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
                tanqueJogador.carregarMunicao();
                console.log("\n\n\n\n\nBala Neles!!!")
            } catch (e) {
                console.log((e as Error).message);
            }
            break;

        case 2:  //reparar
            try {
                tanqueJogador.repararTanque();
            } catch (e) {
                console.log((e as Error).message);
            }
            break;

        case 3:  //status
            try {
                console.table(tanqueJogador);
            } catch (e) {
                console.log((e as Error).message);
            }
            break;

        case 4: //atacar
            try {
                tanqueJogador.atacar()
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