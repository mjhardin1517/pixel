import { Module} from '@nestjs/common'
import { CanvasResolver } from './canvas.resolver.js';
import { CanvasClient } from './canvas.client.js';

@Module({
  providers: [CanvasResolver, CanvasClient]
})
export class CanvasModule {}