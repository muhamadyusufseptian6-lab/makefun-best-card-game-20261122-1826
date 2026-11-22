// Starfall Pact — config.js
// One job: every tunable number, element and card definition for the game.
// No other file hard-codes a rule number; everything below is the source of truth.

var STARFALL_CONFIG = {
  canvasWidth: 1280,
  canvasHeight: 720,
  startLife: 20,
  maxMana: 6,
  deckSize: 24,
  handMax: 7,
  startHand: 4,
  advantageBonus: 2,
  resonanceBonus: 1,
  mendAmount: 3,
  wardAmount: 3,
  scorePerCard: 5,
  lifeBonusPerPoint: 2,
  cardWidth: 118,
  cardHeight: 164,
};

// Four elements, told apart by colour AND by a drawn shape, never by text alone.
// Advantage cycle: Ember beats Thorn, Thorn beats Stone, Stone beats Tide, Tide beats Ember.
var STARFALL_ELEMENTS = {
  ember: { id: 'ember', name: 'Ember', color: '#e2482e', dark: '#8f2413', light: '#ff8a5c', glyph: 'flame', beats: 'thorn' },
  tide: { id: 'tide', name: 'Tide', color: '#2e7fe2', dark: '#174a8f', light: '#6db3ff', glyph: 'wave', beats: 'ember' },
  thorn: { id: 'thorn', name: 'Thorn', color: '#3fae5a', dark: '#1e6b31', light: '#7ddb92', glyph: 'leaf', beats: 'stone' },
  stone: { id: 'stone', name: 'Stone', color: '#8a8f98', dark: '#4c5158', light: '#c3c8d0', glyph: 'mountain', beats: 'tide' },
};

// Twelve original card types. effect is one of: none, mend, draw, ward.
var STARFALL_CARD_DEFS = [
  { id: 'ember-spark', name: 'Ember Spark', element: 'ember', cost: 1, power: 2, effect: 'none', text: 'A quick spark.' },
  { id: 'ember-imp', name: 'Ember Imp', element: 'ember', cost: 2, power: 4, effect: 'none', text: 'A mischievous spark.' },
  { id: 'phoenix-dive', name: 'Phoenix Dive', element: 'ember', cost: 3, power: 6, effect: 'none', text: 'A blazing dive.' },
  { id: 'tide-lash', name: 'Tide Lash', element: 'tide', cost: 1, power: 2, effect: 'none', text: 'A stinging lash.' },
  { id: 'deep-current', name: 'Deep Current', element: 'tide', cost: 2, power: 4, effect: 'none', text: 'A dragging undertow.' },
  { id: 'moonwell-mend', name: 'Moonwell Mend', element: 'tide', cost: 2, power: 1, effect: 'mend', text: 'Heal 3 life.' },
  { id: 'thorn-snare', name: 'Thorn Snare', element: 'thorn', cost: 1, power: 2, effect: 'none', text: 'A tangling snare.' },
  { id: 'briar-volley', name: 'Briar Volley', element: 'thorn', cost: 2, power: 4, effect: 'none', text: 'A volley of barbs.' },
  { id: 'rootbound-ward', name: 'Rootbound Ward', element: 'thorn', cost: 2, power: 1, effect: 'ward', text: 'Block 3 damage.' },
  { id: 'stone-slam', name: 'Stone Slam', element: 'stone', cost: 1, power: 2, effect: 'none', text: 'A heavy slam.' },
  { id: 'mountainfall', name: 'Mountainfall', element: 'stone', cost: 3, power: 6, effect: 'none', text: 'A falling peak.' },
  { id: 'starlit-chart', name: 'Starlit Chart', element: 'stone', cost: 2, power: 3, effect: 'draw', text: 'Draw 1 card.' },
];

function starfallElement(id) {
  return STARFALL_ELEMENTS[id];
}

function starfallElementBeats(attackerId, guardId) {
  if (!guardId) return false;
  return STARFALL_ELEMENTS[attackerId].beats === guardId;
}

function starfallCardDef(id) {
  for (var i = 0; i < STARFALL_CARD_DEFS.length; i++) {
    if (STARFALL_CARD_DEFS[i].id === id) return STARFALL_CARD_DEFS[i];
  }
  return null;
}
