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

const tiles = [
    [-4, -4], [-4, 0], [-4, -4],
    [-2, -6], [-2, -2], [-2, 2], [-2, 6],
    [0, -8], [0, -4], [0, 0], [0, 4], [0, 8],
    [2, -6], [2, -2], [2, 2], [2, 6],
    [4, -4], [4, 0], [4, 4],
];

const oceans = [
    [-2, -10], //  0 left rising
    [-4,  -8], //  1 left rising
    [-6,  -6], //  2 left up
    [-6,  -2], //  3 up
    [-6,   2], //  4 up
    [-6,   6], //  5 right up
    [-4,   8], //  6 right falling
    [-2,  10], //  7 right falling
    [ 0,  12], //  8 right
    [ 2,  10], //  9 right rising
    [ 4,   8], // 10 right rising
    [ 6,   6], // 11 right down
    [ 6,  -2], // 12 down
    [ 6,   2], // 13 down
    [ 6,  -6], // 14 left down
    [ 4,  -8], // 15 left falling
    [ 2, -10], // 16 left falling
    [ 0, -12], // 17 left
];

const upNodes = tiles.concat(oceans.slice(9, 17)).map(([y, x]) => [y-1, x]);
const downNodes = tiles.concat(oceans.slice(0, 8)).map(([y, x]) => [y+1, x]);
const nodes = upNodes.concat(downNodes);

const risingEdges = tiles.concat(oceans.slice(9, 14)).map(([y, x]) => [y-1, x-1]);
const fallingEdges = tiles.concat(oceans.slice(3, 8)).map(([y, x]) => [y+1, x-1]);
const verticalEdges = tiles.concat(oceans.slice(6, 11)).map(([y, x]) => [y, x-2]);
const edges = risingEdges.concat(fallingEdges).concat(verticalEdges);

var actionsRef = null;
var rng = null;

var players = [];
var board = [];
var stats = {
    resources: [],
    towns: 0,
    cities: 0,
    cards: [],
    victoryCards: [],
    longestRoad: false,
    mostKnights: false,
    points: 0,
};

var prevActionId = 0;
var current = null;
var me = null;
var phase = 'forward';
var longestRoad = 4;
// on buy-road, trace extended road on all possible paths, compare if longer
var mostKnights = 2;
// check on playKnight
var townCoord = null;


function initGame(game, player) {

    const gameRef = firebase.database().ref('/' + game);
    const initialRef = gameRef.child('/initial');
    actionsRef = gameRef.child('/actions');
    
    initialRef.get().then((initialSnap) => {
        const initialData = initialSnap.val();
        initState(initialData, player);
        actionsRef.on('child_added', (actionSnap, prevId) => {
            const action = actionSnap.val();
            dispatchAction(action);
        });
    });
}

function initState(data, player) {
    
    players = data.players;
    me = player;
    current = data.players[0];
    
    rng = createRNG(data.seed);
    
    var allCards = victoryCards.concat(actionCards).concat(actionCards);
    for (var i = 0; i < 14; i += 1) {
        allCards.push(knightCard);
    }
    
    stack = allCards.map(v => ({ v, r: rng() }))
        .sort((a, b) => a.r - b.r).map((d) => d.v);
    
    for (var v = -5; v <= 5; v += 1) {
        var cells = [];
        for (var h = -10; h <= 10; h += 1) {
            cells.push({v, h});
        }
        board.push(cells);
    }
    
    for (var tileNum = 0; tileNum < tiles.length; tileNum += 1) {
        const cell = getCell(tiles[tileNum]);
        if (cell.v == 0 && cell.h == 0) {
            cell.tile = W;
            cell.bandit = true;
        } else {
            cell.tile = data.tiles[tileNum];
            cell.roll = data.rolls[tileNum];
        }
    }
    
    upNodes.forEach((c) => getCell(c).node = 'up');
    downNodes.forEach((c) => getCell(c).node = 'down');
    verticalEdges.forEach((c) => getCell(c).edge = 'vert');
    risingEdges.forEach((c) => getCell(c).edge = 'rise');
    fallingEdges.forEach((c) => getCell(c).edge = 'fall');

    /* TODO configurable?
    board[-5][-5].port = '*';
    board[-5][-5].face = 'NW';
    board[-5][1].port = W;
    board[-5][1].face = 'NE';
    board[-3][7].port = '*';
    board[-3][7].face = 'NE';
    board[-2][-8].port = E;
    board[-2][-8].face = 'W';
    board[0][10].port = '*';
    board[0][10].face = 'E';
    board[2][-8].port = G;
    board[2][-8].face = 'W';
    board[3][7].port = L;
    board[3][7].face = 'SE';
    board[5][-5].port = '*';
    board[5][-5].face = 'SW';
    board[5][1].port = H;
    board[5][1].face = 'SE';
    */
    
    updateUI();
    
    const playersLine = "Spieler: " + players.join(', ');
    logLine(playersLine, players);
    
    const fistLine = players[0] + " darf legen";
    logLine(fistLine, players);
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
        'offer-trade': tradeOffered,
        'accept-trade': tradeAccepted,
        'play-knight': knightPlayed,
        'play-monopoly': monopolyPlayed,
        'play-invention': inventionPlayed,
        'play-roadworks': roadworksPlayed,
        'end-turn': turnEnded,
    };
    
    const player = action[0];
    const key = action[1];
    const args = action.slice(2);
    
    actionFunctions[key](player, args);
}

