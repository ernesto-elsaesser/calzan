const resRanks = {
    'Holz': 1,
    'Lehm': 2,
    'Getreide': 3,
    'Wolle': 4,
    'Erz': 5,
};

const H = "Holz";
const L = "Lehm";
const G = "Getreide";
const W = "Wolle";
const E = "Erz";
const S = "Sand";

const RI = "Ritter";
const SB = "Strassenbau";
const MP = "Monopol";
const ER = "Erfindung";

const victoryCards = [
    "Bibliothek", "Marktplatz", "Rathaus", "Kirche", "Universität"
];

const allTileIds = [
    'A1', 'A2', 'A3',
    'B1', 'B2', 'B3', 'B4',
    'C1', 'C2', 'C3', 'C4', 'C5',
    'D1', 'D2', 'D3', 'D4',
    'E1', 'E2', 'E3',
];

const allNodeIds = [
    'A1A', 'A1B', 'A2A', 'A2B', 'A3A', 'A3B', 'A3C',
    'B1A', 'B1B', 'B2A', 'B2B', 'B3A', 'B3B', 'B4A', 'B4B', 'B4C',
    'C1A', 'C1B', 'C2A', 'C2B', 'C3A', 'C3B', 'C4A', 'C4B', 'C5A', 'C5B', 'C5C', 'C1D',
    'D1A', 'D1B', 'D2A', 'D2B', 'D3A', 'D3B', 'D4A', 'D4B', 'D4C', 'C5F', 'D1D',
    'E1A', 'E1B', 'E2A', 'E2B', 'E3A', 'E3B', 'E3C', 'D4F', 'E1D', 'E1E', 'E2D', 'E2E', 'E3D', 'E3E', 'E3F',
];

const allEdgeIds = [
    'A1b', 'A1c', 'A2b', 'A2c', 'A3b', 'A3c', 'A1a', 'A2a', 'A3a', 'A3f',
    'B1b', 'B1c', 'B2b', 'B2c', 'B3b', 'B3c', 'B4b', 'B4c', 'B1a', 'B2a', 'B3a', 'B4a', 'B4f', 'C1b',
    'C1c', 'C2b', 'C2c', 'C3b', 'C3c', 'C4b', 'C4c', 'C5b', 'C5c', 'C1a', 'C2a', 'C3a', 'C4a', 'C5a', 'C5f', 'C1d',
    'D1b', 'D1c', 'D2b', 'D2c', 'D3b', 'D3c', 'D4b', 'D4c', 'C5e', 'D1a', 'D2a', 'D3a', 'D4a', 'D4f', 'D1d',
    'E1b', 'E1c', 'E2b', 'E2c', 'E3b', 'E3c', 'D4e', 'E1a', 'E2a', 'E3a', 'E3f', 'E1d', 'E1e', 'E2d', 'E2e', 'E3d', 'E3e',
];

var actionsRef = null;
var rng = null;

var state = {
    players: [],
    board: {},
    stack: [],
    me: null,
    current: null,
    phase: 'forward',
    context: null,
    resources: [],
    roadIds: [],
    townIds: [],
    cityIds: [],
    cards: [],
    victoryCards: [],
    freeEdgeIds: allEdgeIds,
    freeNodeIds: allNodeIds,
    // per player
    longestRoads: {},
    playedKnights: {},
};

var prevActionId = null;
var selectedTownId = null;
var selectedBanditTileId = null;
var activeCard = null;
var inventionResources = null;


function initGame(game, player) {

    const gameRef = firebase.database().ref('/' + game);
    const initialRef = gameRef.child('/initial');
    actionsRef = gameRef.child('/actions');
    
    initialRef.get().then((initialSnap) => {
        const initialData = initialSnap.val();
        initState(initialData, player);
        actionsRef.on('child_added', (actionSnap, prevId) => {
            const action = actionSnap.val();
            dispatchAction(action, prevId);
        });
    });
}

