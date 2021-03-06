/* 
* choices.js
* 
* A choice object represents a set of actions from which the
* player can choose at a given time in the game.
* In the UI, a choice is presented as a list of buttons from
* which the used has to select one to proceed.
* Some choices have a 'token' attribute. This indicates
* that the choice involves selecting a token on the board.
*/

function createHometownChoice() {
    
    return {
        id: 'hometown',
        token: 'town',
        options: getHometownOptions(),
        select: (nodeId) => postEvent('place-town', nodeId),
    };
}

function createHometownRoadChoice(nodeId) {
    
    return {
        id: 'homeroad',
        token: 'road',
        options: state.board[nodeId].edges,
        select: (edgeId) => postEvent('place-road', edgeId),
    };
}

function createTurnChoice() {
    
    const purchaseChoiceOptions = [
        null,
        getRoadOptions(),
        getTownOptions(),
        getUpgradeOptions(),
        getCardOptions(),
    ];
    
    const purchaseOptions = purchaseIndices.filter((i) => {
        const canAfford = hasResources(purchaseCosts[i]);
        const hasOptions = purchaseChoiceOptions[i].length > 0;
        return canAfford && hasOptions;
    });
    
    const swapRates = getSwapRates();
    const swapOptions = resIndices.filter((i) => state.resources[i] >= swapRates[i]);
    
    const tradeOptions = state.players.filter((p) => p != state.me);
    
    return {
        id: 'turn',
        purchaseOptions,
        swapOptions,
        swapRates,
        tradeOptions,
        selectPurchase: (index) => {
            const token = {1: 'road', 2: 'town', 3: 'city', 4: null}[index];
            if (token) {
                const choiceOptions = purchaseChoiceOptions[index];
                const purchaseChoice = createPurchaseChoice(index, token, choiceOptions);
                pushChoice(purchaseChoice);
                refreshUI();
            } else {
                postEvent('make-purchase', [index]);
            }
        },
        selectSwap: (index) => {
            const swapChoice = createSwapChoice(index, swapRates[index]);
            pushChoice(swapChoice);
            refreshUI();
        },
        selectTrade: (player) => {
            const offerChoice = createTradeOfferChoice(player);
            pushChoice(offerChoice);
            refreshUI();
        },
        end: () => postEvent('end-turn', null),
    }
}
    
function createPurchaseChoice(purchaseIndex, token, options) {
    
    return {
        id: 'purchase',
        token,
        options,
        select: (cellId) => postEvent('make-purchase', [purchaseIndex, cellId]),
        abortable: true,
    };
}
        
function createTradeOfferChoice(player) {
    
    const options = resIndices.filter((i) => state.resources[i] > 0);
    const resources = noResources();
    
    return {
        id: 'offer',
        resources,
        options,
        select: (index) => {
            resources[index] += 1;
            if (resources[index] > state.resources[index]) {
                resources[index] = 0;
            }
            refreshUI();
        },
        confirm: () => {
            const demandChoice = createTradeDemandChoice(player, resources);
            replaceChoice(demandChoice);
            refreshUI();
        },
        abortable: true,
    };
}

function createTradeDemandChoice(player, give) {
    
    const resources = noResources();
    
    return {
        id: 'demand',
        resources,
        options: resIndices,
        select: (index) => {
            resources[index] += 1;
            refreshUI();
        },
        reset: () => {
            resIndices.forEach((i) => resources[i] = 0);
            refreshUI();
        },
        confirm: () => {
            postEvent('offer-trade', [player, give, resources]);
        },
        abortable: true,
    };
}

function createTradeAnswerChoice(proposer, give, take) {
    
    const options = hasResources(take) ? [false, true] : [false];
    
    return {
        id: 'answer',
        proposer,
        give,
        take,
        options,
        select: (accepted) => postEvent('answer-offer', [proposer, give, take, accepted]),
    };
}

function createSwapChoice(resIndex, rate) {
    
    const options = resIndices.filter((i) => i != resIndex);
    
    return {
        id: 'swap',
        options,
        select: (index) => {
            const give = noResources();
            give[resIndex] = rate;
            const take = noResources();
            take[index] = 1;
            postEvent('swap-res', [give, take]);
        },
        abortable: true,
    };
}
        
function createRoadworksFirstChoice(cardIndex) {
    
    return {
        id: 'roadworks1',
        token: 'road',
        options: getRoadOptions(), 
        select: (edgeId) => {
            claimRoad(state.me, edgeId); // premature placement
            const secondChoice = createRoadworksSecondChoice(cardIndex, edgeId);
            replaceChoice(secondChoice);
            refreshUI();
        },
        abortable: true,
    };
}

function createRoadworksSecondChoice(cardIndex, firstEdgeId) {
    
    return {
        id: 'roadworks2',
        token: 'road',
        options: getRoadOptions(),
        select: (edgeId) => postEvent('play-roads', [cardIndex, firstEdgeId, edgeId]),
        revert: () => {
            claimRoad(null, firstEdgeId); 
            popChoice();
            refreshUI();
        },
    };
}

function createMonopolyChoice(cardIndex) {
    
    return {
        id: 'monopoly',
        options: resIndices,
        select: (resIndex) => {
            postEvent('play-monopoly', [cardIndex, resIndex]);
        }
    };
}

function createInventionChoice(cardIndex) {
    
    const resources = noResources();
    
    return {
        id: 'invention',
        resources,
        options: resIndices,
        select: (resIndex) => {
            resources[resIndex] += 1;
            const count = countResources(resources);
            if (count == 2) {
                postEvent('play-invent', [cardIndex, resources]);
            } else {
                refreshUI();
            }
        },
        abortable: true,
    };
}
    
function createDropChoice() {
    
    const count = countResources(state.resources);
    const targetCount = Math.ceil(count / 2);
    const resources = noResources();
    const options = resIndices.filter((i) => state.resources[i] > 0);
    
    return {
        id: 'drop',
        targetCount,
        resources: resources,
        options,
        select: (index) => {
            resources[index] += 1;
            if (resources[index] > state.resources[index]) {
                resources[index] = 0;
            }
            refreshUI();
        },
        confirm: () => {
            postEvent('drop-res', resources);
        },
    };
}

function createBanditChoice() {
    
    const options = getBanditOptions();
    
    return {
        id: 'bandit',
        token: 'bandit',
        options,
        select: (tileId) => {
            moveBandit(tileId); // premature placement
            
            const adjacentPlayers = getAdjacentTowns(tileId).map((t) => t.player);
            const targets = state.players.filter((p) => p != state.me && adjacentPlayers.includes(p));
            
            if (targets.length == 0) {
                postEvent('move-bandit', [tileId, null]);
            } else if (targets.length == 1) {
                postEvent('move-bandit', [tileId, targets[0]]);
            } else {
                const raidOptions = createRaidChoice(tileId, targets);
                replaceChoice(raidOptions);
                refreshUI();
            }
        },
    };
}

function createRaidChoice(tileId, options) {
    
    return {
        id: 'raid',
        options,
        select: (player) => {
            postEvent('move-bandit', [tileId, player]);
        },
    };
}