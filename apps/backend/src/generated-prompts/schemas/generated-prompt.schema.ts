import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type GeneratedPromptDocument = HydratedDocument<GeneratedPrompt>;

@Schema({ _id: false })
export class ParameterValue {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  value: string;
}

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (_, ret: Record<string, unknown>) => {
      if (ret._id) {
        ret.id = (ret._id as { toString(): string }).toString();
        delete ret._id;
      }
      if (ret.templateId) ret.templateId = (ret.templateId as { toString(): string }).toString();
      // Трансформация ParameterValue[] в Record<string, string> для frontend
      if (ret.parameterValues && Array.isArray(ret.parameterValues)) {
        ret.parameterValues = (ret.parameterValues as ParameterValue[]).reduce(
          (acc, pv) => {
            acc[pv.name] = pv.value;
            return acc;
          },
          {} as Record<string, string>,
        );
      }
      delete ret.__v;
      return ret;
    },
  },
})
export class GeneratedPrompt {
  @Prop({ type: Types.ObjectId, ref: 'PromptTemplate', required: true })
  templateId: Types.ObjectId;

  @Prop({ required: true })
  text: string;

  @Prop({ type: [ParameterValue], default: [] })
  parameterValues: ParameterValue[];
}

export const GeneratedPromptSchema = SchemaFactory.createForClass(GeneratedPrompt);

// Индекс для уникальности комбинации
GeneratedPromptSchema.index({ templateId: 1, text: 1 }, { unique: true });
