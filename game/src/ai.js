// Starfall Pact — ai.js
// One job: the rival's brain. A readable heuristic the player can see and counter:
// play the highest-value affordable card, heal or ward when low on life, and
// explain every move in the log so the player can read the rival's plan.

function starfallAiCardValue(card, ai, player) {
  var value = card.power;
  if (card.effect === 'mend' && ai.life <= 10) value += 6;
  if (card.effect === 'mend' && ai.life > 14) value -= 3;
  if (card.effect === 'ward' && ai.life <= 8) value += 6;
  if (card.effect === 'ward' && ai.ward > 0) value -= 4;
  if (card.effect === 'draw') value += 2;
  if (starfallElementBeats(card.element, player.guardElement)) value += 2;
  if (starfallSameElementPlayedCount(ai, card.element) >= 1) value += 1;
  value -= card.cost * 0.5;
  return value;
}

// Why the rival played this card, in plain words for the log line.
function starfallAiReason(card, ai, player) {
  if (card.effect === 'mend' && ai.life <= 10) return 'mends its wounds';
  if (card.effect === 'ward' && ai.life <= 8) return 'raises a ward to survive';
  if (card.effect === 'draw') return 'reads the stars for another card';
  if (starfallElementBeats(card.element, player.guardElement)) return 'exploits the advantage';
  if (starfallSameElementPlayedCount(ai, card.element) >= 1) return 'rings the resonance';
  if (card.power >= 6) return 'unleashes its heaviest blow';
  return 'strikes';
}

// Plan the rival's whole turn on scratch copies, so planning never touches the
// real state: keep picking until no affordable card is worth it. Returns an
// ordered list of { card, reason } the main loop then plays for real, one by one.
function starfallAiPlanTurn(state) {
  var ai = state.rival;
  var plan = [];
  var simMana = ai.mana;
  var simHand = ai.hand.slice();
  var simPlayed = ai.playedThisTurn.slice();
  var simLife = ai.life;
  var simWard = ai.ward;
  var guard = 0;
  while (guard < 8) {
    guard++;
    var simAi = {
      life: simLife, mana: simMana, ward: simWard,
      hand: simHand, playedThisTurn: simPlayed,
    };
    var best = null;
    var bestValue = -999;
    for (var i = 0; i < simHand.length; i++) {
      var card = simHand[i];
      if (card.cost > simMana) continue;
      var value = starfallAiCardValue(card, simAi, state.player);
      if (value > bestValue) {
        bestValue = value;
        best = { index: i, card: card };
      }
    }
    if (!best) break;
    var reason = starfallAiReason(best.card, simAi, state.player);
    plan.push({ card: best.card, reason: reason });
    simMana -= best.card.cost;
    simHand.splice(best.index, 1);
    simPlayed.push(best.card);
    if (best.card.effect === 'mend') simLife = Math.min(STARFALL_CONFIG.startLife, simLife + STARFALL_CONFIG.mendAmount);
    if (best.card.effect === 'ward') simWard = STARFALL_CONFIG.wardAmount;
  }
  return plan;
}
