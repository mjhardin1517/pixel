import { Injectable } from '@nestjs/common';
import { PixelOp, PixelOpInput } from './canvas.models.js';

/**
 * CanvasClient is the client for our .NET canvas service.
 */
@Injectable()
export class CanvasClient {
  private readonly baseUrl = process.env.CANVAS_URL ?? 'http://localhost:5286';

  /**
   * Get all the pixels that are currently set for a given canvas ID
   */
  async snapshot(id: string): Promise<PixelOp[]> {
    const res = await fetch(`${this.baseUrl}/canvases/${id}`);
    if (!res.ok) {
      throw new Error(`canvas service snapshot ${res.status}: ${await res.text()}`);
    }
    return res.json();
  }

  /**
   * Mutate pixels for a given canvas ID
   */
  async applyOps(id: string, ops: PixelOpInput[]): Promise<PixelOp[]> {
    const res = await fetch(`${this.baseUrl}/canvases/${id}/ops`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ops),
    });
    if (!res.ok) {
      throw new Error(`canvas service applyOps ${res.status}: ${await res.text()}`);
    }

    return res.json();
  }
}
