import { ParameterValue } from '../types/entities';

// === Response ===
export interface GenerationResultResponseDto {
  id: string;
  generationId: string;
  promptId: string;
  promptText: string;
  url: string;
  createdAt: Date;
}

// === Paginated Response ===
export interface PaginatedResultsResponseDto {
  items: GenerationResultResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
