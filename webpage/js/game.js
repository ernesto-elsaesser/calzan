// for shits & giggles
const capitals = 'BCDEFGHJKLMNPQRSTVWXYZ';
const idx = Math.trunc(Math.random() * capitals.length);
document.title = "Die " + capitals[idx] + "eedler von Calzan";


function startGame(postEvent) {
    
    logLine(state.current + " darf setzen");

    if (state.current == state.me) {
        const townChoice = createHometownChoice();
        pushChoice(townChoice);
    }

    refreshUI();
}

function dispatchEvent(eventId, event) {
    
    if (eventId != state.nextEventId) {
        console.log("invalid event id", eventId);
        return;
    }
    
    incrementEventId();
    
    const functionMap = {
        'place-town': townPlaced,
        'place-road': roadPlaced,
        'roll-dice': diceRolled,
        'drop-res': resourcesDropped,
        'move-bandit': banditMoved,
        'send-loot': lootSent,
        'make-purchase': purchaseMade,
        'play-knight': knightPlayed,
        'play-roads': roadsPlayed,
        'play-monopoly': monopolyPlayed,
        'send-monopoly': monopolySent,
        'play-invent': inventPlayed,
        'swap-res': resourcesSwapped,
        'offer-trade': tradeOffered,
        'answer-offer': offerAnswered,
        'end-turn': turnEnded,
        'win-game': gameWon,
    };
    
    if (event.args) {
        console.log(eventId, event.player, event.action, event.args)
    } else {
        console.log(eventId, event.player, event.action)
    }
    
    resetChoice();
    
    functionMap[event.action](event.player, event.args);
    
    refreshUI();
}

function updateResources(player, resources, add, cause) {
    
    if (player != state.me) {
        return;
    }
    
    const changes = resIndices.filter((i) => resources[i] > 0);
    var parts;
    if (add) {
        addResources(resources);
        parts = changes.map((i) => "+" + resources[i] + "&nbsp;" + resNames[i]);
    } else {
        subtractResources(resources);
        parts = changes.map((i) => "-" + resources[i] + "&nbsp;" + resNames[i]);
    }

    if (parts.length) {
        logLine(cause + ": " + parts.join(', '));
    }
}
    
function townPlaced(player, args) {
    
    const nodeId = args;
    claimTown(player, nodeId);
    logLine(state.current + " setzt eine Siedlung");
    
    if (player == state.me) {
        if (state.phase == 'backward') {
            const resources = noResources();
            state.board[nodeId].tiles.map((i) => state.board[i]).forEach((t) => {
                if (t.land > 0) resources[t.land] += 1;
            });
            updateResources(player, resources, true, "START");
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
    
    logLine(player + " würfelt eine " + roll.toString());
    
    if (roll == 7) {
        if (state.me == state.players[0]) {
            if (countResources(state.resources) > 7) {
                const dropChoice = createDropChoice();
                pushChoice(dropChoice);
            } else {
                postEvent('drop-res', null);
            }
        }
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
            updateResources(state.me, resources, true, "WÜRFEL");
        }
        if (player == state.me) {
            const turnChoice = createTurnChoice();
            pushChoice(turnChoice);
        }
    }
}

function resourcesDropped(player, args) {
    
    const resources = args;
    
    if (resources) {
        logLine(player + " wirft Rohstoffe ab");
        updateResources(player, resources, false, "RÄUBER");
    }

    const playerIndex = state.players.indexOf(player);
    if (playerIndex == state.players.length - 1) {
        logLine(state.current + " darf den Räuber bewegen");
        if (state.current == state.me) {
            const banditChoice = createBanditChoice();
            pushChoice(banditChoice);
        }
    } else if (state.players[playerIndex + 1] == state.me) {
        if (countResources(state.resources) > 7) {
            const dropChoice = createDropChoice();
            pushChoice(dropChoice);
        } else {
            postEvent('drop-res', null);
        }
    }
}

function banditMoved(player, args) {
    
    const [tileId, targetPlayer] = args;
    
    moveBandit(tileId);
    
    const resIndex = state.board[tileId].land;
    const resName = resNames[resIndex];
    
    if (targetPlayer) {
        logLine(player + " setzt den Räuber auf " + resName + " und beraubt " + targetPlayer);
        
        const random = nextRandom();
        
        if (targetPlayer == state.me) {
            const expResources = expandResources(state.resources);
            if (expResources.length > 0) {
                const resIndex = expResources[Math.floor(expResources.length * random)];
                const resources = noResources();
                resources[resIndex] = 1;
                postEvent('send-loot', [player, resources]);
            } else {
                postEvent('send-loot', [player, null]);
            }
        }
        
    } else {
        logLine(player + " setzt den Räuber auf " + resName);
        if (player == state.me) {
            const turnChoice = createTurnChoice();
            pushChoice(turnChoice);
        }
    }
}

function lootSent(player, args) {
    
    const [receiver, resources] = args;
    
    if (resources) {
        updateResources(receiver, resources, true, "BEUTE")
        updateResources(player, resources, false, "GESTOHLEN");
    }
    
    if (state.current == state.me) {
        const turnChoice = createTurnChoice();
        pushChoice(turnChoice);
    }
}

function purchaseMade(player, args) {
    
    const purchaseIndex = args[0];
    const costs = purchaseCosts[purchaseIndex];
    
    if (purchaseIndex == 1) {
        // new roads can extend or disrupt existing roads,
        // therefore we always need to check for changes
        const prevLongest = state.longestRoad;
        
        claimRoad(player, args[1]);
        logLine(player + " baut eine Straße");
        
        const newLongest = state.longestRoad;
        if (prevLongest.player != newLongest.player && prevLongest.length != newLongest.length) {
            if (newLongest.player) {
                logLine(newLongest.player + " hält nun die längste Handelsstraße (" + newLongest.length + ")");
            } else {
                logLine("Kein Spieler besitzt mehr die längste Handelsstraße");
            }
        }
        
    } else if (purchaseIndex == 2) {
        claimTown(player, args[1]);
        logLine(player + " baut eine Siedlung");
    } else if (purchaseIndex == 3) {
        upgradeTown(player, args[1]);
        logLine(player + " baut eine Siedlung zur Stadt aus");
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
                    cardChoice = createRoadworksFirstChoice(cardIndex);
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
        }
    }
    
    updateResources(player, costs, false, "KOSTEN");
    
    if (player == state.me) {
        
        if (checkVictory()) {
            return;
        }
        
        const turnChoice = createTurnChoice();
        pushChoice(turnChoice);
    }
}

