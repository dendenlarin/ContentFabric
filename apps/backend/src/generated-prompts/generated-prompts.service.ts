import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { GeneratedPrompt, GeneratedPromptDocument } from './schemas/generated-prompt.schema';
import { PromptTemplatesService } from '../prompt-templates/prompt-templates.service';
import { ParametersService } from '../parameters/parameters.service';
import { GeneratePromptsDto } from './dto';

export interface ParameterValue {
  name: string;
  value: string;
}

export interface GenerateResult {
  generated: number;
  skipped: number;
  prompts: GeneratedPromptDocument[];
}

@Injectable()
export class GeneratedPromptsService {
  constructor(
    @InjectModel(GeneratedPrompt.name)
    private generatedPromptModel: Model<GeneratedPromptDocument>,
    private promptTemplatesService: PromptTemplatesService,
    private parametersService: ParametersService,
  ) {}

  // Генерация всех комбинаций промптов для шаблонов
  async generate(dto: GeneratePromptsDto): Promise<GenerateResult> {
    // Удаляем дубликаты, т.к. $in возвращает каждый документ только один раз
    const uniqueTemplateIds = [...new Set(dto.templateIds)];
    const templates = await this.promptTemplatesService.findByIds(uniqueTemplateIds);

    // Проверяем, что все запрошенные шаблоны найдены
    if (templates.length !== uniqueTemplateIds.length) {
      const foundIds = templates.map((t) => t._id.toString());
      const missingIds = uniqueTemplateIds.filter((id) => !foundIds.includes(id));
      throw new NotFoundException(`Шаблоны не найдены: ${missingIds.join(', ')}`);
    }

    let generated = 0;
    let skipped = 0;
    const prompts: GeneratedPromptDocument[] = [];

    for (const template of templates) {
      // Получаем параметры шаблона
      const parameterIds = template.parameterIds.map((id) => id.toString());
      const parameters = await this.parametersService.findByIds(parameterIds);

      // Извлекаем плейсхолдеры из шаблона
      const placeholders = this.promptTemplatesService.extractPlaceholders(template.template);

      // Проверяем, что все плейсхолдеры имеют соответствующие параметры
      const parameterNames = parameters.map((p) => p.name);
      const missingPlaceholders = placeholders.filter((ph) => !parameterNames.includes(ph));

      if (missingPlaceholders.length > 0) {
        throw new BadRequestException(
          `Шаблон "${template.name}" содержит плейсхолдеры без параметров: ${missingPlaceholders.join(', ')}`,
        );
      }

      // Фильтруем только используемые параметры
      const usedParameters = parameters.filter((p) => placeholders.includes(p.name));

      if (usedParameters.length === 0 && placeholders.length === 0) {
        // Нет плейсхолдеров в шаблоне - создаём один промпт без подстановок
        const result = await this.createPromptIfNotExists(
          template._id.toString(),
          template.template,
          [],
        );
        if (result.created) {
          generated++;
          prompts.push(result.prompt);
        } else {
          skipped++;
        }
        continue;
      }

      // Генерируем все комбинации
      const combinations = this.generateCombinations(usedParameters);

      for (const combination of combinations) {
        // Подставляем значения в шаблон
        const text = this.substituteValues(template.template, combination);

        const result = await this.createPromptIfNotExists(
          template._id.toString(),
          text,
          combination,
        );

        if (result.created) {
          generated++;
          prompts.push(result.prompt);
        } else {
          skipped++;
        }
      }
    }

    return { generated, skipped, prompts };
  }

  // Создание промпта если не существует
  private async createPromptIfNotExists(
    templateId: string,
    text: string,
    parameterValues: ParameterValue[],
  ): Promise<{ created: boolean; prompt: GeneratedPromptDocument }> {
    // Проверяем существование
    const existing = await this.generatedPromptModel.findOne({
      templateId: new Types.ObjectId(templateId),
      text,
    });

    if (existing) {
      return { created: false, prompt: existing };
    }

    const prompt = await this.generatedPromptModel.create({
      templateId: new Types.ObjectId(templateId),
      text,
      parameterValues,
    });

    return { created: true, prompt };
  }

  // Генерация декартова произведения комбинаций
  private generateCombinations(
    parameters: { name: string; values: string[] }[],
  ): ParameterValue[][] {
    if (parameters.length === 0) return [[]];

    const [first, ...rest] = parameters;
    const restCombinations = this.generateCombinations(rest);

    const result: ParameterValue[][] = [];
    for (const value of first.values) {
      for (const restCombination of restCombinations) {
        result.push([{ name: first.name, value }, ...restCombination]);
      }
    }

    return result;
  }

  // Подстановка значений в шаблон
  private substituteValues(template: string, values: ParameterValue[]): string {
    let result = template;
    for (const { name, value } of values) {
      result = result.replace(new RegExp(`\\{\\{${name}\\}\\}`, 'g'), value);
    }
    return result;
  }

  async findAll(): Promise<GeneratedPromptDocument[]> {
    return this.generatedPromptModel
      .find()
      .populate('templateId')
      .sort({ createdAt: -1 });
  }

  async findOne(id: string): Promise<GeneratedPromptDocument> {
    const prompt = await this.generatedPromptModel.findById(id).populate('templateId');
    if (!prompt) {
      throw new NotFoundException(`Промпт с id "${id}" не найден`);
    }
    return prompt;
  }

  async findByIds(ids: string[]): Promise<GeneratedPromptDocument[]> {
    return this.generatedPromptModel.find({ _id: { $in: ids } });
  }

  async findByTemplateId(templateId: string): Promise<GeneratedPromptDocument[]> {
    return this.generatedPromptModel.find({
      templateId: new Types.ObjectId(templateId),
    });
  }

  async remove(id: string): Promise<void> {
    const result = await this.generatedPromptModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException(`Промпт с id "${id}" не найден`);
    }
  }

  async removeByTemplateId(templateId: string): Promise<number> {
    const result = await this.generatedPromptModel.deleteMany({
      templateId: new Types.ObjectId(templateId),
    });
    return result.deletedCount;
  }
}
