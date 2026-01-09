import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GeneratedPromptsController } from './generated-prompts.controller';
import { GeneratedPromptsService } from './generated-prompts.service';
import { GeneratedPrompt, GeneratedPromptSchema } from './schemas/generated-prompt.schema';
import { PromptTemplatesModule } from '../prompt-templates/prompt-templates.module';
import { ParametersModule } from '../parameters/parameters.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: GeneratedPrompt.name, schema: GeneratedPromptSchema },
    ]),
    PromptTemplatesModule,
    ParametersModule,
  ],
  controllers: [GeneratedPromptsController],
  providers: [GeneratedPromptsService],
  exports: [GeneratedPromptsService],
})
export class GeneratedPromptsModule {}
