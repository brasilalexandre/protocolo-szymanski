# Gincana da Princesa 👸

Jogo de tabuleiro estilo "Mario Party" com temática infantil, feito em **HTML, CSS e JavaScript puros** (sem instalação e sem build). Foi pensado para jogar no celular, com controles de toque.

## Como jogar

- A **Princesa Pérola** (você) e os amigos **Tico 🍄**, **Dino Lulu 🦖** e **Robô Bip 🤖** andam pelo tabuleiro.
- Toque em **🎲 Rolar o dado** na sua vez e ande as casas.
- Casas:
  - `+3` (azul): ganha 3 moedas 🪙
  - `-3` (vermelha): perde 3 moedas
  - `⭐` (laranja): compra uma estrela por 10 moedas (a estrela muda de lugar depois)
  - `❓` (roxa): evento surpresa
  - `🏁` (amarela): início — passar por ela dá 2 moedas
- A cada **3 rodadas** tem um **minigame** da gincana. Quem fizer mais pontos ganha mais moedas (10 / 6 / 3 / 1).
- Após **9 rodadas**, vence quem tiver mais **⭐**. Em caso de empate, vence quem tiver mais moedas.

### Minigames
1. **Pegue as Estrelinhas** — toque nas estrelas que caem em 10 segundos.
2. **Corrida do Arco-Íris** — toque no botão o máximo que puder em 8 segundos.
3. **Pare na Estrela** — toque em PARAR quando o ponteiro estiver no verde.

## Como abrir

**Opção 1 — direto no navegador:** dê dois cliques em `index.html`.

**Opção 2 — no celular pela rede Wi-Fi:** dentro desta pasta, rode um servidor local:

```bash
python3 -m http.server 8000
```

Depois abra `http://IP-DO-COMPUTADOR:8000/jogo-princesa/` no celular (ou na pasta acima, conforme onde o comando foi executado).

**Opção 3 — hospedagem gratuita:** suba a pasta `jogo-princesa/` no GitHub Pages, Netlify ou similar; o jogo funciona só com arquivos estáticos.

## Estrutura

```
jogo-princesa/
├── index.html        # página principal
├── css/style.css     # visual (cores, botões, modais, minigames)
└── js/
    ├── game.js       # regras: tabuleiro, turnos, dado, moedas, estrelas, gincana
    └── minigames.js  # os três minigames (fácil de acrescentar outros)
```

Para adicionar um minigame, inclua um novo objeto em `window.MINIGAMES` em `js/minigames.js` com `title`, `how` e uma função `run({ stage, players, npc, rand })` que devolve uma Promise com a pontuação de cada jogador (índice 0 = Princesa).

Para mudar o número de rodadas ou o custo da estrela, edite as constantes no início de `js/game.js` (`TOTAL_ROUNDS`, `STAR_COST`, `REWARDS` etc.).

## Observações

- Os personagens são originais (inspirados no estilo, sem usar personagens de marcas registradas).
- A fonte "Luckiest Guy" e "Baloo 2" são carregadas do Google Fonts; se estiver offline, o jogo usa uma fonte reserva.
- Os sons são gerados pelo próprio navegador (podem ser desligados silenciando o celular).
