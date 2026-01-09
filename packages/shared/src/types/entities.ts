import { GenerationStatus, TaskStatus } from '../enums';

// Базовый тип для MongoDB документов
export interface BaseEntity {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
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
  createdAt: Date;
}
