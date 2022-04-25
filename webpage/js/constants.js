const rolls = [2, 3, 3, 4, 4, 4, 5, 5, 5, 5, 6, 6, 6, 6, 6, 7, 7, 7, 7, 7, 7, 8, 8, 8, 8, 8, 9, 9, 9, 9, 10, 10, 10, 11, 11, 12];

const resIndices = [1, 2, 3, 4, 5];
const resNames = ["Sand", "Holz", "Lehm", "Getreide", "Wolle", "Erz"];
const resTiles = [0, 1, 1, 1, 1, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5];

const tileRolls = [5, 2, 6, 3, 8, 10, 9, 12, 11, 4, 8, 10, 9, 4, 5, 6, 3, 11];
const tileRollIds = ['A3', 'A2', 'A1', 'B1', 'C1', 'D1', 'E1', 'E2', 'E3', 'D4', 'C5', 'B4', 'B3', 'B2', 'C2', 'D2', 'D3', 'C4', 'C3'];

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

const oceanTileIds = [
    "O1", "O2", "O3", "O4", "O5", "O6",
    "O7", "O8", "O9", "O10", "O11", "O12",
    "O13", "O14", "O15", "O16", "O17", "O18",
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
// replace styling tiles from presentation attributes to a tile-specific class
const tileClasses = ['tile_desert', 'tile_lumber', 'tile_brick', 'tile_grain', 'tile_wool', 'tile_ore', 'tile_water']
const resColors = ['#EBE3B0', '#6E9B3C', '#DF9327', '#EFDA61', '#AEE670', '#A4A296', '#2D2F6C'];

const boardTemplate = {
    "O1": {"v": -6, "h": -6, "tile": true, "land": 6, "rate": 3},
    "O2": {"v": -6, "h": -2, "tile": true, "land": 6},
    "O3": {"v": -6, "h": 2, "tile": true, "land": 6, "rate": 2, "trade": 4},
    "O4": {"v": -6, "h": 6, "tile": true, "land": 6},
    "O5": {"v": -4, "h": 8, "tile": true, "land": 6, "rate": 3},
    "O6": {"v": -2, "h": 10, "tile": true, "land": 6},
    "O7": {"v": 0, "h": 12, "tile": true, "land": 6, "rate": 3},
    "O8": {"v": 2, "h": 10, "tile": true, "land": 6},
    "O9": {"v": 4, "h": 8, "tile": true, "land": 6, "rate": 2, "trade": 2},
    "O10": {"v": 6, "h": 6, "tile": true, "land": 6},
    "O11": {"v": 6, "h": 2, "tile": true, "land": 6, "rate": 2, "trade": 1},
    "O12": {"v": 6, "h": -2, "tile": true, "land": 6},
    "O13": {"v": 6, "h": -6, "tile": true, "land": 6, "rate": 3},
    "O14": {"v": 4, "h": -8, "tile": true, "land": 6},
    "O15": {"v": 2, "h": -10, "tile": true, "land": 6, "rate": 2, "trade": 3},
    "O16": {"v": 0, "h": -12, "tile": true, "land": 6},
    "O17": {"v": -2, "h": -10, "tile": true, "land": 6, "rate": 2, "trade": 5},
    "O18": {"v": -4, "h": -8, "tile": true, "land": 6},
    
    "A1A": {"v": -5, "h": -6, "node": true, "shift": 1, "route": "O1", "port": 0, "edges": ["A1a", "A1b"], "tiles": ["A1"]},
    "A1b": {"v": -5, "h": -5, "edge": true, "dir": 60, "nodes": ["A1A", "A1B"]},
    "A1B": {"v": -5, "h": -4, "node": true, "shift": -1, "route": "O1", "port": 300, "edges": ["A1b", "A1c"], "tiles": ["A1"]},
    "A1c": {"v": -5, "h": -3, "edge": true, "dir": -60, "nodes": ["A2A", "A1B"]},
    "A2A": {"v": -5, "h": -2, "node": true, "shift": 1, "edges": ["A2a", "A2b", "A1c"], "tiles": ["A1", "A2"]},
    "A2b": {"v": -5, "h": -1, "edge": true, "dir": 60, "nodes": ["A2A", "A2B"]},
    "A2B": {"v": -5, "h": 0, "node": true, "shift": -1, "route": "O3", "port": 60, "edges": ["A2b", "A2c"], "tiles": ["A2"]},
    "A2c": {"v": -5, "h": 1, "edge": true, "dir": -60, "nodes": ["A3A", "A2B"]},
    "A3A": {"v": -5, "h": 2, "node": true, "shift": 1, "route": "O3", "port": 0, "edges": ["A3a", "A3b", "A2c"], "tiles": ["A2", "A3"]},
    "A3b": {"v": -5, "h": 3, "edge": true, "dir": 60, "nodes": ["A3A", "A3B"]},
    "A3B": {"v": -5, "h": 4, "node": true, "shift": -1, "edges": ["A3b", "A3c"], "tiles": ["A3"]},
    "A3c": {"v": -5, "h": 5, "edge": true, "dir": -60, "nodes": ["A3C", "A3B"]},
    "A3C": {"v": -5, "h": 6, "node": true, "shift": 1, "edges": ["A3c", "A3f"], "tiles": ["A3"]},
    
    "A1a": {"v": -4, "h": -6, "edge": true, "dir": 0, "nodes": ["B1B", "A1A"]},
    "A1": {"v": -4, "h": -4, "tile": true, "land": 1, "roll": 6, "nodes": ["A1A", "A1B", "A2A", "B2B", "B2A", "B1B"]},
    "A2a": {"v": -4, "h": -2, "edge": true, "dir": 0, "nodes": ["B2B", "A2A"]},
    "A2": {"v": -4, "h": 0, "tile": true, "land": 4, "roll": 3, "nodes": ["A2A", "A2B", "A3A", "B3B", "B3A", "B2B"]},
    "A3a": {"v": -4, "h": 2, "edge": true, "dir": 0, "nodes": ["B3B", "A3A"]},
    "A3": {"v": -4, "h": 4, "tile": true, "land": 4, "roll": 8, "nodes": ["A3A", "A3B", "A3C", "B4B", "B4A", "B3B"]},
    "A3f": {"v": -4, "h": 6, "edge": true, "dir": 0, "nodes": ["B4B", "A3C"]},

    "B1A": {"v": -3, "h": -8, "node": true, "shift": 1, "route": "O17", "port": 240, "edges": ["B1a", "B1b"], "tiles": ["B1"]},
    "B1b": {"v": -3, "h": -7, "edge": true, "dir": 60, "nodes": ["B1A", "B1B"]},
    "B1B": {"v": -3, "h": -6, "node": true, "shift": -1, "edges": ["B1b", "B1c", "A1a"], "tiles": ["B1", "A1"]},
    "B1c": {"v": -3, "h": -5, "edge": true, "dir": -60, "nodes": ["B1B", "B2A"]},
    "B2A": {"v": -3, "h": -4, "node": true, "shift": 1, "edges": ["B1c", "B2a", "B2b"], "tiles": ["B1", "B2", "A1"]},
    "B2b": {"v": -3, "h": -3, "edge": true, "dir": 60, "nodes": ["B2A", "B2B"]},
    "B2B": {"v": -3, "h": -2, "node": true, "shift": -1, "edges": ["B2b", "B2c", "A2a"], "tiles": ["B2", "A1", "A2"]},
    "B2c": {"v": -3, "h": -1, "edge": true, "dir": -60, "nodes": ["B2B", "B3A"]},
    "B3A": {"v": -3, "h": 0, "node": true, "shift": 1, "edges": ["B2c", "B3b", "B3a"], "tiles": ["B2", "A2", "B3"]},
    "B3b": {"v": -3, "h": 1, "edge": true, "dir": 60, "nodes": ["B3A", "B3B"]},
    "B3B": {"v": -3, "h": 2, "node": true, "shift": -1, "edges": ["B3b", "B3c", "A3a"], "tiles": ["A2", "B3", "A3"]},
    "B3c": {"v": -3, "h": 3, "edge": true, "dir": -60, "nodes": ["B3B", "B4A"]},
    "B4A": {"v": -3, "h": 4, "node": true, "shift": 1, "edges": ["B3c", "B4b", "B4a"], "tiles": ["B3", "A3", "B4"]},
    "B4b": {"v": -3, "h": 5, "edge": true, "dir": 60, "nodes": ["B4A", "B4B"]},
    "B4B": {"v": -3, "h": 6, "node": true, "shift": -1, "route": "O5", "port": 60, "edges": ["B4b", "B4c", "A3f"], "tiles": ["A3", "B4"]},
    "B4c": {"v": -3, "h": 7, "edge": true, "dir": -60, "nodes": ["B4B", "B4C"]},
    "B4C": {"v": -3, "h": 8, "node": true, "shift": 1, "route": "O5", "port": 0, "edges": ["B4c", "B4f"], "tiles": ["B4"]},

    "B1a": {"v": -2, "h": -8, "edge": true, "dir": 0, "nodes": ["C1B", "B1A"]},
    "B1": {"v": -2, "h": -6, "tile": true, "land": 3, "roll": 2, "nodes": ["B1A", "B1B", "B2A", "C2B", "C2A", "C1B"]},
    "B2a": {"v": -2, "h": -4, "edge": true, "dir": 0, "nodes": ["C2B", "B2A"]},
    "B2": {"v": -2, "h": -2, "tile": true, "land": 5, "roll": 4, "nodes": ["B2A", "B2B", "B3A", "C3B", "C3A", "C2B"]},
    "B3a": {"v": -2, "h": 0, "edge": true, "dir": 0, "nodes": ["C3B", "B3A"]},
    "B3": {"v": -2, "h": 2, "tile": true, "land": 3, "roll": 5, "nodes": ["B3A", "B3B", "B4A", "C4B", "C4A", "C3B"]},
    "B4a": {"v": -2, "h": 4, "edge": true, "dir": 0, "nodes": ["C4B", "B4A"]},
    "B4": {"v": -2, "h": 6, "tile": true, "land": 1, "roll": 10, "nodes": ["B4A", "B4B", "B4C", "C5B", "C5A", "C4B"]},
    "B4f": {"v": -2, "h": 8, "edge": true, "dir": 0, "nodes": ["C5B", "B4C"]},
    
    "C1A": {"v": -1, "h": -10, "node": true, "shift": 1, "edges": ["C1a", "C1b"], "tiles": ["C1"]},
    "C1b": {"v": -1, "h": -9, "edge": true, "dir": 60, "nodes": ["C1A", "C1B"]},
    "C1B": {"v": -1, "h": -8, "node": true, "shift": -1, "route": "O17", "port": 300, "edges": ["C1b", "C1c", "B1a"], "tiles": ["C1", "B1"]},
    "C1c": {"v": -1, "h": -7, "edge": true, "dir": -60, "nodes": ["C1B", "C2A"]},
    "C2A": {"v": -1, "h": -6, "node": true, "shift": 1, "edges": ["C1c", "C2b", "C2a"], "tiles": ["C1", "B1", "C2"]},
    "C2b": {"v": -1, "h": -5, "edge": true, "dir": 60, "nodes": ["C2A", "C2B"]},
    "C2B": {"v": -1, "h": -4, "node": true, "shift": -1, "edges": ["C2b", "C2c", "B2a"], "tiles": ["B1", "C2", "B2"]},
    "C2c": {"v": -1, "h": -3, "edge": true, "dir": -60, "nodes": ["C2B", "C3A"]},
    "C3A": {"v": -1, "h": -2, "node": true, "shift": 1, "edges": ["C2c", "C3b", "C3a"], "tiles": ["C2", "B2", "C3"]},
    "C3b": {"v": -1, "h": -1, "edge": true, "dir": 60, "nodes": ["C3A", "C3B"]},
    "C3B": {"v": -1, "h": 0, "node": true, "shift": -1, "edges": ["C3b", "C3c", "B3a"], "tiles": ["B2", "C3", "B3"]},
    "C3c": {"v": -1, "h": 1, "edge": true, "dir": -60, "nodes": ["C3B", "C4A"]},
    "C4A": {"v": -1, "h": 2, "node": true, "shift": 1, "edges": ["C3c", "C4b", "C4a"], "tiles": ["C3", "B3", "C4"]},
    "C4b": {"v": -1, "h": 3, "edge": true, "dir": 60, "nodes": ["C4A", "C4B"]},
    "C4B": {"v": -1, "h": 4, "node": true, "shift": -1, "edges": ["C4b", "C4c", "B4a"], "tiles": ["B3", "C4", "B4"]},
    "C4c": {"v": -1, "h": 5, "edge": true, "dir": -60, "nodes": ["C4B", "C5A"]},
    "C5A": {"v": -1, "h": 6, "node": true, "shift": 1, "edges": ["C4c", "C5b", "C5a"], "tiles": ["C4", "B4", "C5"]},
    "C5b": {"v": -1, "h": 7, "edge": true, "dir": 60, "nodes": ["C5A", "C5B"]},
    "C5B": {"v": -1, "h": 8, "node": true, "shift": -1, "edges": ["C5b", "C5c", "B4f"], "tiles": ["B4", "C5"]},
    "C5c": {"v": -1, "h": 9, "edge": true, "dir": -60, "nodes": ["C5B", "C5C"]},
    "C5C": {"v": -1, "h": 10, "node": true, "shift": 1, "route": "O7", "port": 120, "edges": ["C5c", "C5f"], "tiles": ["C5"]},
    
    "C1a": {"v": 0, "h": -10, "edge": true, "dir": 0, "nodes": ["C1D", "C1A"]},
    "C1": {"v": 0, "h": -8, "tile": true, "land": 1, "roll": 5, "nodes": ["C1A", "C1B", "C2A", "D1B", "D1A", "C1D"]},
    "C2a": {"v": 0, "h": -6, "edge": true, "dir": 0, "nodes": ["D1B", "C2A"]},
    "C2": {"v": 0, "h": -4, "tile": true, "land": 2, "roll": 9, "nodes": ["C2A", "C2B", "C3A", "D2B", "D2A", "D1B"]},
    "C3a": {"v": 0, "h": -2, "edge": true, "dir": 0, "nodes": ["D2B", "C3A"]},
    "C3": {"v": 0, "h": 0, "tile": true, "land": 0, "nodes": ["C3A", "C3B", "C4A", "D3B", "D3A", "D2B"]},
    "C4a": {"v": 0, "h": 2, "edge": true, "dir": 0, "nodes": ["D3B", "C4A"]},
    "C4": {"v": 0, "h": 4, "tile": true, "land": 5, "roll": 6, "nodes": ["C4A", "C4B", "C5A", "D4B", "D4A", "D3B"]},
    "C5a": {"v": 0, "h": 6, "edge": true, "dir": 0, "nodes": ["D4B", "C5A"]},
    "C5": {"v": 0, "h": 8, "tile": true, "land": 3, "roll": 9, "nodes": ["C5A", "C5B", "C5C", "C5F", "D4C", "D4B"]},
    "C5f": {"v": 0, "h": 10, "edge": true, "dir": 0, "nodes": ["C5F", "C5C"]},
    
    "C1D": {"v": 1, "h": -10, "node": true, "shift": -1, "edges": ["C1a", "C1d"], "tiles": ["C1"]},
    "C1d": {"v": 1, "h": -9, "edge": true, "dir": -60, "nodes": ["C1D", "D1A"]},
    "D1A": {"v": 1, "h": -8, "node": true, "shift": 1, "route": "O15", "port": 240, "edges": ["C1d", "D1b", "D1a"], "tiles": ["C1", "D1"]},
    "D1b": {"v": 1, "h": -7, "edge": true, "dir": 60, "nodes": ["D1A", "D1B"]},
    "D1B": {"v": 1, "h": -6, "node": true, "shift": -1, "edges": ["D1b", "D1c", "C2a"], "tiles": ["C1", "D1", "C2"]},
    "D1c": {"v": 1, "h": -5, "edge": true, "dir": -60, "nodes": ["D1B", "D2A"]},
    "D2A": {"v": 1, "h": -4, "node": true, "shift": 1, "edges": ["D1c", "D2b", "D2a"], "tiles": ["D1", "C2", "D2"]},
    "D2b": {"v": 1, "h": -3, "edge": true, "dir": 60, "nodes": ["D2A", "D2B"]},
    "D2B": {"v": 1, "h": -2, "node": true, "shift": -1, "edges": ["D2b", "D2c", "C3a"], "tiles": ["C2", "D2", "C3"]},
    "D2c": {"v": 1, "h": -1, "edge": true, "dir": -60, "nodes": ["D2B", "D3A"]},
    "D3A": {"v": 1, "h": 0, "node": true, "shift": 1, "edges": ["D2c", "D3b", "D3a"], "tiles": ["D2", "C3", "D3"]},
    "D3b": {"v": 1, "h": 1, "edge": true, "dir": 60, "nodes": ["D3A", "D3B"]},
    "D3B": {"v": 1, "h": 2, "node": true, "shift": -1, "edges": ["D3b", "D3c", "C4a"], "tiles": ["C3", "D3", "C4"]},
    "D3c": {"v": 1, "h": 3, "edge": true, "dir": -60, "nodes": ["D3B", "D4A"]},
    "D4A": {"v": 1, "h": 4, "node": true, "shift": 1, "edges": ["D3c", "D4b", "D4a"], "tiles": ["D3", "C4", "D4"]},
    "D4b": {"v": 1, "h": 5, "edge": true, "dir": 60, "nodes": ["D4A", "D4B"]},
    "D4B": {"v": 1, "h": 6, "node": true, "shift": -1, "edges": ["D4b", "D4c", "C5a"], "tiles": ["C4", "D4", "C5"]},
    "D4c": {"v": 1, "h": 7, "edge": true, "dir": -60, "nodes": ["D4B", "D4C"]},
    "D4C": {"v": 1, "h": 8, "node": true, "shift": 1, "edges": ["D4c", "C5e", "D4f"], "tiles": ["D4", "C5"]},
    "C5e": {"v": 1, "h": 9, "edge": true, "dir": 60, "nodes": ["D4C", "C5F"]},
    "C5F": {"v": 1, "h": 10, "node": true, "shift": -1, "route": "O7", "port": 60, "edges": ["C5e", "C5f"], "tiles": ["C5"]},

    "D1a": {"v": 2, "h": -8, "edge": true, "dir": 0, "nodes": ["D1D", "D1A"]},
    "D1": {"v": 2, "h": -6, "tile": true, "land": 3, "roll": 10, "nodes": ["D1A", "D1B", "D2A", "E1B", "E1A", "D1D"]},
    "D2a": {"v": 2, "h": -4, "edge": true, "dir": 0, "nodes": ["E1B", "D2A"]},
    "D2": {"v": 2, "h": -2, "tile": true, "land": 5, "roll": 11, "nodes": ["D2A", "D2B", "D3A", "E2B", "E2A", "E1B"]},
    "D3a": {"v": 2, "h": 0, "edge": true, "dir": 0, "nodes": ["E2B", "D3A"]},
    "D3": {"v": 2, "h": 2, "tile": true, "land": 1, "roll": 3, "nodes": ["D3A", "D3B", "D4A", "E3B", "E3A", "E2B"]},
    "D4a": {"v": 2, "h": 4, "edge": true, "dir": 0, "nodes": ["E3B", "D4A"]},
    "D4": {"v": 2, "h": 6, "tile": true, "land": 4, "roll": 12, "nodes": ["D4A", "D4B", "D4C", "D4F", "E3C", "E3B"]},
    "D4f": {"v": 2, "h": 8, "edge": true, "dir": 0, "nodes": ["D4F", "D4C"]},
    
    "D1D": {"v": 3, "h": -8, "node": true, "shift": -1, "route": "O15", "port": 300, "edges": ["D1a", "D1d"], "tiles": ["D1"]},
    "D1d": {"v": 3, "h": -7, "edge": true, "dir": -60, "nodes": ["D1D", "E1A"]},
    "E1A": {"v": 3, "h": -6, "node": true, "shift": 1, "edges": ["D1d", "E1b", "E1a"], "tiles": ["D1", "E1"]},
    "E1b": {"v": 3, "h": -5, "edge": true, "dir": 60, "nodes": ["E1A", "E1B"]},
    "E1B": {"v": 3, "h": -4, "node": true, "shift": -1, "edges": ["E1b", "E1c", "D2a"], "tiles": ["D1", "E1", "D2"]},
    "E1c": {"v": 3, "h": -3, "edge": true, "dir": -60, "nodes": ["E1B", "E2A"]},
    "E2A": {"v": 3, "h": -2, "node": true, "shift": 1, "edges": ["E1c", "E2b", "E2a"], "tiles": ["E1", "D2", "E2"]},
    "E2b": {"v": 3, "h": -1, "edge": true, "dir": 60, "nodes": ["E2A", "E2B"]},
    "E2B": {"v": 3, "h": 0, "node": true, "shift": -1, "edges": ["E2b", "E2c", "D3a"], "tiles": ["D2", "E2", "D3"]},
    "E2c": {"v": 3, "h": 1, "edge": true, "dir": -60, "nodes": ["E2B", "E3A"]},
    "E3A": {"v": 3, "h": 2, "node": true, "shift": 1, "edges": ["E2c", "E3b", "E3a"], "tiles": ["E2", "D3", "E3"]},
    "E3b": {"v": 3, "h": 3, "edge": true, "dir": 60, "nodes": ["E3A", "E3B"]},
    "E3B": {"v": 3, "h": 4, "node": true, "shift": -1, "edges": ["E3b", "E3c", "D4a"], "tiles": ["D3", "E3", "D4"]},
    "E3c": {"v": 3, "h": 5, "edge": true, "dir": -60, "nodes": ["E3B", "E3C"]},
    "E3C": {"v": 3, "h": 6, "node": true, "shift": 1, "route": "O9", "port": 120, "edges": ["E3c", "D4e", "E3f"], "tiles": ["E3", "D4"]},
    "D4e": {"v": 3, "h": 7, "edge": true, "dir": 60, "nodes": ["E3C", "D4F"]},
    "D4F": {"v": 3, "h": 8, "node": true, "shift": -1, "route": "O9", "port": 180, "edges": ["D4e", "D4f"], "tiles": ["D4"]},
    
    "E1a": {"v": 4, "h": -6, "edge": true, "dir": 0, "nodes": ["E1D", "E1A"]},
    "E1": {"v": 4, "h": -4, "tile": true, "land": 2, "roll": 8, "nodes": ["E1A", "E1B", "E2A", "E2D", "E1E", "E1D"]},
    "E2a": {"v": 4, "h": -2, "edge": true, "dir": 0, "nodes": ["E2D", "E2A"]},
    "E2": {"v": 4, "h": 0, "tile": true, "land": 4, "roll": 4, "nodes": ["E2A", "E2B", "E3A", "E3D", "E2E", "E2D"]},
    "E3a": {"v": 4, "h": 2, "edge": true, "dir": 0, "nodes": ["E3D", "E3A"]},
    "E3": {"v": 4, "h": 4, "tile": true, "land": 2, "roll": 11, "nodes": ["E3A", "E3B", "E3C", "E3F", "E3E", "E3D"]},
    "E3f": {"v": 4, "h": 6, "edge": true, "dir": 0, "nodes": ["E3F", "E3C"]},
    
    "E1D": {"v": 5, "h": -6, "node": true, "shift": -1, "route": "O13", "port": 180, "edges": ["E1a", "E1d"], "tiles": ["E1"]},
    "E1d": {"v": 5, "h": -5, "edge": true, "dir": -60, "nodes": ["E1D", "E1E"]},
    "E1E": {"v": 5, "h": -4, "node": true, "shift": 1, "route": "O13", "port": 240, "edges": ["E1d", "E1e"], "tiles": ["E1"]},
    "E1e": {"v": 5, "h": -3, "edge": true, "dir": 60, "nodes": ["E1E", "E2D"]},
    "E2D": {"v": 5, "h": -2, "node": true, "shift": -1, "edges": ["E1e", "E2d", "E2a"], "tiles": ["E1", "E2"]},
    "E2d": {"v": 5, "h": -1, "edge": true, "dir": -60, "nodes": ["E2D", "E2E"]},
    "E2E": {"v": 5, "h": 0, "node": true, "shift": 1, "route": "O11", "port": 120, "edges": ["E2d", "E2e"], "tiles": ["E2"]},
    "E2e": {"v": 5, "h": 1, "edge": true, "dir": 60, "nodes": ["E2E", "E3D"]},
    "E3D": {"v": 5, "h": 2, "node": true, "shift": -1, "route": "O11", "port": 180, "edges": ["E2e", "E3d", "E3a"], "tiles": ["E2", "E3"]},
    "E3d": {"v": 5, "h": 3, "edge": true, "dir": -60, "nodes": ["E3D", "E3E"]},
    "E3E": {"v": 5, "h": 4, "node": true, "shift": 1, "edges": ["E3d", "E3e"], "tiles": ["E3"]},
    "E3e": {"v": 5, "h": 5, "edge": true, "dir": 60, "nodes": ["E3E", "E3F"]},
    "E3F": {"v": 5, "h": 6, "node": true, "shift": -1, "edges": ["E3e", "E3f"], "tiles": ["E3"]}
};