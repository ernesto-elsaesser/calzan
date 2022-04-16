
function createTownChoice() {
    
    return {
        id: 'town',
        selectCell: (nodeId) => {
            popChoice();
            postEvent('place-town', nodeId);
        },
    };
}

function createRoadChoice() {
    
    return {
        id: 'road',
        selectCell: (edgeId) => {
            popChoice();
            postEvent('place-road', edgeId);
        },
    };
}

function createTurnChoice() {
    
    return {
        id: 'turn',
        purchase: (index) => {
            if (index == 4) { // knight is separated into 2 events
                postEvent(action, purchaseIndex);
            } else {
                const purchaseChoice = createPurchaseChoice(state.choice, index);
                pushChoice(purchaseChoice);
                updateUI();
            }
        },
        trade: (resources) => {
            const tradeChoice = createTradeChoice(state.choice, resources);
            pushChoice(tradeChoice);
            updateUI();
        },
        endTurn: () => {
            popChoice();
            postEvent('end-turn', null);
        },
    }
}
    
function createPurchaseChoice(purchaseIndex) {
    
    return {
        id: ['road', 'town', 'city'][purchaseIndex],
        selectCell: (cellId) => {
            popChoice();
            postEvent('make-purchase', [purchaseIndex, cellId]);
        },
    };
}
        
function createTradeChoice(resources) {
    
    return {
        id: 'trade',
        resources,
        selectResource: (index) => {
            popChoice();
            if (index == null) {
                updateUI();
            } else {
                resources[index] = 1;
                postEvent('trade-sea', resources);
            }
        },
    });
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
                updateUI();
            }
        }
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
                updateUI();
            }
        }
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
            updateUI();
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
                updateUI();
            }
        },
        selectPlayer: (player) => {
            args[1] = player;
            popChoice();
            postEvent('move-bandit', args);
    };
}