'use client';

import React, {useCallback, useEffect, useRef, useState} from 'react';
import {gql, useMutation, useQuery, useSubscription} from "urql";
import {CanvasState, PixelOp} from '@/lib/canvas-state'

const SIZE = 32;
const SCALE = 16;

const CanvasQuery = gql`
    query Canvas($id: String!) {
        canvas(id: $id) {
            x
            y
            color
            stamp {
                counter
                clientId
            }
        }
    }
`

const ApplyOps = gql`
    mutation ApplyOps($canvasId: String!, $ops: [PixelOpInput!]!) {
        applyOps(canvasId: $canvasId, ops: $ops) {
            x
        }
    }
`

const OpsApplied = gql`
    subscription OpsApplied($canvasId: String!) {
        opsApplied(canvasId: $canvasId) {
            x
            y
            color
            stamp {
                counter
                clientId
            }
        }
    }
`

const toHex = (color: number) => `#${color.toString(16).padStart(6, '0')}`

type Props = {
    canvasId: string;
}

type PixelCanvasSubscription = {
    opsApplied: PixelOp[]
}

type PixelCanvasQuery = {
    canvas: PixelOp[]
}

export function PixelCanvas({canvasId}: Props) {
    // We'll use a lot of refs here because we're going to draw the canvas as the data comes over the wire. There's not
    // really a need to create a diff.

    // Init client
    // Mat.random is intentional for now and will have a more proper value later
    const clientId = useRef(Math.random().toString(36).slice(2));
    const counter = useRef(0);

    // Init canvas
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const state = useRef(new CanvasState());

    // Init drawing
    const painting = useRef(false);
    const lastCell = useRef<string | null>(null);
    const [color, setColor] = useState('#000000');

    /**
     * Take an op, turn it to a hex color and draw a rectangle on the canvas at the given position
     */
    const draw = useCallback((op: PixelOp) => {
        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx) return;
        ctx.fillStyle = toHex(op.color);
        ctx.fillRect(op.x * SCALE, op.y * SCALE, SCALE, SCALE);
    }, []);

    /**
     * Manage the stamp then draw
     */
    const receive = useCallback(
        (ops: PixelOp[]) => {
            for (const op of ops) {
                counter.current = Math.max(counter.current, op.stamp.counter);
                if (state.current.apply(op)) draw(op);
            }
        },
        [draw],
    );

    const [snapshot] = useQuery<PixelCanvasQuery>({
        query: CanvasQuery,
        variables: {id: canvasId},
    });

    // Get the initial state of the canvas. Use effect depends on the receive function
    useEffect(() => {
        if (snapshot.data) receive(snapshot.data.canvas);
    }, [snapshot.data, receive]);

    // We could return the result here, by not we are saving the process of react writing differences to the DOM.
    useSubscription<PixelCanvasSubscription>(
        {query: OpsApplied, variables: {canvasId}},
        (_prev, data) => {
            receive(data.opsApplied);
            return data;
        },
    );

    // Create the setter used for updating the remote canvs
    const [, applyOps] = useMutation(ApplyOps);

    const paintAt = (e: React.PointerEvent<HTMLCanvasElement>) => {
        // Get the position on the canvas being drawn to
        const rect = e.currentTarget.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left) / SCALE);
        const y = Math.floor((e.clientY - rect.top) / SCALE);
        if (x < 0 || y < 0 || x >= SIZE || y >= SIZE) return;

        // Record the position of the cell and guard against multiple drag events in the same cell
        const cell = `${x},${y}`;
        if (lastCell.current === cell) return;
        lastCell.current = cell;

        // Increment the counter on the stamp
        counter.current += 1;
        const op: PixelOp = {
            x,
            y,
            // Convert from hex
            color: parseInt(color.slice(1), 16),
            stamp: {
                counter: counter.current,
                clientId: clientId.current,
            },
        };

        // Update the state, return if our update is too old
        if (!state.current.apply(op)) return;
        // Eagerly draw then send the op to the server
        draw(op);
        applyOps({canvasId, ops: [op]})
            .then(res => res.error && console.error(res.error));
    };

    return (
        <div>
            <input type="color" value={color} onChange={(e) => setColor(e.target.value)}/>
            <canvas
                ref={canvasRef}
                width={SIZE * SCALE}
                height={SIZE * SCALE}
                style={{border: '1px solid #ccc', touchAction: 'none'}}
                onPointerDown={(e) => {
                    painting.current = true;
                    lastCell.current = null;
                    e.currentTarget.setPointerCapture(e.pointerId);
                    paintAt(e);
                }}
                onPointerMove={(e) => painting.current && paintAt(e)}
                onPointerUp={() => (painting.current = false)}
            />
        </div>
    );
}
