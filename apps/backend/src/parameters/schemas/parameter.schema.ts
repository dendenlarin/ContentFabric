import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ParameterDocument = HydratedDocument<Parameter>;

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
export class Parameter {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  name: string;

  @Prop({ type: [String], required: true })
  values: string[];
}

export const ParameterSchema = SchemaFactory.createForClass(Parameter);
