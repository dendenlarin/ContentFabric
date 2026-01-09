import { Controller, Get, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { GenerationResultsService } from './generation-results.service';

@ApiTags('generation-results')
@Controller('generation-results')
export class GenerationResultsController {
  constructor(private readonly resultsService: GenerationResultsService) {}

  @Get()
  @ApiOperation({ summary: 'Получить результаты генерации с пагинацией' })
  @ApiQuery({ name: 'generationId', required: true, description: 'ID задачи генерации' })
  @ApiQuery({ name: 'page', required: false, description: 'Номер страницы (по умолчанию 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Количество на странице (по умолчанию 20)' })
  @ApiResponse({ status: 200, description: 'Пагинированный список результатов' })
  async findByGeneration(
    @Query('generationId') generationId: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    const { items, total } = await this.resultsService.findByGenerationId(
      generationId,
      parseInt(page, 10),
      parseInt(limit, 10),
    );

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    return {
      items,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить результат по ID' })
  @ApiParam({ name: 'id', description: 'MongoDB ObjectId результата' })
  @ApiResponse({ status: 200, description: 'Найденный результат' })
  @ApiResponse({ status: 404, description: 'Результат не найден' })
  findOne(@Param('id') id: string) {
    return this.resultsService.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить результат' })
  @ApiParam({ name: 'id', description: 'MongoDB ObjectId результата' })
  @ApiResponse({ status: 200, description: 'Результат успешно удален' })
  @ApiResponse({ status: 404, description: 'Результат не найден' })
  remove(@Param('id') id: string) {
    return this.resultsService.remove(id);
  }
}
