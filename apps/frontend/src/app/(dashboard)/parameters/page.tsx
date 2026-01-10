'use client';

import { useState, useEffect, useCallback } from 'react';
import { Variable } from 'lucide-react';
import { ParameterList, ParameterForm } from '@/components/parameters';
import { Alert } from '@/components/ui';
import { Parameter, getParameters, createParameter, updateParameter, deleteParameter } from '@/lib/api';

export default function ParametersPage() {
  // Состояние списка параметров
  const [parameters, setParameters] = useState<Parameter[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedParameter, setSelectedParameter] = useState<Parameter | null>(null);

  // Состояние редактора
  const [isCreating, setIsCreating] = useState(false);

  // Состояние операций
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Загрузка параметров
  const loadParameters = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getParameters();
      setParameters(data);
    } catch (err) {
      setError('Ошибка загрузки параметров');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadParameters();
  }, [loadParameters]);

  // Автоскрытие сообщений
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Выбор параметра
  const handleSelectParameter = (param: Parameter) => {
    setSelectedParameter(param);
    setIsCreating(false);
    setError(null);
  };

  // Создание нового
  const handleCreateNew = () => {
    setSelectedParameter(null);
    setIsCreating(true);
    setError(null);
  };

  // Сохранение параметра
  const handleSave = async (data: { name: string; values: string[] }) => {
    try {
      setSaving(true);
      setError(null);

      if (selectedParameter) {
        // Редактирование существующего параметра
        await updateParameter(selectedParameter.id, data);
        setSuccess('Параметр обновлён');
      } else {
        // Создание нового параметра
        await createParameter(data);
        setSuccess('Параметр создан');
      }

      await loadParameters();
      setIsCreating(false);
      setSelectedParameter(null);
    } catch (err) {
      setError(selectedParameter ? 'Ошибка обновления параметра' : 'Ошибка создания параметра');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // Удаление параметра
  const handleDelete = async (id: string) => {
    if (!confirm('Удалить этот параметр?')) return;

    try {
      await deleteParameter(id);
      await loadParameters();
      if (selectedParameter?.id === id) {
        setSelectedParameter(null);
        setIsCreating(false);
      }
      setSuccess('Параметр удалён');
    } catch (err) {
      setError('Ошибка удаления параметра');
      console.error(err);
    }
  };

  // Отмена
  const handleCancel = () => {
    setSelectedParameter(null);
    setIsCreating(false);
  };

  return (
    <div className="h-[calc(100vh-64px)] flex">
      {/* Левая панель - список параметров */}
      <div className="w-80 flex-shrink-0">
        <ParameterList
          parameters={parameters}
          selectedId={selectedParameter?.id}
          onSelect={handleSelectParameter}
          onDelete={handleDelete}
          onCreate={handleCreateNew}
          loading={loading}
        />
      </div>

      {/* Правая панель - редактор */}
      <div className="flex-1 overflow-auto bg-muted/30">
        {selectedParameter || isCreating ? (
          <div className="max-w-2xl mx-auto p-6">
            {/* Сообщения */}
            {error && (
              <Alert variant="error" onClose={() => setError(null)} className="mb-6">
                {error}
              </Alert>
            )}

            {success && (
              <Alert variant="success" onClose={() => setSuccess(null)} className="mb-6">
                {success}
              </Alert>
            )}

            <ParameterForm
              parameter={selectedParameter}
              onSave={handleSave}
              onCancel={handleCancel}
              loading={saving}
            />
          </div>
        ) : (
          // Empty state
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <Variable className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Глобальные параметры
              </h2>
              <p className="text-muted-foreground mb-6 max-w-sm">
                Создавайте параметры здесь и используйте их в любых шаблонах.
                Каждый параметр содержит набор значений для генерации вариаций.
              </p>
              <button
                onClick={handleCreateNew}
                className="px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-xl transition-colors shadow-sm shadow-primary/20"
              >
                Создать параметр
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
