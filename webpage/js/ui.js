const log = document.getElementById("log");
const svgOutlines = document.getElementById("outlines");
const svgTiles = document.getElementById("tiles");
const svgTokens = document.getElementById("tokens");
const svgBandits = document.getElementById("bandits");
const resources = document.getElementById("resources");
const cards = document.getElementById("cards");
const victory = document.getElementById("victory");
const actions = document.getElementById("actions");

function logLine(line) {
    
    var html = line;
    for (var n = 0; n < state.players.length; n += 1) {
        const player = state.players[n];
        const span = '<span class="player player' + n + '">' + player + '</span>';
        html = html.replaceAll(player, span);
    }
    log.innerHTML = html + "<br>" + log.innerHTML;
}

function refreshUI() {
    
    refreshBoard();
    refreshActionButtons();
    refreshCards();
    refreshResources();
    refreshVictoryPoints();
}

function refreshBoard() {
    
    svgTiles.innerHTML = "";
    svgTokens.innerHTML = "";
    svgBandits.innerHTML = "";
    
    for (const [cellId, cell] of Object.entries(state.board)) {
            
        const y = 600 + cell.v * 80;
        const x = 640 + cell.h * 45;

        if (cell.tile) {
            
            const roll = cell.bandit ? null : cell.roll;
            addTile(cell.land, roll, x, y);
            
            if (cell.rate) {
                addTrade(cell.rate, cell.trade, x, y);
            } else if (cell.bandit) {
                addBandit(x, y, null);
            } else if (state.choice.id == 'bandit' && cell.land < 6) {
                addBandit(x, y, () => state.choice.selectCell(cellId));
            }
            
        } else if (cell.node) {
            
            const sy = y + cell.shift * 26;
            
            if (cell.route) {
                addPort(cell.port, x, sy);
            }
            
            if (cell.player) {
                if (state.choice.id == 'city' && cell.player == state.me) {
                    addTown(cell.player, cell.city, x, sy, null, () => state.choice.selectCell(cellId));
                } else {
                    addTown(cell.player, cell.city, x, sy, null, null);
                }
            } else if (state.choice.id == 'town') {
                if (state.choice.nodeIds.includes(cellId)) {
                    addTown(state.me, false, x, sy, () => state.choice.selectCell(cellId), null);
                }
            }
            
        } else if (cell.edge) {
            
            if (cell.player) {
                addRoad(cell.player, cell.dir, x, y, null);
            } else if (state.choice.id == 'road') {
                if (state.choice.edgeIds.includes(cellId)) {
                    addRoad(state.me, cell.dir, x, y, () => state.choice.selectCell(cellId));
                }
            }
        }
    }
}

function addTile(resIndex, roll, x, y) {

    const color = resColors[resIndex];
    const strokeColor = resStrokeColors[resIndex];
    
    if (resIndex > 5) {
        const outline = shape('path');
        outline.setAttribute('d', hexaPath);
        outline.setAttribute('transform', 'translate(' + x + ',' + y + ') scale(1.21)');
        //bg.setAttribute('fill', tileColor);
        svgOutlines.appendChild(outline);
    }
    
    const bg = shape('path');
    bg.setAttribute('d', hexaPath);
    bg.setAttribute('transform', 'translate(' + x + ',' + y + ') scale(1.2)');
    bg.setAttribute('fill', tileColor);
    svgTiles.appendChild(bg);

    const tile = shape('path');
    tile.setAttribute('d', hexaPath);
    tile.setAttribute('transform', 'translate(' + x + ',' + y + ')');
    tile.setAttribute('fill', color);
    tile.setAttribute('stroke', strokeColor);
    tile.setAttribute('stroke-width', 5);
    svgTiles.appendChild(tile);
    
    if (roll) {
        const label = shape('text');
        label.setAttribute('text-anchor', 'middle');
        label.setAttribute('x', x);
        if ('86'.includes(roll)) {
            label.setAttribute('y', y + 16);
            label.setAttribute('class', 'rollr');
        } else { 
            label.setAttribute('y', y + 11);
            label.setAttribute('class', 'roll');
        }
        label.innerHTML = roll;
        svgTiles.appendChild(label);
    }
}

