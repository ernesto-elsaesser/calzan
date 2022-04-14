const H = "Holz";
const L = "Lehm";
const G = "Getreide";
const W = "Wolle";
const E = "Erz";
const S = "Sand";

const resRanks = {
    'Holz': 1,
    'Lehm': 2,
    'Getreide': 3,
    'Wolle': 4,
    'Erz': 5,
};

const allResources = [H, L, G, W, E];

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
    newCards: [],
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
var dropState = null;
var pendingSteal = false;
var activeCard = null;
var inventionResources = null;
var trade4Resource = null;


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
    
    updateState();
    
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
        console.log("invalid action id", prevId);
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
        'modify-res': resourcesModified,
        'send-res': resourcesSent,
        'end-turn': turnEnded,
    };
    
    const player = action[0];
    const key = action[1];
    const args = action.slice(2);
    
    console.log(prevActionId, player, key, args);
    
    actionFunctions[key](player, args);
    
    updateState();
}

function commitAction(action) {
       
    action.unshift(state.me);
    
    const actionId = prevActionId + 1;
    const actionPath = '/' + actionId.toString();
    const actionRef = actionsRef.child(actionPath);
    
    actionRef.get().then((snap) => {
        // page reload triggers re-commit of old actions
        if (!snap.exists()) {
            actionRef.set(action);
        }
    });
}

function forwardPlaced(player, args) {
    
    placeInitial(player, args);
    logLine(state.current + " setzt seine erste Siedlung");
}

function backwardPlaced(player, args) {
    
    placeInitial(player, args);
    logLine(state.current + " setzt seine zweite Siedlung");
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
        }
    }
    
    state.freeNodeIds = state.freeNodeIds.filter((i) => !blockedNodeIds.includes(i));
    state.freeEdgeIds = state.freeEdgeIds.filter((i) => !blockedEdgeIds.includes(i));
}

function roadBought(player, args) {
    
    const edgeId = args[0];
    placeRoad(player, edgeId);
    logLine(state.current + " baut eine Strasse");
}

function townBought(player, args) {
    
    const nodeId = args[0];
    placeTown(player, nodeId);
    logLine(state.current + " baut eine Siedlung");
}

function cityBought(player, args) {
    
    const nodeId = args[0];
    state.board[nodeId].city = true;
    if (player == state.me) {
        state.townIds = state.townIds.filter((i) => i != nodeId);
        state.cityIds.push(nodeId);
    }
    logLine(state.current + " baut eine Siedlung zur Stadt aus");
}

function cardBought(player, args) {
    
    const card = state.stack.shift();
    if (player == state.me) {
        if (victoryCards.includes(card)) {
            state.vicotryCards.push(card);
        } else {
            state.newCards.push(card);
        }
    }
    logLine(state.current + " kauft eine Entwicklungskarte");
}

function cardPlayed(player, args) {
    
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
    } else if (card == MP) {
        const resource = args[1];
        logLine(player + " spielt Monopol und erhält: " + resource);
        if (player != state.me) {
            const losses = state.resources.filter((r) => r == resource);
            if (losses.length > 0) {
                sendResources(player, losses);
            }
        }
    } else if (card == ER) {
        logLine(player + " spielt Erfindung und erhält Rohstoffe");
    }
}

function resourcesModified(player, args) {
    
    const [cause, gains, losses] = args;
    
    if (player == state.me) {
        if (losses) {
            remove(losses);
            logLine(player + " zahlt: " + format(losses));
            if (dropState) {
                dropState = null;
                if (pendingSteal) {
                    performSteal();
                }
            }
        }
        if (gains) {
            add(gains);
            logLine(player + " erhält: " + format(gains));
        }
    }
}

