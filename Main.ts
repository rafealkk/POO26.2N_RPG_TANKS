import { Tanque } from "./class/Tanque.ts";
import { Equipamento } from "./class/Equipamento.ts";
import { Batalha } from "./class/Batalha.ts";
import prompt from "prompt-sync";

const teclado = prompt();
const modelos = ["M4 Sherman", "Tiger I", "T-34"];

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
    console.log("1. M4 Sherman | Médio | Vida 80  | Ataque 30 | Precisão 70%");
    console.log("2. Tiger I    | Pesado| Vida 100 | Ataque 50 | Precisão 60%");
    console.log("3. T-34       | Médio | Vida 90  | Ataque 35 | Precisão 80%");
    escolhaTanque = Number(teclado("Escolha (1 a 3): "));
    if (![1, 2, 3].includes(escolhaTanque)) console.log("Modelo inválido!");
} while (![1, 2, 3].includes(escolhaTanque));

const equipamentoJogador = new Equipamento("Ferramentas", "Úteis", 0);
const tanqueJogador = new Tanque(modelos[escolhaTanque - 1]!, "", equipamentoJogador);
const modelosInimigos = modelos.filter(m => m !== tanqueJogador.modelo);
const modeloInimigo = modelosInimigos[Math.floor(Math.random() * modelosInimigos.length)]!;
const equipamentoInimigo = new Equipamento("Ferramentas", "Úteis", 0);
const tanqueInimigo = new Tanque(modeloInimigo, "", equipamentoInimigo);
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
            case 6: batalha.finalizarTurno(); break;
            case 99: console.log("\nSaindo do jogo..."); break;
            default: console.log("Opção inválida!");
        }
    } catch (erro) {
        console.log(`\n${(erro as Error).message}`);
    }
} while (escolha !== 99 && batalha.batalhaAtiva());

if (!tanqueInimigo.estaVivo()) console.log("\nPARABÉNS, VOCÊ VENCEU!");
else if (!tanqueJogador.estaVivo()) console.log("\nFIM DE JOGO!");
