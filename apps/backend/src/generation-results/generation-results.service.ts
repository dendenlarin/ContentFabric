import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { GenerationResult, GenerationResultDocument } from './schemas/generation-result.schema';

interface CreateResultDto {
  generationId: string;
  promptId: string;
  promptText: string;
  url: string;
}

@Injectable()
export class GenerationResultsService {
  constructor(
    @InjectModel(GenerationResult.name)
    private resultModel: Model<GenerationResultDocument>,
  ) {}

  async create(dto: CreateResultDto): Promise<GenerationResultDocument> {
    return this.resultModel.create({
      generationId: new Types.ObjectId(dto.generationId),
      promptId: new Types.ObjectId(dto.promptId),
      promptText: dto.promptText,
      url: dto.url,
    });
  }

  async findByGenerationId(
    generationId: string,
    page = 1,
    limit = 20,
  ): Promise<{ items: GenerationResultDocument[]; total: number }> {
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.resultModel
        .find({ generationId: new Types.ObjectId(generationId) })
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      this.resultModel.countDocuments({ generationId: new Types.ObjectId(generationId) }),
    ]);

    return { items, total };
  }

  async findOne(id: string): Promise<GenerationResultDocument> {
    const result = await this.resultModel.findById(id);
    if (!result) {
      throw new NotFoundException(`Результат с id "${id}" не найден`);
    }
    return result;
  }

  async remove(id: string): Promise<void> {
    const result = await this.resultModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException(`Результат с id "${id}" не найден`);
    }
  }

  async removeByGenerationId(generationId: string): Promise<number> {
    const result = await this.resultModel.deleteMany({
      generationId: new Types.ObjectId(generationId),
    });
    return result.deletedCount;
  }
}
