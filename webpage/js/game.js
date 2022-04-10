const log = document.getElementById("log");

H = "Holz";
L = "Lehm";
G = "Getreide";
W = "Wolle";
E = "Erz";
X = "Wüste";


const playerColors = [
    '1': '#E33E09',
    '2': '#1C79D5',
    '3': '#FBCD19',
    '4': '#8A58E8',
    '5': '#EB7EC5'
];

const victoryCards = [
    "Bibliothek", "Marktplatz", "Rathaus", "Kirche", "Universität"
];

const actionCards = [
    "Monopol", "Strassenbau", "Erfindung",
];

const knightCard = "Ritter";


var actionsRef = null;
var rng = null;

var players = {};
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
var playerIdSequence = {};
var firstPlayerId = null;
var currentPlayerId = null;
var ownPlayerId = null;
var phase = null;
var longestRoad = 4;
// on buy-road, trace extended road on all possible paths, compare if longer
var longestRoadPlayerId = null;
var mostKnights = 2;
// check on playKnight
var mostKnightsPlayerId = null;


function initGame(gameId, playerId) {

    const gameRef = firebase.database().ref('/' + gameId);
    const initialRef = gameRef.child('/initial');
    actionsRef = gameRef.child('/actions');
    
    initialRef.get().then((initialSnap) => {
        const initialData = initialSnap.val();
        initState(initialData, playerId);
        actionsRef.on('child_added', (actionSnap, prevId) => {
            const action = actionSnap.val();
            dispatchAction(action);
        });
    });
}

function initState(data, playerId) {
    
    players = data.players;
    ownPlayerId = playerId;
    firstPlayerId = data.firstId;
    currentPlayerId = data.firstId;
    playerIdSequence = data.sequence;
    phase = 'forward';
    
    rng = createRNG(data.seed);
    
    var allCards = victoryCards + actionCards + actionCards;
    for (var i = 0; i < 14; i += 1) {
        allCards.push(knightCard);
    }
    
    stack = stackCards.map(v => ({ v, r: rng() }))
        .sort((a, b) => a.r - b.r).map((d) => d.v)
    
    var tiles = [];
    var rolls = [];
    var colOffset = null;
    
    for (var row = 0; row < 11; row += 1) {
        
        if (row % 2 == 1) { // tile row
            const rowIndex = (row - 1) / 2
            tiles = data.tiles[rowIndex]
            rolls = data.rolls[rowIndex]
            colOffset = (1 + Math.abs(rowIndex - 2)) * 2;
        } else {
            colOffset = 21;
        }
        
        var cells = [];
        for (var col = 0; col < 21; col += 1) {
            var cell = {};
            const relCol = col - colOffset;
            if (relCol > 0 && relCol % 4 == 0) {
                const colIndex = relCol / 4;
                cell.tile = tiles[colIndex];
                cell.roll = rolls[colIndex];
                cell.bandit = !!cell.roll;
            }
            cells.push({});
        }
        board.push(cells);
    }

    board[0][5]['port'] = '*';
    board[0][5]['face'] = 'NW'
    board[0][11]['port'] = W;
    board[0][11]['face'] = 'NE'
    board[2][17]['port'] = '*';
    board[2][17]['face'] = 'NE'
    board[3][2]['port'] = E;
    board[3][2]['face'] = 'W'
    board[5][20]['port'] = '*';
    board[5][20]['face'] = 'E'
    board[7][2]['port'] = G;
    board[7][2]['face'] = 'W'
    board[8][17]['port'] = L;
    board[8][17]['face'] = 'SE'
    board[10][5]['port'] = '*';
    board[10][5]['face'] = 'SW'
    board[10][11]['port'] = H;
    board[10][11]['face'] = 'SE'
    
    initLog();
    updateBoard(board);
    
    updateStats(stats);
}

function createRNG(seed) {
    
    return function() {
      var t = seed += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}

function initLog() {
    
    var playersLine = "Spieler: ";
    var fistLine;
    
    for (const playerId of Object.keys(players)) {
        
        const tag = createPlayerTag(playerId);
        
        if (i > 0) {
            playersLine += ", ";
        }
        playersLine += tag;
        
        if (playerId == currentId) {
            fistLine = tag + " beginnt";
        }
    }
    
    logLine(playersLine);
    logLine(fistLine);
}
    
function createPlayerTag(playerId) {
    
    const name = players[playerId];
    const color = playerColors[playerId];
    return '<span style="font-weight: bold; color: ' + color + ';">' + name + '</span>';
}

function logLine(line) {
    
    log.innerHTML += line + "<br>";
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
    const playerId = action[1];
    const args = action.slice(2);
    
    // test args validity in functions!
    actionFunctions[key](args);
}

function commitAction(action) {
       
    const actionId = prevActionId + 1;
    const actionPath = '/' + actionId.toString();
    actionsRef.child(actionPath).set(action);
}

endTurn = () => commitAction(['end-turn']);
placeForward = (tc, rc) => commitAction(['place-forward', tc, rc]);
rollDice = () => commitAction(['roll-dice']);

function turnEnded(playerId, args) {
    
    checkTurn(playerId);
    
    if (phase == 'backward') {
        for (const [prevId, nextId] of Object.entries(playerIdSequence)) {
            if (nextId == currentPlayerId) {
                currentPlayerId = prevId;
                break;
            }
        }
        if (currentPlayerId = firstPlayerId) {
            phase = 'game';
        }
    } else {
        currentPlayerId = playerIdSequence[currentPlayerId];
        if (phase == 'forward' && currentPlayerId = firstPlayerId) {
            phase = 'backward';
        }
    }
    
    const tag = createPlayerTag(currentPlayerId);
    
    if (phase == 'game') {
        logLine(tag + " ist an der Reihe");
    } else {
        logLine(tag + " darf legen");
    }
}

const nodeNeighbors = [[], [, ], [, ]];

function forwardPlaced(playerId, args) {
    
    checkTurn(playerId);
    
    if (phase != 'forward') {
        throw "wrong phase: forward vs " + phase;
    }
    
    board[args[0]][args[1]].town = playerId;
    board[args[2]][args[3]].road = playerId;
    
    for (const delta of nodeNeighbors) {
        const resource = board[args[0]+delta[0]][args[1]+delta[1]].tile;
        if (resource && resource != W) {
            stats.resources.push(resource);
        }
    }
    
    stats.towns += 1;
    
    updateBoard(board);
    updateStats(stats);
    
    const tag = createPlayerTag(currentPlayerId);
    logLine(tag + " hat die erste Siedlung platziert");
}

function dice(sides) {
    
    return Math.floot((sides + 1) * rng())
}
    
function diceRolled(playerId, args) {
    
    checkTurn(playerId);
    
    if (phase != 'game') {
        throw "wrong phase: game vs " + phase;
    }
    
    const roll = dice(6) + dice(6);
    const tag = createPlayerTag(currentPlayerId);
    
    logLine(tag + " würfelt eine " + roll.toString());
}
    
function checkTurn(playerId) {
    
    if (playerId != currentPlayerId) {
        throw "wrong player: " + playerId + " != " + currentPlayerId;
    }
}
    