function resourcesSent(player, args) {
    
    const [recipient, resources] = args;
    if (player == state.me) {
        remove(resources);
        logLine(player + " zahlt an " + recipient + ": " + format(resources));
    } else if (recipient == state.me) {
        add(resources);
        logLine(recipient + " erhält von " + player + ": " + format(resources));
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
            if (state.current == state.me) {
                rollDice();
            }
        } else {
            state.current = state.players[currentIndex - 1];
            logLine(state.current + " darf setzen");
        }
    } else if (state.phase == 'game') {
        const nextIndex = (currentIndex + 1) % state.players.length;
        state.current = state.players[nextIndex];
        
        logLine(state.current + " ist am Zug");
        
        if (state.current == state.me) {
            state.cards = state.cards.concat(state.newCards);
            state.newCards = [];
            rollDice();
        }
    }
}
    
function diceRolled(player, args) {
    
    const roll = 2 + Math.floor(6 * rng()) + Math.floor(6 * rng())
    
    logLine(player + " würfelt eine " + roll.toString());
    
    if (roll == 7) {
        logLine(state.current + " darf den Räuber bewegen");
        state.phase = 'bandit';
        const count = state.resources.length;
        if (count > 7) {
            const target = Math.ceil(count / 2);
            dropState = {target};
            for (const resource of allResources) {
                dropState[resource] = 0;
            }
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
            modifyResources("Erträge", yields, null);
        }
    }
}
    
function banditMoved(player, args) {
    
    const [tileId, targetPlayer] = args;
    
    for (const otherTileId of allTileIds) {
        state.board[otherTileId].bandit = false;
    }
    state.board[tileId].bandit = true;
    
    const resource = state.board[tileId].res;
    if (targetPlayer) {
        logLine(state.current + " setzt den Räuber auf " + resource + " und beraubt " + targetPlayer);
    } else {
        logLine(state.current + " setzt den Räuber auf " + resource);
    }
    
    if (targetPlayer == state.me) {
        if (dropState) {
            pendingSteal = true;
        } else {
            performSteal();
        }
    } else {
        rng(); // keep RNG in sync
    }
    
    state.phase = 'game';
}

