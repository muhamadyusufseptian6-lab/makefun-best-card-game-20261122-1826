// Starfall Pact — deck.js
// One job: the seeded random source, the 24-card deck, drawing and card instances.

function starfallRng(seed) {
  var s = seed >>> 0;
  if (s === 0) s = 1;
  return function nextRandom() {
    s = (s + 0x6d2b79f5) >>> 0;
    var t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function starfallShuffle(list, rng) {
  for (var i = list.length - 1; i > 0; i--) {
    var j = Math.floor(rng() * (i + 1));
    var tmp = list[i];
    list[i] = list[j];
    list[j] = tmp;
  }
  return list;
}

// Two copies of each of the twelve card types: a 24-card deck.
function starfallBuildDeck(rng) {
  var deck = [];
  var uid = 0;
  for (var copy = 0; copy < 2; copy++) {
    for (var i = 0; i < STARFALL_CARD_DEFS.length; i++) {
      var def = STARFALL_CARD_DEFS[i];
      deck.push({
        uid: uid++,
        defId: def.id,
        name: def.name,
        element: def.element,
        cost: def.cost,
        power: def.power,
        effect: def.effect,
        text: def.text,
      });
    }
  }
  return starfallShuffle(deck, rng);
}

function starfallTakeCard(side) {
  if (side.deck.length === 0) return null;
  if (side.hand.length >= STARFALL_CONFIG.handMax) return null;
  var card = side.deck.pop();
  side.hand.push(card);
  return card;
}

function starfallDrawOpeningHand(side, rng) {
  for (var i = 0; i < STARFALL_CONFIG.startHand; i++) {
    starfallTakeCard(side);
  }
}

// How many cards of this element the side has already played this turn.
function starfallSameElementPlayedCount(side, element) {
  var count = 0;
  for (var i = 0; i < side.playedThisTurn.length; i++) {
    if (side.playedThisTurn[i].element === element) count++;
  }
  return count;
}

// Final power of a card played right now: base + resonance (+1 when a second
// card of the same element lands this turn) + advantage (+2 when its element
// beats the defender's guard element).
function starfallCardPower(card, attacker, defender) {
  var power = card.power;
  if (starfallSameElementPlayedCount(attacker, card.element) >= 1) {
    power += STARFALL_CONFIG.resonanceBonus;
  }
  if (starfallElementBeats(card.element, defender.guardElement)) {
    power += STARFALL_CONFIG.advantageBonus;
  }
  return power;
}

function starfallPowerBreakdown(card, attacker, defender) {
  var parts = [];
  if (starfallSameElementPlayedCount(attacker, card.element) >= 1) parts.push('Resonance +1');
  if (starfallElementBeats(card.element, defender.guardElement)) parts.push('Advantage +2');
  return parts.join('  ');
}
