const resRanks = {
    'Holz': 1,
    'Lehm': 2,
    'Getreide': 3,
    'Wolle': 4,
    'Erz': 5,
};

const resColors = {
    'Holz': '#6E9B3C',
    'Lehm': '#DF9327',
    'Getreide': '#EFDA61',
    'Wolle': '#AEE670',
    'Erz': '#A4A296',
    'Wüste': '#EBE3B0'
};

const resStrokeColors = {
    'Holz': '#4F702A',
    'Lehm': '#A87325',
    'Getreide': '#CCB94C',
    'Wolle': '#89C852',
    'Erz': '#7F7E74',
    'Wüste': '#D8CC8B'
};


const log = document.getElementById("log");
const svgTiles = document.getElementById("tiles");
const svgTokens = document.getElementById("tokens");
const svgBandits = document.getElementById("bandits");
const resources = document.getElementById("resources");
const cards = document.getElementById("cards");
const victory = document.getElementById("victory");

const cardButton = document.getElementById("card");
const tradeButton = document.getElementById("trade");
const endButton = document.getElementById("end");

function logLine(line) {
    
    var html = line;
    for (var n = 0; n < state.players.length; n += 1) {
        const player = state.players[n];
        const span = '<span class="player player' + n + '">' + player + '</span>';
        html = html.replaceAll(player, span);
    }
    log.innerHTML += html + "<br>";
}

function updateUI() {
    
    updateBoard();
    updateControls();
}

function updateBoard() {
    
    svgTiles.innerHTML = "";
    svgTokens.innerHTML = "";
    svgBandits.innerHTML = "";

    for (const cell of Object.values(state.board)) {
            
        const y = 550 + cell.v * 80;
        const x = 550 + cell.h * 45;

        if (cell.tile) {
            
            addTile(cell.res, cell.roll, cell.bandit, x, y);
            
        } else if (cell.node) {
            
            if (cell.player) {
                addTown(cell.player, cell.city, cell.shift, null, x, y);
            } else if (cell.action) {
                addTown(state.me, cell.city, cell.shift, cell.action, x, y);
            }
        } else if (cell.edge) {
            
            if (cell.player) {
                addRoad(cell.player, cell.dir, null, x, y);
            } else if (cell.action) {
                addRoad(state.me, cell.dir, cell.action, x, y);
            }
            if (cell.port) {
                addPort(cell.res, cell.port, x, y);
            }
        }
    }
}

