import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Parameter, ParameterDocument } from './schemas/parameter.schema';
import { CreateParameterDto, UpdateParameterDto } from './dto';
import {
  PromptTemplate,
  PromptTemplateDocument,
} from '../prompt-templates/schemas/prompt-template.schema';

@Injectable()
export class ParametersService {
  constructor(
    @InjectModel(Parameter.name) private parameterModel: Model<ParameterDocument>,
    @InjectModel(PromptTemplate.name) private promptTemplateModel: Model<PromptTemplateDocument>,
  ) {}

  async create(dto: CreateParameterDto): Promise<ParameterDocument> {
    const existing = await this.parameterModel.findOne({ name: dto.name });
    if (existing) {
      throw new ConflictException(`Параметр "${dto.name}" уже существует`);
    }
    return this.parameterModel.create(dto);
  }

  async findAll(): Promise<ParameterDocument[]> {
    return this.parameterModel.find().sort({ createdAt: -1 });
  }

  async findOne(id: string): Promise<ParameterDocument> {
    const parameter = await this.parameterModel.findById(id);
    if (!parameter) {
      throw new NotFoundException(`Параметр с id "${id}" не найден`);
    }
    return parameter;
  }

  async findByName(name: string): Promise<ParameterDocument | null> {
    return this.parameterModel.findOne({ name });
  }

  async findByIds(ids: string[]): Promise<ParameterDocument[]> {
    return this.parameterModel.find({ _id: { $in: ids } });
  }

  async update(id: string, dto: UpdateParameterDto): Promise<ParameterDocument> {
    const parameter = await this.parameterModel.findByIdAndUpdate(
      id,
      { $set: dto },
      { new: true },
    );
    if (!parameter) {
      throw new NotFoundException(`Параметр с id "${id}" не найден`);
    }
    return parameter;
  }

  async remove(id: string): Promise<void> {
    const result = await this.parameterModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException(`Параметр с id "${id}" не найден`);
    }
    // Удаляем ссылки на параметр из всех шаблонов
    await this.promptTemplateModel.updateMany(
      { parameterIds: new Types.ObjectId(id) },
      { $pull: { parameterIds: new Types.ObjectId(id) } },
    );
  }
}
