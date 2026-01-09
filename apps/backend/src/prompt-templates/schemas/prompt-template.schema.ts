import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type PromptTemplateDocument = HydratedDocument<PromptTemplate>;

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
export class PromptTemplate {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  template: string;

  @Prop({ type: [Types.ObjectId], ref: 'Parameter', default: [] })
  parameterIds: Types.ObjectId[];
}

export const PromptTemplateSchema = SchemaFactory.createForClass(PromptTemplate);

// Виртуальное поле 'parameters' как алиас для 'parameterIds' после populate
PromptTemplateSchema.virtual('parameters').get(function () {
  return this.parameterIds;
});
