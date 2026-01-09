import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PromptTemplatesController } from './prompt-templates.controller';
import { PromptTemplatesService } from './prompt-templates.service';
import { PromptTemplate, PromptTemplateSchema } from './schemas/prompt-template.schema';
import { ParametersModule } from '../parameters/parameters.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PromptTemplate.name, schema: PromptTemplateSchema },
    ]),
    forwardRef(() => ParametersModule),
  ],
  controllers: [PromptTemplatesController],
  providers: [PromptTemplatesService],
  exports: [PromptTemplatesService],
})
export class PromptTemplatesModule {}
