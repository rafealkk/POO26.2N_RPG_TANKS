# Falas dos tripulantes

## Executar

Use Node.js 22 ou superior (validado com Node.js 24).

1. Execute `npm install`.
2. Copie `.env.example` para `.env`.
3. Preencha `GEMINI_API_KEY` no arquivo `.env` com sua chave do Google AI Studio:
   https://aistudio.google.com/apikey
4. Execute `npm start` em um terminal interativo.

O comando de início carrega o `.env` automaticamente. Também é possível definir
`GEMINI_API_KEY` diretamente no ambiente. `GEMINI_MODEL` é opcional e permite
alterar o modelo; o padrão é `gemini-3.5-flash-lite`. A disponibilidade depende da API
e da sua conta. Sem chave, o jogo funciona usando as falas alternativas.

O arquivo `.env` e suas variantes locais são ignorados pelo Git. O exemplo
versionado não contém chave. Nunca coloque uma chave real no código, nos testes
ou no arquivo de exemplo.

## Alterações por etapa

1. `class/GeradorFalas.ts`: centraliza o SDK oficial `@google/genai`, recebe um
   resumo do disparo e solicita uma frase em português de até 120 caracteres.
   A chamada usa timeout de 60 segundos. Respostas vazias, longas e erros usam
   falas locais para acerto, erro ou destruição. Erros do SDK não são impressos.
2. `class/Batalha.ts`: solicita uma fala depois de resolver cada disparo, tanto
   do jogador como do inimigo. Usa o dano real e a vida restante. O gerador pode
   ser passado ao construtor para permitir testes sem acesso à API.
3. `Main.ts`: aguarda ataque e finalização de turno. A cadeia de chamadas da
   batalha usa `async/await` para manter as mensagens em ordem.
4. Configuração: adiciona SDK, tipos do Node, executor `tsx` e comandos npm.
   O `package-lock.json` registra as dependências instaladas.

As classes dos tanques e equipamentos não foram alteradas. Custos, sorteios,
chance de acerto, dano, reparo e decisões do inimigo continuam iguais.
Não há chamadas ao Gemini em carregamento, movimento, reparo ou consulta de status.

## Verificar

```powershell
npm run typecheck
npm test
```

Os testes da integração simulam respostas do SDK e não usam uma chave real.
Verificam alternativas, falha da API e os resultados e recursos de disparos.

Documentação do SDK: https://googleapis.github.io/js-genai/

## Diagnóstico temporário

Execute `npx tsx --env-file-if-exists=.env diagnostico-gemini.ts` para testar uma chamada real
fora da batalha. Esse comando pode consumir cota da API. Ele informa presença da
chave, inicialização do cliente, início da requisição, tamanho da resposta e
motivo do descarte, ou tipo e mensagem sanitizada do erro. Não imprime a fala.

Para habilitar os mesmos logs durante o jogo, no PowerShell:

```powershell
$env:GEMINI_DEBUG="1"
npm start
```

Para desligar os logs: `Remove-Item Env:GEMINI_DEBUG`.

## Correção de disponibilidade

Em 08/11/2026, o modelo 3.8 Flash retornou prazo expirado e sobrecarga. O 3.5 Flash Lite respondeu com uma fala aceita. O modelo configurado no ambiente tem prioridade sobre o padrão do código. A chave não foi alterada.

O orçamento de geração passou de 256 para 1024 tokens para reduzir o risco de interromper a geração antes de obter uma fala. Tokens não são caracteres: a validação final continua exigindo até 120 caracteres. Isso não corrige sobrecarga do servidor; a troca do modelo resolveu a chamada testada. Falhas futuras ainda usam as alternativas locais.