function updateState() {
    
    state.context = null;
    state.actions = {};
    for (const cell of Object.values(state.board)) {
        delete cell.action;
    }
    
    if (dropState) {
        state.context = "Werfe " + dropState.target + " Rohstoffe ab";
        var dropSum = 0;
        for (const resource of allResources) {
            const dropCount = dropState[resource];
            state.actions[dropCount + " x " + resource] = "addDrop('" + resource + "')";
            dropSum += dropCount;
        }
        state.actions["Abwerfen"] = "submitDrop()";
        state.actions["Zurücksetzen"] = "resetDrop()";
    } else if (state.current == state.me) {
        
        if (selectedBanditTileId) {
            state.context = "Wen berauben?";
            for (const nodeId of state.board[selectedBanditTileId].nodes) {
                const player = state.board[nodeId].player;
                if (player && player != state.me) {
                    state.actions[player] = "moveBandit('" + player + "')";
                }
            }
        } else if (trade4Resource) {
            state.context = "Tauschen gegen";
            for (const resource of allResources) {
                if (resource != trade4Resource) {
                    state.actions[resource] = "trade4('" + resource + "')";
                }
            }
            state.actions["(Abbrechen)"] = "abortTrade()";
        } else if (activeCard == ER) {
            const count = inventionResources.length + 1;
            state.context = "Wähle deinen " + count + ". Rohstoff";
            for (const resource of allResources) {
                state.actions[resource] = "selectInvention('" + resource + "')";
            }
        } else if (activeCard == MP) {
            state.context = "Monopol auf welchen Rohstoff?";
            for (const resource of allResources) {
                state.actions[resource] = "monoploize('" + resource + "')";
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
            
            for (const resource of allResources) {
                if (stats[resource] > 3) {
                    state.actions["4 " + resource + " umtauschen"] = "initTrade4('" + resource + "')";
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
    updateState();
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
    if (state.phase == 'backward') {
        modifyResources("Start-Rohstoffe", yields, null);
    }
    endTurn();
}

function selectTile(tileId) {
    
    var options = [];
    for (const nodeId of state.board[tileId].nodes) {
        const player = state.board[nodeId].player;
        if (player && player != state.me && !options.includes(player)) {
            options.push(player);
        }
    }
    
    if (options.length == 0) {
        commitAction(['move-bandit', tileId, null]);
    } else if (options.length == 1) {
        commitAction(['move-bandit', tileId, options[0]]);
    } else {
        selectedBanditTileId = tileId;
        // pre-move bandit for UX
        for (const otherTileId of allTileIds) {
            state.board[otherTileId].bandit = false;
        }
        state.board[tileId].bandit = true;
        updateState();
    }
    
}

function moveBandit(targetPlayer) {
    const tileId = selectedBanditTileId;
    selectedBanditTileId = null;
    commitAction(['move-bandit', tileId, targetPlayer]);
}

function performSteal() {
    
    pendingSteal = false;
    
    if (state.resources.length == 0) {
        rng(); // keep RNG in sync
        return;
    }
    
    const randomIndex = Math.floor(state.resources.length * rng())
    const resource = state.resources[randomIndex];
    sendResources(player, [resource]);
}

function activateCard(card) {
    
    if (card == RI) {
        commitAction(['play-card', RI]);
    } else if (card == ER) {
        activeCard = card;
        inventionResources = [];
        updateState();
    } else if (card == MP) {
        activeCard = card;
        updateState();
    } else if (card == SB) {
        commitAction(['play-card', SB]);
        modifyResources(SB, [H, H, L, L], null);
    }
}

function monopolize(resource) {
    activeCard = null;
    commitAction(['play-card', MP, resource]);
}

function selectInvention(resource) {
    inventionResources.push(resource);
    if (inventionResources.length == 1) {
        updateState();
    } else {
        const resources = inventionResources;
        activeCard = null;
        inventionResources = null;
        commitAction(['play-card', ER]);
        modifyResources(ER, resources, null);
    }
}

function rollDice() {
    commitAction(['roll-dice']);
}

function modifyResources(cause, gains, losses) {
    commitAction(['modify-res', cause, gains, losses]);
}

function sendResources(player, resources) {
    commitAction(['send-res', player, resources]);
}

function addDrop(resource) {
    const dropCount = dropState[resource];
    const available = state.resources.filter((r) => r == resource).length;
    if (dropCount < available) {
        dropState[resource] += 1;
        updateState();
    }
}

function resetDrop() {
    for (const resource of allResources) {
        dropState[resource] = 0;
    }
    updateState();
}

function submitDrop() {
        
    var resources = [];
    for (const [key, value] of Object.entries(dropState)) {
        if (key != 'target') {
            for (var i = 0; i < value; i += 1) {
                resources.push(key);
            }
        }
    }
    
    if (resources.length < dropState.target) {
        window.alert("Nicht genügend Rohstoffe ausgewählt!");
        return;
    }
        
    modifyResources("Über 7", null, resources);
}

function buyRoad(edgeId) {
    modifyResources("Strasse", null, [H, L]);
    commitAction(['buy-road', edgeId]);
}

function buyTown(nodeId) {
    modifyResources("Siedlung", null, [H, L, G, W]);
    commitAction(['buy-town', nodeId]);
}

function buyCity(nodeId) {
    modifyResources("Stadt", null, [G, G, E, E, E]);
    commitAction(['buy-city', nodeId]);
}

function buyCard() {
    modifyResources("Entwicklungskarte", null, [G, W, E]);
    commitAction(['buy-card']);
}

function initTrade4(resource) {
    trade4Resource = resource;
    updateState();
}

function abortTrade() {
    trade4Resource = null;
    updateState();
}
    
function trade4(resource) {
    const price = trade4Resource;
    trade4Resource = null;
    modifyResources("Seehandel", [resource], [price, price, price, price]);
}

function endTurn() {
    commitAction(['end-turn']);
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