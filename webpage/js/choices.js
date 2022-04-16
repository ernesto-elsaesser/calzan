
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
        id: 'purchase',
        index: purchaseIndex,
        selectCell: (cellId) => {
            popChoice();
            postEvent('make-purchase', cellId);
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
        
function createCardChoice(cardIndex) {
        
    if (state.choice) {

        const resIndex = arg;
        
        if (resIndex == null) {
            clearChoice();
            updateUI();
            return;
        }

        const cardIndex = state.choice.cardIndex;
        const cardName = cardNames[cardIndex];
        
        if (cardName == "Erfindung") {
            if (state.choice.first) {
                const firstResIndex = state.choice.first;
                clearChoice();
                postEvent(action, [cardIndex, firstResIndex, resIndex]);
            } else {
                updateChoice('first', resIndex);
                updateUI();
            }
        } else if (cardName == "Monopol") {
            clearChoice();
            postEvent(action, [cardIndex, resIndex]);
        }

    } else {
        
    const cardIndex = arg;

    if (cardIndex >= knightMinIndex) {
        postEvent(action, [cardIndex]);
        return;
    }

    if (cardNames[cardIndex] == "Strassenbau") {
        setBoardMode('redeem-road');
    }
    startChoice({action, cardIndex});
    updateUI();
}

function freeRoadClicked(action, arg) {
        
    const edgeId = arg;
    if (state.choice.first) {
        const firstEdgeId = state.choice.first;
        setBoardMode(null);
        clearChoice();
        postEvent('play-card', [state.choice.cardIndex, firstEdgeId, edgeId]);
    } else {
        claimRoad(state.me, edgeId); // NOTE: premature placement, not confirmed by event!!!
        updateChoice('first', edgeId);
        updateUI();
    }
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
            moveBandit(tileId); // NOTE: premature placement, not confirmed by event!!!
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