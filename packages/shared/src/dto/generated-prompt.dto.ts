import { ParameterValue } from '../types/entities';

// === Generate (запрос на генерацию комбинаций) ===
export interface GeneratePromptsDto {
  templateIds: string[];
}

// === Response ===
export interface GeneratedPromptResponseDto {
  id: string;
  templateId: string;
  text: string;
  parameterValues: ParameterValue[];
  createdAt: Date;
}

// === Response для генерации ===
export interface GeneratePromptsResponseDto {
  generated: number;   // Сколько создано
  skipped: number;     // Сколько пропущено (дубликаты)
  prompts: GeneratedPromptResponseDto[];
}
