/**
 * Базовый URL для API запросов
 * Backend работает на порту 3001
 */
const API_BASE = 'http://localhost:3001/api';

/**
 * Обертка для fetch с базовым URL и обработкой ошибок
 */
export async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// === Типы данных ===

export interface Parameter {
  id: string;
  name: string;
  values: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PromptTemplate {
  id: string;
  name: string;
  template: string;
  parameters: Parameter[];
  createdAt: string;
  updatedAt: string;
}

export interface GeneratedPrompt {
  id: string;
  text: string;
  parameterValues: Record<string, string>;
  templateId: string;
  template?: PromptTemplate;
  createdAt: string;
}

export interface Generation {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  modelId: string;
  provider: string;
  prompts: GeneratedPrompt[];
  createdAt: string;
  updatedAt: string;
}

export interface GenerationResult {
  id: string;
  generationId: string;
  promptId: string;
  result: string;
  status: 'success' | 'error';
  createdAt: string;
}

// === API функции для параметров ===

export async function getParameters(): Promise<Parameter[]> {
  return apiFetch<Parameter[]>('/parameters');
}

export async function createParameter(data: { name: string; values: string[] }): Promise<Parameter> {
  return apiFetch<Parameter>('/parameters', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateParameter(id: string, data: { name: string; values: string[] }): Promise<Parameter> {
  return apiFetch<Parameter>(`/parameters/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteParameter(id: string): Promise<void> {
  return apiFetch<void>(`/parameters/${id}`, {
    method: 'DELETE',
  });
}

// === API функции для шаблонов ===

export async function getPromptTemplates(): Promise<PromptTemplate[]> {
  return apiFetch<PromptTemplate[]>('/prompt-templates');
}

export interface EmbeddedParameter {
  name: string;
  values: string[];
}

export async function createPromptTemplate(data: {
  name: string;
  template: string;
  parameterIds?: string[];
  embeddedParameters?: EmbeddedParameter[];
}): Promise<PromptTemplate> {
  return apiFetch<PromptTemplate>('/prompt-templates', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function deletePromptTemplate(id: string): Promise<void> {
  return apiFetch<void>(`/prompt-templates/${id}`, {
    method: 'DELETE',
  });
}

// === API функции для сгенерированных промптов ===

export interface GeneratePromptsResult {
  generated: number;
  skipped: number;
  prompts: GeneratedPrompt[];
}

export async function generatePrompts(templateId: string): Promise<GeneratePromptsResult> {
  return apiFetch<GeneratePromptsResult>('/generated-prompts/generate', {
    method: 'POST',
    body: JSON.stringify({ templateIds: [templateId] }),
  });
}

export async function getGeneratedPrompts(templateId?: string): Promise<GeneratedPrompt[]> {
  const query = templateId ? `?templateId=${templateId}` : '';
  return apiFetch<GeneratedPrompt[]>(`/generated-prompts${query}`);
}

// === API функции для генераций ===

export async function getGenerations(): Promise<Generation[]> {
  return apiFetch<Generation[]>('/generations');
}

export async function createGeneration(data: {
  name: string;
  promptIds: string[];
  modelId: string;
  provider: string;
}): Promise<Generation> {
  return apiFetch<Generation>('/generations', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function startGeneration(id: string): Promise<Generation> {
  return apiFetch<Generation>(`/generations/${id}/start`, {
    method: 'POST',
  });
}

export async function getGenerationResults(generationId: string): Promise<GenerationResult[]> {
  return apiFetch<GenerationResult[]>(`/generation-results?generationId=${generationId}`);
}
