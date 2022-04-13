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
    resources: {H: 0, L: 0, G: 0, W: 0, E: 0 },
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
// on buy-road, trace extended road on all possible paths, compare if longer
// check on playKnight

var prevActionId = null;
var selectedTownId = null;
var selectedTileId = null;
var freeRoads = 0;


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
    updateUI();
    
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
    
    if (prevId != prevActionId) {
        console.log("Invalid action id", prevId);
        return;
    }
    
    const actionFunctions = {
        'place-forward': forwardPlaced,
        'place-backward': backwardPlaced,
        'move-bandit': banditMoved,
        'buy-town': townBought,
        'buy-road': roadBought,
        'buy-city': cityBought,
        'buy-card': cardBought,
        'play-card': cardPlayed,
        'transfer-res': resourcesTransferred,
        'drop-res': resourcesDropped,
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
    updateUI();
    
    prevActionId += 1;
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
    
    const currentIndex = state.players.indexOf(state.current);
    if (currentIndex == state.players.length - 1) {
        state.phase = 'backward';
    } else {
        state.current = state.players[currentIndex + 1];
    }
    logLine(state.current + " darf setzen");
}

function backwardPlaced(player, args) {
    
    assert(player, 'backward');
    placeInitial(player, args);
    logLine(state.current + " hat seine zweite Siedlung platziert");
    
    const currentIndex = state.players.indexOf(state.current);
    if (currentIndex == 0) {
        state.phase = 'game';
        roll();
    } else {
        state.current = state.players[currentIndex - 1];
        logLine(state.current + " darf setzen");
    }
}
    
function placeInitial(player, args) {
    
    const [nodeId, edgeId] = args;
    placeTown(player, nodeId);
    placeRoad(player, edgeId);
    
    if (player == state.me) {
        for (const tileId of state.board[nodeId].tiles) {
            const resource = state.board[tileId].res;
            if (resource != S) {
                state.resources[resource] += 1;
            }
        }
    }
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
    
    var blockedNodeIds = [nodeId];
    var blockedEdgeIds = [];
    if (player == state.me) {
        state.townIds.push(nodeId);
    } else {
        for (const edgeId of cell.edges) {
            blockedEdgeIds.push(edgeId);
            for (const nextNodeId of state.board[edgeId].nodes) {
                blockedNodeIds.push(nextNodeId);
                for (const nextEdgeId of state.board[nextNodeId].edges) {
                    blockedEdgeIds.push(nextEdgeId);
                }
            }
        }
    }
    
    state.freeNodeIds = state.freeNodeIds.filter((i) => !blockedNodeIds.includes(i));
    state.freeEdgeIds = state.freeEdgeIds.filter((i) => !blockedEdgeIds.includes(i));
}

function upgradeTown(player, nodeId) {
    
    if (player == state.me) {
        state.townIds = state.townIds.filter((i) => i != nodeId);
        state.cityIds.push(nodeId);
    }
    
    state.board[nodeId].city = true;
}

function roadBought(player, args) {
    
    assert(player, 'game');
    
    const edgeId = args[0];
    
    if (player == state.me) {
        if (freeRoads > 0) {
            freeRoads -= 1;
        } else {
            state.resources[H] -= 1;
            state.resources[L] -= 1;
        }
    }
    
    placeRoad(player, edgeId);
    
    logLine(state.current + " baut eine Strasse");
}

function townBought(player, args) {
    
    assert(player, 'game');
    
    const nodeId = args[0];
    
    if (player == state.me) {
        state.resources[H] -= 1;
        state.resources[L] -= 1;
        state.resources[G] -= 1;
        state.resources[W] -= 1;
    }    
    
    placeTown(player, nodeId);
    
    logLine(state.current + " baut eine Siedlung");
}

function cityBought(player, args) {
    
    assert(player, 'game');
    
    const nodeId = args[0];
    
    if (player == state.me) {
        state.resources[G] -= 2;
        state.resources[E] -= 3;
    }    
    
    upgradeTown(player, nodeId);
    
    logLine(state.current + " baut eine Siedlung zur Stadt aus");
    
    updateActions();
    updateUI();
}

function cardBought(player, args) {
    
    assert(player, 'game');
    
    
    const card = state.stack.shift();
    
    if (player == state.me) {
        state.resources[G] -= 1;
        state.resources[W] -= 1;
        state.resources[E] -= 1;
        
        if (victoryCards.includes(card)) {
            state.vicotryCards.push(card);
        } else {
            const action = "playCard('" + card + "')";
            state.cards.push({title: card, action});
        }
    }

    logLine(state.current + " kauft eine Entwicklungskarte");
}

function cardPlayed(player, args) {
    
    assert(player, 'game');
    
    const card = args[0];
    
    if (card == RI) {
        state.playedKnights[player] += 1;
        state.phase = 'bandit';
        logLine(player + " spielt eine Ritter-Karte und darf den Räuber bewegen");
    } else if (card == SB) {
        logLine(player + " spielt Strassenbau und erhält 2 kostenlose Strassen");
        if (player == state.me) {
            freeRoads += 2;
        }
    } else if (card == MO) {
        logLine(player + " spielt Monopol und Ernie muss schwitzen");
    } else if (card == ER) {
        logLine(player + " spielt Erfindung und teilt Ernie seine Wünsche mit");
    }
}

