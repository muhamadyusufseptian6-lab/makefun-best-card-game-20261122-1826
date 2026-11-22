// Starfall Pact — render.js
// One job: everything drawn on the canvas — the night table, the cards with
// their colour-and-shape elements, the HUD, and the title / win / lose screens.
// All art is drawn here with canvas paths; no image or font is loaded anywhere.

function starfallRoundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// One element glyph, drawn from paths so colour and shape both tell the element.
function starfallDrawElementGlyph(ctx, glyph, cx, cy, size, color) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(2, size * 0.08);
  ctx.lineJoin = 'round';
  var s = size;
  if (glyph === 'flame') {
    ctx.beginPath();
    ctx.moveTo(cx, cy - s * 0.5);
    ctx.bezierCurveTo(cx + s * 0.42, cy - s * 0.05, cx + s * 0.34, cy + s * 0.34, cx, cy + s * 0.42);
    ctx.bezierCurveTo(cx - s * 0.34, cy + s * 0.34, cx - s * 0.42, cy - s * 0.05, cx, cy - s * 0.5);
    ctx.fill();
    ctx.fillStyle = '#ffd27d';
    ctx.beginPath();
    ctx.moveTo(cx, cy - s * 0.08);
    ctx.bezierCurveTo(cx + s * 0.2, cy + s * 0.1, cx + s * 0.14, cy + s * 0.3, cx, cy + s * 0.32);
    ctx.bezierCurveTo(cx - s * 0.14, cy + s * 0.3, cx - s * 0.2, cy + s * 0.1, cx, cy - s * 0.08);
    ctx.fill();
  } else if (glyph === 'wave') {
    for (var row = 0; row < 2; row++) {
      var wy = cy - s * 0.14 + row * s * 0.32;
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.45, wy);
      ctx.quadraticCurveTo(cx - s * 0.22, wy - s * 0.3, cx, wy);
      ctx.quadraticCurveTo(cx + s * 0.22, wy + s * 0.3, cx + s * 0.45, wy);
      ctx.quadraticCurveTo(cx + s * 0.22, wy + s * 0.42, cx, wy + s * 0.12);
      ctx.quadraticCurveTo(cx - s * 0.22, wy - s * 0.18, cx - s * 0.45, wy);
      ctx.fill();
    }
  } else if (glyph === 'leaf') {
    ctx.beginPath();
    ctx.moveTo(cx, cy - s * 0.5);
    ctx.quadraticCurveTo(cx + s * 0.42, cy - s * 0.1, cx, cy + s * 0.48);
    ctx.quadraticCurveTo(cx - s * 0.42, cy - s * 0.1, cx, cy - s * 0.5);
    ctx.fill();
    ctx.strokeStyle = '#d8ffd8';
    ctx.lineWidth = Math.max(1.5, size * 0.05);
    ctx.beginPath();
    ctx.moveTo(cx, cy - s * 0.34);
    ctx.lineTo(cx, cy + s * 0.36);
    ctx.stroke();
  } else if (glyph === 'mountain') {
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.48, cy + s * 0.4);
    ctx.lineTo(cx - s * 0.05, cy - s * 0.42);
    ctx.lineTo(cx + s * 0.18, cy - s * 0.05);
    ctx.lineTo(cx + s * 0.32, cy - s * 0.28);
    ctx.lineTo(cx + s * 0.48, cy + s * 0.4);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.05, cy - s * 0.42);
    ctx.lineTo(cx + s * 0.08, cy - s * 0.18);
    ctx.lineTo(cx - s * 0.02, cy - s * 0.12);
    ctx.lineTo(cx - s * 0.16, cy - s * 0.16);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