function initState(data, player) {
    
    rng = createRNG(data.seed);
    
    state.board = data.board;
    state.players = data.players;
    state.me = player;
    state.current = data.players[0];
    
    for (const player of data.players) {
        state.longestRoads[player] = 0;
        state.playedKnights[player] = 0;
    }
    
    var allCards = [];
    for (const card of victoryCards) {
        allCards.push(card);
    }
    for (var i = 0; i < 2; i += 1) {
        allCards.push(SB);
        allCards.push(MP);
        allCards.push(ER);
    }
    for (var i = 0; i < 14; i += 1) {
        allCards.push(RI);
    }
    
    state.stack = allCards.map(v => ({ v, r: rng() }))
        .sort((a, b) => a.r - b.r).map((d) => d.v);
    
    updateActions();
    
    logLine("Spieler: " + state.players.join(', '));
    logLine(state.players[0] + " darf setzen");
}

function createRNG(seed) {
    
    return function() {
      var t = seed += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}
    
function dispatchAction(action, prevId) {
    
    console.log("action after", prevId);
    
    if (prevId != prevActionId) {
        console.log("Invalid action id", prevId);
        return;
    }
    
    prevActionId += 1;
    
    const actionFunctions = {
        'place-forward': forwardPlaced,
        'place-backward': backwardPlaced,
        'roll-dice': diceRolled,
        'move-bandit': banditMoved,
        'buy-town': townBought,
        'buy-road': roadBought,
        'buy-city': cityBought,
        'buy-card': cardBought,
        'play-card': cardPlayed,
        'add-res': resourcesAdded,
        'drop-res': resourcesDropped,
        'send-res': resourcesSent,
        /*
        'offer-trade': tradeOffered,
        'accept-trade': tradeAccepted,
        */
        'end-turn': turnEnded,
    };
    
    const player = action[0];
    const key = action[1];
    const args = action.slice(2);
    
    actionFunctions[key](player, args);
    
    updateActions();
}

function commitAction(action) {
       
    const actionId = prevActionId + 1;
    const actionPath = '/' + actionId.toString();
    action.unshift(state.me);
    actionsRef.child(actionPath).set(action);
}

function forwardPlaced(player, args) {
    
    assert(player, 'forward');
    placeInitial(player, args);
    logLine(state.current + " hat seine erste Siedlung platziert");
}

function backwardPlaced(player, args) {
    
    assert(player, 'backward');
    placeInitial(player, args);
    logLine(state.current + " hat seine zweite Siedlung platziert");
}
    
function placeInitial(player, args) {
    
    const [nodeId, edgeId] = args;
    placeTown(player, nodeId);
    placeRoad(player, edgeId);
}

function placeRoad(player, edgeId) {
    
    const cell = state.board[edgeId];
    cell.player = player;
    
    if (player == state.me) {
        state.roadIds.push(edgeId);
    }
    
    state.freeEdgeIds = state.freeEdgeIds.filter((i) => i != edgeId);
    
    // TODO update state.longestRoads[player]
}

function placeTown(player, nodeId) {
    
    const cell = state.board[nodeId];
    cell.player = player;
    
    if (player == state.me) {
        state.townIds.push(nodeId);
    }
    
    var blockedNodeIds = [nodeId];
    var blockedEdgeIds = [];
    
    for (const edgeId of cell.edges) {
        
        if (player != state.me) {
            blockedEdgeIds.push(edgeId);
        }
        
        for (const nextNodeId of state.board[edgeId].nodes) {
            blockedNodeIds.push(nextNodeId);
            
            /*
            if (player != state.me) {
                for (const nextEdgeId of state.board[nextNodeId].edges) {
                    blockedEdgeIds.push(nextEdgeId);
                }
            }
            */
        }
    }
    
    state.freeNodeIds = state.freeNodeIds.filter((i) => !blockedNodeIds.includes(i));
    state.freeEdgeIds = state.freeEdgeIds.filter((i) => !blockedEdgeIds.includes(i));
}

function roadBought(player, args) {
    
    assert(player, 'game');
    const edgeId = args[0];
    placeRoad(player, edgeId);
    logLine(state.current + " baut eine Strasse");
}

function townBought(player, args) {
    
    assert(player, 'game');
    const nodeId = args[0];
    placeTown(player, nodeId);
    logLine(state.current + " baut eine Siedlung");
}

function cityBought(player, args) {
    
    assert(player, 'game');
    const nodeId = args[0];
    state.board[nodeId].city = true;
    if (player == state.me) {
        state.townIds = state.townIds.filter((i) => i != nodeId);
        state.cityIds.push(nodeId);
    }
    logLine(state.current + " baut eine Siedlung zur Stadt aus");
}

function cardBought(player, args) {
    
    assert(player, 'game');
    const card = state.stack.shift();
    if (player == state.me) {
        if (victoryCards.includes(card)) {
            state.vicotryCards.push(card);
        } else {
            state.cards.push(card);
        }
    }
    logLine(state.current + " kauft eine Entwicklungskarte");
}

function cardPlayed(player, args) {
    
    assert(player, 'game');
    
    const card = args[0];
    
    if (player == state.me) {
        const cardIndex = state.cards.indexOf(card);
        state.cards.splice(cardIndex, 1);
    }
    
    if (card == RI) {
        logLine(player + " spielt eine Ritter-Karte und darf den Räuber bewegen");
        state.phase = 'bandit';
        state.playedKnights[player] += 1;
    } else if (card == SB) {
        logLine(player + " spielt Strassenbau und erhält 2 kostenlose Strassen");
    } else if (card == MO) {
        const chosenResource = args[1];
        logLine(player + " spielt Monopol und erhält: " + chosenResource);
        if (player != state.me) {
            var lost = [];
            var kept = [];
            for (const resource of state.resources) {
                if (resource == chosenResource) {
                    lost.push(resource);
                } else {
                    kept.push(resource);
                }
            }
            if (lost.length > 0) {
                state.resources = kept;
                sendResources(player, lost);
            }
        }
    } else if (card == ER) {
        logLine(player + " spielt Erfindung und erhält Rohstoffe");
    }
}

function resourcesAdded(player, args) {
    
    const resources = args;
    if (player == state.me) {
        add(resources);
        logLine(player + " erhält: " + format(resources));
    } else {
        logLine(player + " erhält Rohstoffe");
    }
}

function resourcesDropped(player, args) {
    
    const resources = args;
    if (player == state.me) {
        remove(resources);
        logLine(player + " zahlt: " + format(resources));
    } else {
        logLine(player + " zahlt Rohstoffe");
    }
}

function resourcesSent(player, args) {
    
    const recipient = args[0];
    const resources = args.slice(1);
    if (player == state.me) {
        remove(resources);
        logLine(player + " zahlt an " + recipient + ": " + format(resources));
    } else if (recipient == state.me) {
        add(resources);
        logLine(recipient + " erhält von " + player + ": " + format(resources));
    } else {
        logLine(recipient + " erhält von " + player + " Rohstoffe");
    }
}

function turnEnded(player, args) {
    
    const currentIndex = state.players.indexOf(state.current);
    
    if (state.phase == 'forward') {
        if (currentIndex == state.players.length - 1) {
            state.phase = 'backward';
            logLine(state.current + " darf erneut setzen");
        } else {
            state.current = state.players[currentIndex + 1];
            logLine(state.current + " darf setzen");
        }
    } else if (state.phase == 'backward') {
        if (currentIndex == 0) {
            state.phase = 'game';
            logLine(state.current + " ist am Zug");
        } else {
            state.current = state.players[currentIndex - 1];
            logLine(state.current + " darf setzen");
        }
    } else if (state.phase == 'game') {
        const nextIndex = (currentIndex + 1) % state.players.length;
        state.current = state.players[nextIndex];
        
        logLine(state.current + " ist am Zug");
        
        if (state.current == state.me) {
            rollDice();
        }
    }
}
    
    
function diceRolled(player, args) {
    
    assert(player, 'game');
    
    const roll = dice(6) + dice(6);
    logLine(player + " würfelt eine " + roll.toString());
    
    if (roll == 7) {
        logLine(state.current + " darf den Räuber bewegen");
        state.phase = 'bandit';
        if (state.resources.length > 7) {
            triggerSteal();
        }
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
            addResources(yields);
        }
    }
}
    
