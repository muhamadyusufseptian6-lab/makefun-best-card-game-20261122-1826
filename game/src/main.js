// Starfall Pact — main.js
// One job: the game state machine — new games, turns, playing cards, the
// rival's turn, scoring, winning and losing — and the render loop that runs it.

function starfallNewSide(rng) {
  return {
    life: STARFALL_CONFIG.startLife,
    mana: 1,
    maxMana: 1,
    deck: starfallBuildDeck(rng),
    hand: [],
    played: [],
    playedThisTurn: [],
    ward: 0,
    guardElement: null,
  };
}

function starfallNewGame(seed) {
  var rng = starfallRng(seed || 1);
  var state = {
    screen: 'title',
    phase: 'player',
    turn: 1,
    score: 0,
    damageDealt: 0,
    cardsPlayed: 0,
    seed: seed || 1,
    rng: rng,
    player: starfallNewSide(rng),
    rival: starfallNewSide(rng),
    log: [],
    selected: -1,
    muted: false,
    message: '',
    over: false,
    endStats: null,
    anims: [],
    particles: [],
  };
  starfallDrawOpeningHand(state.player, rng);
  starfallDrawOpeningHand(state.rival, rng);
  state.log.push('The pact is sealed. You hold ' + state.player.hand.length + ' cards.');
  state.log.push('Click a card to play it, or press Enter to end your turn.');
  return state;
}

function starfallLog(state, line) {
  state.log.push(line);
  if (state.log.length > 40) state.log.shift();
}

function starfallAddScore(state, points) {
  state.score += points;
}

// Deal damage to a side, letting its ward absorb what it can. Returns damage done.
function starfallDealDamage(state, target, amount) {
  var blocked = 0;
  if (target.ward > 0) {
    blocked = Math.min(target.ward, amount);
    target.ward -= blocked;
    amount -= blocked;
  }
  target.life = Math.max(0, target.life - amount);
  if (blocked > 0) starfallLog(state, 'Ward blocks ' + blocked + ' damage.');
  return amount;
}

function starfallApplyCardEffect(state, side, card) {
  if (card.effect === 'mend') {
    side.life = Math.min(STARFALL_CONFIG.startLife, side.life + STARFALL_CONFIG.mendAmount);
    starfallLog(state, 'Moonwell Mend restores ' + STARFALL_CONFIG.mendAmount + ' life.');
    starfallPlaySound(state, 'heal');
  } else if (card.effect === 'draw') {
    var drawn = starfallTakeCard(side);
    if (drawn) starfallLog(state, 'Starlit Chart draws ' + drawn.name + '.');
    else starfallLog(state, 'Starlit Chart finds no room in hand.');
  } else if (card.effect === 'ward') {
    side.ward = STARFALL_CONFIG.wardAmount;
    starfallLog(state, 'Rootbound Ward blocks the next ' + STARFALL_CONFIG.wardAmount + ' damage.');
  }
}

// Play one card from a side's hand onto the table, against the other side.
function starfallPlayCardFromHand(state, side, foe, handIndex, whoLabel) {
  var card = side.hand[handIndex];
  if (!card || card.cost > side.mana) return false;
  var power = starfallCardPower(card, side, foe);
  var breakdown = starfallPowerBreakdown(card, side, foe);
  side.mana -= card.cost;
  side.hand.splice(handIndex, 1);
  side.played.push({ card: card, power: power });
  side.playedThisTurn.push(card);
  side.guardElement = card.element;
  starfallApplyCardEffect(state, side, card);
  var dealt = starfallDealDamage(state, foe, power);
  if (side === state.player) {
    state.damageDealt += dealt;
    state.cardsPlayed += 1;
    starfallAddScore(state, STARFALL_CONFIG.scorePerCard);
  }
  var line = whoLabel + ' played ' + card.name + ' for ' + power + '.';
  if (breakdown) line += ' (' + breakdown + ')';
  starfallLog(state, line);
  starfallPlaySound(state, dealt > 0 ? 'hit' : 'play');
  return true;
}

function starfallCheckEnd(state) {
  if (state.rival.life <= 0) {
    state.over = true;
    state.screen = 'win';
    var bonus = state.player.life * STARFALL_CONFIG.lifeBonusPerPoint;
    starfallAddScore(state, bonus);
    state.endStats = {
      score: state.score, turns: state.turn, lifeLeft: state.player.life,
      damageDealt: state.damageDealt, cardsPlayed: state.cardsPlayed,
    };
    starfallSpawnWinStars(state);
    starfallPlaySound(state, 'win');
    return true;
  }
  if (state.player.life <= 0) {
    state.over = true;
    state.screen = 'lose';
    state.endStats = {
      score: state.score, turns: state.turn, lifeLeft: 0,
      damageDealt: state.damageDealt, cardsPlayed: state.cardsPlayed,
    };
    starfallPlaySound(state, 'lose');
    return true;
  }
  return false;
}