function addBandit(x, y, listener) {
    
    const bandit = shape('g');
    const bx = x - 67;
    const by = y - 90;
    bandit.setAttribute('transform', 'translate(' + bx + ',' + by + ') scale(0.45)');
    bandit.innerHTML = `
        <path d="M202.856445,187.635029 C210.703598,194.69253 223.801024,198.900418 237.046827,202.568567 L238.738194,203.034088 L238.738194,203.034088 L240.428814,203.494812 C252.255036,206.705587 263.853012,209.642337 271.582031,213.953388 C276.977539,216.956318 281.884766,220.813739 285.81543,225.989521 C296.655273,240.296161 297.363281,263.538349 300,281.3362 C299.121094,290.564716 293.896484,295.886982 283.569336,296.692646 L16.4306641,296.692646 C6.10351562,295.911396 0.87890625,290.58913 0,281.3362 C2.63671875,263.538349 3.36914062,240.296161 14.1845703,225.989521 C18.1152344,220.789325 22.9980469,216.956318 28.4179688,213.953388 C36.0898774,209.685136 46.8280588,206.766045 57.7404891,203.584057 L59.4203092,203.092229 C72.3034895,199.302312 85.2227573,195.031648 93.4326172,187.635029 C91.6259766,192.981708 150,242.176044 202.856445,187.635029 Z M77.1484375,64.2707707 C93.7988281,-20.8366512 209.155273,-22.0085262 224.829102,64.2707707 L224.829102,64.2707707 L229.56543,63.0012395 L229.56543,86.1457707 L223.339844,86.1457707 C219.897461,138.562763 201.098633,171.082294 178.076172,185.388935 C168.139648,191.565693 157.421875,194.37331 146.75293,193.958271 C136.108398,193.543232 125.585938,189.905536 116.015625,183.167255 C93.5546875,167.346943 76.3671875,134.363544 76.0498047,86.1457707 L76.0498047,86.1457707 L70.7275391,86.1457707 L70.4101563,64.2707707 Z M150.537109,157.459247 C137.426758,157.459247 126.782227,161.585224 126.782227,166.663349 C126.782227,171.741474 137.402344,175.86745 150.537109,175.86745 C163.647461,175.86745 174.291992,171.741474 174.291992,166.663349 C174.291992,161.585224 163.671875,157.459247 150.537109,157.459247 Z M82.8857422,106.507099 C84.0087891,115.833271 85.8154297,124.402607 88.2324219,132.215107 C93.9208984,133.948505 98.3154297,156.507099 116.430664,145.886982 C137.768555,139.295185 159.692383,139.173114 182.250977,145.886982 C198.31543,155.408466 202.392578,138.709247 207.763672,136.536396 C210.717773,128.552997 213.15918,119.593036 214.941406,109.656513 C193.945313,131.21413 171.630859,131.824482 150,107.410419 C126.489258,131.726825 103.710938,133.43581 82.8857422,106.507099 Z M206.542969,98.5481145 C205.615234,97.6203801 203.930664,98.1330754 202.807617,98.3039738 L202.807617,98.3039738 L163.598633,104.456318 C165.454102,107.849872 167.651367,110.608661 170.214844,112.781513 C184.375,124.793232 199.462891,115.100849 206.518555,100.74538 C206.982422,99.7688176 207.006836,99.0119817 206.542969,98.5481145 Z M96.9794419,98.2774271 C95.8617887,98.0875136 94.2917597,97.6645579 93.4082031,98.5481145 C92.9443359,99.0119817 92.96875,99.7688176 93.4326172,100.74538 C100.488281,115.100849 115.576172,124.793232 129.736328,112.781513 C132.299805,110.608661 134.49707,107.849872 136.352539,104.456318 L136.352539,104.456318 L97.1435547,98.3039738 Z M217.749023,86.1457707 L81.640625,86.1457707 C81.640625,87.3176457 81.6650391,88.4406926 81.6894531,89.5637395 L147.460938,96.4485051 L152.734375,96.4485051 L217.504883,89.4416692 C217.602539,88.3430363 217.675781,87.2688176 217.749023,86.1457707 Z" fill-rule="nonzero"></path>
        <circle cx="192.871094" cy="112.304688" r="7.32421875"></circle>
        <circle cx="104.980469" cy="102.539062" r="7.32421875"></circle>
        <path d="M167.072526,163.201074 L168.356728,165.277438 C155.696726,173.107476 143.073559,173.270602 130.687635,165.760372 L129.897369,165.270574 L131.203504,163.207937 C142.791134,170.545638 154.417091,170.705153 166.281228,163.680057 L167.072526,163.201074 Z" fill-rule="nonzero"></path>
        `;
    if (listener) {
        bandit.setAttribute('opacity', 0.5);
        //bandit.setAttribute('stroke', 'black');
        bandit.setAttribute('stroke-width', 1);
        bandit.addEventListener('click', listener);
    }
    
    svgBandits.appendChild(bandit);
}

