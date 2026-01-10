import { GenerationStatus, TaskStatus } from '../enums';

// Базовый тип для MongoDB документов
export interface BaseEntity {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

// Базовый тип для API Response (даты как строки после JSON сериализации)
export interface BaseResponse {
  id: string;
  createdAt: string;
  updatedAt: string;
}

// === EmbeddedParameter (для создания параметров вместе с шаблоном) ===
export interface EmbeddedParameter {
  name: string;
  values: string[];
}

// === Parameter ===
export interface IParameter extends BaseEntity {
  name: string;       // "gender" - ключ для {{gender}}
  values: string[];   // ["male", "female"]
}

// === PromptTemplate ===
export interface IPromptTemplate extends BaseEntity {
  name: string;
  template: string;          // "A {{gender}} {{profession}} at work"
  parameterIds: string[];    // Связанные параметры
}

// === GeneratedPrompt ===
export interface ParameterValue {
  name: string;   // "gender"
  value: string;  // "male"
}

export interface IGeneratedPrompt {
  _id: string;
  templateId: string;
  text: string;                      // "A male doctor at work" - финальный текст
  parameterValues: ParameterValue[];
  createdAt: Date;
}

// === Generation ===
export interface GenerationTask {
  promptId: string;
  status: TaskStatus;
  resultId?: string;
  error?: string;
}

export interface GenerationSettings {
  aspectRatio?: string;
  negativePrompt?: string;
}

export interface IGeneration extends BaseEntity {
  name: string;
  modelId: string;              // "google-imagen-4"
  provider: string;             // "google" | "openai"
  status: GenerationStatus;
  tasks: GenerationTask[];      // Embedded documents
  settings?: GenerationSettings;
}

// === GenerationResult ===
export interface IGenerationResult {
  _id: string;
  generationId: string;
  promptId: string;
  promptText: string;           // Денормализация для удобства
  url: string;                  // Путь к файлу
  status: 'success' | 'error';  // Статус результата генерации
  error?: string;               // Текст ошибки (если status === 'error')
  createdAt: Date;
}

// =============================================================================
// API Response типы (для frontend - даты как строки после JSON сериализации)
// =============================================================================

export interface ParameterResponse {
  id: string;
  name: string;
  values: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PromptTemplateResponse {
  id: string;
  name: string;
  template: string;
  parameters: ParameterResponse[];  // Populated параметры
  createdAt: string;
  updatedAt: string;
}

export interface GeneratedPromptResponse {
  id: string;
  templateId: string;
  text: string;
  parameterValues: Record<string, string>;  // Трансформировано из ParameterValue[]
  template?: PromptTemplateResponse;
  createdAt: string;
}

export interface GenerationTaskResponse {
  promptId: string;
  status: TaskStatus;
  resultId?: string;
  error?: string;
}

export interface GenerationResponse {
  id: string;
  name: string;
  modelId: string;
  provider: string;
  status: GenerationStatus;
  tasks: GenerationTaskResponse[];
  settings?: GenerationSettings;
  createdAt: string;
  updatedAt: string;
}

export interface GenerationResultResponse {
  id: string;
  generationId: string;
  promptId: string;
  promptText: string;
  url: string;
  status: 'success' | 'error';  // Статус результата генерации
  error?: string;               // Текст ошибки (если status === 'error')
  createdAt: string;
}
