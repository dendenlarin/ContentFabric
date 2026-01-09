'use client';

import { useState, useEffect, useCallback } from 'react';
import { Save, Sparkles, AlertCircle } from 'lucide-react';
import { TemplateList, PromptEditor } from '@/components/templates';
import { Button, Input } from '@/components/ui';
import {
  PromptTemplate,
  Parameter,
  getPromptTemplates,
  createPromptTemplate,
  deletePromptTemplate,
  generatePrompts,
  getParameters,
} from '@/lib/api';
import {
  extractParameterNames,
  areAllParametersDefined,
  countCombinations,
} from '@/lib/template-utils';

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
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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
        params[p.name] = [...p.values];
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

  // Выбор шаблона для редактирования
  const handleSelectTemplate = (template: PromptTemplate) => {
    resetForm({ template });
  };

  // Создание нового шаблона
  const handleCreateNew = () => {
    resetForm({ isCreating: true });
  };

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

      await createPromptTemplate({
        name: templateName,
        template: templateText,
        embeddedParameters,
      });

      setSuccess('Шаблон сохранён');
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

  // Генерация промптов
  const handleGenerate = async () => {
    if (!selectedTemplate) return;

    if (!areAllParametersDefined(templateText, parameters)) {
      setError('Сначала определите все параметры');
      return;
    }

    try {
      setGenerating(true);
      setError(null);
      const result = await generatePrompts(selectedTemplate.id);
      setSuccess(`Сгенерировано ${result.generated} промптов`);
    } catch (err) {
      setError('Ошибка генерации промптов');
      console.error(err);
    } finally {
      setGenerating(false);
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

  // Статистика для кнопки генерации
  const paramNames = extractParameterNames(templateText);
  const allDefined = areAllParametersDefined(templateText, parameters);
  const combinationsCount = allDefined ? countCombinations(parameters, paramNames) : 0;

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
              <div className="flex items-center gap-2 p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
                <button
                  onClick={() => setError(null)}
                  className="ml-auto text-destructive/70 hover:text-destructive"
                >
                  ×
                </button>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700">
                <span>{success}</span>
                <button
                  onClick={() => setSuccess(null)}
                  className="ml-auto text-emerald-500 hover:text-emerald-700"
                >
                  ×
                </button>
              </div>
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
                className="flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Сохранить
              </Button>

              {selectedTemplate && (
                <Button
                  variant="secondary"
                  onClick={handleGenerate}
                  loading={generating}
                  disabled={!allDefined || paramNames.length === 0}
                  className="flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Генерировать
                  {allDefined && combinationsCount > 0 && (
                    <span className="ml-1 px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                      {combinationsCount}
                    </span>
                  )}
                </Button>
              )}
            </div>
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
