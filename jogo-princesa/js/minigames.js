/*
 * Minigames da Gincana.
 * Cada minigame recebe um "ctx" com:
 *   stage   -> elemento onde o minigame desenha a sua área
 *   players -> lista de jogadores (índice 0 = Princesa, controlada pelo toque)
 *   npc(p, base) -> pontuação simulada para um amigo (NPC)
 *   rand(a, b)   -> inteiro aleatório entre a e b
 * e devolve uma Promise com um array de pontuações (uma por jogador).
 */
(() => {
  'use strict';

  const pause = (ms) => new Promise((r) => setTimeout(r, ms));

  window.MINIGAMES = [
    /* ---------------------------------------------------------- *
     * 1) PEGUE AS ESTRELINHAS — toque nas estrelas que caem
     * ---------------------------------------------------------- */
    {
      title: '⭐ Pegue as Estrelinhas',
      how: 'Toque nas estrelinhas que caem! 💎 vale 3 pontos. Você tem 10 segundos.',
      run({ stage, players, npc, rand }) {
        return new Promise((resolve) => {
          stage.innerHTML = `
            <div class="timer" id="t">10</div>
            <div class="score-live" id="sc">0</div>
          `;
          const timerEl = stage.querySelector('#t');
          const scoreEl = stage.querySelector('#sc');
          let caught = 0;
          let left = 10;

          const spawn = setInterval(() => {
            const gem = Math.random() < 0.2;
            const s = document.createElement('div');
            s.className = 'falling';
            s.textContent = gem ? '💎' : '⭐';
            s.style.left = rand(8, 88) + '%';
            s.addEventListener('pointerdown', (e) => {
              e.preventDefault();
              if (s.dataset.done) return;
              s.dataset.done = '1';
              caught += gem ? 3 : 1;
              scoreEl.textContent = caught;
              s.textContent = '✨';
              s.style.animation = 'none';
              s.style.transform = 'scale(1.3)';
              setTimeout(() => s.remove(), 200);
            });
            stage.appendChild(s);
            setTimeout(() => s.remove(), 2600);
          }, 550);

          const tick = setInterval(() => {
            left -= 1;
            timerEl.textContent = left;
            if (left <= 0) {
              clearInterval(spawn);
              clearInterval(tick);
              stage.innerHTML = '';
              resolve(players.map((p, i) => (i === 0 ? caught : npc(p, 9))));
            }
          }, 1000);
        });
      },
    },

    /* ---------------------------------------------------------- *
     * 2) CORRIDA DO ARCO-ÍRIS — toque sem parar por 8 segundos
     * ---------------------------------------------------------- */
    {
      title: '🌈 Corrida do Arco-Íris',
      how: 'Toque no botão o mais rápido que puder por 8 segundos!',
      run({ stage, players, npc }) {
        return new Promise((resolve) => {
          stage.innerHTML = `
            <p class="hint">Toque sem parar! 👆</p>
            <button class="tapbtn" id="tap">TOQUE!</button>
            <div class="bar"><div id="fill"></div></div>
            <div class="big-score" id="sc">0</div>
          `;
          const btn = stage.querySelector('#tap');
          const fill = stage.querySelector('#fill');
          const scoreEl = stage.querySelector('#sc');
          const DURATION = 8000;
          let taps = 0;
          const start = performance.now();

          const onTap = (e) => {
            e.preventDefault();
            taps += 1;
            scoreEl.textContent = taps;
            btn.classList.add('squish');
            setTimeout(() => btn.classList.remove('squish'), 60);
          };
          btn.addEventListener('pointerdown', onTap);

          const frame = setInterval(() => {
            const t = performance.now() - start;
            fill.style.width = Math.min(100, (t / DURATION) * 100) + '%';
            if (t >= DURATION) {
              clearInterval(frame);
              btn.disabled = true;
              btn.removeEventListener('pointerdown', onTap);
              resolve(players.map((p, i) => (i === 0 ? taps : npc(p, 38))));
            }
          }, 50);
        });
      },
    },

    /* ---------------------------------------------------------- *
     * 3) PARE NA ESTRELA — pare o ponteiro no verde
     * ---------------------------------------------------------- */
    {
      title: '🎯 Pare na Estrela',
      how: 'Um ponteiro vai e volta. Toque em PARAR quando ele estiver no verde do meio!',
      run({ stage, players, npc }) {
        return new Promise((resolve) => {
          stage.innerHTML = `
            <p class="hint">Toque em PARAR no centro! ⭐</p>
            <div class="meter"><div class="needle" id="n"></div></div>
            <button class="btn" id="stop" style="margin-top:44px">✋ PARAR</button>
          `;
          const needle = stage.querySelector('#n');
          const btn = stage.querySelector('#stop');
          const t0 = performance.now();
          let pos = 0;
          let raf = 0;
          let done = false;

          const loop = () => {
            const t = (performance.now() - t0) / 1000;
            pos = ((Math.sin(t * 2.8) + 1) / 2) * 100;
            needle.style.left = pos + '%';
            if (!done) raf = requestAnimationFrame(loop);
          };
          raf = requestAnimationFrame(loop);

          btn.addEventListener('pointerdown', (e) => {
            e.preventDefault();
            if (done) return;
            done = true;
            cancelAnimationFrame(raf);
            btn.disabled = true;
            const score = Math.max(0, Math.round(100 - Math.abs(pos - 50) * 2));
            stage.querySelector('.hint').innerHTML = `Você fez <span class="big-score">${score}</span> pontos!`;
            pause(1400).then(() =>
              resolve(players.map((p, i) => (i === 0 ? score : npc(p, 70))))
            );
          });
        });
      },
    },
  ];
})();
