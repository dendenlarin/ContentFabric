import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { extractParameterNames } from '@content-fabric/shared';
import { PromptTemplate, PromptTemplateDocument } from './schemas/prompt-template.schema';
import { CreatePromptTemplateDto, UpdatePromptTemplateDto } from './dto';
import { ParametersService } from '../parameters/parameters.service';

@Injectable()
export class PromptTemplatesService {
  constructor(
    @InjectModel(PromptTemplate.name)
    private promptTemplateModel: Model<PromptTemplateDocument>,
    private parametersService: ParametersService,
  ) {}

  async create(dto: CreatePromptTemplateDto): Promise<PromptTemplateDocument> {
    // Собираем ID параметров из существующих
    const parameterIds: Types.ObjectId[] = dto.parameterIds?.map((id) => new Types.ObjectId(id)) || [];

    // Обрабатываем встроенные параметры - создаём или находим существующие
    if (dto.embeddedParameters && dto.embeddedParameters.length > 0) {
      for (const embedded of dto.embeddedParameters) {
        // Проверяем существует ли параметр с таким именем
        let param = await this.parametersService.findByName(embedded.name);

        if (param) {
          // Параметр существует - обновляем значения
          param = await this.parametersService.update(param._id.toString(), {
            values: embedded.values,
          });
        } else {
          // Создаём новый параметр
          param = await this.parametersService.create({
            name: embedded.name,
            values: embedded.values,
          });
        }

        // Добавляем ID если его ещё нет в списке
        const paramId = new Types.ObjectId(param._id.toString());
        if (!parameterIds.some((id) => id.equals(paramId))) {
          parameterIds.push(paramId);
        }
      }
    }

    return this.promptTemplateModel.create({
      name: dto.name,
      template: dto.template,
      parameterIds,
    });
  }

  async findAll(): Promise<PromptTemplateDocument[]> {
    const templates = await this.promptTemplateModel
      .find()
      .populate('parameterIds')
      .sort({ createdAt: -1 });
    // Фильтруем null-значения после populate (удалённые параметры)
    return templates.map((t) => this.filterNullParameters(t));
  }

  async findOne(id: string): Promise<PromptTemplateDocument> {
    const template = await this.promptTemplateModel
      .findById(id)
      .populate('parameterIds');
    if (!template) {
      throw new NotFoundException(`Шаблон с id "${id}" не найден`);
    }
    // Фильтруем null-значения после populate (удалённые параметры)
    return this.filterNullParameters(template);
  }

  async findByIds(ids: string[]): Promise<PromptTemplateDocument[]> {
    const templates = await this.promptTemplateModel
      .find({ _id: { $in: ids } })
      .populate('parameterIds');
    // Фильтруем null-значения после populate (удалённые параметры)
    return templates.map((t) => this.filterNullParameters(t));
  }

  async update(id: string, dto: UpdatePromptTemplateDto): Promise<PromptTemplateDocument> {
    const updateData: Record<string, unknown> = { ...dto };
    if (dto.parameterIds) {
      updateData.parameterIds = dto.parameterIds.map((id) => new Types.ObjectId(id));
    }

    const template = await this.promptTemplateModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true },
    );
    if (!template) {
      throw new NotFoundException(`Шаблон с id "${id}" не найден`);
    }
    return template;
  }

  async remove(id: string): Promise<void> {
    const result = await this.promptTemplateModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException(`Шаблон с id "${id}" не найден`);
    }
  }

  // Извлечение плейсхолдеров из шаблона (обёртка для обратной совместимости)
  extractPlaceholders(template: string): string[] {
    return extractParameterNames(template);
  }

  // Фильтрует null-значения из parameterIds после populate
  private filterNullParameters(template: PromptTemplateDocument): PromptTemplateDocument {
    if (template.parameterIds && Array.isArray(template.parameterIds)) {
      template.parameterIds = template.parameterIds.filter((p) => p != null) as Types.ObjectId[];
    }
    return template;
  }
}
