
var state = {
    players: [],
    board: {},
    rng: null,
    me: null,
    current: null,
    phase: 'forward',
    choice: {},
    resources: [],
    stack: [],
    cards: [],
    playedKnights: 0,
    longestRoad: 4,
    longestRoadPlayer: null,
    largestForce: 2,
    largestForcePlayer: null,
};

function initState(data, player) {
    
    state.seed = data.seed;
    state.board = data.board;
    state.players = data.players;
    state.longestRoads = data.players.map((p) => 0);
    state.me = player;
    state.current = data.players[0];
    state.resources = noResources();
    state.stack = cardIndices.map((i) => i);
}

function nextRandom() {
    
    state.seed += 0x6D2B79F5;
    var t = state.seed;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
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
        state.cards.forEach((c) => c.locked = false);
    }
}

function updateResources(player, resources) {
    
    if (player == state.me) {
        for (const index of resIndices) {
            state.resources[index] += resources[index];
        }
    }
}

function claimTown(player, nodeId) {
    
    state.board[nodeId].player = player;
}

function claimRoad(player, edgeId) {
    
    state.board[edgeId].player = player;
}

function computeRoadLength(player) {
    
    const roads = getRoads(player);
    return 0; // TODO implement!
}

function upgradeTown(player, nodeId) {
    
    state.board[nodeId].city = true;
}

function moveBandit(tileId) {
    
    for (const otherTileId of landTileIds) {
        state.board[otherTileId].bandit = false;
    }
    state.board[tileId].bandit = true;
}

function takeCard(player, cardIndex, listener) {
    
    state.stack = state.stack.filter((i) => i != cardIndex);
    
    if (player == state.me) {
        const card = {
            index: cardIndex,
            locked: true,
            listener,
        };
        state.cards.push(card);
    }
}

function discardCard(player, cardIndex) {
    
    if (player == state.me) {
        state.cards = state.cards.filter((c) => c.index != cardIndex);
        if (cardIndex >= knightMinIndex) {
            state.playedKnights += 1;
        }
    }
}

function updateLargestForce(player, size) {
    
    state.largestForce = size;
    state.largestForcePlayer = player;
}

function updateLongestRoad(player, length) {
    
    state.longestRoad = length;
    state.longestRoadPlayer = player;
}

function pushChoice(choice) {
    
    choice.parent = state.choice;
    state.choice = choice;
}

function popChoice() {
    
    if (state.choice.parent) {
        state.choice = state.choice.parent;
    } else {
        console.log("INVALID POP");
    }
}

function resetChoice(choice) {
    
    state.choice = {};
}

function countResources(resources) {
    
    return resIndices.reduce((acc, i) => acc + resources[i], 0);
}

function negateResources(resources) {
    
    return resources.map((n) => n == 'R' ? 'R' : -n);
}

function expandResources(resources) {
    
    var expanded = [];
    resIndices.forEach((i) => {
        for (var r = 0; r < resources[i]; r += 1) {
            expanded.push(i);
        }
    });
    return expanded;
}

function getTowns(player) {
    
    return nodeIds.map((i) => state.board[i]).filter((c) => c.player == player);
}

function getRoads(player) {
    
    return edgeIds.map((i) => state.board[i]).filter((c) => c.player == player);
}

function getTradeRates(player) {
    
    const portTowns = getTowns(player).filter((t) => t.rate);
    const specPortTowns = portTowns.filter((t) => t.trade);
    
    const canTrade3 = portTowns.length > specPortTowns.length;
    const rates = noResources().map((n) => canTrade3 ? 3 : 4);
    
    specPortTowns.forEach((t) => rates[t.trade] = 2);
    
    return rates;
}

function getAdjacentTowns(tileId) {
    
    return state.board[tileId].nodes.map((i) => state.board[i]).filter((c) => c.player);
}

function getYieldingTileIds(roll) {
    
    return landTileIds.filter((i) => state.board[i].roll == roll && state.board[i].bandit != true);
}

function canBuy(purchase) {
    
    const costs = purchaseCosts[purchase];
    for (const index of resIndices) {
        if (state.resources[index] + costs[index] < 0) {
            return false;
        }
    }
    return true;
}

function canBuildHometown(nodeId) {
    
    for (const edgeId of state.board[nodeId].edges) {
        for (const nextNodeId of state.board[edgeId].nodes) {
            if (state.board[nextNodeId].player) {
                return false;
            }
        }
    }
    return true;
}

function canBuildTown(player, nodeId) {
    
    if (!canBuildHometown(nodeId)) {
        return false;
    }
    
    var ownedEdgeId = null;
    for (const edgeId of state.board[nodeId].edges) {
        if (state.board[edgeId].player == player) {
            ownedEdgeId = edgeId;
            break;
        }
    }
    
    if (ownedEdgeId == null) {
        return false;
    }
    
    for (const nodeId of state.board[ownedEdgeId].nodes) {
        if (state.board[nodeId].player) {
            return false;
        }
    }
    
    return true;
}

function canBuildRoad(player, edgeId) {
    
    for (const nodeId of state.board[edgeId].nodes) {
        if (state.board[nodeId].player == player) {
            return true;
        }
        for (const edgeId of state.board[nodeId].edges) {
            if (state.board[edgeId].player == player) {
                return true;
            }
        }
    }
    return false;
}

function getVictoryProgress() {
    
    var townCount = 0, cityCount = 0;
    getTowns(state.me).forEach((t) => {
        if (t.city) {
            cityCount += 1;
        } else {
            townCount += 1;
        }
    });
    
    const cards = state.cards.filter((c) => c.index <= victoryMaxIndex);
    const longest = state.longestRoadPlayer == state.me;
    const largest = state.largestForcePlayer == state.me;
    
    const points = townCount + 2 * cityCount + cards.length + (longest ? 2 : 0) + (largest ? 2 : 0);
    
    return {points, townCount, cityCount, cards, longest, largest};
}

function formatResources(resources) {
    
    return resIndices.filter((i) => resources[i]).map((i) => resources[i] + " " + resNames[i]).join(', ');
}