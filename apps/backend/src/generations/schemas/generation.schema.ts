import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { GenerationStatus, TaskStatus } from '@content-fabric/shared';

export type GenerationDocument = HydratedDocument<Generation>;

@Schema({ _id: false })
export class GenerationTask {
  @Prop({ type: Types.ObjectId, ref: 'GeneratedPrompt', required: true })
  promptId: Types.ObjectId;

  @Prop({ type: String, enum: Object.values(TaskStatus), default: TaskStatus.PENDING })
  status: TaskStatus;

  @Prop({ type: Types.ObjectId, ref: 'GenerationResult' })
  resultId?: Types.ObjectId;

  @Prop()
  error?: string;
}

@Schema({ _id: false })
export class GenerationSettings {
  @Prop()
  aspectRatio?: string;

  @Prop()
  negativePrompt?: string;
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
      delete ret.__v;
      return ret;
    },
  },
})
export class Generation {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  modelId: string;

  @Prop({ required: true })
  provider: string;

  @Prop({
    type: String,
    enum: Object.values(GenerationStatus),
    default: GenerationStatus.DRAFT,
  })
  status: GenerationStatus;

  @Prop({ type: [GenerationTask], default: [] })
  tasks: GenerationTask[];

  @Prop({ type: GenerationSettings })
  settings?: GenerationSettings;
}

export const GenerationSchema = SchemaFactory.createForClass(Generation);
