import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type GenerationResultDocument = HydratedDocument<GenerationResult>;

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (_, ret: Record<string, unknown>) => {
      if (ret._id) {
        ret.id = (ret._id as { toString(): string }).toString();
        delete ret._id;
      }
      if (ret.generationId) ret.generationId = (ret.generationId as { toString(): string }).toString();
      if (ret.promptId) ret.promptId = (ret.promptId as { toString(): string }).toString();
      delete ret.__v;
      return ret;
    },
  },
})
export class GenerationResult {
  @Prop({ type: Types.ObjectId, ref: 'Generation', required: true, index: true })
  generationId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'GeneratedPrompt', required: true })
  promptId: Types.ObjectId;

  @Prop({ required: true })
  promptText: string;

  @Prop({ required: true })
  url: string;
}

export const GenerationResultSchema = SchemaFactory.createForClass(GenerationResult);
