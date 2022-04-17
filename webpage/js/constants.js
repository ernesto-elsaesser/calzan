const rolls = [2, 3, 3, 4, 4, 4, 5, 5, 5, 5, 6, 6, 6, 6, 6, 7, 7, 7, 7, 7, 7, 8, 8, 8, 8, 8, 9, 9, 9, 9, 10, 10, 10, 11, 11, 12];

const resIndices = [1, 2, 3, 4, 5];
const resNames = ["Sand", "Holz", "Lehm", "Getreide", "Wolle", "Erz"];

const noResources = () => ['R', 0, 0, 0, 0, 0];

const purchaseIndices = [1, 2, 3, 4];
const purchaseCosts = [null, ['R', 1, 1, 0, 0, 0], ['R', 1, 1, 1, 1, 0], ['R', 0, 0, 2, 0, 3], ['R', 0, 0, 1, 1, 1]];
const purchaseNames = [null, "Straße", "Siedlung", "Stadt", "Entwicklungskarte"];
const purchaseActionNames = [null, "Straße bauen", "Siedlung bauen", "Siedlung ausbauen", "Entwicklungskarte kaufen"];

const cardIndices = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25];
const victoryMaxIndex = 5;
const knightMinIndex = 12;
const cardActions = [
    null, null, null, null, null, null,
    "play-roads", "play-roads", "play-monopoly", "play-monopoly", "play-invent", "play-invent",
    'play-knight', 'play-knight', 'play-knight', 'play-knight', 'play-knight', 'play-knight', 'play-knight', 
    'play-knight', 'play-knight', 'play-knight', 'play-knight', 'play-knight', 'play-knight', 'play-knight', 
];
const cardNames = [
    null,
    "Bibliothek", "Marktplatz", "Rathaus", "Kirche", "Universität",
    "Straßenbau", "Straßenbau", "Monopol", "Monopol", "Erfindung", "Erfindung",
    "Ritter", "Ritter", "Ritter", "Ritter", "Ritter", "Ritter", "Ritter", 
    "Ritter", "Ritter", "Ritter", "Ritter", "Ritter", "Ritter", "Ritter", 
];

const landTileIds = [
    'A1', 'A2', 'A3',
    'B1', 'B2', 'B3', 'B4',
    'C1', 'C2', 'C3', 'C4', 'C5',
    'D1', 'D2', 'D3', 'D4',
    'E1', 'E2', 'E3',
];

const nodeIds = [
    'A1A', 'A1B', 'A2A', 'A2B', 'A3A', 'A3B', 'A3C',
    'B1A', 'B1B', 'B2A', 'B2B', 'B3A', 'B3B', 'B4A', 'B4B', 'B4C',
    'C1A', 'C1B', 'C2A', 'C2B', 'C3A', 'C3B', 'C4A', 'C4B', 'C5A', 'C5B', 'C5C', 'C1D',
    'D1A', 'D1B', 'D2A', 'D2B', 'D3A', 'D3B', 'D4A', 'D4B', 'D4C', 'C5F', 'D1D',
    'E1A', 'E1B', 'E2A', 'E2B', 'E3A', 'E3B', 'E3C', 'D4F', 'E1D', 'E1E', 'E2D', 'E2E', 'E3D', 'E3E', 'E3F',
];

const edgeIds = [
    'A1b', 'A1c', 'A2b', 'A2c', 'A3b', 'A3c', 'A1a', 'A2a', 'A3a', 'A3f',
    'B1b', 'B1c', 'B2b', 'B2c', 'B3b', 'B3c', 'B4b', 'B4c', 'B1a', 'B2a', 'B3a', 'B4a', 'B4f', 'C1b',
    'C1c', 'C2b', 'C2c', 'C3b', 'C3c', 'C4b', 'C4c', 'C5b', 'C5c', 'C1a', 'C2a', 'C3a', 'C4a', 'C5a', 'C5f', 'C1d',
    'D1b', 'D1c', 'D2b', 'D2c', 'D3b', 'D3c', 'D4b', 'D4c', 'C5e', 'D1a', 'D2a', 'D3a', 'D4a', 'D4f', 'D1d',
    'E1b', 'E1c', 'E2b', 'E2c', 'E3b', 'E3c', 'D4e', 'E1a', 'E2a', 'E3a', 'E3f', 'E1d', 'E1e', 'E2d', 'E2e', 'E3d', 'E3e',
];

const hexaPath = "M-81,0 L-81,48 L0,96 L81,48 L81,-48 L0,-96 L-81,-48 L-81,0";

const tileColor = '#FFFFC0';
const resColors = ['#EBE3B0', '#6E9B3C', '#DF9327', '#EFDA61', '#AEE670', '#A4A296', '#2D2F6C'];
const resStrokeColors = ['#D8CC8B', '#4F702A', '#A87325', '#CCB94C', '#89C852', '#7F7E74', '#2D2F6C'];