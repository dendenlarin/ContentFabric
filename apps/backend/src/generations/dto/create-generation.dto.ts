import {
  IsString,
  IsArray,
  ArrayMinSize,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GenerationSettingsDto {
  @ApiPropertyOptional({
    description: 'Соотношение сторон изображения',
    example: '16:9',
  })
  @IsOptional()
  @IsString()
  aspectRatio?: string;

  @ApiPropertyOptional({
    description: 'Негативный промпт (что исключить)',
    example: 'blurry, low quality, distorted',
  })
  @IsOptional()
  @IsString()
  negativePrompt?: string;
}

export class CreateGenerationDto {
  @ApiProperty({
    description: 'Название задачи генерации',
    example: 'Portrait Batch #1',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'ID сгенерированных промптов для обработки',
    example: ['507f1f77bcf86cd799439011'],
    type: [String],
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  promptIds: string[];

  @ApiProperty({
    description: 'ID модели генерации',
    example: 'stable-diffusion-xl-1024-v1-0',
  })
  @IsString()
  modelId: string;

  @ApiProperty({
    description: 'Провайдер генерации',
    example: 'stability-ai',
  })
  @IsString()
  provider: string;

  @ApiPropertyOptional({
    description: 'Дополнительные настройки генерации',
    type: GenerationSettingsDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => GenerationSettingsDto)
  settings?: GenerationSettingsDto;
}
