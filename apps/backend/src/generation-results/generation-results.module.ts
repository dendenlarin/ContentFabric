import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GenerationResultsController } from './generation-results.controller';
import { GenerationResultsService } from './generation-results.service';
import { GenerationResult, GenerationResultSchema } from './schemas/generation-result.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: GenerationResult.name, schema: GenerationResultSchema },
    ]),
  ],
  controllers: [GenerationResultsController],
  providers: [GenerationResultsService],
  exports: [GenerationResultsService],
})
export class GenerationResultsModule {}
