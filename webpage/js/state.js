
var state = {
    players: [],
    board: {},
    rng: null,
    stack: [],
    me: null,
    current: null,
    phase: 'forward',
    boardMode: null,
    choice: null,
    resources: [],
    playableCards: [],
    victoryCards: [],
    // per player
    longestRoads: {},
    playedKnights: {},
};

function initState(data, player) {
    
    state.rng = createRNG(data.seed);
    
    state.board = data.board;
    state.players = data.players;
    state.me = player;
    state.current = data.players[0];
    
    for (const player of data.players) {
        state.longestRoads[player] = 0;
        state.playedKnights[player] = 0;
    }
    
    state.stack = allCards.map(v => ({ v, r: state.rng() }))
        .sort((a, b) => a.r - b.r).map((d) => d.v);
}

function createRNG(seed) {
    
    return function() {
      var t = seed += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}

function advanceTurn() {
    const currentIndex = state.players.indexOf(state.current);
    
    if (state.phase == 'forward') {
        if (currentIndex == state.players.length - 1) {
            state.phase = 'backward';
        } else {
            state.current = state.players[currentIndex + 1];
        }
    } else if (state.phase == 'backward') {
        if (currentIndex == 0) {
            state.phase = 'game';
        } else {
            state.current = state.players[currentIndex - 1];
        }
    } else if (state.phase == 'game') {
        const nextIndex = (currentIndex + 1) % state.players.length;
        state.current = state.players[nextIndex];
        
        if (state.current == state.me) {
            // cards can be played one round after buy
            for (const playableCard of state.playableCards) {
                playableCard.usable = true;
            }
        }
    }
}

function increaseResources(player, resources) {
    if (player == state.me) {
        state.resources = state.resources.concat(resources).sort((a, b) => resRanks[a] - resRanks[b]);
    }
}

function decreaseResources(player, resources) {
    if (player == state.me) {
        for (const resource of resources) {
            const resIndex = state.resources.indexOf(resource);
            state.resources.splice(resIndex, 1);
        }
    }
}

function claimRoad(player, edgeId) {
    
    state.board[edgeId].player = player;
    // TODO update state.longestRoads[player]
}

function claimTown(player, nodeId) {
    
    state.board[nodeId].player = player;
}

function upgradeTown(player, nodeId) {
    
    state.board[nodeId].city = true;
}

function moveBandit(tileId) {
    
    for (const otherTileId of allTileIds) {
        state.board[otherTileId].bandit = false;
    }
    state.board[tileId].bandit = true;
}

function drawCard(player) {
    
    const cardName = state.stack.shift();
    
    if (player == state.me) {
        if (victoryCards.includes(cardName)) {
            state.victoryCards.push(cardName);
        } else {
            var playableCard = {name: cardName, usable: false};
            state.playableCards.push(playableCard);
        }
    }
    
    return cardName;
}

function consumeCard(player, cardName) {
    
    if (player == state.me) {
        var cardIndex;
        for (var i = 0; i <= state.playableCards.length; i += 1) {
            
            if (state.playableCards[i].name == cardName) {
                cardIndex = i;
                break;
            }
        }
        state.playableCards.splice(cardIndex, 1);
    }
    
    if (cardName == RI) {
        state.playedKnights[player] += 1;
    }
}

function setBoardMode(mode) {
    
    state.boardMode = mode;
}

function startChoice(choice) {
    
    state.choice = choice;
}

function updateChoice(key, value) {
    
    state.choice[key] = value;
}
    
function clearChoice(choice) {
    
    state.choice = null;
}

function sort(resources) {
    return resources.sort((a, b) => resRanks[a] - resRanks[b])
}
