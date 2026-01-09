import { IsString, IsArray, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

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
}