function starfallDrawBackground(ctx, time) {
  var g = ctx.createLinearGradient(0, 0, 0, 720);
  g.addColorStop(0, '#0b1026');
  g.addColorStop(0.55, '#141b3d');
  g.addColorStop(1, '#1d2b4a');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 1280, 720);
  // Fixed star field, placed by a tiny hash so it never moves between frames.
  ctx.fillStyle = '#ffffff';
  for (var i = 0; i < 90; i++) {
    var sx = (i * 173 + 41) % 1280;
    var sy = (i * 97 + 23) % 700;
    var tw = 0.35 + 0.3 * Math.sin(time / 700 + i);
    ctx.globalAlpha = Math.max(0.15, tw);
    ctx.fillRect(sx, sy, 2, 2);
  }
  ctx.globalAlpha = 1;
  // The hollow moon.
  ctx.fillStyle = '#f4ead2';
  ctx.beginPath();
  ctx.arc(1120, 92, 52, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#141b3d';
  ctx.beginPath();
  ctx.arc(1104, 80, 44, 0, Math.PI * 2);
  ctx.fill();
  // Felt table.
  ctx.fillStyle = '#123524';
  ctx.beginPath();
  ctx.ellipse(640, 400, 620, 300, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#2c6b4a';
  ctx.lineWidth = 3;
  ctx.stroke();
}

function starfallDrawLifeBar(ctx, x, y, w, life, maxLife, label, barColor) {
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  starfallRoundRect(ctx, x, y, w, 26, 8);
  ctx.fill();
  var frac = Math.max(0, life / maxLife);
  ctx.fillStyle = barColor;
  starfallRoundRect(ctx, x + 3, y + 3, Math.max(0, (w - 6) * frac), 20, 6);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 15px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(label + '  ' + life + ' / ' + maxLife, x + 10, y + 14);
}

function starfallDrawMana(ctx, x, y, mana, maxMana) {
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 15px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('Mana', x, y + 10);
  for (var i = 0; i < maxMana; i++) {
    ctx.beginPath();
    ctx.arc(x + 62 + i * 26, y + 10, 9, 0, Math.PI * 2);
    ctx.fillStyle = i < mana ? '#4db2ff' : 'rgba(255,255,255,0.18)';
    ctx.fill();
    ctx.strokeStyle = '#bfe3ff';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
}

function starfallDrawCardBack(ctx, x, y, w, h) {
  ctx.fillStyle = '#2a2140';
  starfallRoundRect(ctx, x, y, w, h, 10);
  ctx.fill();
  ctx.strokeStyle = '#c9a227';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#c9a227';
  ctx.beginPath();
  ctx.arc(x + w / 2, y + h / 2, Math.min(w, h) * 0.22, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#2a2140';
  ctx.beginPath();
  ctx.arc(x + w / 2, y + h / 2, Math.min(w, h) * 0.13, 0, Math.PI * 2);
  ctx.fill();
}

function starfallDrawCard(ctx, card, x, y, w, h, opts) {
  opts = opts || {};
  var el = starfallElement(card.element);
  var scale = w / STARFALL_CONFIG.cardWidth;
  ctx.save();
  ctx.fillStyle = '#f7f2e7';
  starfallRoundRect(ctx, x, y, w, h, 10 * scale);
  ctx.fill();
  ctx.strokeStyle = opts.selected ? '#ffd24d' : el.dark;
  ctx.lineWidth = opts.selected ? 4 : 2;
  ctx.stroke();
  // Element band with glyph.
  ctx.fillStyle = el.color;
  starfallRoundRect(ctx, x + 4 * scale, y + 4 * scale, w - 8 * scale, 44 * scale, 8 * scale);
  ctx.fill();
  starfallDrawElementGlyph(ctx, el.glyph, x + 26 * scale, y + 26 * scale, 30 * scale, '#ffffff');
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold ' + Math.round(13 * scale) + 'px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(el.name, x + 44 * scale, y + 27 * scale, 42 * scale);
  // Cost gem, top right.
  ctx.fillStyle = '#1d4ed8';
  ctx.beginPath();
  ctx.arc(x + w - 20 * scale, y + 26 * scale, 15 * scale, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold ' + Math.round(17 * scale) + 'px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(String(card.cost), x + w - 20 * scale, y + 27 * scale);
  // Card name, kept inside the card at any size.
  ctx.fillStyle = '#1c1c22';
  ctx.font = 'bold ' + Math.round(16 * scale) + 'px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(card.name, x + w / 2, y + 66 * scale, w - 8 * scale);
  // Big central glyph.
  starfallDrawElementGlyph(ctx, el.glyph, x + w / 2, y + 100 * scale, 44 * scale, el.color);
  // Effect text, kept clear of the power gem at the bottom right.
  ctx.fillStyle = '#33333c';
  ctx.font = Math.round(11 * scale) + 'px sans-serif';
  ctx.fillText(card.text, x + (w - 36 * scale) / 2, y + 132 * scale, w - 44 * scale);
  // Power, bottom right.
  ctx.fillStyle = el.dark;
  ctx.beginPath();
  ctx.arc(x + w - 22 * scale, y + h - 20 * scale, 16 * scale, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold ' + Math.round(18 * scale) + 'px sans-serif';
  ctx.fillText(String(card.power), x + w - 22 * scale, y + h - 19 * scale);
  // Bonus note (resonance / advantage) when it applies.
  if (opts.bonus) {
    ctx.fillStyle = '#b45309';
    ctx.font = 'bold ' + Math.round(11 * scale) + 'px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(opts.bonus, x + 8 * scale, y + h - 14 * scale);
  }
  if (opts.dim) {
    ctx.fillStyle = 'rgba(20,20,30,0.45)';
    starfallRoundRect(ctx, x, y, w, h, 10 * scale);
    ctx.fill();
  }
  ctx.restore();
}

function starfallDrawLog(ctx, state) {
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  starfallRoundRect(ctx, 1006, 196, 258, 210, 10);
  ctx.fill();
  ctx.fillStyle = '#ffd24d';
  ctx.font = 'bold 15px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('BATTLE LOG', 1020, 208);
  ctx.fillStyle = '#e8e4d8';
  ctx.font = '12.5px sans-serif';
  var lines = state.log.slice(-7);
  for (var i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], 1020, 232 + i * 23, 232);
  }
}

function starfallDrawTitle(ctx, state, time) {
  starfallDrawBackground(ctx, time);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffd24d';
  ctx.font = 'bold 78px Georgia, serif';
  ctx.fillText('STARFALL PACT', 640, 138);
  ctx.fillStyle = '#e8e4d8';
  ctx.font = '24px Georgia, serif';
  ctx.fillText('A duel of falling stars beneath the Hollow Moon', 640, 192);
  // Element cycle: four glyphs in a ring with the advantage arrows between them.
  var ids = ['ember', 'tide', 'thorn', 'stone'];
  var cx = 640, cy = 345, r = 85;
  for (var i = 0; i < 4; i++) {
    var a = -Math.PI / 2 + i * Math.PI / 2;
    var gx = cx + Math.cos(a) * r;
    var gy = cy + Math.sin(a) * r;
    var el = starfallElement(ids[i]);
    ctx.fillStyle = el.color;
    ctx.beginPath();
    ctx.arc(gx, gy, 42, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#f7f2e7';
    ctx.lineWidth = 3;
    ctx.stroke();
    starfallDrawElementGlyph(ctx, el.glyph, gx, gy, 44, '#ffffff');
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText(el.name, gx, gy + 62);
  }
  ctx.fillStyle = '#c9c2ae';
  ctx.font = '15px sans-serif';
  ctx.fillText('Ember beats Thorn  ·  Thorn beats Stone  ·  Stone beats Tide  ·  Tide beats Ember', 640, 522);
  ctx.fillText('Play 2 cards of one element in a turn: Resonance +1 power each.', 640, 548);
  ctx.fillStyle = '#ffffff';
  ctx.font = '17px sans-serif';
  ctx.fillText('You: 20 life, mana grows 1 each turn (max 6). Click a card to play it.', 640, 584);
  ctx.fillText('Keys 1-7 select a card · Enter / Space ends the turn · R restarts · M mutes', 640, 610);
  if (Math.floor(time / 500) % 2 === 0) {
    ctx.fillStyle = '#ffd24d';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText('Click or press Enter to begin', 640, 664);
  }
}

function starfallDrawEndScreen(ctx, state, won) {
  starfallDrawBackground(ctx, 0);
  ctx.fillStyle = 'rgba(5,8,20,0.72)';
  ctx.fillRect(0, 0, 1280, 720);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = won ? '#ffd24d' : '#ff6b5e';
  ctx.font = 'bold 84px Georgia, serif';
  ctx.fillText(won ? 'VICTORY' : 'DEFEAT', 640, 190);
  ctx.fillStyle = '#e8e4d8';
  ctx.font = '26px Georgia, serif';
  ctx.fillText(
    won ? 'The Hollow Moon sets. The pact is yours.' : 'The Warden keeps the Hollow Moon tonight.',
    640, 260
  );
  var s = state.endStats;
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px sans-serif';
  ctx.fillText('Final score: ' + s.score, 640, 350);
  ctx.font = '20px sans-serif';
  ctx.fillText('Turns: ' + s.turns + '    Life left: ' + s.lifeLeft + '    Damage dealt: ' + s.damageDealt + '    Cards played: ' + s.cardsPlayed, 640, 396);
  ctx.fillStyle = '#ffd24d';
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText('Press R to play again', 640, 480);
}

function starfallDrawTable(ctx, state, time) {
  starfallDrawBackground(ctx, time);
  var p = state.player;
  var r = state.rival;

  // Top strip: game name, turn, score.
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#e8e4d8';
  ctx.font = 'bold 17px sans-serif';
  ctx.fillText('STARFALL PACT', 24, 24);
  ctx.textAlign = 'center';
  ctx.fillText('Turn ' + state.turn, 640, 24);
  ctx.textAlign = 'right';
  ctx.fillStyle = '#ffd24d';
  ctx.fillText('Score ' + state.score, 1256, 24);

  // Rival portrait and bars.
  ctx.fillStyle = '#3a2d5c';
  ctx.beginPath();
  ctx.arc(88, 108, 44, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#c9a227';
  ctx.lineWidth = 3;
  ctx.stroke();
  starfallDrawElementGlyph(ctx, 'flame', 88, 108, 46, '#ffd24d');
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 19px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('Warden of the Hollow Moon', 148, 92);
  starfallDrawLifeBar(ctx, 148, 112, 300, r.life, STARFALL_CONFIG.startLife, 'Life', '#c0392b');
  starfallDrawMana(ctx, 148, 146, r.mana, STARFALL_CONFIG.maxMana);
  ctx.fillStyle = '#c9c2ae';
  ctx.font = '14px sans-serif';
  ctx.fillText('Deck ' + r.deck.length + '   Hand ' + r.hand.length, 470, 156);
  if (r.guardElement) {
    var ge = starfallElement(r.guardElement);
    ctx.fillStyle = ge.color;
    starfallRoundRect(ctx, 620, 140, 150, 30, 8);
    ctx.fill();
    starfallDrawElementGlyph(ctx, ge.glyph, 640, 155, 20, '#ffffff');
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Guard: ' + ge.name, 656, 156);
  }

  // Rival hand, face down, top right.
  for (var i = 0; i < r.hand.length; i++) {
    starfallDrawCardBack(ctx, 800 + i * 34, 66, 56, 78);
  }

  // Played cards on the table.
  ctx.fillStyle = '#c9c2ae';
  ctx.font = 'bold 14px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('YOUR PACT', 60, 210);
  ctx.textAlign = 'right';
  ctx.fillText("WARDEN'S PACT", 990, 210);
  var now = time;
  var tableW = 96, tableH = 134;
  for (var j = 0; j < p.played.length; j++) {
    var pc = p.played[j];
    var px = 60 + j * (tableW + 10);
    var anim = starfallFindAnim(state, pc.card.uid);
    if (anim) {
      var t = Math.min(1, (now - anim.start) / anim.dur);
      var ax = anim.x0 + (anim.x1 - anim.x0) * t;
      var ay = anim.y0 + (anim.y1 - anim.y0) * t;
      starfallDrawCard(ctx, pc.card, ax, ay, tableW, tableH, {});
    } else {
      starfallDrawCard(ctx, pc.card, px, 224, tableW, tableH, {});
    }
  }
  for (var k = 0; k < r.played.length; k++) {
    var rc = r.played[k];
    var rx = 990 - tableW - k * (tableW + 10);
    var ranim = starfallFindAnim(state, rc.card.uid);
    if (ranim) {
      var rt = Math.min(1, (now - ranim.start) / ranim.dur);
      var rax = ranim.x0 + (ranim.x1 - ranim.x0) * rt;
      var ray = ranim.y0 + (ranim.y1 - ranim.y0) * rt;
      starfallDrawCard(ctx, rc.card, rax, ray, tableW, tableH, {});
    } else {
      starfallDrawCard(ctx, rc.card, rx, 224, tableW, tableH, {});
    }
  }
  // Center VS.
  ctx.fillStyle = '#ffd24d';
  ctx.font = 'bold 30px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('VS', 525, 300);

  starfallDrawLog(ctx, state);

  // Player bars, bottom left.
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 19px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('You', 40, 420);
  starfallDrawLifeBar(ctx, 40, 440, 300, p.life, STARFALL_CONFIG.startLife, 'Life', '#27ae60');
  if (p.ward > 0) {
    ctx.fillStyle = '#8ecae6';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('Ward blocks ' + p.ward, 352, 454);
  }
  starfallDrawMana(ctx, 40, 474, p.mana, STARFALL_CONFIG.maxMana);
  ctx.fillStyle = '#c9c2ae';
  ctx.font = '14px sans-serif';
  ctx.fillText('Deck ' + p.deck.length + '   Hand ' + p.hand.length, 40, 512);
  if (p.guardElement) {
    var pge = starfallElement(p.guardElement);
    ctx.fillStyle = pge.color;
    starfallRoundRect(ctx, 220, 496, 150, 30, 8);
    ctx.fill();
    starfallDrawElementGlyph(ctx, pge.glyph, 240, 511, 20, '#ffffff');
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('Guard: ' + pge.name, 256, 512);
  }

  // End Turn button.
  var btn = starfallEndTurnButtonRect();
  var canEnd = state.phase === 'player' && !state.over;
  ctx.fillStyle = canEnd ? '#c9a227' : '#555a63';
  starfallRoundRect(ctx, btn.x, btn.y, btn.w, btn.h, 10);
  ctx.fill();
  ctx.fillStyle = '#1c1c22';
  ctx.font = 'bold 20px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('END TURN', btn.x + btn.w / 2, btn.y + btn.h / 2 + 1);
  ctx.fillStyle = '#c9c2ae';
  ctx.font = '13px sans-serif';
  ctx.fillText('Enter / Space', btn.x + btn.w / 2, btn.y + btn.h + 18);

  // Player hand, fanned along the bottom.
  var hand = p.hand;
  var cw = STARFALL_CONFIG.cardWidth;
  var ch = STARFALL_CONFIG.cardHeight;
  var gap = 12;
  var totalW = hand.length * cw + (hand.length - 1) * gap;
  var startX = (1280 - totalW) / 2;
  var handY = 720 - ch - 12;
  for (var m = 0; m < hand.length; m++) {
    var card = hand[m];
    var hx = startX + m * (cw + gap);
    var hy = handY - (state.selected === m ? 22 : 0);
    var playable = state.phase === 'player' && !state.over && card.cost <= p.mana;
    var bonus = '';
    if (playable) bonus = starfallPowerBreakdown(card, p, r);
    starfallDrawCard(ctx, card, hx, hy, cw, ch, {
      selected: state.selected === m,
      dim: !playable,
      bonus: bonus,
    });
  }

  // Turn message line above the hand.
  if (state.message) {
    ctx.fillStyle = '#ffd24d';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(state.message, 640, 512);
  }
  if (state.phase === 'rival' && !state.over) {
    ctx.fillStyle = '#e8e4d8';
    ctx.font = 'italic 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('The Warden is playing...', 640, 512);
  }

  // Win flourish: falling stars.
  if (state.screen === 'win') {
    starfallDrawParticles(ctx, state);
  }
}

function starfallEndTurnButtonRect() {
  return { x: 1096, y: 580, w: 160, h: 52 };
}

function starfallFindAnim(state, uid) {
  for (var i = 0; i < state.anims.length; i++) {
    if (state.anims[i].uid === uid) return state.anims[i];
  }
  return null;
}

function starfallDrawParticles(ctx, state) {
  var now = performance.now();
  for (var i = 0; i < state.particles.length; i++) {
    var pt = state.particles[i];
    var age = (now - pt.born) / 1000;
    if (age > pt.life) {
      // The flourish never ends: a spent star falls again from the top.
      pt.born = now;
      pt.x = 200 + Math.random() * 880;
      pt.y = 60 + Math.random() * 120;
      age = 0;
    }
    var alpha = 1 - age / pt.life;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = pt.color;
    ctx.beginPath();
    ctx.arc(pt.x + pt.vx * age, pt.y + pt.vy * age + 60 * age * age, pt.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function starfallRender(ctx, state, time) {
  if (state.screen === 'title') {
    starfallDrawTitle(ctx, state, time);
  } else if (state.screen === 'win') {
    starfallDrawEndScreen(ctx, state, true);
    starfallDrawParticles(ctx, state);
  } else if (state.screen === 'lose') {
    starfallDrawEndScreen(ctx, state, false);
  } else {
    starfallDrawTable(ctx, state, time);
  }
}
