import { Tanque } from "./class/Tanque.ts";
import { TanqueLeve } from "./class/TanqueLeve.ts";
import { TanqueMedio } from "./class/TanqueMedio.ts";
import { TanquePesado } from "./class/TanquePesado.ts";
import { Equipamento } from "./class/Equipamento.ts";
import { Batalha } from "./class/Batalha.ts";
import prompt from "prompt-sync";

const teclado = prompt();
const modelos = ["M2", "M4 Sherman", "Tiger I", "T-34"];

function criarTanque(modelo: string, equipamento: Equipamento): Tanque {
    switch (modelo) {
        case "M2": return new TanqueLeve(equipamento);
        case "M4 Sherman": return new TanqueMedio("M4 Sherman", equipamento);
        case "Tiger I": return new TanquePesado(equipamento);
        case "T-34": return new TanqueMedio("T-34", equipamento);
        default: throw new Error("Modelo inválido: " + modelo);
    }
}

console.clear();
console.log(String.raw`
==========================================
               TANK KOMBAT
==========================================
             __.---.___
        ___/__\_O_/___\___
       /___\__________/___\
       |===|\________/|===|
_______|===|__________|===|______

         PREPARE-SE PARA A GUERRA!
==========================================`);
teclado("\nPressione ENTER para iniciar...");

let escolhaTanque = 0;
do {
    console.log("\n========== ESCOLHA SEU TANQUE ==========");
    console.log("1. M2         | Leve   | Vida 65  | Ataque 30 | Precisão 95%");
    console.log("2. M4 Sherman | Médio  | Vida 80  | Ataque 40 | Precisão 90%");
    console.log("3. Tiger I    | Pesado | Vida 120 | Ataque 70 | Precisão 80%");
    console.log("4. T-34       | Médio  | Vida 90  | Ataque 60 | Precisão 70%");
    escolhaTanque = Number(teclado("Escolha (1 a 4): "));
    if (![1, 2, 3, 4].includes(escolhaTanque)) console.log("Modelo inválido!");
} while (![1, 2, 3, 4].includes(escolhaTanque));

const equipamentoJogador = new Equipamento("Ferramentas", "Úteis", 0);
const tanqueJogador = criarTanque(modelos[escolhaTanque - 1]!, equipamentoJogador);
const modelosInimigos = modelos.filter(m => m !== tanqueJogador.modelo);
const modeloInimigo = modelosInimigos[Math.floor(Math.random() * modelosInimigos.length)]!;
const equipamentoInimigo = new Equipamento("Ferramentas", "Úteis", 0);
const tanqueInimigo = criarTanque(modeloInimigo, equipamentoInimigo);
const batalha = new Batalha(tanqueJogador, tanqueInimigo);

console.log(`\nSeu tanque: ${tanqueJogador.modelo}`);
console.log(`Inimigo detectado: ${tanqueInimigo.modelo}`);
teclado("\nPressione ENTER para iniciar a batalha...");

let escolha = 0;
do {
    batalha.mostrarStatus();
    console.log("\n1. Carregar canhão (-30)");
    console.log("2. Reparar tanque (-50)");
    console.log("3. Consultar status (0)");
    console.log("4. Atacar (-30)");
    console.log("5. Movimentar (-70)");
    console.log("6. Finalizar turno (inimigo joga)");
    console.log("99. Sair");
    escolha = Number(teclado("\nEscolha uma opção: "));
    try {
        switch (escolha) {
            case 1: batalha.carregarJogador(); break;
            case 2: batalha.repararJogador(); break;
            case 3: batalha.mostrarStatus(); break;
            case 4: batalha.atacarInimigo(); break;
            //case 4: console.log(tanqueJogador.atacar()); break;
            case 5: batalha.movimentarJogador(); break;
            case 6: console.clear(); batalha.finalizarTurno(); break;
            case 99: console.log("\nSaindo do jogo..."); break;
            default: console.log("Opção inválida!");
        }
    } catch (erro) {
        console.log(`\n${(erro as Error).message}`);
    }
} while (escolha !== 99 && batalha.batalhaAtiva());

if (!tanqueInimigo.estaVivo()) console.log("\nPARABÉNS, VOCÊ VENCEU!");
else if (!tanqueJogador.estaVivo()) console.log("\nFIM DE JOGO!");
