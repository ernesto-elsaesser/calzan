const state = {
    seed: 0,
    board: {},
    players: [],
    nextEventId: 1,
    postFunc: null,
    me: null,
    current: null,
    phase: 'forward',
    choice: {},
    resources: [],
    stack: [],
    cards: [],
    playedKnights: null,
    longestRoad: {player: null, length: 4},
    largestForce: {player: null, size: 2},
};

function initState(data, postFunc, player) {
    
    state.seed = data.seed;
    state.board = data.board;
    state.players = data.players;
    state.postFunc = postFunc;
    state.me = player;
    state.current = data.players[0];
    state.resources = noResources();
    state.stack = cardIndices.map((i) => i); // copy
    state.playedKnights = data.players.map((p) => 0);
}

function postEvent(action, args) {
    
    state.postFunc(state.nextEventId, {player: state.me, action, args});
}

function incrementEventId() {
    
    state.nextEventId += 1;
}

function nextRandom() {
    
    // xorshift: https://www.jstatsoft.org/article/view/v008i14
	state.seed ^= state.seed << 13;
	state.seed ^= state.seed >>> 17;
	state.seed ^= state.seed << 5;
	state.seed >>>= 0; // uint32 cast
    return state.seed / 4294967296;
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

function getVictoryProgress() {
    
    const townAndCityCount = getTowns().length;
    const cityCount = getUpgradedTowns().length;
    const townCount = townAndCityCount - cityCount;
    
    const cards = state.cards.filter((c) => c.index <= victoryMaxIndex);
    const longest = state.longestRoad.player == state.me;
    const largest = state.largestForce.player == state.me;
    
    const points = townCount + 2 * cityCount + cards.length + (longest ? 2 : 0) + (largest ? 2 : 0);
    
    return {points, townCount, cityCount, cards, longest, largest};
}

// TOWNS

function getHometownOptions() {
    
    return nodeIds.filter(canBuildHometown);
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

function getTownOptions() {
    
    return nodeIds.filter(canBuildTown);
}

function canBuildTown(nodeId) {
    
    if (!canBuildHometown(nodeId)) {
        return false;
    }
    
    var ownedEdgeId = null;
    for (const edgeId of state.board[nodeId].edges) {
        if (state.board[edgeId].player == state.me) {
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

function claimTown(player, nodeId) {
    
    state.board[nodeId].player = player;
}

function getTowns() {
    
    return nodeIds.filter((i) => state.board[i].player == state.me);
}

// ROADS

function claimRoad(player, edgeId) {
    
    state.board[edgeId].player = player;
    
    // recompute lengths
    
    var maxPlayer = null;
    var maxLength = 4;
    
    for (const player_ of state.players) {
        const length = computeRoadLength(player_);
        if (length > maxLength) {
            maxPlayer = player_;
            maxLength = length;
        }
    }
    
    state.longestRoad = {player: maxPlayer, length: maxLength};
}

function getRoads() {
    
    return edgeIds.filter((i) => state.board[i].player == state.me);
}

function getRoadOptions() {
    
    return edgeIds.filter(canBuildRoad);
}

function canBuildRoad(edgeId) {
    
    for (const nodeId of state.board[edgeId].nodes) {
        if (state.board[nodeId].player == state.me) {
            return true;
        }
        for (const nextEdgeId of state.board[nodeId].edges) {
            if (state.board[nextEdgeId].player == state.me) {
                return true;
            }
        }
    }
    return false;
}

// CITIES

function getUpgradeOptions() {
    
    return getTowns().filter((i) => state.board[i].city != true);
}

function upgradeTown(player, nodeId) {
    
    state.board[nodeId].city = true;
}

function getUpgradedTowns() {
    
    return getTowns().filter((i) => state.board[i].city == true);
}

// TILES

function getBanditOptions() {
    
    return landTileIds.filter((i) => state.board[i].land < 6 && state.board[i].bandit != true);
}

function moveBandit(tileId) {
    
    for (const otherTileId of landTileIds) {
        state.board[otherTileId].bandit = false;
    }
    state.board[tileId].bandit = true;
}

function getYieldingTileIds(roll) {
    
    return landTileIds.filter((i) => state.board[i].roll == roll && state.board[i].bandit != true);
}

function getAdjacentTowns(tileId) {
    
    return state.board[tileId].nodes.map((i) => state.board[i]).filter((c) => c.player);
}

// CARDS

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
    }
    
    if (cardIndex >= knightMinIndex) {
        const size = state.playedKnights[player] += 1;
        if (size > state.largestForce.size) {
            state.largestForce = {player, size};
        }
    }
}

// RESOURCES

function addResources(resources) {
    
    resIndices.forEach((i) => state.resources[i] += resources[i]);
}

function subtractResources(resources) {
    
    resIndices.forEach((i) => state.resources[i] -= resources[i]);
}

function countResources(resources) {
    
    return resIndices.reduce((acc, i) => acc + resources[i], 0);
}

function hasResources(resources) {
    
    for (const index of resIndices) {
        if (state.resources[index] - resources[index] < 0) {
            return false;
        }
    }
    return true;
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

function getSwapRates() {
    
    var canTrade3To1 = false;
    var resIndices2To1 = [];
    
    getTowns().forEach((i) => {
        const tileId = state.board[i].route;
        if (tileId) {
            const trade = state.board[tileId].trade;
            if (trade) {
                resIndices2To1.push(trade);
            } else {
                canTrade3To1 = true;
            }
        }
    });
    
    const rates = noResources();
    resIndices.forEach((i) => rates[i] = canTrade3To1 ? 3 : 4);
    resIndices2To1.forEach((i) => rates[i] = 2);
    return rates;
}

// CHOICES

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

function insertChoice(choice) {
    
    choice.parent = state.choice.parent;
    state.choice.parent = choice;
}

function replaceChoice(choice) {
    
    choice.parent = state.choice.parent;
    state.choice = choice;
}

function resetChoice(choice) {
    
    state.choice = {};
}