import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { GenerationsService } from './generations.service';
import { CreateGenerationDto } from './dto';

@ApiTags('generations')
@Controller('generations')
export class GenerationsController {
  constructor(private readonly generationsService: GenerationsService) {}

  @Post()
  @ApiOperation({ summary: 'Создать новую задачу генерации' })
  @ApiResponse({ status: 201, description: 'Задача успешно создана' })
  @ApiResponse({ status: 400, description: 'Невалидные данные' })
  create(@Body() dto: CreateGenerationDto) {
    return this.generationsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Получить все задачи генерации' })
  @ApiResponse({ status: 200, description: 'Список всех задач' })
  findAll() {
    return this.generationsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить задачу по ID с прогрессом' })
  @ApiParam({ name: 'id', description: 'MongoDB ObjectId задачи' })
  @ApiResponse({ status: 200, description: 'Задача с информацией о прогрессе' })
  @ApiResponse({ status: 404, description: 'Задача не найдена' })
  async findOne(@Param('id') id: string) {
    const generation = await this.generationsService.findOne(id);
    return {
      ...generation.toObject(),
      progress: this.generationsService.getProgress(generation),
    };
  }

  @Post(':id/start')
  @ApiOperation({ summary: 'Запустить генерацию' })
  @ApiParam({ name: 'id', description: 'MongoDB ObjectId задачи' })
  @ApiResponse({ status: 200, description: 'Генерация запущена' })
  @ApiResponse({ status: 404, description: 'Задача не найдена' })
  @ApiResponse({ status: 400, description: 'Задача уже запущена или завершена' })
  start(@Param('id') id: string) {
    return this.generationsService.start(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить задачу генерации' })
  @ApiParam({ name: 'id', description: 'MongoDB ObjectId задачи' })
  @ApiResponse({ status: 200, description: 'Задача успешно удалена' })
  @ApiResponse({ status: 404, description: 'Задача не найдена' })
  remove(@Param('id') id: string) {
    return this.generationsService.remove(id);
  }
}
