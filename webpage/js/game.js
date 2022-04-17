var eventsRef = null;
var prevEventId = null;

var dropCallback; // used when player is raided before having chosen resources to drop

function initGame(game, player) {
    
    const gameRef = firebase.database().ref('/' + game);
    eventsRef = gameRef.child('/events');
    
    gameRef.get().then((snap) => {
        const gameData = snap.val();
        initState(gameData, player);
        startGame();
        
        eventsRef.on('child_added', (eventSnap, prevId) => {
            const event = eventSnap.val();
            dispatchEvent(event, prevId);
        });
    });
}

function dispatchEvent(event, prevId) {
    
    if (prevId != prevEventId) {
        console.log("invalid event id", prevId);
        return;
    }
    
    prevEventId += 1;
    
    const functionMap = {
        'place-town': townPlaced,
        'place-road': roadPlaced,
        'roll-dice': diceRolled,
        'move-bandit': banditMoved,
        'drop-res': resourcesDropped,
        'make-purchase': purchaseMade,
        'play-knight': knightPlayed,
        'play-roads': roadsPlayed,
        'play-monopoly': monopolyPlayed,
        'play-invent': inventPlayed,
        'send-res': resourcesSent,
        'swap-res': resourcesSwapped,
        'claim-force': forceClaimed,
        'claim-roads': roadsClaimed,
        'offer-trade': tradeOffered,
        'answer-offer': offerAnswered,
        'end-turn': turnEnded,
        'win-game': gameWon,
    };
    
    if (event.args) {
        console.log(prevEventId, event.player, event.action, event.args)
    } else {
        console.log(prevEventId, event.player, event.action)
    }
    
    functionMap[event.action](event.player, event.args);
    
    refreshUI();
}

function postEvent(action, args) {
       
    const event = {
        player: state.me,
        action: action,
        args: args,
    };
    
    const eventId = prevEventId + 1;
    const eventRef = eventsRef.child('/' + eventId.toString());
    
    eventRef.get().then((snap) => {
        // page reload triggers re-commit of old actions
        if (!snap.exists()) {
            eventRef.set(event);
        }
    });
}

function startGame() {
    
    logLine("Spieler: " + state.players.join(', '));
    logLine(state.current + " darf setzen");

    if (state.current == state.me) {
        const townChoice = createHometownChoice();
        pushChoice(townChoice);
    }

    refreshUI();
}
    
function townPlaced(player, args) {
    
    const nodeId = args;
    claimTown(player, nodeId);
    logLine(state.current + " setzt eine Siedlung");
    
    resetChoice();
    
    if (player == state.me) {
        if (state.phase == 'backward') {
            const resources = noResources();
            state.board[nodeId].tiles.map((i) => state.board[i]).forEach((t) => {
                if (t.land > 0) resources[t.land] += 1;
            });
            updateResources(player, resources, true);
            logLine("ERTRÄGE: " + formatResources(resources));
        }
        const roadChoice = createHometownRoadChoice(nodeId);
        pushChoice(roadChoice);
    }
}

function roadPlaced(player, args) {
    
    const edgeId = args;
    claimRoad(player, edgeId);
    logLine(player + " setzt eine Straße");
    
    advanceTurn();
    resetChoice();
    
    if (state.phase == 'game') {
        logLine(state.current + " ist am Zug");
        if (state.current == state.me) {
            postEvent('roll-dice', null);
        }
    } else {
        logLine(state.current + " darf setzen");
        if (state.current == state.me) {
            const townChoice = createHometownChoice();
            pushChoice(townChoice);
        }
    }
}

function diceRolled(player, args) {
    
    const random = nextRandom();
    const roll = rolls[Math.floor(random * rolls.length)];
    
    resetChoice();
    logLine(player + " würfelt eine " + roll.toString());
    
    if (roll == 7) {
        if (player == state.me) {
            const turnChoice = createTurnChoice();
            pushChoice(turnChoice);
            const banditChoice = createBanditChoice();
            pushChoice(banditChoice);
        }
        if (countResources(state.resources) > 7) {
            const dropChoice = createDropChoice();
            pushChoice(dropChoice);
        }
        logLine(player + " darf den Räuber bewegen");
    } else {
        const resources = noResources();
        getYieldingTileIds(roll).forEach((i) => {
            const resIndex = state.board[i].land;
            getAdjacentTowns(i).filter((t) => t.player == state.me).forEach((t) => {
                resources[resIndex] += t.city ? 2 : 1;
            });
        });
        const count = countResources(resources);
        if (count > 0) {
            updateResources(state.me, resources, true);
            logLine("ERTRÄGE: " + formatResources(resources));
        }
        if (player == state.me) {
            const turnChoice = createTurnChoice();
            pushChoice(turnChoice);
        }
    }
}

