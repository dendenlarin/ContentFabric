'use client';

import { useState, useEffect, useCallback } from 'react';
import { Play, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button, Input, Select, Card, CardHeader, CardTitle, CardContent, Badge, ProgressBar } from '@/components/ui';
import {
  Generation,
  PromptTemplate,
  GeneratedPrompt,
  getGenerations,
  getPromptTemplates,
  getGeneratedPrompts,
  createGeneration,
  startGeneration,
} from '@/lib/api';

/** Доступные провайдеры */
const providers = [
  { value: 'openai', label: 'OpenAI' },
  { value: 'anthropic', label: 'Anthropic' },
  { value: 'google', label: 'Google AI' },
];

/** Модели по провайдерам */
const modelsByProvider: Record<string, { value: string; label: string }[]> = {
  openai: [
    { value: 'gpt-4', label: 'GPT-4' },
    { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
    { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
  ],
  anthropic: [
    { value: 'claude-3-opus', label: 'Claude 3 Opus' },
    { value: 'claude-3-sonnet', label: 'Claude 3 Sonnet' },
    { value: 'claude-3-haiku', label: 'Claude 3 Haiku' },
  ],
  google: [
    { value: 'gemini-pro', label: 'Gemini Pro' },
    { value: 'gemini-ultra', label: 'Gemini Ultra' },
  ],
};

/**
 * Страница создания и управления генерациями контента
 */
export default function GenerationsPage() {
  // Данные
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [prompts, setPrompts] = useState<GeneratedPrompt[]>([]);
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [loading, setLoading] = useState(true);

  // Форма создания
  const [name, setName] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [provider, setProvider] = useState('openai');
  const [model, setModel] = useState('gpt-4');
  const [selectedPromptIds, setSelectedPromptIds] = useState<Set<string>>(new Set());

  // Состояние операций
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Загрузка данных
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [templatesData, generationsData] = await Promise.all([
        getPromptTemplates(),
        getGenerations(),
      ]);
      setTemplates(templatesData);
      setGenerations(generationsData);
    } catch (err) {
      setError('Ошибка загрузки данных');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Загрузка промптов при выборе шаблона
  useEffect(() => {
    if (!selectedTemplateId) {
      setPrompts([]);
      setSelectedPromptIds(new Set());
      return;
    }

    const loadPrompts = async () => {
      try {
        const data = await getGeneratedPrompts(selectedTemplateId);
        setPrompts(data);
        // Выбираем все промпты по умолчанию
        setSelectedPromptIds(new Set(data.map((p) => p.id)));
      } catch (err) {
        console.error(err);
      }
    };

    loadPrompts();
  }, [selectedTemplateId]);

  // Смена провайдера - сбросить модель
  useEffect(() => {
    const models = modelsByProvider[provider];
    if (models && models.length > 0) {
      setModel(models[0].value);
    }
  }, [provider]);

  // Создание генерации
  const handleCreate = async () => {
    if (!name.trim()) {
      setError('Введите название генерации');
      return;
    }
    if (selectedPromptIds.size === 0) {
      setError('Выберите хотя бы один промпт');
      return;
    }

    try {
      setCreating(true);
      setError(null);

      const generation = await createGeneration({
        name,
        promptIds: Array.from(selectedPromptIds),
        modelId: model,
        provider,
      });

      // Сразу запускаем
      await startGeneration(generation.id);

      setSuccess('Генерация запущена');
      setName('');
      setSelectedTemplateId('');
      setSelectedPromptIds(new Set());

      await loadData();
    } catch (err) {
      setError('Ошибка создания генерации');
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  // Toggle промпта
  const togglePrompt = (id: string) => {
    setSelectedPromptIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Выбрать все / снять все
  const toggleAllPrompts = () => {
    if (selectedPromptIds.size === prompts.length) {
      setSelectedPromptIds(new Set());
    } else {
      setSelectedPromptIds(new Set(prompts.map((p) => p.id)));
    }
  };

  // Статус генерации
  const getStatusBadge = (status: Generation['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="default">Ожидание</Badge>;
      case 'running':
        return <Badge variant="info">Выполняется</Badge>;
      case 'completed':
        return <Badge variant="success">Завершено</Badge>;
      case 'failed':
        return <Badge variant="error">Ошибка</Badge>;
    }
  };

  // Активные генерации (running или pending)
  const activeGenerations = generations.filter(
    (g) => g.status === 'running' || g.status === 'pending'
  );

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Генерации</h1>
        <p className="text-muted-foreground mt-1">
          Создавайте генерации контента на основе шаблонов
        </p>
      </div>

      {/* Сообщения */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto">×</button>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{success}</span>
          <button onClick={() => setSuccess(null)} className="ml-auto">×</button>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Форма создания */}
        <Card>
          <CardHeader>
            <CardTitle>Новая генерация</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Название"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Batch #1"
            />

            <Select
              label="Шаблон"
              value={selectedTemplateId}
              onChange={(e) => setSelectedTemplateId(e.target.value)}
              placeholder="Выберите шаблон"
              options={templates.map((t) => ({ value: t.id, label: t.name }))}
            />

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Провайдер"
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                options={providers}
              />

              <Select
                label="Модель"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                options={modelsByProvider[provider] || []}
              />
            </div>

            {/* Выбор промптов */}
            {prompts.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-foreground">
                    Промпты ({selectedPromptIds.size}/{prompts.length})
                  </label>
                  <button
                    onClick={toggleAllPrompts}
                    className="text-sm text-primary hover:text-primary/80"
                  >
                    {selectedPromptIds.size === prompts.length ? 'Снять все' : 'Выбрать все'}
                  </button>
                </div>
                <div className="border border-border rounded-lg max-h-48 overflow-auto">
                  {prompts.map((prompt) => (
                    <label
                      key={prompt.id}
                      className="flex items-start gap-3 p-3 hover:bg-accent cursor-pointer border-b border-border last:border-0"
                    >
                      <input
                        type="checkbox"
                        checked={selectedPromptIds.has(prompt.id)}
                        onChange={() => togglePrompt(prompt.id)}
                        className="mt-1 rounded border-input text-primary focus:ring-ring"
                      />
                      <span className="text-sm text-foreground line-clamp-2">
                        {prompt.text}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <Button
              onClick={handleCreate}
              loading={creating}
              disabled={!name.trim() || selectedPromptIds.size === 0}
              className="w-full flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4" />
              Запустить генерацию
            </Button>
          </CardContent>
        </Card>

        {/* Активные генерации */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Активные генерации
          </h2>

          {loading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent>
                    <div className="h-4 bg-muted rounded w-1/2 mb-3" />
                    <div className="h-2 bg-muted/50 rounded w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : activeGenerations.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <Sparkles className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">Нет активных генераций</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {activeGenerations.map((gen) => (
                <Card key={gen.id}>
                  <CardContent>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-medium text-foreground">{gen.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {gen.provider} / {gen.modelId}
                        </p>
                      </div>
                      {getStatusBadge(gen.status)}
                    </div>
                    <ProgressBar value={gen.progress} showLabel size="sm" />
                    <p className="text-xs text-muted-foreground mt-2">
                      {gen.prompts.length} промптов
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
