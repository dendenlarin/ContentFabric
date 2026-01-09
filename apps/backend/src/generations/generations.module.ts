import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bullmq';
import { GenerationsController } from './generations.controller';
import { GenerationsService } from './generations.service';
import { Generation, GenerationSchema } from './schemas/generation.schema';
import { GeneratedPromptsModule } from '../generated-prompts/generated-prompts.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Generation.name, schema: GenerationSchema }]),
    BullModule.registerQueue({ name: 'generation' }),
    GeneratedPromptsModule,
  ],
  controllers: [GenerationsController],
  providers: [GenerationsService],
  exports: [GenerationsService],
})
export class GenerationsModule {}