function commitAction(action) {
       
    const actionId = prevActionId + 1;
    const actionPath = '/' + actionId.toString();
    action.unshift(me);
    actionsRef.child(actionPath).set(action);
}

endTurn = () => commitAction(['end-turn']);
place = (tv, th, rv, rh) => commitAction(['place-' + phase, tv, th, rv, rh]);
rollDice = () => commitAction(['roll-dice']);

function placeTown(v, h) {
    
    townCoord = [v, h];
    updateUI();
}

function forwardPlaced(player, args) {
    
    checkTurn(player);
    if (phase != 'forward') {
        throw "wrong phase: forward vs " + phase;
    }
    placeTokes(player, args);
    logLine(current + " hat seine erste Siedlung platziert", players);
    
    const currentIndex = players.indexOf(current);
    if (currentIndex == players.length - 1) {
        phase = 'backward';
    } else {
        current = players[currentIndex + 1];
    }
    logLine(current + " darf setzen", players);
    
    updateUI();
}

function backwardPlaced(player, args) {
    
    checkTurn(player);
    if (phase != 'backward') {
        throw "wrong phase: backward vs " + phase;
    }
    placeTokes(player, args);
    logLine(current + " hat seine zweite Siedlung platziert", players);
    
    const currentIndex = players.indexOf(current);
    if (currentIndex == 0) {
        phase = 'game';
    } else {
        current = players[currentIndex - 1];
        logLine(current + " darf setzen", players);
    }
    
    updateUI();
}
    
function placeTokes(player, args) {
    
    const townCell = getCell(args.slice(0, 2));
    cell.town = player;
    const roadCell = getCell(args.slice(2));
    roadCell.road = player;
    
    if (player == current) {
        stats.towns += 1;
        getNeighbors(townCell).forEach((neighbor) => {
            if (neighbor.tile && neighbor.tile != W) {
                stats.resources.push(neighbor.tile);
            }
        });
    }
}

function diceRolled(player, args) {
    
    checkTurn(player);
    
    if (phase != 'game') {
        throw "wrong phase: game vs " + phase;
    }
    
    const roll = dice(6) + dice(6);
    logLine(current + " würfelt eine " + roll.toString(), players);
    
    for (const cells of board) {
        for (const cell of cells) {
            if (cell.roll == roll) {
                getNeighbors(cell).forEach((neighbor) => {
                    if (neighbor.town) {
                        logLine(neighbor.town + " erhält " + cell.tile, players);
                        if (neighbor.town == me) {
                            stats.resources.push(cell.tile);
                            if (neighbor.city) {
                                stats.resources.push(cell.tile);
                            }
                        }
                    }
                });
            }
        }
    }
    
    updateUI();
}
    
function turnEnded(player, args) {
    
    checkTurn(player);
    
    if (phase != 'game') {
        throw "wrong phase: game vs " + phase;
    }
    
    const currentIndex = players.indexOf(current);
    const nextIndex = (currentIndex + step) % players.length;
    current = players[nextIndex];
    
    logLine(current + " ist an der Reihe", players);
    
    updateUI();
}

function checkTurn(player) {
    
    if (player != current) {
        throw "wrong player: " + player + " != " + current;
    }
}
    
function updateUI() {
    
    updateButtons();
    updateBoard(board);
    updateStats(stats);
}

function updateButtons() {
    
    for (const cells of board) {
        for (const cell of cells) {
            
            delete cell.action;
            
            if (current != me) {
                continue;
            }
            
            if (phase == 'game') {
                // TODO
            } else {
                if (townCoord) {
                    const [ty, tx] = townCoord;
                    if (cell.edge) {
                        for (const [dy, dx] of neighbors) {
                            if (cell.y + dx == ty && cell.x + dx == tx) {
                                const args = [ty, tx, cell.y, cell.x].join(',');
                                cell.action = "place(" + args + ")";
                            }
                        }
                    }
                } else {
                    if (cell.node) {
                        cell.action = "placeTown(" + cell.v + "," + cell.h + ")";
                    }
                }
            }
            
        }
    }
    
}

function getCell(coord) {
    const [v, h] = coord;
    return board[v+5][h+10];
}

function getNeighbors(cell) {
    return [
        getCell([cell.v-1, cell.h-1]),
        getCell([cell.v-1, cell.h]),
        getCell([cell.v-1, cell.h+1]),
        getCell([cell.v+1, cell.h-1]),
        getCell([cell.v+1, cell.h]),
        getCell([cell.v+1, cell.h+1]),
    ];
}


function dice(sides) {
    
    return Math.floot((sides + 1) * rng())
}
    