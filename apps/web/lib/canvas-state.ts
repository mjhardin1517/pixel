/**
 * This file is a client side reprise of what we have in the canvas service
 */

export type Stamp = {
    counter: number;
    clientId: string
}

export type PixelOp = {
    x: number;
    y: number;
    color: number;
    stamp: Stamp
}

export function compareStamps(a: Stamp, b: Stamp): number {
    if (a.counter !== b.counter) {
        return a.counter - b.counter;
    }

    return a.clientId < b.clientId ? -1 : a.clientId > b.clientId ? 1 : 0;
}

export class CanvasState {
    private pixels = new Map<string, PixelOp>();

    apply(op: PixelOp): boolean {
        const { x, y, stamp } = op;
        const key = `${x},${y}`
        const current = this.pixels.get(key);
        if (current && compareStamps(stamp, current.stamp) <= 0) return false

        this.pixels.set(key, op);
        return true;
    }
}