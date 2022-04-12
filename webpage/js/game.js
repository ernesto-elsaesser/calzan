const H = "Holz";
const L = "Lehm";
const G = "Getreide";
const W = "Wolle";
const E = "Erz";
const X = "Wüste";

const victoryCards = [
    "Bibliothek", "Marktplatz", "Rathaus", "Kirche", "Universität"
];

const actionCards = [
    "Monopol", "Strassenbau", "Erfindung",
];

const knightCard = "Ritter";

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
    resources: [],
    towns: 0,
    cities: 0,
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
    
    var allCards = victoryCards.concat(actionCards).concat(actionCards);
    for (var i = 0; i < 14; i += 1) {
        allCards.push(knightCard);
    }
    
    state.stack = allCards.map(v => ({ v, r: rng() }))
        .sort((a, b) => a.r - b.r).map((d) => d.v);
    
    updateActions();
    updateUI();
    
    logLine("Spieler: " + state.players.join(', '));
    logLine(state.players[0] + " darf setzen";);
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
        /*
        'move-bandit': banditMoved,
        'buy-town': townBought,
        'buy-road': roadBought,
        'buy-city': cityBought,
        'buy-card': cardBought,
        'offer-trade': tradeOffered,
        'accept-trade': tradeAccepted,
        'play-knight': knightPlayed,
        'play-monopoly': monopolyPlayed,
        'play-invention': inventionPlayed,
        'play-roadworks': roadworksPlayed,
        */
        'end-turn': turnEnded,
    };
    
    const player = action[0];
    const key = action[1];
    const args = action.slice(2);
    
    actionFunctions[key](player, args);
    
    prevActionId += 1;
}

function commitAction(action) {
       
    const actionId = prevActionId + 1;
    const actionPath = '/' + actionId.toString();
    action.unshift(me);
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
    
    updateActions();
    updateUI();
}

function backwardPlaced(player, args) {
    
    assert(player, 'backward');
    placeInitial(player, args);
    logLine(state.current + " hat seine zweite Siedlung platziert");
    
    const currentIndex = state.players.indexOf(state.current);
    if (currentIndex == 0) {
        state.phase = 'game';
    } else {
        state.current = state.players[currentIndex - 1];
        logLine(state.current + " darf setzen");
    }
    
    updateActions();
    updateUI();
}
    
function placeInitial(player, args) {
    
    const [nodeId, edgeId] = args;
    placeTown(player, nodeId);
    placeRoad(player, edgeId);
    
    if (player == state.me) {
        for (const tileId of state.board[nodeId].tiles) {
            const resource = state.board[tileId].resource;
            if (resource != W) {
                state.resources.push(resource);
            }
        });
    }
}

function placeTown(player, nodeId) {
    
    const cell = state.board[nodeId];
    cell.town = player;
    
    state.freeNodeIds.remove(nodeId);
    if (player == state.me) {
        state.towns += 1;
    } else {
        for (const edgeId of cell.edges) {
            state.freeEdgeIds.remove(edgeId);
            for (const nextNodeId of state.board[edgeId].nodes) {
                state.freeNodeIds.remove(nextNodeId);
                for (const nextEdgeId of state.board[nextNodeId].edges) {
                    state.freeEdgeIds.remove(nextEdgeId);
                }
            }
        });
    }
}

function placeRoad(player, edgeId) {
    
    const cell = state.board[edgeId];
    cell.road = player;
    
    state.freeEdgeIds.remove(edgeId);
    
    // TODO update state.longestRoads[player]
}

function turnEnded(player, args) {
    
    assert(player, 'game');
    
    const currentIndex = state.players.indexOf(state.current);
    const nextIndex = (currentIndex + 1) % state.players.length;
    state.current = state.players[nextIndex];
    
    const roll = dice(6) + dice(6);
    logLine(state.current + " würfelt eine " + roll.toString());
    
    for (const tileId of allTileIds) {
        const tileCell = state.board[tileId];
        if (tileCell.roll == roll) {
            for (const nodeId of tileCell.nodes) {
                const townCell = state.board[nodeId];
                if (townCell.player) {
                    logLine(townCell.player + " erhält " + tileCell.resource);
                    if (townCell.player == state.me) {
                        state.resources.push(tileCell.resource);
                        if (townCell.city) {
                            state.resources.push(tileCell.resource);
                        }
                    }
                }
                
            }
        }
    }
    
    updateActions();
    updateUI();
}

function assert(player, phase) {
    
    if (state.current != player || state.phase != phase) {
        abort(player);
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
        // TODO
    } else {
        
        // placement
        if (selectedTownId) {
            for (const edgeId of state.board[selectedTownId].edges) {
                state.board[edgeId].action = "selectRoad(" + edgeId + ")";
            }
        } else {
            for (const nodeId of state.freeNodeIds) {
                state.board[nodeId].action = "selectTown(" + nodeId + ")";
            }
        }
    }
}

function selectTown(nodeId) {
    selectedTownId = nodeId;
    state.board[nodeId].player = state.me;
    updateControls();
    updateUI();
}

function selectRoad(edgeId) {
    commitAction(['place-' + state.phase, selectedTownId, edgeId]);
    selectedTownId = null;
}

function endTurn() {
    commitAction(['end-turn']);
}

function dice(sides) {
    return Math.floot((sides + 1) * rng())
}

function abort(player) {
    window.alert("Ungültiger Zug von " + player + ". Spiel abgebrochen.");
}
