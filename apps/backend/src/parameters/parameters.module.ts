import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ParametersController } from './parameters.controller';
import { ParametersService } from './parameters.service';
import { Parameter, ParameterSchema } from './schemas/parameter.schema';
import {
  PromptTemplate,
  PromptTemplateSchema,
} from '../prompt-templates/schemas/prompt-template.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Parameter.name, schema: ParameterSchema },
      { name: PromptTemplate.name, schema: PromptTemplateSchema },
    ]),
  ],
  controllers: [ParametersController],
  providers: [ParametersService],
  exports: [ParametersService],
})
export class ParametersModule {}
