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
import { PromptTemplatesService } from './prompt-templates.service';
import { CreatePromptTemplateDto, UpdatePromptTemplateDto } from './dto';

@ApiTags('prompt-templates')
@Controller('prompt-templates')
export class PromptTemplatesController {
  constructor(private readonly promptTemplatesService: PromptTemplatesService) {}

  @Post()
  @ApiOperation({ summary: 'Создать новый шаблон промпта' })
  @ApiResponse({ status: 201, description: 'Шаблон успешно создан' })
  @ApiResponse({ status: 400, description: 'Невалидные данные' })
  create(@Body() dto: CreatePromptTemplateDto) {
    return this.promptTemplatesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Получить все шаблоны' })
  @ApiResponse({ status: 200, description: 'Список всех шаблонов' })
  findAll() {
    return this.promptTemplatesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить шаблон по ID' })
  @ApiParam({ name: 'id', description: 'MongoDB ObjectId шаблона' })
  @ApiResponse({ status: 200, description: 'Найденный шаблон' })
  @ApiResponse({ status: 404, description: 'Шаблон не найден' })
  findOne(@Param('id') id: string) {
    return this.promptTemplatesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновить шаблон' })
  @ApiParam({ name: 'id', description: 'MongoDB ObjectId шаблона' })
  @ApiResponse({ status: 200, description: 'Шаблон успешно обновлен' })
  @ApiResponse({ status: 404, description: 'Шаблон не найден' })
  update(@Param('id') id: string, @Body() dto: UpdatePromptTemplateDto) {
    return this.promptTemplatesService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить шаблон' })
  @ApiParam({ name: 'id', description: 'MongoDB ObjectId шаблона' })
  @ApiResponse({ status: 200, description: 'Шаблон успешно удален' })
  @ApiResponse({ status: 404, description: 'Шаблон не найден' })
  remove(@Param('id') id: string) {
    return this.promptTemplatesService.remove(id);
  }
}
