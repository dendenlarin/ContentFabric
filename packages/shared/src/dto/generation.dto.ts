import { GenerationStatus, TaskStatus } from '../enums';
import { GenerationSettings, GenerationTask } from '../types/entities';

// === Create ===
export interface CreateGenerationDto {
  name: string;
  promptIds: string[];
  modelId: string;
  provider: string;
  settings?: GenerationSettings;
}

// === Update ===
export interface UpdateGenerationDto {
  name?: string;
  settings?: GenerationSettings;
}

// === Task Response ===
export interface GenerationTaskResponseDto {
  promptId: string;
  status: TaskStatus;
  resultId?: string;
  error?: string;
}

// === Progress ===
export interface GenerationProgressDto {
  total: number;
  completed: number;
  failed: number;
  pending: number;
  percentage: number;
}

// === Response ===
export interface GenerationResponseDto {
  id: string;
  name: string;
  modelId: string;
  provider: string;
  status: GenerationStatus;
  tasks: GenerationTaskResponseDto[];
  progress: GenerationProgressDto;
  settings?: GenerationSettings;
  createdAt: Date;
  updatedAt: Date;
}

// === List Item (для списка) ===
export interface GenerationListItemDto {
  id: string;
  name: string;
  status: GenerationStatus;
  progress: GenerationProgressDto;
  modelId: string;
  createdAt: Date;
}
