'use client';

import { useState } from 'react';
import { Search, Plus, FileText } from 'lucide-react';
import { PromptTemplate } from '@/lib/api';
import { TemplateCard } from './TemplateCard';

interface TemplateListProps {
  /** Массив шаблонов */
  templates: PromptTemplate[];
  /** ID выбранного шаблона */
  selectedId?: string;
  /** Callback при выборе шаблона */
  onSelect?: (template: PromptTemplate) => void;
  /** Callback при удалении шаблона */
  onDelete?: (id: string) => void;
  /** Callback при дублировании шаблона */
  onDuplicate?: (template: PromptTemplate) => void;
  /** Callback при создании нового шаблона */
  onCreate?: () => void;
  /** Состояние загрузки */
  loading?: boolean;
}

/**
 * Список шаблонов с поиском и возможностью создания нового
 */
export function TemplateList({
  templates,
  selectedId,
  onSelect,
  onDelete,
  onDuplicate,
  onCreate,
  loading = false,
}: TemplateListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Фильтрация по поиску
  const filteredTemplates = templates.filter((template) =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.template.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-card border-r border-border">
      {/* Header с поиском */}
      <div className="p-4 border-b border-border space-y-3">
        {/* Кнопка создания */}
        <button
          onClick={onCreate}
          className="
            w-full flex items-center justify-center gap-2
            px-4 py-2.5
            bg-primary hover:bg-primary/90
            text-primary-foreground font-medium
            rounded-xl
            transition-colors
            shadow-sm shadow-primary/20
          "
        >
          <Plus className="w-4 h-4" />
          Новый шаблон
        </button>

        {/* Поиск */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск шаблонов..."
            className="
              w-full pl-10 pr-4 py-2
              bg-muted border border-border rounded-lg
              text-sm text-foreground placeholder-muted-foreground
              focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring
              transition-all
            "
          />
        </div>
      </div>

      {/* Список */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          // Skeleton loading
          <>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="p-4 rounded-xl border border-border animate-pulse"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-muted rounded-lg" />
                  <div className="flex-1">
                    <div className="h-4 bg-muted rounded w-2/3 mb-1" />
                    <div className="h-3 bg-muted/50 rounded w-1/3" />
                  </div>
                </div>
                <div className="h-12 bg-muted/50 rounded-lg mb-3" />
                <div className="flex gap-2">
                  <div className="h-5 bg-muted rounded w-16" />
                  <div className="h-5 bg-muted rounded w-20" />
                </div>
              </div>
            ))}
          </>
        ) : filteredTemplates.length === 0 ? (
          // Empty state
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
              <FileText className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-medium text-foreground mb-1">
              {searchQuery ? 'Ничего не найдено' : 'Нет шаблонов'}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {searchQuery
                ? 'Попробуйте изменить запрос'
                : 'Создайте первый шаблон для начала работы'
              }
            </p>
            {!searchQuery && (
              <button
                onClick={onCreate}
                className="
                  px-4 py-2
                  bg-primary hover:bg-primary/90
                  text-primary-foreground text-sm font-medium
                  rounded-lg transition-colors
                "
              >
                Создать шаблон
              </button>
            )}
          </div>
        ) : (
          // Template cards
          filteredTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              selected={template.id === selectedId}
              onClick={() => onSelect?.(template)}
              onDelete={() => onDelete?.(template.id)}
              onDuplicate={() => onDuplicate?.(template)}
            />
          ))
        )}
      </div>

      {/* Footer с количеством */}
      {!loading && templates.length > 0 && (
        <div className="p-3 border-t border-border text-center">
          <span className="text-xs text-muted-foreground">
            {filteredTemplates.length === templates.length
              ? `${templates.length} ${templates.length === 1 ? 'шаблон' : templates.length < 5 ? 'шаблона' : 'шаблонов'}`
              : `${filteredTemplates.length} из ${templates.length}`
            }
          </span>
        </div>
      )}
    </div>
  );
}
