import { IsString, IsArray, IsOptional, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

// Встроенный параметр для создания вместе с шаблоном
export class EmbeddedParameterDto {
  @ApiProperty({ description: 'Название параметра', example: 'style' })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Значения параметра',
    example: ['realistic', 'cartoon'],
  })
  @IsArray()
  @IsString({ each: true })
  values: string[];
}

export class CreatePromptTemplateDto {
  @ApiProperty({
    description: 'Название шаблона',
    example: 'Portrait Generator',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Текст шаблона с плейсхолдерами {{param_name}}',
    example: 'A {{style}} portrait of a person in {{color}} tones',
  })
  @IsString()
  template: string;

  @ApiPropertyOptional({
    description: 'ID существующих параметров для подстановки в шаблон',
    example: ['507f1f77bcf86cd799439011'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  parameterIds?: string[];

  @ApiPropertyOptional({
    description: 'Встроенные параметры для создания вместе с шаблоном',
    type: [EmbeddedParameterDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EmbeddedParameterDto)
  embeddedParameters?: EmbeddedParameterDto[];
}
