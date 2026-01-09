import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ParametersService } from './parameters.service';
import { CreateParameterDto, UpdateParameterDto } from './dto';

@ApiTags('parameters')
@Controller('parameters')
export class ParametersController {
  constructor(private readonly parametersService: ParametersService) {}

  @Post()
  @ApiOperation({ summary: 'Создать новый параметр' })
  @ApiResponse({ status: 201, description: 'Параметр успешно создан' })
  @ApiResponse({ status: 400, description: 'Невалидные данные' })
  @ApiResponse({ status: 409, description: 'Параметр с таким именем уже существует' })
  create(@Body() dto: CreateParameterDto) {
    return this.parametersService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Получить все параметры' })
  @ApiResponse({ status: 200, description: 'Список всех параметров' })
  findAll() {
    return this.parametersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить параметр по ID' })
  @ApiParam({ name: 'id', description: 'MongoDB ObjectId параметра' })
  @ApiResponse({ status: 200, description: 'Найденный параметр' })
  @ApiResponse({ status: 404, description: 'Параметр не найден' })
  findOne(@Param('id') id: string) {
    return this.parametersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновить параметр' })
  @ApiParam({ name: 'id', description: 'MongoDB ObjectId параметра' })
  @ApiResponse({ status: 200, description: 'Параметр успешно обновлен' })
  @ApiResponse({ status: 404, description: 'Параметр не найден' })
  update(@Param('id') id: string, @Body() dto: UpdateParameterDto) {
    return this.parametersService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить параметр' })
  @ApiParam({ name: 'id', description: 'MongoDB ObjectId параметра' })
  @ApiResponse({ status: 200, description: 'Параметр успешно удален' })
  @ApiResponse({ status: 404, description: 'Параметр не найден' })
  remove(@Param('id') id: string) {
    return this.parametersService.remove(id);
  }
}
