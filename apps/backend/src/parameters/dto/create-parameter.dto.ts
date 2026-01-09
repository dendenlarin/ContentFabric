import { IsString, IsArray, ArrayMinSize, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateParameterDto {
  @ApiProperty({
    description: 'Уникальное имя параметра (только a-z, 0-9, _)',
    example: 'style',
  })
  @IsString()
  @Matches(/^[a-z][a-z0-9_]*$/, {
    message: 'Имя должно начинаться с буквы и содержать только a-z, 0-9, _',
  })
  name: string;

  @ApiProperty({
    description: 'Массив возможных значений параметра',
    example: ['realistic', 'cartoon', 'abstract'],
    type: [String],
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  values: string[];
}