function resourcesSwapped(player, args) {
    
    const [give, take] = args;
    
    logLine(player + " handelt per Hafen");
    updateResources(player, give, false, "GEGEBEN");
    updateResources(player, take, true, "ERHALTEN");
    
    if (state.current == state.me) {
        const turnChoice = createTurnChoice();
        pushChoice(turnChoice);
    }
}

function knightPlayed(player, args) {
    
    const cardIndex = args;
    
    const prevLargest = state.largestForce;
    
    discardCard(player, cardIndex);
    logLine(player + " spielt eine Ritter-Karte und darf den Räuber bewegen");
    
    const newLargest = state.largestForce;
    
    if (newLargest.size > prevLargest.size) {
        logLine(newLargest.player + " hält nun die größte Rittermacht (" + newLargest.size + ")");
        
        if (player == state.me && checkVictory()) {
            return;
        }
    }
    
    if (player == state.me) {
        const banditChoice = createBanditChoice();
        pushChoice(banditChoice);
    }
}
    
function roadsPlayed(player, args) {
    
    const [cardIndex, edgeId1, edgeId2] = args;
    discardCard(player, cardIndex);
    claimRoad(player, edgeId1);
    claimRoad(player, edgeId2);
    
    logLine(player + " spielt Straßenbau und erhält 2 kostenlose Straßen");
    
    if (state.current == state.me) {
        
        const length = computeRoadLength(state.me);
        if (length > state.longestRoad) {
            postEvent('claim-longest', length);
            return;
        }
        
        const turnChoice = createTurnChoice();
        pushChoice(turnChoice);
    }
}

function monopolyPlayed(player, args) {
        
    const [cardIndex, resIndex] = args;
    discardCard(player, cardIndex);
    
    logLine(player + " spielt Monopol auf: " + resNames[resIndex]);
    
    if (state.me == state.players[0]) {
        obeyMonopoly(player, resIndex);
    }
}

function obeyMonopoly(player, resIndex) {
    
    if (player == state.me || state.resources[resIndex] == 0) {
        postEvent('send-monopoly', [player, null]);
        return;
    }
    
    var resources = noResources();
    resources[resIndex] = state.resources[resIndex];
    postEvent('send-monopoly', [player, resIndex, resources]);
}

function monopolySent(player, args) {
    
    const [receiver, resIndex, resources] = args;
    
    if (resources) {
        logLine(player + " gibt Rohstoffe ab");
        updateResources(receiver, resources, true, "MONOPOL");
        updateResources(player, resources, false, "MONOPOL");
    }
    
    const playerIndex = state.players.indexOf(player);
    if (playerIndex == state.players.length - 1) {
        if (state.current == state.me) {
            const turnChoice = createTurnChoice();
            pushChoice(turnChoice);
        }
    } else if (state.players[playerIndex + 1] == state.me) {
        obeyMonopoly(receiver, resIndex);
    }
}
        
function inventPlayed(player, args) {
    
    const [cardIndex, resources] = args;
    
    discardCard(player, cardIndex);
    logLine(player + " spielt Erfindung und erhält Rohstoffe");
    
    updateResources(player, resources, true, "ERFINDUNG");
    
    if (state.current == state.me) {
        const turnChoice = createTurnChoice();
        pushChoice(turnChoice);
    }
}

function turnEnded(player, args) {
    
    advanceTurn();
    
    logLine(state.current + " ist am Zug");

    if (state.current == state.me) {
        // NOTE: technically, cards can be played before rolling
        postEvent('roll-dice', null);
    }
}

function tradeOffered(player, args) {
    
    const [partner, give, take] = args;
    
    if (player == state.me || partner == state.me) {
        logLine(player + " schlägt " + partner + " einen Handel vor");
    }
    
    if (partner == state.me) {
        const answerChoice = createTradeAnswerChoice(player, give, take);
        pushChoice(answerChoice);
    }
}

function offerAnswered(player, args) {
    
    const [proposer, give, take, accepted] = args;
    
    if (accepted) {
        updateResources(proposer, give, false, "GEGEBEN");
        updateResources(player, give, true, "ERHALTEN");
        updateResources(proposer, take, true, "ERHALTEN");
        updateResources(player, take, false, "GEGEBEN");
        logLine(proposer + " handelt mit  " + player);
    } else if (proposer == state.me) {
        logLine(player + " lehnt den vorgeschlagenen Handel ab");
    }
    
    if (state.current == state.me) {
        const turnChoice = createTurnChoice();
        pushChoice(turnChoice);
    }
}

function checkVictory() {
    
    const progress = getVictoryProgress();
    if (progress.points >= 10) {
        postEvent('win-game', progress.points);
        return true;
    }
    return false;
}

function gameWon(player, args) {
    
    const points = args;
    logLine(player + " gewinnt mit " + points + " Siegpunkten");
    
    resetChoice();
}
