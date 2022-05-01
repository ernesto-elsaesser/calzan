/* 
* length.js
* 
* Contains the (recursive) algorithm to determine the
* longest road on the board for a given player.
*/

function computeRoadLength(player) {
    
    var connections = {};
    var terminals = [];
    
    nodeIds.forEach((node) => {
        
        const connected = [];
        var disrupted = false;
        
        state.board[node].edges.forEach((edge) => {
            const owner = state.board[edge].player;
            if (owner) {
                if (owner == player) {
                    const endpoints = state.board[edge].nodes;
                    const otherNode = endpoints[0] == node ? endpoints[1] : endpoints[0];
                    connected.push(otherNode);
                } else {
                    disrupted = true;
                }
            }
        });
                                        
        if (connected.length > 0) {
            connections[node] = connected;
            if (disrupted || connected.length == 1) {
                terminals.push(node);
            }
        }
    });
    
    var maxLength = 0;
    for (const terminal of terminals) {
        const length = getTailLength(connections, terminals, [terminal]);
        maxLength = Math.max(length, maxLength);
    }
    
    return maxLength;
}

function getTailLength(connections, terminals, path) {
    
    var maxTailLength = 0;
    const node = path[0];
    
    for (const nextNode of connections[node]) {
        if (!path.includes(nextNode) && !terminals.includes(nextNode)) {
            const extPath = [nextNode].concat(path);
            const tailLength = getTailLength(connections, terminals, extPath);
            maxTailLength = Math.max(maxTailLength, tailLength);
        }
    }
    
    return maxTailLength + 1;
}