function addTile(resource, roll, hasBandit, x, y) {

    const color = resColors[resource];
    const strokeColor = resStrokeColors[resource];
    
    const hexaPath = 'M-81,0 L-81,48 L0,96 L81,48 L81,-48 L0,-96 L-81,-48 L-81,0';
    
    const bg = shape('path');
    bg.setAttribute('d', hexaPath);
    bg.setAttribute('transform', 'translate(' + x + ',' + y + ') scale(1.2)');
    bg.setAttribute('fill', '#FFFFC0');
    svgTiles.appendChild(bg);

    const tile = shape('path');
    tile.setAttribute('d', hexaPath);
    tile.setAttribute('transform', 'translate(' + x + ',' + y + ')');
    tile.setAttribute('fill', color);
    tile.setAttribute('stroke', strokeColor);
    tile.setAttribute('stroke-width', 5);
    svgTiles.appendChild(tile);

    if (hasBandit) {
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
        svgBandits.appendChild(bandit);
    } else if (roll) {
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

function addPort(resource, face, x, y) {
    
    var px = x;
    var py = y;
    
    if (face == 'W') {
        px -= 40;
    } else if (face == 'NW') {
        px -= 25;
        py -= 35;
    } else if (face == 'NE') {
        px += 25;
        py -= 35;
    } else if (face == 'E') {
        px += 40;
    } else if (face == 'SE') {
        px += 25;
        py += 35;
    } else if (face == 'SW') {
        px -= 25;
        py += 35;
    }
    
    const port = shape('circle');
    port.setAttribute('cx', px);
    port.setAttribute('cy', py);
    port.setAttribute('r', 25);

    const label = shape('text');
    label.setAttribute('text-anchor', 'middle');
    label.setAttribute('x', px + 0.5);
    
    if (resource == '*') {
        port.setAttribute('fill-opacity', 0);
        port.setAttribute('stroke', 'white');
        port.setAttribute('stroke-width', 2);
        label.setAttribute('class', 'portw');
        label.setAttribute('y', py + 7);
        label.innerHTML = '3:1';
    } else {
        port.setAttribute('fill', resColors[resource]);
        label.setAttribute('class', 'port');
        label.setAttribute('y', py + 7.5);
        label.innerHTML = '2:1';
    }
    
    svgTiles.appendChild(port);
    svgTiles.appendChild(label);
}

function addTown(player, isCity, shift, action, x, y) {
    
    const ty = shift == 'up' ? y - 26 : y + 26;
    
    const town = shape('circle', player);
    town.setAttribute('cx', x);
    town.setAttribute('cy', ty);
    town.setAttribute('r', '25');
    town.setAttribute('stroke', 'black');
    town.setAttribute('stroke-width', 1);
    
    if (action) {
        town.setAttribute('opacity', 0.5);
        town.setAttribute('onclick', action);
    }
        
    svgTokens.appendChild(town);
    
    if (isCity) {
        const dot = shape('circle');
        dot.setAttribute('cx', x);
        dot.setAttribute('cy', ty);
        dot.setAttribute('r', '10');
        svgTokens.appendChild(dot);
    }
}
    

function addRoad(player, spin, action, x, y) {
    
    const road = shape('rect', player);
    road.setAttribute('x', x - 15);
    road.setAttribute('y', y - 20);
    road.setAttribute('width', 30);
    road.setAttribute('height', 40);
    road.setAttribute('rx', 10);
    road.setAttribute('stroke', 'black');
    road.setAttribute('stroke-width', 1);
    
    var angle = 0;
    if (spin == 'rise') {
        angle = 60;
    } else if (spin == 'fall') {
        angle = -60;
    }
    road.setAttribute('transform', 'rotate(' + angle + ',' + x + ',' + y + ')');
    
    if (action) {
        road.setAttribute('opacity', 0.5);
        road.setAttribute('onclick', action);
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

function updateControls() {
    
    resources.innerHTML = "";
    if (state.resources.length) {
        const sortedResources = state.resources.sort((a, b) => resRanks[a] - resRanks[b]); 
        for (const resource of sortedResources) {
            const resImg = document.createElement('img');
            resImg.src = "img/" + resource + ".png";
            resImg.width = "50";
            resources.appendChild(resImg);
        }
    } else {
        resources.innerHTML = "keine Rohstoffe";
    }
    
    cards.innerHTML = "";
    if (state.cards.length) {
        for (const card of state.cards) {
            const cardButton = document.createElement('button');
            cardButton.className = "card";
            cardButton.onclick = card.action;
            cardButton.innerHTML = card.title;
            cards.appendChild(cardButton);
        }
    } else {
        cards.innerHTML = "keine Karten";
    }
    
    var points = 0;
    victory.innerHTML = "";
    if (state.towns) {
        victory.innerHTML += state.towns + " Siedlungen (1P)";
        points += state.towns;
    }
    if (state.cities) {
        victory.innerHTML += " + " + state.cities + " Städte (2P)";
        points += 2 * state.cities;
    }
    for (const card of state.victoryCards) {
        victory.innerHTML += " + " + card + " (1P)";
        points += 1;
    }
    
    var maxLength = 4;
    var maxLengthPlayer = null;
    for (const [player, length] of Object.entries(state.longestRoads)) {
        if (length > maxLength) {
            maxLength = length;
            maxLengthPlayer = player;
        }
    }
    
    if (maxLengthPlayer == state.me) {
        victory.innerHTML += " + Längste Handelsstraße (2P)";
        points += 2;
    }
    
    var maxKnights = 2;
    var maxKnightPlayer = null;
    for (const [player, knights] of Object.entries(state.playedKnights)) {
        if (knights > maxKnights) {
            maxKnights = knights;
            maxKnightPlayer = player;
        }
    }
    
    if (maxKnightPlayer == state.me) {
        victory.innerHTML += " + Größte Rittermacht (2P)";
        points += 2;
    }
    
    if (points > 0) {
        victory.innerHTML += " = " + points;
    } else {
        victory.innerHTML = 'keine Punkte';
    }
}
