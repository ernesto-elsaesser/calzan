function computeRoadLength() {
    
    const segments = getRoads().map((i) => {
        const [a, b] = state.board[i].nodes;
        const segment = {i, n: 1};
        // clusters can not be joined trough opponent towns
        if (a.player == state.me || a.player == null) {
            segment.a = a;
        }
        if (b.player == state.me || b.player == null) {
            segment.b = b;
        }
        return segment;
    });
    
    var maxLength = 0;
    var cycles = [];
    
    while (segments.length) {
        
        var merged = false;
        const segment = segments.pop();
        for (const other of segments) {
            if (segment.a == other.a) {
                other.a = segment.b;
            } else if (segment.b == other.b) {
                other.b = segment.a;
            } else if (segment.a == other.b) {
                other.b = segment.b;
            } else if (segment.b == other.a) {
                other.a = segment.a;
            } else {
                continue;
            }
            
            other.n += segment.n;
            merged = true;
            break;
        }
        
        if (!merged) {
            if (segment.n > maxLength) {
                maxLength = segment.n;
            }
            if (segment.a == segment.b) {
                cycles.push(segment.i);
            }
        }
    }
    
    if (cycles.length) {
        console.log("CYCLICAL ROADS NOT YET SUPPORTED", cycles);
    }
    
    return maxLength;
}