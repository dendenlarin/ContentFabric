// Статус генерации (Generation)
export enum GenerationStatus {
  DRAFT = 'draft',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

// Статус отдельной задачи (GenerationTask)
export enum TaskStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

// Провайдеры моделей
export enum ModelProvider {
  GOOGLE = 'google',
  OPENAI = 'openai',
}
