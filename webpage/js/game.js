var eventsRef = null;
var prevEventId = null;


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
        'build-town': townBuilt,
        'build-road': roadBuilt,
        'upgrade-town': townUpgraded,
        'buy-card': cardBought,
        'play-card': cardPlayed,
        'send-res': resourcesSent,
        'trade-sea': seaTraded,
        'offer-trade': tradeOffered,
        'accept-trade': tradeAccepted,
        'end-turn': turnEnded,
    };
    
    console.log(prevActionId, event.player, event.action, event.args);
    functionMap[event.action](event.player, event.args);
    
    updateState();
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
            eventRef.set(action);
        }
    });
}

function startGame() {
    
    logLine("Spieler: " + state.players.join(', '));
    logLine(state.current + " darf setzen");

    if (state.current == state.me) {
        setBoardMode('place-town');
    }

    updateUI();
}
    
function townPlaced(player, args) {
    
    const nodeId = args;
    addTown(player, nodeId);
    logLine(state.current + " setzt eine Siedlung");
    
    if (state.current == state.me) {
        if (state.phase == 'backward') {
            var yields = [];
            for (const tileId of state.board[nodeId].tiles) {
                const resource = state.board[tileId].res;
                if (resource != S) {
                    yields.push(resource);
                }
            }
            increaseResources(player, yields);
            logLine(" - Erträge: " + sort(yields).join(', '));
        }
        setBoardMode('place-road');
    }
}

function roadPlaced(player, args) {
    
    const edgeId = args;
    addRoad(player, edgeId);
    logLine(state.current + " setzt eine Strasse");
    
    if (state.current == state.me) {
        setBoardMode(null);
    }
    
    advanceTurn();
    
    if (state.phase == 'game') {
        logLine(state.current + " ist am Zug");
        if (state.current == state.me) {
            postEvent('roll-dice');
        }
    } else {
        logLine(state.current + " darf setzen");
    }
}

function roadBuilt(player, args) {
    
    const edgeId = args;
    decreaseResources(player, roadCosts);
    addRoad(player, edgeId);
    logLine(state.current + " baut eine Strasse");
}

function townBuilt(player, args) {
    
    const nodeId = args;
    decreaseResources(player, townCosts);
    addTown(player, nodeId);
    logLine(state.current + " baut eine Siedlung");
}

function townUpgraded(player, args) {
    
    const nodeId = args;
    decreaseResources(player, cityCosts);
    upgradeTown(player, nodeId);
    logLine(state.current + " baut eine Siedlung zur Stadt aus");
}

function cardBought(player, args) {
    
    decreaseResources(cardCosts);
    drawCard(player, "cardSelected");
    logLine(state.current + " kauft eine Entwicklungskarte");
}

function cardPlayed(player, args) {
    
    const card = args[0];
    consumeCard(card);
    
    if (card == RI) {
        if (state.current == state.me) {
            setBoardMode('move-bandit');
        }
        logLine(player + " spielt eine Ritter-Karte und darf den Räuber bewegen");
    } else if (card == SB) {
        addRoad(player, args[1]);
        addRoad(player, args[2]);
        logLine(player + " spielt Strassenbau und erhält 2 kostenlose Strassen");
    } else if (card == MP) {
        const resource = args[1];
        logLine(player + " spielt Monopol und erhält: " + resource);
        if (player != state.me) {
            const losses = state.resources.filter((r) => r == resource);
            if (losses.length > 0) {
                postEvent('send-res', [MP, player, losses]);
            }
        }
    } else if (card == ER) {
        const resources = args;
        increaseResources(player, resources);
        logLine(player + " spielt Erfindung und erhält Rohstoffe");
    }
}

function resourcesDropped(player, args) {
    
    const losses = args;
    decreaseResources(player, losses);
    
    if (pendingSteal) {
        pendingSteal = false;
        performSteal();
    }
}

function resourcesSent(player, args) {
    
    const [cause, recipient, resources] = args;
    decreaseResources(player, resources);
    increaseResources(recipient, resources);
}

function turnEnded(player, args) {
    
    advanceTurn();
    
    logLine(state.current + " ist am Zug");

    if (state.current == state.me) {
        // NOTE: technically, cards can be played before rolling
        postEvent('roll-dice');
    }
}
    
function diceRolled(player, args) {
    
    const roll = 2 + Math.floor(6 * rng()) + Math.floor(6 * rng())
    
    logLine(player + " würfelt eine " + roll.toString());
    
    if (roll == 7) {
        const count = state.resources.length;
        if (count > 7) {
            const targetCount = Math.ceil(count / 2);
            const options = state.resources.map((r) => false);
            startChoice({action: 'drop-res', targetCount, options});
        }
        if (state.current == state.me) {
            setBoardMode('move-bandit');
        }
        logLine(state.current + " darf den Räuber bewegen");
    } else {
        var yields = [];
        for (const tileId of allTileIds) {
            const tileCell = state.board[tileId];
            if (tileCell.roll == roll && tileCell.bandit != true) {
                for (const nodeId of tileCell.nodes) {
                    const townCell = state.board[nodeId];
                    if (townCell.player) {
                        if (townCell.player == state.me) {
                            yields.push(tileCell.res);
                            if (townCell.city) {
                                yields.push(tileCell.res);
                            }
                        }
                    }
                }
            }
        }
        if (yields.length > 0) {
            increaseResources(yields);
            logLine(" - Erträge: " + sort(yields).join(', '));
        }
    }
}
    