function banditMoved(player, args) {
    
    assert(player, 'bandit');
    
    const [tileId, targetPlayer] = args;
    
    for (const otherTileId of allTileIds) {
        state.board[otherTileId].bandit = false;
    }
    state.board[tileId].bandit = true;
    
    if (targetPlayer == state.me) {
        const resIndex = dice(state.resources.length - 1);
        const resources = state.resources.splice(resIndex, 1);
        sendResources(player, resources);
    } else {
        dice(0); // keep RNG in sync
    }
    
    state.phase = 'game';
}

function assert(player, phase) {
    
    if (state.current != player || state.phase != phase) {
        window.alert("Ungültiger Zug von " + player + ". Spiel abgebrochen.");
    }
}

function updateActions() {
    
    state.actions = {};
    for (const cell of Object.values(state.board)) {
        delete cell.action;
    }
    
    if (state.current == state.me) {
        
        if (state.context) {
            if (selectedBanditTileId) {
                for (const nodeId of state.board[selectedBanditTileId].nodes) {
                    const player = state.board[nodeId].player;
                    if (player && player != state.me) {
                        state.actions[player] = "moveBandit('" + player + "')";
                    }
                }
            } else if (activeCard == ER) {
                for (const resource of Object.keys(resRanks)) {
                    state.actions[resource] = "selectInvention('" + resource + "')";
                }
            } else if (activeCard == MO) {
                for (const resource of Object.keys(resRanks)) {
                    state.actions[resource] = "monoploize('" + resource + "')";
                }
            }
        } else if (state.phase == 'game') {

            //state.actions["Handel"] = "trade()";

            var stats = {};
            for (const resource of state.resources) {
                if (resource in stats) {
                    stats[resource] += 1;
                } else {
                    stats[resource] = 1;
                }
            }

            const canRoad = stats[H] > 0 && stats[L] > 0;
            const canTown = canRoad && stats[G] > 0 && stats[W] > 0;
            const canCity = stats[G] > 1 && stats[E] > 2;
            const canCard = stats[G] > 0 && stats[W] > 0 && stats[E] > 0;

            if (canCard) {
                state.actions["Entwicklungskarte kaufen"] = "buyCard()";
            }

            state.actions["Zug beenden"] = "endTurn()";

            for (const nodeId of state.townIds.concat(state.cityIds)) {
                for (const edgeId of state.board[nodeId].edges) {
                    if (canRoad && state.freeEdgeIds.includes(edgeId)) {
                        state.board[edgeId].action = "buyRoad('" + edgeId + "')";
                    }
                }
            }
                
            for (const edgeId of state.roadIds) {
                for (const nodeId of state.board[edgeId].nodes) {
                    if (canTown && state.freeNodeIds.includes(nodeId)) {
                        state.board[nodeId].action = "buyTown('" + nodeId + "')";
                    }
                    for (const nextEdgeId of state.board[nodeId].edges) {
                        if (canRoad && state.freeEdgeIds.includes(nextEdgeId)) {
                            state.board[nextEdgeId].action = "buyRoad('" + nextEdgeId + "')";
                        }
                    }
                }
            }

            if (canCity) {
                for (const nodeId of state.townIds) {
                    state.board[nodeId].upgrade = "buyCity('" + nodeId + "')";
                }
            }

        } else if (state.phase == 'bandit') {

            for (const tileId of allTileIds) {
                if (state.board[tileId].bandit) {
                    continue;
                }
                state.board[tileId].action = "selectTile('" + tileId + "')";
            }

        } else if (state.phase == 'forward' || state.phase == 'backward') {

            if (selectedTownId) {
                for (const edgeId of state.board[selectedTownId].edges) {
                    state.board[edgeId].action = "selectRoad('" + edgeId + "')";
                }
            } else {
                for (const nodeId of state.freeNodeIds) {
                    state.board[nodeId].action = "selectTown('" + nodeId + "')";
                }
            }
        }
    }
    
    updateUI();
}

