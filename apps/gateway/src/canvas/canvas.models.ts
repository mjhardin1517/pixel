/**
 * This file is for defining the graphql data. Input data used in mutations must
 * be kept separate even if they are the same.
 */
import { Field, InputType, Int, ObjectType, ID } from '@nestjs/graphql';

@ObjectType()
export class Stamp {
  /**
   * The arrow function in the decorator is allowing lazy evaluation of types. This
   * solves circular dependency problems via delayed evaluation. It also solves
   * types not being ready due to the order Javascript executes them when loading
   * modules.
   */
  @Field(() => Int) counter: number;
  @Field(() => ID) clientId: string;
}

@ObjectType()
export class PixelOp {
  @Field(() => Int) x: number;
  @Field(() => Int) y: number;
  @Field(() => Int) color: number;
  @Field(() => Stamp) stamp: Stamp;
}

@InputType()
export class StampInput {
  @Field(() => Int) counter: number;
  @Field() clientId: string;
}

@InputType()
export class PixelOpInput {
  @Field(() => Int) x: number;
  @Field(() => Int) y: number;
  @Field(() => Int) color: number;
  @Field(() => StampInput) stamp: StampInput;
}
