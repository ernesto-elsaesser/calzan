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

const neighbors = [[-1, -1], [-1, 0], [-1, 1], [1, -1], [1, 0], [1, 1]];


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
var phase = null;
var longestRoad = 4;
// on buy-road, trace extended road on all possible paths, compare if longer
var mostKnights = 2;
// check on playKnight


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
    phase = 'forward';
    
    rng = createRNG(data.seed);
    
    var allCards = victoryCards.concat(actionCards).concat(actionCards);
    for (var i = 0; i < 14; i += 1) {
        allCards.push(knightCard);
    }
    
    stack = allCards.map(v => ({ v, r: rng() }))
        .sort((a, b) => a.r - b.r).map((d) => d.v);
    
    for (var y = 0; y < 11; y += 1) {
        var cells = [];
        for (var x = 0; x < 21; x += 1) {
            cells.push({x, y});
        }
        board.push(cells);
    }
    
    initEdgeRow(board[0], true);
    
    board[1][6].tile = data.tiles[0][0];
    board[1][6].roll = data.rolls[0][0];
    board[1][10].tile = data.tiles[0][1];
    board[1][10].roll = data.rolls[0][1];
    board[1][14].tile = data.tiles[0][2];
    board[1][14].roll = data.rolls[0][2];
    
    initEdgeRow(board[2], false);
    
    board[3][4].tile = data.tiles[1][0];
    board[3][4].roll = data.rolls[1][0];
    board[3][8].tile = data.tiles[1][1];
    board[3][8].roll = data.rolls[1][1];
    board[3][12].tile = data.tiles[1][2];
    board[3][12].roll = data.rolls[1][2];
    board[3][16].tile = data.tiles[1][3];
    board[3][16].roll = data.rolls[1][3];
    
    initEdgeRow(board[4], true);
    
    board[5][2].tile = data.tiles[2][0];
    board[5][2].roll = data.rolls[2][0];
    board[5][6].tile = data.tiles[2][1];
    board[5][6].roll = data.rolls[2][1];
    board[5][10].tile = W;
    board[5][10].bandit = true
    board[5][14].tile = data.tiles[2][3];
    board[5][14].roll = data.rolls[2][3];
    board[5][18].tile = data.tiles[2][4];
    board[5][18].roll = data.rolls[2][4];
            
    initEdgeRow(board[6], false);
    
    board[7][4].tile = data.tiles[3][0];
    board[7][4].roll = data.rolls[3][0];
    board[7][8].tile = data.tiles[3][1];
    board[7][8].roll = data.rolls[3][1];
    board[7][12].tile = data.tiles[3][2];
    board[7][12].roll = data.rolls[3][2];
    board[7][16].tile = data.tiles[3][3];
    board[7][16].roll = data.rolls[3][3];
    
    initEdgeRow(board[8], true);
    
    board[9][6].tile = data.tiles[4][0];
    board[9][6].roll = data.rolls[4][0];
    board[9][10].tile = data.tiles[4][1];
    board[9][10].roll = data.rolls[4][1];
    board[9][14].tile = data.tiles[4][2];
    board[9][14].roll = data.rolls[4][2];
    
    initEdgeRow(board[10], false);

    board[0][5].port = '*';
    board[0][5].face = 'NW';
    board[0][11].port = W;
    board[0][11].face = 'NE';
    board[2][17].port = '*';
    board[2][17].face = 'NE';
    board[3][2].port = E;
    board[3][2].face = 'W';
    board[5][20].port = '*';
    board[5][20].face = 'E';
    board[7][2].port = G;
    board[7][2].face = 'W';
    board[8][17].port = L;
    board[8][17].face = 'SE';
    board[10][5].port = '*';
    board[10][5].face = 'SW';
    board[10][11].port = H;
    board[10][11].face = 'SE';
    
    updateBoard(board);
    updateStats(stats);
    
    const playersLine = "Spieler: " + players.join(', ');
    logLine(playersLine, players);
    
    const fistLine = players[0] + " darf legen";
    logLine(fistLine, players);
}

function initEdgeRow(cells, even) {
    
    const values = ['down', 'rise', 'up', 'fall'];
    const shift = even ? 0 : 2;
    for (var col = 0; col < 21; col += 1) {
        const key = col % 2 == 0 ? 'node' : 'edge';
        cells[col][key] = values[(col % 4) + shift]; 
    }
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
        'end-turn': turnEnded,
        'roll-dice': diceRolled,
        'move-bandit': banditMoved,
        'place-forward': forwardPlaced,
        'place-backward': backwardPlaced,
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
    };
    
    const key = action[0];
    const player = action[1];
    const args = action.slice(2);
    
    actionFunctions[key](player, args);
}

function commitAction(action) {
       
    const actionId = prevActionId + 1;
    const actionPath = '/' + actionId.toString();
    actionsRef.child(actionPath).set(action);
}

endTurn = () => commitAction(['end-turn']);
placeForward = (tc, rc) => commitAction(['place-forward', tc.y, tc.x, rc.y, rc.x]);
placeBackward = (tc, rc) => commitAction(['place-backward', tc.y, tc.x, rc.y, rc.x]);
rollDice = () => commitAction(['roll-dice']);

function turnEnded(player, args) {
    
    checkTurn(player);
    
    const currentIndex = players.indexOf(current);
    const step = phase == 'backward' ? -1 : 1;
    const nextIndex = (currentIndex + step) % players.length;
    current = players[nextIndex];
    
    if (current == players[0]) {
        if (phase == 'forward') {
            phase = 'backward';
        } else if (phase == 'backward') {
            phase = 'game';
        }
    }
    
    if (phase == 'game') {
        logLine(current + " ist an der Reihe", players);
    } else {
        logLine(current + " darf setzen", players);
    }
}

function forwardPlaced(player, args) {
    
    checkTurn(player);
    if (phase != 'forward') {
        throw "wrong phase: forward vs " + phase;
    }
    place(player, args);
    logLine(current + " hat seine erste Siedlung platziert", players);
}

function backwardPlaced(player, args) {
    
    checkTurn(player);
    if (phase != 'backward') {
        throw "wrong phase: backward vs " + phase;
    }
    place(player, args);
    logLine(current + " hat seine zweite Siedlung platziert", players);
}
    
function place(player, args) {
    
    board[args[0]][args[1]].town = player;
    board[args[2]][args[3]].road = player;
    
    if (player == current) {
        for (const [dy, dx] of neighbors) {
            const neigbor = board[args[0]+dy][args[1]+dx];
            if (neighbor.tile && neighbor.tile != W) {
                stats.resources.push(neighbor.tile);
            }
        }
        stats.towns += 1;
    }
    
    updateBoard(board);
    updateStats(stats);
}

function dice(sides) {
    
    return Math.floot((sides + 1) * rng())
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
                for (const [dy, dx] of neighbors) {
                    const neighbor = board[cell.row+dy][cell.col+dx];
                    if (neighbor.town) {
                        logLine(neighbor.town + " erhält " + cell.tile, players);
                        if (neighbor.town == me) {
                            stats.resources.push(cell.tile);
                            if (neighbor.city) {
                                stats.resources.push(cell.tile);
                            }
                        }
                    }
                }
            }
        }
    }
    
    updateStats(stats);
}
    
function checkTurn(player) {
    
    if (player != current) {
        throw "wrong player: " + player + " != " + current;
    }
}
    