function starfallSpawnWinStars(state) {
  var rng = starfallRng(state.seed + 77);
  state.particles = [];
  for (var i = 0; i < 60; i++) {
    state.particles.push({
      x: 200 + rng() * 880,
      y: 80 + rng() * 200,
      vx: (rng() - 0.5) * 40,
      vy: 30 + rng() * 60,
      size: 2 + rng() * 3,
      color: ['#ffd24d', '#ffffff', '#ff8a5c'][Math.floor(rng() * 3)],
      born: performance.now() - rng() * 900,
      life: 1.6 + rng() * 1.2,
    });
  }
}

function starfallStartPlayerTurn(state) {
  state.phase = 'player';
  state.player.playedThisTurn = [];
  state.rival.playedThisTurn = [];
  state.player.maxMana = Math.min(STARFALL_CONFIG.maxMana, state.turn);
  state.player.mana = state.player.maxMana;
  var drawn = starfallTakeCard(state.player);
  state.message = drawn ? 'Turn ' + state.turn + ' — drew ' + drawn.name + '.' : 'Turn ' + state.turn + ' — deck is empty.';
  starfallLog(state, 'Turn ' + state.turn + ' — mana refilled to ' + state.player.mana + '.');
  starfallPlaySound(state, 'turn');
}

function starfallEndTurn(state) {
  if (state.phase !== 'player' || state.over) return;
  state.selected = -1;
  state.phase = 'rival';
  state.message = '';
  starfallLog(state, 'You end your turn. The Warden moves...');
  starfallPlaySound(state, 'turn');
  var plan = starfallAiPlanTurn(state);
  var step = 0;
  function playNextAiCard() {
    if (state.over) return;
    if (step >= plan.length) {
      starfallFinishRivalTurn(state);
      return;
    }
    var move = plan[step];
    step++;
    var handIndex = -1;
    for (var i = 0; i < state.rival.hand.length; i++) {
      if (state.rival.hand[i].uid === move.card.uid) { handIndex = i; break; }
    }
    if (handIndex >= 0) {
      starfallPlayCardFromHand(state, state.rival, state.player, handIndex, 'Warden');
      starfallLog(state, 'Warden ' + move.reason + '.');
    }
    if (starfallCheckEnd(state)) return;
    setTimeout(playNextAiCard, 650);
  }
  setTimeout(playNextAiCard, 650);
}

function starfallFinishRivalTurn(state) {
  if (state.over) return;
  state.rival.maxMana = Math.min(STARFALL_CONFIG.maxMana, state.turn + 1);
  state.rival.mana = state.rival.maxMana;
  starfallTakeCard(state.rival);
  state.turn += 1;
  starfallStartPlayerTurn(state);
  if (starfallCheckEnd(state)) return;
}

function starfallRestart(state, canvas) {
  var fresh = starfallNewGame(Math.floor(Math.random() * 100000) + 1);
  fresh.screen = 'play';
  fresh.phase = 'player';
  starfallStartPlayerTurn(fresh);
  starfallReplaceState(state, fresh);
  void canvas;
}

function starfallReplaceState(state, fresh) {
  var keys = Object.keys(fresh);
  for (var i = 0; i < keys.length; i++) {
    state[keys[i]] = fresh[keys[i]];
  }
}

function starfallBoot() {
  var canvas = document.getElementById('game');
  var ctx = canvas.getContext('2d');
  canvas.width = STARFALL_CONFIG.canvasWidth;
  canvas.height = STARFALL_CONFIG.canvasHeight;
  var params = starfallShotParams();
  var state = params.shot
    ? starfallBuildShotState(params.shot, params.seed)
    : starfallNewGame(params.seed);
  if (params.shot) {
    state.muted = true;
  }

  var actions = {
    beginGame: function () {
      state.screen = 'play';
      state.phase = 'player';
      starfallStartPlayerTurn(state);
      starfallPlaySound(state, 'turn');
    },
    selectCard: function (index) {
      if (state.phase !== 'player' || state.over) return;
      state.selected = index;
    },
    playCard: function (index) {
      if (state.phase !== 'player' || state.over) return;
      var card = state.player.hand[index];
      if (!card) return;
      if (card.cost > state.player.mana) {
        state.message = 'Not enough mana for ' + card.name + '.';
        return;
      }
      var rects = starfallHandCardRects(state);
      var from = rects[index] || { x: 640, y: 560, w: 118, h: 164 };
      var slot = state.player.played.length;
      var ok = starfallPlayCardFromHand(state, state.player, state.rival, index, 'You');
      if (ok) {
        state.anims.push({
          uid: card.uid,
          x0: from.x, y0: from.y,
          x1: 60 + slot * 106, y1: 224,
          start: performance.now(), dur: 350,
        });
        state.selected = -1;
        state.message = '';
        if (starfallCheckEnd(state)) return;
      }
    },
    endTurn: function () {
      starfallEndTurn(state);
    },
    restart: function () {
      starfallRestart(state, canvas);
    },
    toggleMute: function () {
      state.muted = !state.muted;
      state.message = state.muted ? 'Sound muted. (M to unmute)' : 'Sound on.';
    },
  };

  starfallAttachInput(canvas, state, actions);

  function frame(time) {
    starfallRender(ctx, state, time);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

document.addEventListener('DOMContentLoaded', starfallBoot);
