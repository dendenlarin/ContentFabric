import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { GeneratedPromptsService } from './generated-prompts.service';
import { GeneratePromptsDto } from './dto';

@ApiTags('generated-prompts')
@Controller('generated-prompts')
export class GeneratedPromptsController {
  constructor(private readonly generatedPromptsService: GeneratedPromptsService) {}

  @Post('generate')
  @ApiOperation({ summary: 'Сгенерировать промпты из шаблонов' })
  @ApiResponse({ status: 201, description: 'Промпты успешно сгенерированы' })
  @ApiResponse({ status: 400, description: 'Невалидные данные' })
  generate(@Body() dto: GeneratePromptsDto) {
    return this.generatedPromptsService.generate(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Получить все сгенерированные промпты' })
  @ApiQuery({ name: 'templateId', required: false, description: 'Фильтр по ID шаблона' })
  @ApiResponse({ status: 200, description: 'Список промптов' })
  findAll(@Query('templateId') templateId?: string) {
    if (templateId) {
      return this.generatedPromptsService.findByTemplateId(templateId);
    }
    return this.generatedPromptsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить промпт по ID' })
  @ApiParam({ name: 'id', description: 'MongoDB ObjectId промпта' })
  @ApiResponse({ status: 200, description: 'Найденный промпт' })
  @ApiResponse({ status: 404, description: 'Промпт не найден' })
  findOne(@Param('id') id: string) {
    return this.generatedPromptsService.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить промпт' })
  @ApiParam({ name: 'id', description: 'MongoDB ObjectId промпта' })
  @ApiResponse({ status: 200, description: 'Промпт успешно удален' })
  @ApiResponse({ status: 404, description: 'Промпт не найден' })
  remove(@Param('id') id: string) {
    return this.generatedPromptsService.remove(id);
  }
}
