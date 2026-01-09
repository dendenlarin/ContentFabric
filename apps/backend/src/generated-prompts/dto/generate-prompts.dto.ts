import { IsArray, ArrayMinSize, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GeneratePromptsDto {
  @ApiProperty({
    description: 'ID шаблонов для генерации промптов',
    example: ['507f1f77bcf86cd799439011'],
    type: [String],
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  templateIds: string[];
}