function addTrade(rate, trade, x, y) {
    
    const ring = shape('circle');
    ring.setAttribute('cx', x);
    ring.setAttribute('cy', y);
    ring.setAttribute('r', 25);

    const label = shape('text');
    label.innerHTML = rate + ':1';
    label.setAttribute('text-anchor', 'middle');
    label.setAttribute('x', x + 0.5);

    if (trade) {
        ring.setAttribute('fill', resColors[trade]);
        label.setAttribute('class', 'port');
        label.setAttribute('y', y + 7.5);
    } else {
        ring.setAttribute('fill-opacity', 0);
        ring.setAttribute('stroke', 'white');
        ring.setAttribute('stroke-width', 2);
        label.setAttribute('class', 'portw');
        label.setAttribute('y', y + 7);
    }
    
    svgTokens.appendChild(ring);
    svgTokens.appendChild(label);
}


function addPort(angle, x, y) {
    
    const port = shape('rect');
    port.setAttribute('x', x - 9);
    port.setAttribute('y', y - 44);
    port.setAttribute('width', 18);
    port.setAttribute('height', 44);
    port.setAttribute('rx', 5);
    port.setAttribute('fill', 'saddlebrown');
    port.setAttribute('transform', 'rotate(' + angle + ',' + x + ',' + y + ')');
    svgTokens.appendChild(port);
}
    
function addTown(player, isCity, x, y, listener, upgradeListener) {
    
    const town = shape('circle', player);
    town.setAttribute('cx', x);
    town.setAttribute('cy', y);
    town.setAttribute('r', '25');
    town.setAttribute('stroke', 'black');
    town.setAttribute('stroke-width', 1);
    
    if (listener) {
        town.setAttribute('opacity', 0.5);
        town.addEventListener('click', listener);
    }
        
    svgTokens.appendChild(town);
    
    if (isCity) {
        const dot = shape('circle');
        dot.setAttribute('cx', x);
        dot.setAttribute('cy', y);
        dot.setAttribute('r', '10');
        svgTokens.appendChild(dot);
    } else if (upgradeListener) {
        const arrow = shape('polygon');
        arrow.setAttribute('points', "0,-17 15,10 -15,10");
        arrow.setAttribute('fill', 'white');
        arrow.setAttribute('opacity', 0.5);
        arrow.setAttribute('transform', 'translate(' + x + ',' + y + ')');
        arrow.addEventListener('click', upgradeListener);
        svgTokens.appendChild(arrow);
    }
}

function addRoad(player, angle, x, y, listener) {
    
    const road = shape('rect', player);
    road.setAttribute('x', x - 15);
    road.setAttribute('y', y - 20);
    road.setAttribute('width', 30);
    road.setAttribute('height', 40);
    road.setAttribute('rx', 10);
    road.setAttribute('stroke', 'black');
    road.setAttribute('stroke-width', 1);
    
    road.setAttribute('transform', 'rotate(' + angle + ',' + x + ',' + y + ')');
    
    if (listener) {
        road.setAttribute('opacity', 0.5);
        road.addEventListener('click', listener);
    }
    
    svgTokens.appendChild(road);
}

function shape(tag, player) {
    const shape = document.createElementNS("http://www.w3.org/2000/svg", tag);
    if (player) {
        const playerNum = state.players.indexOf(player);
        shape.setAttribute('class', 'player' + playerNum);
    }
    return shape;
}

function refreshResources() {
    
    resources.innerHTML = "";
    
    const expResources = expandResources(state.resources);
    
    if (expResources.length) {
        for (const resIndex of expResources) {
            const resImg = document.createElement('img');
            resImg.src = "img/" + resNames[resIndex] + ".png";
            resImg.width = "50";
            resources.appendChild(resImg);
        }
    } else {
        resources.innerHTML = "keine Rohstoffe";
    }
}
    
