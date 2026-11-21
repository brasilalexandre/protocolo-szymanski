/*
 * Gincana da Princesa — lógica principal
 * Tabuleiro em anel, turnos, dado, moedas, estrelas e minigames.
 */
(() => {
  'use strict';

  /* ------------------------------------------------------------------ *
   * Configuração
   * ------------------------------------------------------------------ */
  const TOTAL_ROUNDS = 9;        // rodadas da gincana
  const MINIGAME_EVERY = 3;      // minigame a cada 3 rodadas
  const REWARDS = [10, 6, 3, 1]; // moedas por colocação no minigame
  const STAR_COST = 10;          // moedas para comprar 1 estrela
  const STEP_MS = 230;           // tempo entre casas andadas
  const GRID = 7;                // tabuleiro 7x7 => 24 casas no anel

  // Personagens originais (inspirados no clima de jogos de tabuleiro)
  const PLAYERS = [
    { name: 'Princesa Pérola', emoji: '👸', color: '#ff5fa2', human: true,  skill: 1.00 },
    { name: 'Tico',            emoji: '🍄', color: '#e53935', human: false, skill: 0.85 },
    { name: 'Dino Lulu',       emoji: '🦖', color: '#43a047', human: false, skill: 1.00 },
    { name: 'Robô Bip',        emoji: '🤖', color: '#1e88e5', human: false, skill: 1.15 },
  ];

  // Tipos de casa: S = início, + = ganha moedas, - = perde moedas,
  // ★ = loja de estrelas, ? = evento surpresa
  const ORIGINAL_KINDS = [
    'S', '+', '-', '★', '?', '+', '-', '+', '★', '?', '-', '+',
    '+', '-', '?', '+', '-', '★', '+', '?', '-', '+', '★', '-',
  ];

  const KIND_STYLE = {
    'S': { color: '#ffd23f', label: '🏁' },
    '+': { color: '#4fc3f7', label: '+3' },
    '-': { color: '#ef5350', label: '-3' },
    '★': { color: '#ffb300', label: '⭐' },
    '?': { color: '#ab47bc', label: '❓' },
  };

  const EVENTS = [
    { text: '🎀 Achou um laço de fita! +5 moedas', coins: 5 },
    { text: '🍌 Escorregou numa casca de banana! -4 moedas', coins: -4 },
    { text: '🌬️ Vento a favor! Avança 2 casas', move: 2 },
    { text: '🎂 Ganhou um bolinho da princesa! +2 moedas', coins: 2 },
  ];

  const MEDALS = ['🥇', '🥈', '🥉', '4º'];

  /* ------------------------------------------------------------------ *
   * Elementos e estado
   * ------------------------------------------------------------------ */
  const $ = (sel) => document.querySelector(sel);
  const canvas = $('#board');
  const g = canvas.getContext('2d');
  const hudEl = $('#hud');
  const msgEl = $('#msg');
  const rollBtn = $('#roll');
  const diceEl = $('#dice');
  const overlay = $('#overlay');
  const modal = $('#modal');

  const N = GRID * 4 - 4;        // 24 casas
  const PERIM = perimeter(GRID); // coordenadas [coluna, linha] de cada casa

  let kinds = ORIGINAL_KINDS.slice();
  let round = 0;
  PLAYERS.forEach((p) => Object.assign(p, { coins: 5, stars: 0, pos: 0 }));
  let active = -1;   // índice do jogador com a vez
  let size = 0;      // lado do tabuleiro em px (CSS)
  let cell = 0;      // lado de cada célula em px (CSS)
  let audioCtx = null;

  /* ------------------------------------------------------------------ *
   * Utilidades
   * ------------------------------------------------------------------ */
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const rand = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
  // Pontuação de um NPC em um minigame: base x habilidade x sorte
  const npc = (p, base) => Math.round(base * p.skill * (0.75 + Math.random() * 0.5));

  function perimeter(n) {
    const cells = [];
    for (let c = 0; c < n; c++) cells.push([c, 0]);
    for (let r = 1; r < n; r++) cells.push([n - 1, r]);
    for (let c = n - 2; c >= 0; c--) cells.push([c, n - 1]);
    for (let r = n - 2; r >= 1; r--) cells.push([0, r]);
    return cells;
  }

  function beep(freq, dur) {
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      const o = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      o.type = 'square';
      o.frequency.value = freq;
      gain.gain.value = 0.04;
      o.connect(gain);
      gain.connect(audioCtx.destination);
      o.start();
      o.stop(audioCtx.currentTime + dur);
    } catch (e) { /* som é opcional */ }
  }

  function roundRect(x, y, w, h, r) {
    g.beginPath();
    g.moveTo(x + r, y);
    g.arcTo(x + w, y, x + w, y + h, r);
    g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r);
    g.arcTo(x, y, x + w, y, r);
    g.closePath();
  }

  /* ------------------------------------------------------------------ *
   * Tela: tabuleiro, HUD, mensagens e modais
   * ------------------------------------------------------------------ */
  function resize() {
    const box = canvas.parentElement.getBoundingClientRect();
    size = Math.floor(Math.min(box.width, box.height));
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    cell = size / GRID;
    draw();
  }

  function draw() {
    if (!cell) return;
    g.clearRect(0, 0, size, size);

    // Fundo (grama)
    g.fillStyle = '#8fd96b';
    roundRect(0, 0, size, size, cell * 0.5);
    g.fill();

    // Centro (painel da gincana)
    g.fillStyle = '#fff6cf';
    roundRect(cell * 1.1, cell * 1.1, size - cell * 2.2, size - cell * 2.2, cell * 0.4);
    g.fill();
    g.fillStyle = '#5b3b1e';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.font = `${cell * 0.5}px 'Luckiest Guy', 'Baloo 2', sans-serif`;
    g.fillText('GINCANA', size / 2, size / 2 - cell * 0.6);
    g.font = `${cell * 0.3}px 'Baloo 2', sans-serif`;
    g.fillText(round ? `Rodada ${round} de ${TOTAL_ROUNDS}` : 'Reino Colorido', size / 2, size / 2 - cell * 0.1);
    g.fillText('🏆 ⭐ = vitória', size / 2, size / 2 + cell * 0.35);

    // Casas do anel
    for (let i = 0; i < N; i++) {
      const [c, r] = PERIM[i];
      const x = c * cell + 4;
      const y = r * cell + 4;
      const w = cell - 8;
      const h = cell - 8;
      const style = KIND_STYLE[kinds[i]];
      g.fillStyle = style.color;
      roundRect(x, y, w, h, cell * 0.18);
      g.fill();
      g.lineWidth = 2;
      g.strokeStyle = 'rgba(0,0,0,0.25)';
      g.stroke();

      g.fillStyle = '#fff';
      g.font = `bold ${cell * 0.24}px 'Baloo 2', sans-serif`;
      g.fillText(style.label, x + w / 2, y + h * 0.26);
    }

    // Peças (personagens) — cada um numa linha/coluna para não sobrepor
    PLAYERS.forEach((p, idx) => {
      const [c, r] = PERIM[p.pos];
      const cx = (c + 0.5) * cell + (idx % 2 ? 0.2 : -0.2) * cell;
      const cy = (r + 0.5) * cell + (idx < 2 ? 0.08 : 0.3) * cell;
      const radius = cell * 0.17;

      g.beginPath();
      g.arc(cx, cy, radius, 0, Math.PI * 2);
      g.fillStyle = '#ffffff';
      g.fill();
      g.lineWidth = idx === active ? 4 : 2;
      g.strokeStyle = idx === active ? '#ffd23f' : p.color;
      g.stroke();

      g.font = `${cell * 0.28}px 'Apple Color Emoji', 'Segoe UI Emoji', sans-serif`;
      g.fillStyle = '#000';
      g.fillText(p.emoji, cx, cy + cell * 0.01);
    });
  }

  function renderHud() {
    hudEl.innerHTML = PLAYERS.map((p, i) => `
      <div class="card${i === active ? ' active' : ''}" style="--c:${p.color}">
        <div class="av">${p.emoji}</div>
        <div class="nm">${p.name}</div>
        <div class="st">⭐${p.stars} 🪙${p.coins}</div>
      </div>`).join('');
  }

  function setMsg(text) {
    msgEl.textContent = text;
  }

  function openModal(html) {
    modal.innerHTML = html;
    overlay.classList.remove('hidden');
  }

  function closeModal() {
    overlay.classList.add('hidden');
    modal.innerHTML = '';
  }

  function clickOnce(selector) {
    return new Promise((resolve) => {
      modal.querySelector(selector).addEventListener('click', () => resolve(), { once: true });
    });
  }

  /* ------------------------------------------------------------------ *
   * Regras do jogo
   * ------------------------------------------------------------------ */
  function resetPlayers() {
    PLAYERS.forEach((p) => {
      p.coins = 5;
      p.stars = 0;
      p.pos = 0;
    });
  }

  function moveStar() {
    const old = kinds.indexOf('★');
    kinds[old] = '+';
    let idx;
    do {
      idx = rand(1, N - 1);
    } while (!(kinds[idx] === '+' || kinds[idx] === '-') || idx === old);
    kinds[idx] = '★';
  }

  // Espera o jogador tocar em "Rolar o dado"
  function waitForRoll() {
    rollBtn.disabled = false;
    return new Promise((resolve) => {
      rollBtn.addEventListener('click', () => {
        rollBtn.disabled = true;
        resolve(rand(1, 6));
      }, { once: true });
    });
  }

  async function showDice(finalValue) {
    for (let k = 0; k < 6; k++) {
      diceEl.textContent = rand(1, 6);
      beep(400 + k * 60, 0.03);
      await sleep(70);
    }
    diceEl.textContent = finalValue;
  }

  async function moveSteps(p, steps) {
    for (let s = 0; s < steps; s++) {
      p.pos = (p.pos + 1) % N;
      if (p.pos === 0) {
        p.coins += 2;
        setMsg(`${p.name} passou pelo início e ganhou 2 moedas! 🏁`);
      }
      beep(660, 0.05);
      draw();
      renderHud();
      await sleep(STEP_MS);
    }
  }

  async function landOn(p) {
    const kind = kinds[p.pos];

    if (kind === '+') {
      p.coins += 3;
      setMsg(`${p.name} ganhou 3 moedas! 🪙`);
      beep(880, 0.12);
    } else if (kind === '-') {
      const lost = Math.min(3, p.coins);
      p.coins -= lost;
      setMsg(`${p.name} perdeu ${lost} moeda(s) 😢`);
      beep(220, 0.2);
    } else if (kind === '★') {
      if (p.coins >= STAR_COST) {
        p.coins -= STAR_COST;
        p.stars += 1;
        moveStar();
        setMsg(`${p.name} comprou uma ⭐ por ${STAR_COST} moedas!`);
        beep(990, 0.25);
      } else {
        setMsg(`${p.name} quer uma ⭐, mas precisa de ${STAR_COST} moedas.`);
      }
    } else if (kind === '?') {
      const ev = EVENTS[rand(0, EVENTS.length - 1)];
      setMsg(ev.text);
      beep(520, 0.15);
      if (ev.coins) p.coins = Math.max(0, p.coins + ev.coins);
      renderHud();
      draw();
      await sleep(1100);
      if (ev.move) await moveSteps(p, ev.move);
    }

    renderHud();
    draw();
    await sleep(1100);
  }

  async function takeTurn(i) {
    const p = PLAYERS[i];
    active = i;
    renderHud();
    draw();

    let roll;
    if (p.human) {
      setMsg('Sua vez, Princesa! Toque em "Rolar o dado" 🎲');
      roll = await waitForRoll();
    } else {
      setMsg(`Vez de ${p.name}...`);
      await sleep(800);
      roll = rand(1, 6);
    }

    await showDice(roll);
    setMsg(`${p.name} tirou ${roll}!`);
    await sleep(400);
    await moveSteps(p, roll);
    await landOn(p);
  }

  /* ------------------------------------------------------------------ *
   * Minigames
   * ------------------------------------------------------------------ */
  async function runMinigame(n) {
    const game = window.MINIGAMES[(n - 1) % window.MINIGAMES.length];

    openModal(`
      <h2>Minigame ${n} da gincana</h2>
      <h1>${game.title}</h1>
      <p>${game.how}</p>
      <button class="btn" id="go">Vamos! 🚀</button>`);
    await clickOnce('#go');

    openModal(`<h2>${game.title}</h2><div id="stage" class="stage"></div>`);
    const scores = await game.run({
      stage: modal.querySelector('#stage'),
      players: PLAYERS,
      npc,
      rand,
      sleep,
    });

    const ranking = PLAYERS.map((_, i) => i)
      .sort((a, b) => scores[b] - scores[a] || a - b);

    const lines = ranking.map((i, pos) => {
      const p = PLAYERS[i];
      const gain = REWARDS[pos];
      p.coins += gain;
      return `<li style="--c:${p.color}">
        <span>${MEDALS[pos]} ${p.emoji} ${p.name}</span>
        <span>${scores[i]} pts · +${gain} 🪙</span>
      </li>`;
    }).join('');

    openModal(`
      <h2>Resultado do minigame</h2>
      <h1>Pontuação!</h1>
      <ol class="rank">${lines}</ol>
      <button class="btn" id="ok">Continuar ▶</button>`);
    await clickOnce('#ok');
    closeModal();
    renderHud();
    draw();
  }

  /* ------------------------------------------------------------------ *
   * Fluxo da gincana
   * ------------------------------------------------------------------ */
  async function runGame() {
    resetPlayers();
    kinds = ORIGINAL_KINDS.slice();
    active = -1;
    renderHud();
    draw();

    for (round = 1; round <= TOTAL_ROUNDS; round++) {
      setMsg(`🏁 Rodada ${round} de ${TOTAL_ROUNDS}! Vamos lá!`);
      draw();
      await sleep(900);

      for (let i = 0; i < PLAYERS.length; i++) {
        await takeTurn(i);
      }

      if (round % MINIGAME_EVERY === 0) {
        active = -1;
        renderHud();
        await runMinigame(round / MINIGAME_EVERY);
      }
    }

    active = -1;
    renderHud();
    draw();
    rollBtn.disabled = true;
    await showFinal();
  }

  async function showFinal() {
    const ranking = PLAYERS.map((_, i) => i).sort((a, b) =>
      PLAYERS[b].stars - PLAYERS[a].stars ||
      PLAYERS[b].coins - PLAYERS[a].coins ||
      a - b
    );
    const winner = PLAYERS[ranking[0]];
    const lines = ranking.map((i, pos) => {
      const p = PLAYERS[i];
      return `<li style="--c:${p.color}">
        <span>${MEDALS[pos] || pos + 1 + 'º'} ${p.emoji} ${p.name}</span>
        <span>⭐ ${p.stars} · 🪙 ${p.coins}</span>
      </li>`;
    }).join('');

    openModal(`
      <h2>🏆 Fim da gincana!</h2>
      <h1>${winner.emoji} ${winner.name} venceu!</h1>
      <ol class="rank">${lines}</ol>
      <button class="btn" id="again">Jogar de novo 🔁</button>`);
    await clickOnce('#again');
    closeModal();
    runGame();
  }

  function showIntro() {
    openModal(`
      <h1>Gincana da Princesa</h1>
      <p>👸 A Princesa Pérola chamou os amigos para a grande gincana do Reino Colorido!</p>
      <p>🎲 Role o dado, ande pelo tabuleiro, pegue 🪙 moedas e compre ⭐ estrelas (${STAR_COST} moedas cada).</p>
      <p>🎮 A cada ${MINIGAME_EVERY} rodadas tem minigame. No fim, quem tiver mais ⭐ vence!</p>
      <button class="btn" id="start">▶ Começar!</button>`);
    clickOnce('#start').then(() => {
      closeModal();
      runGame();
    });
  }

  /* ------------------------------------------------------------------ *
   * Inicialização
   * ------------------------------------------------------------------ */
  rollBtn.disabled = true;
  window.addEventListener('resize', resize);
  window.addEventListener('orientationchange', () => setTimeout(resize, 200));
  resize();
  renderHud();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(draw);
  showIntro();
})();