function banditMoved(player, args) {
    
    const [tileId, targetPlayer] = args;
    
    moveBandit(tileId);
    
    if (state.choice.id == 'bandit') {
        popChoice();
    }
    
    const resIndex = state.board[tileId].land;
    const resName = resNames[resIndex];
    
    if (targetPlayer) {
        logLine(player + " setzt den Räuber auf " + resName + " und beraubt " + targetPlayer);
        
        const random = nextRandom();
        
        if (targetPlayer == state.me) {
            if (state.choice && state.choice.id == 'drop') {
                dropCallback = () => getRaided(player, random);
            } else {
                getRaided(player, random);
            }
        }
        
    } else {
        logLine(player + " setzt den Räuber auf " + resName);
    }
}

function purchaseMade(player, args) {
    
    const purchaseIndex = args[0];
    const costs = purchaseCosts[purchaseIndex];
    updateResources(player, costs, false);
    
    if (state.choice.purchaseIndex) {
        popChoice();
    }
    
    if (purchaseIndex == 1) {
        claimRoad(player, args[1]);
        logLine(player + " baut eine Straße");
        if (player == state.me) {
            const length = computeRoadLength(state.me);
            if (length > state.longestRoad) {
                postEvent('claim-roads', length);
            }
        }
    } else if (purchaseIndex == 2) {
        claimTown(player, args[1]);
        logLine(player + " baut eine Siedlung");
        if (player == state.me) checkVictory();
    } else if (purchaseIndex == 3) {
        upgradeTown(player, args[1]);
        logLine(player + " baut eine Siedlung zur Stadt aus");
        if (player == state.me) checkVictory();
    } else if (purchaseIndex == 4) {
        const random = nextRandom();
        const cardIndex = state.stack[Math.floor(state.stack.length * random)];
        const cardName = cardNames[cardIndex];
        var listener = null;
        if (cardName == "Ritter") {
            listener = () => postEvent('play-knight', cardIndex);
        } else if (cardIndex > victoryMaxIndex) {
            listener = () => {
                var cardChoice;
                if (cardName == "Straßenbau") {
                    cardChoice = createRoadworksChoice(cardIndex);
                } else if (cardName == "Monopol") {
                    cardChoice = createMonopolyChoice(cardIndex);
                } else if (cardName == "Erfindung") {
                    cardChoice = createInventionChoice(cardIndex);
                }
                pushChoice(cardChoice);
                refreshUI();
            };
        }
        takeCard(player, cardIndex, listener);
        logLine(player + " kauft eine Entwicklungskarte");
        if (player == state.me) {
            logLine("KARTE: " + cardName);
            checkVictory();
        }
    }
}

function knightPlayed(player, args) {
    
    const cardIndex = args;
    discardCard(player, cardIndex);
    
    logLine(player + " spielt eine Ritter-Karte und darf den Räuber bewegen");
    
    if (player == state.me) {
        if (state.playedKnights > state.largestForce) {
            postEvent('claim-force', state.playedKnights);
        }
        const banditChoice = createBanditChoice();
        pushChoice(banditChoice);
    }
}
    
function roadsPlayed(player, args) {
    
    const [cardIndex, edgeId1, edgeId2] = args;
    discardCard(player, cardIndex);
    claimRoad(player, edgeId1);
    claimRoad(player, edgeId2);
    
    if (state.choice.id == 'road') {
        popChoice();
    }
    
    logLine(player + " spielt Straßenbau und erhält 2 kostenlose Straßen");
}