function resourcesTransferred(player, args) {
    
    const [sender, resources] = args;
    
    if (sender == state.me) {
        for (const [resource, count] of Object.entries(resources)) {
            state.resources[resource] -= count;
        }
    } else if (player == state.me) {
        for (const [resource, count] of Object.entries(resources)) {
            state.resources[resource] += count;
        }
    }
    
    if (sender) {
        logLine(player + " hat von " + sender + " Rohstoffe erhalten");
    } else {
        logLine(player + " hat von Rohstoffe erhalten");
    }
}

function resourcesDropped(player, args) {
    
    const resources = args[0];
    
    if (player == state.me) {
        for (const [resource, count] of Object.entries(resources)) {
            state.resources[resource] += count;
        }
    }
    
    logLine(player + " hat Rohstoffe abgeworfen");
}

function turnEnded(player, args) {
    
    assert(player, 'game');
    
    logLine(state.current + " beendet seinen Zug");
    
    const currentIndex = state.players.indexOf(state.current);
    const nextIndex = (currentIndex + 1) % state.players.length;
    state.current = state.players[nextIndex];
    
    roll();
}
    
    
function roll() {
    const roll = dice(6) + dice(6);
    logLine(state.current + " würfelt eine " + roll.toString());
    
    if (roll == 7) {
        logLine(state.current + " darf den Räuber bewegen");
        state.phase = 'bandit';
    } else {
        for (const tileId of allTileIds) {
            const tileCell = state.board[tileId];
            if (tileCell.roll == roll) {
                for (const nodeId of tileCell.nodes) {
                    const townCell = state.board[nodeId];
                    if (townCell.player) {
                        logLine(townCell.player + " erhält " + tileCell.res);
                        if (townCell.player == state.me) {
                            state.resources[tileCell.res] += townCell.city ? 2 : 1;
                        }
                    }
                }
            }
        }
    }
    
    logLine(state.current + " ist am Zug");
}
    
function banditMoved(player, args) {
    
    assert(player, 'bandit');
    
    const [tileId, targetPlayer] = args;
    
    for (const otherTileId of allTileIds) {
        state.board[otherTileId].bandit = false;
    }
    state.board[tileId].bandit = true;
    
    var total = 0;
    var maxCount = 0;
    var maxResource = null;
    
    for (const [resource, count] of Object.entries(state.resources)) {
        total += count;
        if (count > maxCount) {
            maxResource = resource;
            maxCount = count;
        }
    }
    
    if (targetPlayer == state.me && maxResource) {
        // TODO select random resources
        transferResources(player, {maxResource: 1});
        total -= 1;
    }
    
    if (total > 7) {
        // TODO select resources and drop
        // dropResources(player, {});
        logLine(state.current + " hat zu viele Rohstoffe und schreibt Ernie welche er abwerfen wird");
    }
    
    state.phase = 'game';
}

function assert(player, phase) {
    
    if (state.current != player || state.phase != phase) {
        window.alert("Ungültiger Zug von " + player + ". Spiel abgebrochen.");
    }
}

function updateActions() {
    
    for (const cell of Object.values(state.board)) {
        delete cell.action;
    }
    
    if (state.current != state.me) {
        return;
    }
    
    if (state.phase == 'game') {
        
        const canRoad = freeRoads > 0 || (state.resources[H] > 1 && state.resources[L] > 1);
        const canTown = canRoad && state.resources[G] > 1 && state.resources[W] > 1;
        const canCity = state.resources[G] > 2 && state.resources[E] > 3;
            
        for (const edgeId of state.roadIds) {
            for (const nodeId of state.board[edgeId].nodes) {
                if (canTown && state.freeNodeIds.includes(nextEdgeId)) {
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
        
    } else if (state.phase == 'game') {
        
        for (const tileId in allTileIds) {
            if (state.board[tileId].bandit) {
                continue;
            }
            state.board[tileId].action = "selectTile('" + tileId + "')";
        }
        
    } else {
        
        // placement
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

function selectTown(nodeId) {
    selectedTownId = nodeId;
    state.board[nodeId].player = state.me;
    updateActions();
    updateUI();
}

function selectRoad(edgeId) {
    const nodeId = selectedTownId;
    selectedTownId = null;
    commitAction(['place-' + state.phase, state.me, nodeId, edgeId]);
}

function selectTile(tileId) {
    selectedTileId = tileId;
    // TODO choose targetPlayer, then call moveBandit
}

function moveBandit(targetPlayer) {
    const tileId = selectedTileId;
    commitAction(['move-bandit', state.me, tileId, targetPlayer]);
}

function buyRoad(edgeId) {
    commitAction(['buy-road', state.me, edgeId]);
}

function buyTown(nodeId) {
    commitAction(['buy-town', state.me, nodeId]);
}

function buyCity(nodeId) {
    commitAction(['buy-city', state.me, nodeId]);
}

function buyCard() {
    commitAction(['buy-card', state.me]);
}

function playCard(card) {
    commitAction(['play-card', state.me, card]);
}
        
function transferResources(recipient, resources) {
    commitAction(['transfer-res', recipient, state.me, resources]);
}

function dropResources(resources) {
    commitAction(['drop-res', state.me, resources]);
}

function trade() {
    window.alert("Handeln funktioniert aktuell leider nur per Spracheingabe.");
}

function endTurn() {
    commitAction(['end-turn', state.me]);
}

function dice(sides) {
    return Math.floor((sides + 1) * rng())
}
