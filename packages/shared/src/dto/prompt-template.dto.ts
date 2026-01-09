import { ParameterResponseDto } from './parameter.dto';

// === Create ===
export interface CreatePromptTemplateDto {
  name: string;
  template: string;
  parameterIds: string[];
}

// === Update ===
export interface UpdatePromptTemplateDto {
  name?: string;
  template?: string;
  parameterIds?: string[];
}

// === Response ===
export interface PromptTemplateResponseDto {
  id: string;
  name: string;
  template: string;
  parameterIds: string[];
  createdAt: Date;
  updatedAt: Date;
  // Опционально: развёрнутые параметры
  parameters?: ParameterResponseDto[];
}