function monopolyPlayed(player, args) {
        
    const [cardIndex, resIndex] = args;
    discardCard(player, cardIndex);
    
    if (state.choice.id == 'monopoly') {
        popChoice();
    }
    
    logLine(player + " spielt Monopol auf: " + resNames[resIndex]);
    
    if (player != state.me) {
        if (state.resources[resIndex] > 0) {
            var resources = noResources();
            resources[resIndex] = state.resources[resIndex];
            postEvent('send-res', ["MONOPOL", player, resources]);
        }
    }
}
        
function inventPlayed(player, args) {
    
    const [cardIndex, resources] = args;
    discardCard(player, cardIndex);
    updateResources(player, resources, true);
    
    if (state.choice.id == 'invention') {
        popChoice();
    }
    
    logLine(player + " spielt Erfindung und erhält Rohstoffe");
    
    if (player == state.me) {
        logLine("ERFINDUNG: " + formatResources(resources));
    }
}

function turnEnded(player, args) {
    
    advanceTurn();
    
    resetChoice();
    logLine(state.current + " ist am Zug");

    if (state.current == state.me) {
        // NOTE: technically, cards can be played before rolling
        postEvent('roll-dice', null);
    }
}
    
function resourcesDropped(player, args) {
    
    const resources = args;
    updateResources(player, resources, false);
    
    if (player == state.me) {
        popChoice();
        if (dropCallback) {
            dropCallback();
            dropCallback = null;
        }
    }
}

function resourcesSent(player, args) {
    
    const [cause, recipient, resources] = args;
    
    updateResources(recipient, resources, true);
    updateResources(player, resources, false);
    
    if (player == state.me || recipient == state.me) {
        logLine(cause + ": " + formatResources(resources));
    }
}

function resourcesSwapped(player, args) {
    
    const [give, take] = args;
    updateResources(player, give, false);
    updateResources(player, take, true);
    
    if (state.choice.id == 'swap') {
        popChoice();
    }
}

function getRaided(player, random) {
    
    const expResources = expandResources(state.resources);
    if (expResources.length == 0) {
        return;
    }
    
    const resIndex = expResources[Math.floor(expResources.length * random)];
    const resources = noResources();
    resources[resIndex] = 1;

    postEvent('send-res', ["RÄUBER", player, resources]);
}

function forceClaimed(player, args) {
    
    const size = args;
    updateLargestForce(player, size);
    logLine(player + " hält nun die größte Rittermacht");
    
    if (player == state.me) checkVictory();
}

function roadsClaimed(player, args) {
    
    const length = args;
    updateLongestRoad(player, length);
    logLine(player + " hält nun die längste Handelsstraße");
    
    if (player == state.me) checkVictory();
}

function tradeOffered(player, args) {
    
    const [partner, give, take] = args;
    
    if (state.choice.id == 'offer') {
        popChoice();
    }
    
    if (player == state.me || partner == state.me) {
        logLine(player + " schlägt " + partner + " einen Handel vor");
    }
    
    if (partner == state.me) {
        if (hasResources(take)) {
            const answerChoice = createTradeAnswerChoice(player, give, take);
            if (state.choice.id) {
                insertChoice(answerChoice);
            } else {
                pushChoice(answerChoice);
            }
        } else {
            postEvent('answer-offer', [player, give, take, false]);
        }
    }
}

function offerAnswered(player, args) {
    
    const [proposer, give, take, accepted] = args;
    
    if (state.choice.id == 'answer') {
        popChoice();
    }
    
    if (accepted) {
        updateResources(proposer, give, false);
        updateResources(player, give, true);
        updateResources(proposer, take, true);
        updateResources(player, take, false);
        logLine(proposer + " handelt mit  " + player);
    } else if (proposer == state.me) {
        logLine(player + " lehnt den vorgeschlagenen Handel ab");
    }
}

function checkVictory() {
    
    const progress = getVictoryProgress();
    if (progress.points >= 10) {
        postEvent('win-game', progress.points);
    }
}

function gameWon(player, args) {
    
    const points = args;
    logLine(player + " gewinnt mit " + points + " Siegpunkten");
    
    resetChoice();
}

// TEMPORARY FUNCTION UNTIL ALGORITHM IMPLEMENTED

function lhs(length) {
    postEvent('claim-roads', length);
}