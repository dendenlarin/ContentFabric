import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { GenerationProcessor } from './generation.processor';
import { GenerationsModule } from '../generations/generations.module';
import { GenerationResultsModule } from '../generation-results/generation-results.module';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'generation' }),
    GenerationsModule,
    GenerationResultsModule,
  ],
  providers: [GenerationProcessor],
})
export class QueuesModule {}
