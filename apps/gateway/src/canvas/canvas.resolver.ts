import { Args, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';
import { CanvasClient } from './canvas.client.js';
import { PixelOp, PixelOpInput } from './canvas.models.js';

const pubsub = new PubSub();
const topic = (canvasId: string) => `ops.${canvasId}`;

/** Resolver is like a controller for a REST API */
@Resolver()
export class CanvasResolver {
  constructor(private readonly client: CanvasClient) {}

  @Query(() => [PixelOp])
  canvas(@Args('id') id: string) {
    return this.client.snapshot(id);
  }

  @Mutation(() => [PixelOp])
  async applyOps(
    @Args('canvasId') canvasId: string,
    @Args({ name: 'ops', type: () => [PixelOpInput]}) ops: PixelOpInput[],
  ) {
    const accepted = await this.client.applyOps(canvasId, ops);
    if (accepted.length > 0) {
      await pubsub.publish(topic(canvasId), { opsApplied: accepted})
    }
    return accepted;
  }

  @Subscription(() => [PixelOp])
  opsApplied(@Args('canvasId') canvasId: string) {
    return pubsub.asyncIterableIterator(topic(canvasId));
  }
}
