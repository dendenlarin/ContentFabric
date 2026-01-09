import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { GenerationsService } from '../generations/generations.service';
import { GenerationResultsService } from '../generation-results/generation-results.service';
import { TaskStatus } from '@content-fabric/shared';

interface GenerationJobData {
  generationId: string;
  taskIndex: number;
  promptId: string;
  promptText: string;
  modelId: string;
  provider: string;
  settings?: Record<string, unknown>;
}

@Processor('generation')
export class GenerationProcessor extends WorkerHost {
  private readonly logger = new Logger(GenerationProcessor.name);

  constructor(
    private generationsService: GenerationsService,
    private resultsService: GenerationResultsService,
  ) {
    super();
  }

  async process(job: Job<GenerationJobData>): Promise<void> {
    const { generationId, taskIndex, promptId, promptText, modelId, provider } = job.data;

    this.logger.log(`Processing task ${taskIndex} for generation ${generationId}`);

    try {
      // Обновляем статус на PROCESSING
      await this.generationsService.updateTaskStatus(
        generationId,
        taskIndex,
        TaskStatus.PROCESSING,
      );

      // TODO: Реальный вызов API модели
      // Пока заглушка - симулируем генерацию
      const imageUrl = await this.generateImage(promptText, modelId, provider);

      // Сохраняем результат
      const result = await this.resultsService.create({
        generationId,
        promptId,
        promptText,
        url: imageUrl,
      });

      // Обновляем статус задачи
      await this.generationsService.updateTaskStatus(
        generationId,
        taskIndex,
        TaskStatus.COMPLETED,
        result._id.toString(),
      );

      this.logger.log(`Task ${taskIndex} completed for generation ${generationId}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Task ${taskIndex} failed: ${errorMessage}`);

      await this.generationsService.updateTaskStatus(
        generationId,
        taskIndex,
        TaskStatus.FAILED,
        undefined,
        errorMessage,
      );

      throw error; // Для retry
    }
  }

  // Заглушка для генерации изображения
  private async generateImage(
    prompt: string,
    modelId: string,
    provider: string,
  ): Promise<string> {
    // Симулируем задержку API
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 2000));

    // TODO: Реализовать реальные адаптеры для моделей
    // Пока возвращаем placeholder URL
    const hash = Buffer.from(prompt).toString('base64').slice(0, 10);
    return `/uploads/generated_${Date.now()}_${hash}.png`;
  }
}