function selectTown(nodeId) {
    selectedTownId = nodeId;
    state.board[nodeId].player = state.me;
    updateActions();
}

function selectRoad(edgeId) {
    const nodeId = selectedTownId;
    var yields = [];
    for (const tileId of state.board[nodeId].tiles) {
        const resource = state.board[tileId].res;
        if (resource != S) {
            yields.push(resource);
        }
    }
    selectedTownId = null;
    commitAction(['place-' + state.phase, nodeId, edgeId]);
    addResources(yields);
    endTurn();
}

function selectTile(tileId) {
    selectedBanditTileId = tileId;
    state.context = "Raubzug";
    updateActions();
}

function moveBandit(targetPlayer) {
    const tileId = selectedBanditTileId;
    selectedBanditTileId = null;
    state.context = null;
    commitAction(['move-bandit', tileId, targetPlayer]);
    updateActions();
}

function triggerSteal() {
    // TODO let player select resources to drop
}

function activateCard(card) {
    
    if (card == RI) {
        commitAction(['play-card', RI]);
    } else if (card == ER) {
        state.context = ER + " (1. Rohstoff)";
        activeCard = ER;
        inventionResources = []
        updateActions();
    } else if (card == MO) {
        state.context = MO;
        activeCard = MO;
        updateActions();
    } else if (card == SB) {
        commitAction(['play-card', SB]);
        addResources([H, H, L, L]);
    }
    
    // TODO end turn afterwards?
}