function refreshCards() {
    
    const canPlay = state.choice.id == 'turn';
    
    cards.innerHTML = "";
    if (state.cards.length) {
        for (const card of state.cards) {
            const cardButton = document.createElement('button');
            cardButton.className = "card";
            if (canPlay && card.listener && !card.locked) {
                cardButton.addEventListener('click', card.listener)
            } else {
                cardButton.disabled = true;
            }
            cardButton.innerHTML = cardNames[card.index];
            cards.appendChild(cardButton);
        }
    } else {
        cards.innerHTML = "keine Karten";
    }
}
    
function refreshVictoryPoints() {
    
    var points = 0;
    victory.innerHTML = "";
    
    var townCount = 0, cityCount = 0;
    getTowns(state.me).forEach((t) => {
        if (t.city) {
            cityCount += 1;
            points += 2;
        } else {
            townCount += 1;
            points += 1;
        }
    });
    
    if (townCount) {
        victory.innerHTML += townCount + " Siedlungen (1P)";
    }
    
    if (cityCount) {
        victory.innerHTML += " + " + cityCount + " Städte (2P)";
    }
    
    state.cards.filter((c) => c.index <= victoryMaxIndex).forEach((i) => {
        victory.innerHTML += " + " + cardNames[c.index] + " (1P)";
        points += 1;
    });
    
    if (state.longestRoadPlayer == state.me) {
        victory.innerHTML += " + Längste Handelsstraße (2P)";
        points += 2;
    }
    
    if (state.largestForcePlayer == state.me) {
        victory.innerHTML += " + Größte Rittermacht (2P)";
        points += 2;
    }
    
    if (points > 0) {
        victory.innerHTML += " = " + points;
    } else {
        victory.innerHTML = 'keine Punkte';
    }
}
        
function refreshActionButtons() {
    
    actions.innerHTML = "";
    
    if (state.choice == null) {
        return;
    }
    
    var title = null;
    var buttons = [];
    
    if (state.choice.id == 'turn') {
        purchaseIndices.filter((i) => canBuy(i)).forEach((i) => {
            buttons.push([purchaseActionNames[i], () => state.choice.purchase(i)]);
        });
        resIndices.forEach((i) => {
            const rate = state.choice.tradeRates[i];
            if (state.resources[i] >= rate) {
                buttons.push([rate + " " + resNames[i] + " umtauschen", () => state.choice.trade(i)]);
            }
        });
        buttons.push(["Zug beenden", state.choice.end]);
    } else if (state.choice.id == 'drop') {
        title = "Werfe " + state.choice.targetCount + " Rohstoffe ab";
        resIndices.filter((i) => state.resources[i] > 0).forEach((i) => {
            const amount = state.choice.resources[i];
            const text = amount + " " + resNames[i];
            buttons.push([text, () => state.choice.selectResource(i)]);
        });
        buttons.push(["Bestätigen", state.choice.confirm]);
    } else if (state.choice.id == 'bandit') {
        title = "Wen berauben?";
        state.choice.targetOptions.forEach((p) => {
            buttons.push([p, () => state.choice.selectPlayer(p)]);
        });
    } else if (state.choice.id == 'trade') {
        title = "Tauschen gegen";
        resIndices.filter((i) => state.choice.resources[i] == 0).forEach((i) => {
            buttons.push([resNames[i], () => state.choice.selectResource(i)]);
        });
        buttons.push(["Abbrechen", state.choice.abort]);
    } else if (state.choice.id == 'invention') {
        if (state.choice.indices.length == 0) {
            title.innerHTML = "Erfindung - Erster Rohstoff";
        } else {
            title.innerHTML = "Erfindung - Zweiter Rohstoff";
        }
        resIndices.forEach((i) => {
            buttons.push([resNames[i], () => state.choice.selectResource(i)]);
        });
        buttons.push(["Abbrechen", state.choice.abort]);
    } else if (state.choice.id == 'monopoly') {
        title.innerHTML = "Monopol auf welchen Rohstoff?";
        resIndices.forEach((i) => {
            buttons.push([resNames[i], () => state.choice.selectResource(i)]);
        });
        buttons.push(["Abbrechen", state.choice.abort]);
    }
    
    if (title) {
        const header = document.createElement('h4');
        header.innerHTML = title;
        actions.appendChild(header);
    }
        
    for (const [label, listener] of buttons) {
        const button = document.createElement('button');
        button.innerHTML = label;
        button.addEventListener('click', listener);
        actions.appendChild(button);
    }
}
