import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Generation, GenerationDocument } from './schemas/generation.schema';
import { GeneratedPromptsService } from '../generated-prompts/generated-prompts.service';
import { CreateGenerationDto } from './dto';
import { GenerationStatus, TaskStatus } from '@content-fabric/shared';

@Injectable()
export class GenerationsService {
  constructor(
    @InjectModel(Generation.name)
    private generationModel: Model<GenerationDocument>,
    private generatedPromptsService: GeneratedPromptsService,
    @InjectQueue('generation') private generationQueue: Queue,
  ) {}

  async create(dto: CreateGenerationDto): Promise<GenerationDocument> {
    // Проверяем существование промптов
    const prompts = await this.generatedPromptsService.findByIds(dto.promptIds);
    if (prompts.length !== dto.promptIds.length) {
      throw new BadRequestException('Некоторые промпты не найдены');
    }

    // Создаём tasks из промптов
    const tasks = dto.promptIds.map((promptId) => ({
      promptId: new Types.ObjectId(promptId),
      status: TaskStatus.PENDING,
    }));

    return this.generationModel.create({
      name: dto.name,
      modelId: dto.modelId,
      provider: dto.provider,
      settings: dto.settings,
      tasks,
      status: GenerationStatus.DRAFT,
    });
  }

  async findAll(): Promise<GenerationDocument[]> {
    return this.generationModel.find().sort({ createdAt: -1 });
  }

  async findOne(id: string): Promise<GenerationDocument> {
    const generation = await this.generationModel.findById(id);
    if (!generation) {
      throw new NotFoundException(`Генерация с id "${id}" не найдена`);
    }
    return generation;
  }

  // Запуск генерации
  async start(id: string): Promise<GenerationDocument> {
    const generation = await this.findOne(id);

    if (generation.status !== GenerationStatus.DRAFT) {
      throw new BadRequestException('Можно запустить только генерацию в статусе DRAFT');
    }

    // Обновляем статус
    generation.status = GenerationStatus.PROCESSING;
    await generation.save();

    // Получаем тексты промптов
    const promptIds = generation.tasks.map((t) => t.promptId.toString());
    const prompts = await this.generatedPromptsService.findByIds(promptIds);
    const promptMap = new Map(prompts.map((p) => [p._id.toString(), p.text]));

    // Добавляем задачи в очередь
    for (let i = 0; i < generation.tasks.length; i++) {
      const task = generation.tasks[i];
      const promptText = promptMap.get(task.promptId.toString()) || '';

      await this.generationQueue.add(
        'generate',
        {
          generationId: generation._id.toString(),
          taskIndex: i,
          promptId: task.promptId.toString(),
          promptText,
          modelId: generation.modelId,
          provider: generation.provider,
          settings: generation.settings,
        },
        {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 1000,
          },
        },
      );
    }

    return generation;
  }

  // Обновление статуса задачи (вызывается из воркера)
  async updateTaskStatus(
    generationId: string,
    taskIndex: number,
    status: TaskStatus,
    resultId?: string,
    error?: string,
  ): Promise<void> {
    const updateData: Record<string, unknown> = {
      [`tasks.${taskIndex}.status`]: status,
    };

    if (resultId) {
      updateData[`tasks.${taskIndex}.resultId`] = new Types.ObjectId(resultId);
    }
    if (error) {
      updateData[`tasks.${taskIndex}.error`] = error;
    }

    await this.generationModel.updateOne(
      { _id: generationId },
      { $set: updateData },
    );

    // Проверяем, все ли задачи завершены
    await this.checkAndUpdateGenerationStatus(generationId);
  }

  // Проверка и обновление общего статуса генерации
  private async checkAndUpdateGenerationStatus(generationId: string): Promise<void> {
    const generation = await this.generationModel.findById(generationId);
    if (!generation) return;

    const allCompleted = generation.tasks.every(
      (t) => t.status === TaskStatus.COMPLETED || t.status === TaskStatus.FAILED,
    );

    if (allCompleted) {
      const allSuccess = generation.tasks.every((t) => t.status === TaskStatus.COMPLETED);
      generation.status = allSuccess
        ? GenerationStatus.COMPLETED
        : GenerationStatus.FAILED;
      await generation.save();
    }
  }

  // Получение прогресса
  getProgress(generation: GenerationDocument) {
    const total = generation.tasks.length;
    const completed = generation.tasks.filter((t) => t.status === TaskStatus.COMPLETED).length;
    const failed = generation.tasks.filter((t) => t.status === TaskStatus.FAILED).length;
    const pending = generation.tasks.filter(
      (t) => t.status === TaskStatus.PENDING || t.status === TaskStatus.PROCESSING,
    ).length;

    return {
      total,
      completed,
      failed,
      pending,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }

  async remove(id: string): Promise<void> {
    const result = await this.generationModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException(`Генерация с id "${id}" не найдена`);
    }
  }
}
