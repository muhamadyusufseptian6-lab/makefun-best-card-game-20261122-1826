// Starfall Pact — input.js
// One job: mouse clicks, keyboard controls and the tiny synthesized bleeps.
// Sound is WebAudio oscillators only; no audio file is ever loaded.

var starfallAudioContext = null;

function starfallEnsureAudio(state) {
  if (state.muted) return null;
  try {
    if (!starfallAudioContext) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      starfallAudioContext = new AC();
    }
    if (starfallAudioContext.state === 'suspended') starfallAudioContext.resume();
    return starfallAudioContext;
  } catch (e) {
    return null;
  }
}

function starfallBleep(state, freq, durMs, kind) {
  var ac = starfallEnsureAudio(state);
  if (!ac) return;
  try {
    var osc = ac.createOscillator();
    var gain = ac.createGain();
    osc.type = kind || 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.12, ac.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + durMs / 1000);
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.start();
    osc.stop(ac.currentTime + durMs / 1000);
  } catch (e) {
    // Sound is decoration; a failure must never break the game.
  }
}

function starfallPlaySound(state, name) {
  if (name === 'play') starfallBleep(state, 520, 120, 'triangle');
  else if (name === 'hit') starfallBleep(state, 180, 160, 'sawtooth');
  else if (name === 'heal') starfallBleep(state, 740, 200, 'sine');
  else if (name === 'turn') starfallBleep(state, 330, 90, 'sine');
  else if (name === 'win') {
    starfallBleep(state, 523, 150, 'triangle');
    setTimeout(function () { starfallBleep(state, 659, 150, 'triangle'); }, 140);
    setTimeout(function () { starfallBleep(state, 784, 260, 'triangle'); }, 280);
  } else if (name === 'lose') {
    starfallBleep(state, 220, 220, 'sawtooth');
    setTimeout(function () { starfallBleep(state, 165, 320, 'sawtooth'); }, 200);
  }
}

// Hand card hit-boxes, in canvas coordinates, matching render.js exactly.
function starfallHandCardRects(state) {
  var hand = state.player.hand;
  var cw = STARFALL_CONFIG.cardWidth;
  var ch = STARFALL_CONFIG.cardHeight;
  var gap = 12;
  var totalW = hand.length * cw + (hand.length - 1) * gap;
  var startX = (1280 - totalW) / 2;
  var handY = 720 - ch - 12;
  var rects = [];
  for (var i = 0; i < hand.length; i++) {
    rects.push({
      x: startX + i * (cw + gap),
      y: handY - (state.selected === i ? 22 : 0),
      w: cw,
      h: ch,
    });
  }
  return rects;
}

function starfallPointInRect(px, py, rect) {
  return px >= rect.x && px <= rect.x + rect.w && py >= rect.y && py <= rect.y + rect.h;
}

// Wire the canvas and the keyboard to the game's actions object.
function starfallAttachInput(canvas, state, actions) {
  canvas.addEventListener('click', function (event) {
    var rect = canvas.getBoundingClientRect();
    var x = (event.clientX - rect.left) * (1280 / rect.width);
    var y = (event.clientY - rect.top) * (720 / rect.height);
    if (state.screen === 'title') {
      actions.beginGame();
      return;
    }
    if (state.screen === 'win' || state.screen === 'lose') return;
    if (state.phase !== 'player' || state.over) return;
    var btn = starfallEndTurnButtonRect();
    if (starfallPointInRect(x, y, btn)) {
      actions.endTurn();
      return;
    }
    var rects = starfallHandCardRects(state);
    for (var i = 0; i < rects.length; i++) {
      if (starfallPointInRect(x, y, rects[i])) {
        if (state.selected === i) actions.playCard(i);
        else actions.selectCard(i);
        return;
      }
    }
    actions.selectCard(-1);
  });

  window.addEventListener('keydown', function (event) {
    var key = event.key;
    if (key === 'm' || key === 'M') {
      actions.toggleMute();
      return;
    }
    if (key === 'r' || key === 'R') {
      actions.restart();
      return;
    }
    if (state.screen === 'title') {
      if (key === 'Enter' || key === ' ') {
        event.preventDefault();
        actions.beginGame();
      }
      return;
    }
    if (state.screen === 'win' || state.screen === 'lose') return;
    if (key >= '1' && key <= '7') {
      var idx = Number(key) - 1;
      if (idx < state.player.hand.length) actions.selectCard(idx);
      return;
    }
    if (key === 'Enter' || key === ' ') {
      event.preventDefault();
      if (state.selected >= 0 && state.phase === 'player' && !state.over) {
        actions.playCard(state.selected);
      } else {
        actions.endTurn();
      }
    }
  });
}
