
function createHometownChoice() {
    
    const freeNodeIds = nodeIds.filter((i) => canBuildHometown(i));
    
    return {
        id: 'town',
        nodeIds: freeNodeIds,
        selectCell: (nodeId) => {
            popChoice();
            postEvent('place-town', nodeId);
        },
    };
}

function createHometownRoadChoice(nodeId) {
    
    const edgeIds = state.board[nodeId].edges;
    
    return {
        id: 'road',
        edgeIds,
        selectCell: (edgeId) => {
            popChoice();
            postEvent('place-road', edgeId);
        },
    };
}

function createTurnChoice() {
    
    const tradeRates = getTradeRates(state.me);
    
    return {
        id: 'turn',
        tradeRates,
        purchase: (index) => {
            if (index == 4) { // knight is separated into 2 events
                postEvent(action, purchaseIndex);
            } else {
                const purchaseChoice = createPurchaseChoice(state.choice, index);
                pushChoice(purchaseChoice);
                refreshUI();
            }
        },
        trade: (index) => {
            const tradeChoice = createTradeChoice(index, tradeRates[index]);
            pushChoice(tradeChoice);
            refreshUI();
        },
        end: () => {
            popChoice();
            postEvent('end-turn', null);
        },
    }
}
    
function createPurchaseChoice(purchaseIndex) {
    
    const choice = {
        selectCell: (cellId) => {
            popChoice();
            postEvent('make-purchase', [purchaseIndex, cellId]);
        },
        abort: () => {
            popChoice();
            refreshUI();
        },
    };
    
    if (purchaseIndex == 1) {
        choice.id = 'road';
        choice.edgeIds = edgeIds.filter((i) => canBuildRoad(i));
    } else if (purchaseIndex == 2) {
        choice.id = 'town';
        choice.nodeIds = nodeIds.filter((i) => canBuildTown(i));
    } else if (purchaseIndex == 3) {
        choice.id = 'city';
    }
    
    return choice;
}
        
function createTradeChoice(resIndex, rate) {
    
    const resources = noResources();
    resources[resIndex] = -rate;
    
    return {
        id: 'trade',
        resources,
        selectResource: (index) => {
            popChoice();
            if (index == null) {
                refreshUI();
            } else {
                resources[index] = 1;
                postEvent('trade-sea', resources);
            }
        },
        abort: () => {
            popChoice();
            refreshUI();
        },
    };
}
        
function createRoadworksChoice(cardIndex) {
    
    const edgeIds = [];
    
    return {
        id: 'road',
        edgeIds,
        selectCell: (edgeId) => {
            edgeIds.push(edgeId);
            if (edgeIds.lenght == 2) {
                popChoice();
                postEven('play-roads', [cardIndex].concat(edgeIds));
            } else {
                claimRoad(state.me, edgeId); // premature placement
                refreshUI();
            }
        },
        abort: () => {
            popChoice();
            refreshUI();
        },
    };
}

function createMonopolyChoice(cardIndex) {
    
    return {
        id: 'monopoly',
        selectResource: (resIndex) => {
            popChoice();
            postEven('play-monopoly', [cardIndex, resIndex]);
        }
    };
}

function createInventionChoice(cardIndex) {
    
    const indices = [];
    
    return {
        id: 'invention',
        indices,
        selectResource: (resIndex) => {
            indices.push(resIndex);
            if (indices.lenght == 2) {
                popChoice();
                postEven('play-invent', [cardIndex].concat(indices));
            } else {
                refreshUI();
            }
        },
        abort: () => {
            popChoice();
            refreshUI();
        },
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
            resources[index] = (resources[index] + 1) % state.resources[index] + 1;
            refreshUI();
        },
        confirm: () => {
            const count = countResources(resources);

            if (count != targetCount) {
                window.alert("Bitte genau " + targetCount + " Rohstoffe auswählen!");
                return;
            }

            popChoice();
            postEvent('drop-res', resources);
        },
    };
}

function createBanditChoice() {
    
    const targetOptions = [];
    const args = [null, null];
    
    return {
        id: 'bandit',
        targetOptions,
        selectCell: (tileId) => {
            moveBandit(tileId); // premature placement
            args[0] = tileId;
            
            const adjacentPlayers = getAdjacentTowns(tileId).map((t) => t.player);
            state.player.filter((p) => p != state.me && adjacentPlayers.includes(p)).forEach(targetOptions.push);
            
            if (targetOptions.length == 0) {
                popChoice();
                postEvent('move-bandit', args);
            } else if (targetOptions.length == 1) {
                popChoice();
                args[1] = targetOptions[0];
                postEvent('move-bandit', args);
            } else {
                // TODO remove board buttons?
                refreshUI();
            }
        },
        selectPlayer: (player) => {
            args[1] = player;
            popChoice();
            postEvent('move-bandit', args);
        },
    };
}