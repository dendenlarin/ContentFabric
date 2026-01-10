import { IsString, IsArray, IsOptional, ValidateNested } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { EmbeddedParameterDto } from './create-prompt-template.dto';

export class UpdatePromptTemplateDto {
  @ApiPropertyOptional({
    description: 'Новое название шаблона',
    example: 'Updated Portrait Generator',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Новый текст шаблона',
    example: 'A {{style}} portrait with {{mood}} mood',
  })
  @IsOptional()
  @IsString()
  template?: string;

  @ApiPropertyOptional({
    description: 'Новый список ID параметров',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  parameterIds?: string[];

  @ApiPropertyOptional({
    description: 'Встроенные параметры для обновления вместе с шаблоном',
    type: [EmbeddedParameterDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EmbeddedParameterDto)
  embeddedParameters?: EmbeddedParameterDto[];
}