function monopolize(resource) {
    commitAction(['play-card', MO, resource]);
    state.context = null;
    activeCard = null;
    updateActions();
}

function selectInvention(resource) {
    inventionResources.push(resource);
    if (inventionResources.length == 1) {
        state.context = ER + " (2. Rohstoff)";
    } else {
        const resources = inventionResources;
        state.context = null;
        activeCard = null;
        inventionResources = null;
        commitAction(['play-card', ER]);
        addResources(resources);
    }
    updateActions();
}

function rollDice() {
    commitAction(['roll-dice']);
}

function addResources(resources) {
    commitAction(['add-res'].concat(resources));
}

function dropResources(resources) {
    commitAction(['drop-res'].concat(resources));
}

function sendResources(player, resources) {
    commitAction(['send-res', player].concat(resources));
}

function buyRoad(edgeId) {
    dropResources([H, L]);
    commitAction(['buy-road', edgeId]);
}

function buyTown(nodeId) {
    dropResources([H, L, G, W]);
    commitAction(['buy-town', nodeId]);
}

function buyCity(nodeId) {
    dropResources([G, G, E, E, E]);
    commitAction(['buy-city', nodeId]);
}

function buyCard() {
    dropResources([G, W, E]);
    commitAction(['buy-card']);
}

function trade() {
    window.alert("Handeln funktioniert aktuell leider nur per Spracheingabe.");
}

function endTurn() {
    commitAction(['end-turn']);
}

function dice(sides) {
    return Math.floor((sides + 1) * rng())
}

function add(resources) {
    state.resources = state.resources.concat(resources).sort((a, b) => resRanks[a] - resRanks[b]);
}

function remove(resources) {
    for (const resource of resources) {
        const resIndex = state.resources.indexOf(resource);
        state.resources.splice(resIndex, 1);
    }
}

function format(resources) {
    return resources.sort((a, b) => resRanks[a] - resRanks[b]).join(', ')   
}