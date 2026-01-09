import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bullmq';
import { ParametersModule } from './parameters/parameters.module';
import { PromptTemplatesModule } from './prompt-templates/prompt-templates.module';
import { GeneratedPromptsModule } from './generated-prompts/generated-prompts.module';
import { GenerationsModule } from './generations/generations.module';
import { GenerationResultsModule } from './generation-results/generation-results.module';
import { QueuesModule } from './queues/queues.module';

@Module({
  imports: [
    MongooseModule.forRoot(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/content_fabric',
    ),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
      },
    }),
    ParametersModule,
    PromptTemplatesModule,
    GeneratedPromptsModule,
    GenerationsModule,
    GenerationResultsModule,
    QueuesModule,
  ],
})
export class AppModule {}
