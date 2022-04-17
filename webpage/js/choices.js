
function createHometownChoice() {
    
    const freeNodeIds = nodeIds.filter((i) => canBuildHometown(i));
    
    return {
        id: 'hometown',
        token: 'town',
        nodeIds: freeNodeIds,
        selectCell: (nodeId) => {
            postEvent('place-town', nodeId);
        },
    };
}

function createHometownRoadChoice(nodeId) {
    
    const edgeIds = state.board[nodeId].edges;
    
    return {
        id: 'homeroad',
        token: 'road',
        edgeIds,
        selectCell: (edgeId) => {
            postEvent('place-road', edgeId);
        },
    };
}

function createTurnChoice() {
    
    const swapRates = getSwapRates(state.me);
    
    return {
        id: 'turn',
        tradeRates,
        purchase: (index) => {
            if (index == 4) { // knight is separated into 2 events
                postEvent('make-purchase', [index]);
            } else {
                const purchaseChoice = createPurchaseChoice(index);
                pushChoice(purchaseChoice);
                refreshUI();
            }
        },
        swap: (index) => {
            const swapChoice = createSwapChoice(index, tradeRates[index]);
            pushChoice(swapChoice);
            refreshUI();
        },
        propose: () => {
            const offerChoice = createTradeOfferChoice();
            pushChoice(offerChoice);
            refreshUI();
        },
        end: () => {
            postEvent('end-turn', null);
        },
    }
}
    
function createPurchaseChoice(purchaseIndex) {
    
    const choice = {
        id: 'purchase',
        selectCell: (cellId) => {
            postEvent('make-purchase', [purchaseIndex, cellId]);
        },
        abortable: true,
    };
    
    if (purchaseIndex == 1) {
        choice.token = 'road';
        choice.edgeIds = edgeIds.filter((i) => canBuildRoad(state.me, i));
    } else if (purchaseIndex == 2) {
        choice.token = 'town';
        choice.nodeIds = nodeIds.filter((i) => canBuildTown(state.me, i));
    } else if (purchaseIndex == 3) {
        choice.token = 'city';
        choice.nodeIds = nodeIds.filter((i) => state.board[i].player == state.me && state.board[i].city != true);
    }
    
    return choice;
}
        
function createTradeOfferChoice() {
    
    var partner = null;
    var giveConfirmed = false;
    var give = noResources();
    var take = noResources();
    
    return {
        id: 'offer',
        give,
        take,
        getStage: () => giveConfirmed ? 'take' : (partner ? 'give' : 'partner'),
        selectPlayer: (player) => {
            partner = player;
            refreshUI();
        },
        selectResource: (index) => {
            if (giveConfirmed) {
                take[index] += 1;
            } else {
                give[index] += 1;
                if (give[index] > state.resources[index]) {
                    give[index] = 0;
                }
            }
            refreshUI();
        },
        reset: () => {
            resIndices.forEach((i) => take[i] = 0);
            refreshUI();
        },
        confirm: () => {
            if (giveConfirmed) {
                postEvent('offer-trade', [partner, give, take]);
            } else {
                giveConfirmed = true;
                refreshUI();
            }
        },
        abortable: true,
    };
}

function createTradeAnswerChoice(proposer, give, take) {
    
    return {
        id: 'answer',
        proposer,
        give,
        take,
        respond: (accepted) => {
            postEvent('answer-offer', [proposer, give, take, accepted]);
        },
    };
}

function createSwapChoice(resIndex, rate) {
    
    const resources = noResources();
    resources[resIndex] = -rate;
    
    return {
        id: 'swap',
        resources,
        selectResource: (index) => {
            resources[index] = 1;
            postEvent('swap-res', resources);
        },
        abortable: true,
    };
}
        
function createRoadworksChoice(cardIndex) {
    
    const freeEdgeIds = edgeIds.filter((i) => canBuildRoad(state.me, i));
    var firstEdgeId = null;
    
    return {
        id: 'roadworks',
        token: 'road',
        edgeIds: freeEdgeIds,
        selectCell: (edgeId) => {
            if (firstEdgeId) {
                postEvent('play-roads', [cardIndex, firstEdgeId, edgeId]);
            } else {
                firstEdgeId = edgeId;
                claimRoad(state.me, edgeId); // premature placement
                edgeIds.filter((i) => canBuildRoad(state.me, i)).forEach((i) => {
                    if (!freeEdgeIds.includes(i)) freeEdgeIds.push(i);
                });
                refreshUI();
            }
        },
        abortable: true,
    };
}

function createMonopolyChoice(cardIndex) {
    
    return {
        id: 'monopoly',
        selectResource: (resIndex) => {
            postEvent('play-monopoly', [cardIndex, resIndex]);
        }
    };
}

function createInventionChoice(cardIndex) {
    
    const resources = noResources();
    
    return {
        id: 'invention',
        resources,
        selectResource: (resIndex) => {
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
    
    return {
        id: 'drop',
        targetCount,
        resources: resources,
        selectResource: (index) => {
            resources[index] += 1;
            if (resources[index] > state.resources[index]) {
                resources[index] = 0;
            }
            refreshUI();
        },
        confirm: () => {
            const negResources = negateResources(resources);
            postEvent('drop-res', negResources);
        },
    };
}

function createBanditChoice() {
    
    const tileIds = landTileIds.filter((i) = state.board[i].land < 6 && state.board[i].bandit != true);
    const targetOptions = [];
    var selectedTileId = null;
    
    return {
        id: 'bandit',
        token: 'bandit',
        tileIds,
        targetOptions,
        selectCell: (tileId) => {
            moveBandit(tileId); // premature placement
            
            const adjacentPlayers = getAdjacentTowns(tileId).map((t) => t.player);
            const targets = state.players.filter((p) => p != state.me && adjacentPlayers.includes(p));
            
            if (targets.length == 0) {
                postEvent('move-bandit', [tileId, null]);
            } else if (targets.length == 1) {
                postEvent('move-bandit', [tileId, targets[0]);
            } else {
                selectedTileId = tileId;
                targets.forEach((p) => targetOptions.push(p));
                // TODO remove board buttons?
                refreshUI();
            }
        },
        selectPlayer: (player) => {
            postEvent('move-bandit', [selectedTileId, player]);
        },
    };
}