import { IsString, IsArray, ArrayMinSize, IsOptional, Matches } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateParameterDto {
  @ApiPropertyOptional({
    description: 'Новое имя параметра',
    example: 'color_scheme',
  })
  @IsOptional()
  @IsString()
  @Matches(/^[a-z][a-z0-9_]*$/, {
    message: 'Имя должно начинаться с буквы и содержать только a-z, 0-9, _',
  })
  name?: string;

  @ApiPropertyOptional({
    description: 'Новый массив значений',
    example: ['warm', 'cold', 'neutral'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  values?: string[];
}
