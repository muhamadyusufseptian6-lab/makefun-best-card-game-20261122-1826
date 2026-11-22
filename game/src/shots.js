// Starfall Pact — shots.js
// One job: the ?shot=start|play|win|lose&seed=N scenes the screenshots are
// taken from. Each scene is built instantly on load, with no interaction, from
// the same state a real game would reach, so the screenshots are true renders.

function starfallShotParams() {
  var params = new URLSearchParams(window.location.search);
  var shot = params.get('shot');
  var seedRaw = params.get('seed');
  var seed = seedRaw ? parseInt(seedRaw, 10) : 1;
  if (isNaN(seed)) seed = 1;
  return { shot: shot, seed: seed };
}

// A hand of five readable cards, fixed by the seed, for the play scene.
var starfallShotUid = 100;

function starfallShotHand(rng) {
  var pool = [
    'ember-spark', 'ember-imp', 'phoenix-dive', 'tide-lash',
    'deep-current', 'moonwell-mend', 'thorn-snare', 'briar-volley',
    'rootbound-ward', 'stone-slam', 'mountainfall', 'starlit-chart',
  ];
  var hand = [];
  var used = {};
  while (hand.length < 5) {
    var def = starfallCardDef(pool[Math.floor(rng() * pool.length)]);
    if (used[def.id]) continue;
    used[def.id] = true;
    hand.push({
      uid: starfallShotUid++, defId: def.id, name: def.name, element: def.element,
      cost: def.cost, power: def.power, effect: def.effect, text: def.text,
    });
  }
  return hand;
}

// Build a full state for one shot scene. 'play' is a mid-game table: turn 4,
// both sides bloodied, cards already on the table, mana to spend, score ticking.
function starfallBuildShotState(scene, seed) {
  var rng = starfallRng(seed);
  var state = starfallNewGame(seed);
  if (scene === 'start') {
    state.screen = 'title';
    return state;
  }
  if (scene === 'play') {
    state.screen = 'play';
    state.phase = 'player';
    state.turn = 4;
    state.score = 27;
    state.damageDealt = 12;
    state.cardsPlayed = 3;
    state.player.life = 16;
    state.player.mana = 4;
    state.player.maxMana = 4;
    state.player.hand = starfallShotHand(rng);
    state.player.deck = starfallBuildDeck(rng).slice(0, 14);
    state.player.played = [
      { card: starfallShotHand(rng)[0], power: 4 },
      { card: starfallShotHand(rng)[1], power: 3 },
    ];
    state.player.playedThisTurn = [state.player.played[0].card];
    state.player.guardElement = 'ember';
    state.rival.life = 13;
    state.rival.mana = 3;
    state.rival.maxMana = 4;
    state.rival.hand = starfallBuildDeck(rng).slice(0, 5);
    state.rival.deck = starfallBuildDeck(rng).slice(0, 14);
    state.rival.played = [
      { card: starfallShotHand(rng)[2], power: 4 },
      { card: starfallShotHand(rng)[3], power: 2 },
    ];
    state.rival.guardElement = 'tide';
    state.log = [
      'Turn 4 — your move.',
      'You played Briar Volley for 4.',
      'Resonance! Second Thorn card +1.',
      'Warden played Deep Current for 4.',
      'Tide beats Ember: Warden +2.',
      'Your ward blocked 3 damage.',
      'Mana refilled to 4. Strike!',
    ];
    state.message = 'Your turn — click a card to play it.';
    state.selected = 1;
    return state;
  }
  if (scene === 'win') {
    state.screen = 'win';
    state.phase = 'player';
    state.over = true;
    state.turn = 7;
    state.rival.life = 0;
    state.player.life = 11;
    state.score = 68;
    state.damageDealt = 20;
    state.cardsPlayed = 9;
    state.endStats = {
      score: 68, turns: 7, lifeLeft: 11, damageDealt: 20, cardsPlayed: 9,
    };
    state.log = ['Phoenix Dive lands for 6.', 'The Warden falls. Victory!'];
    starfallSpawnWinStars(state);
    return state;
  }
  if (scene === 'lose') {
    state.screen = 'lose';
    state.phase = 'rival';
    state.over = true;
    state.turn = 6;
    state.player.life = 0;
    state.rival.life = 9;
    state.score = 31;
    state.damageDealt = 11;
    state.cardsPlayed = 7;
    state.endStats = {
      score: 31, turns: 6, lifeLeft: 0, damageDealt: 11, cardsPlayed: 7,
    };
    state.log = ['Mountainfall crushes you for 6.', 'Your life reaches 0. Defeat.'];
    return state;
  }
  state.screen = 'title';
  return state;
}