function banditMoved(player, args) {
    
    const [tileId, targetPlayer] = args;
    moveBandit(tileId);
    
    const resource = state.board[tileId].res;
    if (targetPlayer) {
        logLine(state.current + " setzt den Räuber auf " + resource + " und beraubt " + targetPlayer);
    } else {
        logLine(state.current + " setzt den Räuber auf " + resource);
    }
    
    if (targetPlayer == state.me) {
        if (context.choice) {
            // TODO check in dispatchClick, call getRaided
            context.choice.pendingRaid = true;
        } else {
            getRaided();
        }
    } else {
        rng(); // keep RNG in sync
    }
}

function getRaided() {
    
    if (state.resources.length == 0) {
        rng(); // keep RNG in sync
        return;
    }
    
    const randomIndex = Math.floor(state.resources.length * rng())
    const resource = state.resources[randomIndex];
    const losses = [resource];

    postEvent('send-res', ["Räuber", player, losses]);
}

function seaTraded(player, args) {
    
    const [price, resource] = args;
    decreaseResources(player, price);
    increaseResources(player, [resource]);
}

function tradeOffered(player, args) {
    
}

function tradeAccepted(player, args) {
    
}

function dispatchClick(action, arg) {
    
    const functionMap = {
        'place-town': tokenClicked,
        'place-road': tokenClicked,
        'build-town': tokenClicked,
        'build-road': tokenClicked,
        'redeen-road': freeRoadClicked,
        'move-bandit': banditClicked,
        'buy-card': buyClicked,
        'play-card': playClicked,
        'toggle-drop': dropToggled,
        'drop-res': dropClicked,
        'trade-sea': tradeClicked,
    };
    
    functionMap[action](action, arg);
}
    
    
function tokenClicked(action, arg) {
        
    if (state.boardMode == action) {
        setBoardMode(null);
        postEvent(action, arg);
    } else {
        setBoardMode(action);
        updateUI();
    }
}
        
function banditClicked(action, arg) {
        
    if (state.choice) {
        const tileId = state.choice.tileId;
        clearChoice();
        postEvent(action, [tileId, arg]);
    } else {
        moveBandit(arg); // NOTE: premature placement, not confirmed by event!!!
        setBoardMode(null);

        var targets = [];
        for (const nodeId of state.board[arg].nodes) {
            const player = state.board[nodeId].player;
            if (player && player != state.me && !targets.includes(player)) {
                targets.push(player);
            }
        }

        if (targets.length == 0) {
            postEvent(action, [tileId, null]);
        } else if (targets.length == 1) {
            postEvent(action, [tileId, targets[0]]);
        } else {
            startChoice({tileId: arg, targets});
            updateUI();
        }
    }
}
        
function buyClicked(action, arg) {
        
    postEvent(action, null);
}
        
function playClicked(action, arg) {
        
    if (state.choice) {

        if (args == null) {
            clearChoice();
            updateUI();
            return;
        }

        if (state.choice.cardName == ER) {
            if (state.choice.first) {
                const firstId = state.choice.first;
                clearChoice();
                postEvent(action', [ER, firstId, arg]);
            } else {
                updateChoice('first', arg);
                updateUI();
            }
        } else if (state.choice.cardName == MP) {
            clearChoice();
            postEvent(action', [MP, arg]);
        }

    } else if (arg == RI) {
        postEvent(action', [RI]);
    } else {
        if (arg == SB) {
            setBoardMode('redeem-road');
        }
        startChoice({action, cardName: arg});
        updateUI();
    }
}

function freeRoadClicked(action, arg) {
        
    if (state.choice.first) {
        const firstId = state.choice.first;
        setBoardMode(null);
        clearChoice();
        postEvent('play-card', [SB, firstId, arg]);
    } else {
        addRoad(state.me, arg); // NOTE: premature placement, not confirmed by event!!!
        updateChoice('first', arg);
        updateUI();
    }
}
        
function dropToggled(action, arg) {
        
    var toggles = state.choice.toggles;
    toggles[arg] = !toggles[arg];
    updateUI();
}
        
function dropClicked(action, arg) {

    var losses = [];
    for (var i = 0; i < state.resources.length; i += 1) {
        if (state.choice.toggles[i]) {
            losses.push(state.resources[i]);
        }
    }

    if (losses.length != state.choice.targetCount) {
        window.alert("Ungültige Auswahl!");
        return;
    }

    clearChoice();
    postEvent(action, losses);
}
        
function tradeClicked(action, arg) {
    
    if (context.choice) {
        if (args == null) {
            clearChoice();
            updateUI();
            return;
        }

        const price = context.choice.price;
        clearChoice();
        postEvent(action, [price, arg]);

    } else {
        startChoice({action, price: arg});
        updateUI();
    }
}
