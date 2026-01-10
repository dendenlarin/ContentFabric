'use client';

import { useState, useEffect, useCallback } from 'react';
import { Save, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { TemplateList, PromptEditor } from '@/components/templates';
import { Button, Input, Alert } from '@/components/ui';
import {
  PromptTemplate,
  Parameter,
  GeneratedPrompt,
  getPromptTemplates,
  createPromptTemplate,
  updatePromptTemplate,
  deletePromptTemplate,
  generatePrompts,
  getParameters,
  getGeneratedPrompts,
} from '@/lib/api';
import { extractParameterNames } from '@/lib/template-utils';

/**
 * Страница управления шаблонами промптов
 * Двухколоночный layout: список слева, редактор справа
 */
export default function TemplatesPage() {
  // Состояние списка шаблонов
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [globalParameters, setGlobalParameters] = useState<Parameter[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<PromptTemplate | null>(null);

  // Состояние редактора
  const [isCreating, setIsCreating] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateText, setTemplateText] = useState('');
  const [parameters, setParameters] = useState<Record<string, string[]>>({});

  // Состояние операций
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Состояние сгенерированных промптов
  const [generatedPrompts, setGeneratedPrompts] = useState<GeneratedPrompt[]>([]);
  const [loadingPrompts, setLoadingPrompts] = useState(false);

  // Пагинация промптов
  const [promptsPage, setPromptsPage] = useState(0);
  const PROMPTS_PER_PAGE = 10;

  // Сброс формы редактирования
  const resetForm = useCallback((options: {
    template?: PromptTemplate | null;
    isCreating?: boolean;
    clearMessages?: boolean;
  } = {}) => {
    const { template = null, isCreating: creating = false, clearMessages = true } = options;

    setSelectedTemplate(template);
    setIsCreating(creating);

    if (template) {
      setTemplateName(template.name);
      setTemplateText(template.template);
      const params: Record<string, string[]> = {};
      (template.parameters || []).forEach((p) => {
        // Защитная проверка: параметр должен иметь name и values
        if (p && p.name && Array.isArray(p.values)) {
          params[p.name] = [...p.values];
        }
      });
      setParameters(params);
    } else {
      setTemplateName('');
      setTemplateText('');
      setParameters({});
    }

    if (clearMessages) {
      setError(null);
      setSuccess(null);
    }
  }, []);

  // Загрузка шаблонов
  const loadTemplates = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getPromptTemplates();
      setTemplates(data);
    } catch (err) {
      setError('Ошибка загрузки шаблонов');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Загрузка глобальных параметров
  const loadGlobalParameters = useCallback(async () => {
    try {
      const params = await getParameters();
      setGlobalParameters(params);
    } catch (err) {
      console.error('Ошибка загрузки глобальных параметров:', err);
    }
  }, []);

  useEffect(() => {
    loadTemplates();
    loadGlobalParameters();
  }, [loadTemplates, loadGlobalParameters]);

  // Автоматическое подтягивание глобальных параметров по имени
  useEffect(() => {
    if (!templateText || globalParameters.length === 0) return;

    const paramNames = extractParameterNames(templateText);
    if (paramNames.length === 0) return;

    setParameters((prev) => {
      let updated = false;
      const newParams = { ...prev };

      paramNames.forEach((name) => {
        // Если параметр не определён локально, ищем глобальный с таким же именем
        if (!newParams[name]?.length) {
          const globalParam = globalParameters.find((p) => p.name === name);
          if (globalParam?.values.length) {
            newParams[name] = globalParam.values;
            updated = true;
          }
        }
      });

      return updated ? newParams : prev;
    });
  }, [templateText, globalParameters]);

  // Выбор шаблона для редактирования с автогенерацией
  const handleSelectTemplate = async (template: PromptTemplate) => {
    resetForm({ template });
    setGeneratedPrompts([]);
    setPromptsPage(0);

    // Загружаем существующие промпты
    setLoadingPrompts(true);
    try {
      const prompts = await getGeneratedPrompts(template.id);

      // Если промптов нет — автоматически генерируем
      if (prompts.length === 0) {
        const result = await generatePrompts(template.id);
        setGeneratedPrompts(result.prompts);
        setSuccess(`Автоматически сгенерировано ${result.generated} промптов`);
      } else {
        setGeneratedPrompts(prompts);
      }
    } catch (err) {
      console.error('Ошибка загрузки/генерации промптов:', err);
    } finally {
      setLoadingPrompts(false);
    }
  };

  // Создание нового шаблона
  const handleCreateNew = () => {
    resetForm({ isCreating: true });
    setGeneratedPrompts([]);
  };

  // Проверка наличия изменений
  const hasChanges = useCallback(() => {
    if (isCreating) {
      // Для нового шаблона - есть изменения если есть контент
      return templateName.trim() !== '' || templateText.trim() !== '';
    }
    if (!selectedTemplate) return false;

    // Проверяем изменения названия и текста
    if (templateName !== selectedTemplate.name) return true;
    if (templateText !== selectedTemplate.template) return true;

    // Проверяем изменения параметров
    const currentParamNames = extractParameterNames(templateText);
    for (const name of currentParamNames) {
      const originalParam = selectedTemplate.parameters?.find(p => p.name === name);
      const currentValues = parameters[name] || [];
      const originalValues = originalParam?.values || [];
      if (JSON.stringify(currentValues.sort()) !== JSON.stringify(originalValues.sort())) {
        return true;
      }
    }

    return false;
  }, [isCreating, selectedTemplate, templateName, templateText, parameters]);

  // Сохранение шаблона
  const handleSave = async () => {
    if (!templateName.trim()) {
      setError('Введите название шаблона');
      return;
    }
    if (!templateText.trim()) {
      setError('Введите текст шаблона');
      return;
    }

    // Проверяем что все параметры определены
    const paramNames = extractParameterNames(templateText);
    const undefinedParams = paramNames.filter(
      (name) => !parameters[name] || parameters[name].length === 0
    );

    if (undefinedParams.length > 0) {
      setError(`Не определены параметры: ${undefinedParams.join(', ')}`);
      return;
    }

    try {
      setSaving(true);
      setError(null);

      // Преобразуем локальные параметры в формат для API
      const embeddedParameters = paramNames.map((name) => ({
        name,
        values: parameters[name] || [],
      }));

      if (selectedTemplate && !isCreating) {
        // Обновляем существующий шаблон
        await updatePromptTemplate(selectedTemplate.id, {
          name: templateName,
          template: templateText,
          embeddedParameters,
        });

        // Перегенерируем варианты после обновления параметров
        const result = await generatePrompts(selectedTemplate.id);
        setGeneratedPrompts(result.prompts);
        setSuccess(`Шаблон обновлён. Сгенерировано ${result.generated} вариантов`);
      } else {
        // Создаём новый шаблон
        await createPromptTemplate({
          name: templateName,
          template: templateText,
          embeddedParameters,
        });
        setSuccess('Шаблон создан');
      }

      await loadTemplates();

      // Если создавали новый - сбрасываем форму
      if (isCreating) {
        resetForm({ clearMessages: false });
      }
    } catch (err) {
      setError('Ошибка сохранения шаблона');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // Удаление шаблона
  const handleDelete = async (id: string) => {
    if (!confirm('Удалить этот шаблон?')) return;

    try {
      await deletePromptTemplate(id);
      await loadTemplates();
      if (selectedTemplate?.id === id) {
        resetForm({ clearMessages: false });
      }
      setSuccess('Шаблон удалён');
    } catch (err) {
      setError('Ошибка удаления шаблона');
      console.error(err);
    }
  };

  // Дублирование шаблона
  const handleDuplicate = (template: PromptTemplate) => {
    const duplicatedTemplate = {
      ...template,
      name: `${template.name} (копия)`,
    };
    resetForm({ template: duplicatedTemplate, isCreating: true });
  };

  // Пагинированные промпты
  const totalPages = Math.ceil(generatedPrompts.length / PROMPTS_PER_PAGE);
  const paginatedPrompts = generatedPrompts.slice(
    promptsPage * PROMPTS_PER_PAGE,
    (promptsPage + 1) * PROMPTS_PER_PAGE
  );

  return (
    <div className="h-[calc(100vh-64px)] flex">
      {/* Левая панель - список шаблонов */}
      <div className="w-80 flex-shrink-0">
        <TemplateList
          templates={templates}
          selectedId={selectedTemplate?.id}
          onSelect={handleSelectTemplate}
          onDelete={handleDelete}
          onDuplicate={handleDuplicate}
          onCreate={handleCreateNew}
          loading={loading}
        />
      </div>

      {/* Правая панель - редактор */}
      <div className="flex-1 overflow-auto bg-muted/30">
        {selectedTemplate || isCreating ? (
          <div className="max-w-3xl mx-auto p-6 space-y-6">
            {/* Заголовок */}
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {isCreating ? 'Новый шаблон' : 'Редактирование шаблона'}
              </h1>
              <p className="text-muted-foreground mt-1">
                Используйте {'{{param}}'} для создания параметров. Кликните на параметр для определения значений.
              </p>
            </div>

            {/* Сообщения */}
            {error && (
              <Alert variant="error" onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert variant="success" onClose={() => setSuccess(null)}>
                {success}
              </Alert>
            )}

            {/* Название */}
            <Input
              label="Название шаблона"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="Например: Product Description"
            />

            {/* Редактор */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Текст шаблона
              </label>
              <PromptEditor
                value={templateText}
                onChange={setTemplateText}
                parameters={parameters}
                onParametersChange={setParameters}
                availableParameters={globalParameters}
                placeholder="Напишите описание {{product}} на языке {{language}} в стиле {{style}}..."
              />
            </div>

            {/* Кнопки действий */}
            <div className="flex items-center gap-3 pt-4 border-t border-border">
              <Button
                onClick={handleSave}
                loading={saving}
                disabled={!hasChanges()}
                className="flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Сохранить
              </Button>
            </div>

            {/* Сгенерированные промпты */}
            {selectedTemplate && (
              <div className="pt-6 border-t border-border">
                <h3 className="text-lg font-semibold mb-4">
                  Варианты промптов
                  {generatedPrompts.length > 0 && (
                    <span className="ml-2 text-sm font-normal text-muted-foreground">
                      ({generatedPrompts.length})
                    </span>
                  )}
                </h3>

                {loadingPrompts ? (
                  <div className="text-muted-foreground">Загрузка...</div>
                ) : generatedPrompts.length === 0 ? (
                  <div className="text-muted-foreground">
                    Нет вариантов промптов
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      {paginatedPrompts.map((prompt) => (
                        <div
                          key={prompt.id}
                          className="p-3 bg-muted/50 rounded-lg text-sm font-mono"
                        >
                          {prompt.text}
                        </div>
                      ))}
                    </div>

                    {/* Пагинация */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                        <span className="text-sm text-muted-foreground">
                          Страница {promptsPage + 1} из {totalPages}
                        </span>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setPromptsPage(p => Math.max(0, p - 1))}
                            disabled={promptsPage === 0}
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setPromptsPage(p => Math.min(totalPages - 1, p + 1))}
                            disabled={promptsPage === totalPages - 1}
                          >
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        ) : (
          // Empty state
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <Sparkles className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Выберите шаблон
              </h2>
              <p className="text-muted-foreground mb-4">
                Выберите шаблон из списка или создайте новый
              </p>
              <Button onClick={handleCreateNew}>
                Создать шаблон
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
