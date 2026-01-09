'use client';

import { useState, useEffect, KeyboardEvent } from 'react';
import { X, Plus, Variable } from 'lucide-react';
import { Parameter } from '@/lib/api';

interface ParameterFormProps {
  /** Параметр для редактирования (null для создания нового) */
  parameter: Parameter | null;
  /** Callback при сохранении */
  onSave: (data: { name: string; values: string[] }) => void;
  /** Callback при отмене */
  onCancel: () => void;
  /** Состояние загрузки */
  loading?: boolean;
}

/**
 * Форма создания/редактирования параметра
 * Валидация: название обязательно, минимум 1 значение
 */
export function ParameterForm({
  parameter,
  onSave,
  onCancel,
  loading = false,
}: ParameterFormProps) {
  const [name, setName] = useState('');
  const [values, setValues] = useState<string[]>([]);
  const [newValue, setNewValue] = useState('');
  const [errors, setErrors] = useState<{ name?: string; values?: string }>({});

  // Инициализация формы при изменении параметра
  useEffect(() => {
    if (parameter) {
      setName(parameter.name);
      setValues([...parameter.values]);
    } else {
      setName('');
      setValues([]);
    }
    setNewValue('');
    setErrors({});
  }, [parameter]);

  // Добавление нового значения
  const addValue = () => {
    const trimmedValue = newValue.trim();
    if (!trimmedValue) return;

    // Проверка на дубликаты
    if (values.includes(trimmedValue)) {
      setErrors(prev => ({ ...prev, values: 'Такое значение уже существует' }));
      return;
    }

    setValues([...values, trimmedValue]);
    setNewValue('');
    setErrors(prev => ({ ...prev, values: undefined }));
  };

  // Удаление значения
  const removeValue = (index: number) => {
    setValues(values.filter((_, i) => i !== index));
  };

  // Обработка нажатия Enter
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addValue();
    }
  };

  // Валидация и отправка формы
  const handleSubmit = () => {
    const newErrors: { name?: string; values?: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Название параметра обязательно';
    } else if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(name.trim())) {
      newErrors.name = 'Название должно начинаться с буквы и содержать только буквы, цифры и _';
    }

    if (values.length === 0) {
      newErrors.values = 'Добавьте хотя бы одно значение';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({ name: name.trim(), values });
  };

  const isEditing = parameter !== null;

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-primary/10 text-primary">
          <Variable className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            {isEditing ? 'Редактирование параметра' : 'Новый параметр'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {isEditing
              ? 'Измените название или значения параметра'
              : 'Создайте параметр для использования в шаблонах'}
          </p>
        </div>
      </div>

      {/* Название параметра */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Название параметра
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono text-sm">
            {'{{'}
          </span>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setErrors(prev => ({ ...prev, name: undefined }));
            }}
            placeholder="product_type"
            className={`
              w-full pl-9 pr-9 py-2.5
              bg-background border rounded-lg
              text-sm text-foreground placeholder-muted-foreground font-mono
              focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring
              transition-all
              ${errors.name ? 'border-destructive' : 'border-input'}
            `}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono text-sm">
            {'}}'}
          </span>
        </div>
        {errors.name && (
          <p className="mt-1.5 text-sm text-destructive">{errors.name}</p>
        )}
      </div>

      {/* Значения параметра */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Значения параметра
        </label>

        {/* Поле добавления нового значения */}
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={newValue}
            onChange={(e) => {
              setNewValue(e.target.value);
              setErrors(prev => ({ ...prev, values: undefined }));
            }}
            onKeyDown={handleKeyDown}
            placeholder="Введите значение и нажмите Enter"
            className={`
              flex-1 px-3 py-2.5
              bg-background border rounded-lg
              text-sm text-foreground placeholder-muted-foreground
              focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring
              transition-all
              ${errors.values ? 'border-destructive' : 'border-input'}
            `}
          />
          <button
            type="button"
            onClick={addValue}
            className="
              px-3 py-2.5
              bg-muted hover:bg-accent
              text-foreground
              rounded-lg
              transition-colors
              flex items-center gap-1
            "
          >
            <Plus className="w-4 h-4" />
            Добавить
          </button>
        </div>

        {errors.values && (
          <p className="mb-2 text-sm text-destructive">{errors.values}</p>
        )}

        {/* Список значений */}
        {values.length > 0 ? (
          <div className="flex flex-wrap gap-2 p-3 bg-muted/50 rounded-lg min-h-[60px]">
            {values.map((value, index) => (
              <span
                key={index}
                className="
                  inline-flex items-center gap-1.5
                  px-2.5 py-1
                  bg-primary/10 text-primary
                  text-sm font-medium rounded-lg
                  group
                "
              >
                {value}
                <button
                  type="button"
                  onClick={() => removeValue(index)}
                  className="
                    p-0.5 rounded
                    hover:bg-primary/20
                    transition-colors
                  "
                  aria-label={`Удалить ${value}`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        ) : (
          <div className="p-4 bg-muted/50 rounded-lg text-center">
            <p className="text-sm text-muted-foreground">
              Значения пока не добавлены
            </p>
          </div>
        )}

        <p className="mt-2 text-xs text-muted-foreground">
          Всего значений: {values.length}
        </p>
      </div>

      {/* Кнопки действий */}
      <div className="flex justify-end gap-3 pt-4 border-t border-border">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="
            px-4 py-2
            bg-muted hover:bg-accent
            text-foreground font-medium
            rounded-lg
            transition-colors
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          Отмена
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="
            px-4 py-2
            bg-primary hover:bg-primary/90
            text-primary-foreground font-medium
            rounded-lg
            transition-colors
            shadow-sm shadow-primary/20
            disabled:opacity-50 disabled:cursor-not-allowed
            flex items-center gap-2
          "
        >
          {loading && (
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          )}
          {isEditing ? 'Сохранить' : 'Создать'}
        </button>
      </div>
    </div>
  );
}
