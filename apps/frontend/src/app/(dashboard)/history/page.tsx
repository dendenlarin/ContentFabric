'use client';

import { useState, useEffect, useCallback } from 'react';
import { History as HistoryIcon, ChevronDown, ChevronUp, Clock, Sparkles } from 'lucide-react';
import { Button, Card, CardContent, Badge, Select, Input, StatusBadge } from '@/components/ui';
import { formatDateTime } from '@/lib/utils';
import {
  Generation,
  GenerationResult,
  getGenerations,
  getGenerationResults,
} from '@/lib/api';

/**
 * Страница истории генераций
 * Показывает все завершённые генерации с возможностью просмотра результатов
 */
export default function HistoryPage() {
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, GenerationResult[]>>({});
  const [loadingResults, setLoadingResults] = useState<string | null>(null);

  // Фильтры
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Загрузка генераций
  const loadGenerations = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getGenerations();
      setGenerations(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGenerations();
  }, [loadGenerations]);

  // Загрузка результатов генерации
  const loadResults = async (generationId: string) => {
    if (results[generationId]) return;

    try {
      setLoadingResults(generationId);
      const data = await getGenerationResults(generationId);
      setResults((prev) => ({ ...prev, [generationId]: data }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingResults(null);
    }
  };

  // Toggle развёрнутости
  const toggleExpanded = async (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
      await loadResults(id);
    }
  };

  // Фильтрация
  const filteredGenerations = generations.filter((gen) => {
    if (statusFilter && statusFilter !== 'all' && gen.status !== statusFilter) return false;

    if (dateFrom) {
      const from = new Date(dateFrom);
      const created = new Date(gen.createdAt);
      if (created < from) return false;
    }

    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59);
      const created = new Date(gen.createdAt);
      if (created > to) return false;
    }

    return true;
  });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">История генераций</h1>
        <p className="text-muted-foreground mt-1">
          Просматривайте все выполненные генерации и их результаты
        </p>
      </div>

      {/* Фильтры */}
      <div className="flex flex-wrap gap-4 p-4 bg-card rounded-xl border border-border">
        <Select
          label="Статус"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={[
            { value: 'all', label: 'Все статусы' },
            { value: 'completed', label: 'Завершено' },
            { value: 'running', label: 'Выполняется' },
            { value: 'pending', label: 'Ожидание' },
            { value: 'failed', label: 'Ошибка' },
          ]}
        />

        <Input
          type="date"
          label="С даты"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
        />

        <Input
          type="date"
          label="По дату"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
        />

        {(statusFilter !== 'all' || dateFrom || dateTo) && (
          <div className="flex items-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setStatusFilter('all');
                setDateFrom('');
                setDateTo('');
              }}
            >
              Сбросить
            </Button>
          </div>
        )}
      </div>

      {/* Список генераций */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent>
                <div className="h-5 bg-muted rounded w-1/3 mb-2" />
                <div className="h-4 bg-muted/50 rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredGenerations.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <HistoryIcon className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              Нет генераций
            </h3>
            <p className="text-muted-foreground">
              {statusFilter !== 'all' || dateFrom || dateTo
                ? 'Попробуйте изменить фильтры'
                : 'История генераций пуста'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredGenerations.map((gen) => (
            <Card key={gen.id} className="overflow-hidden">
              <CardContent className="p-0">
                {/* Header */}
                <div
                  onClick={() => toggleExpanded(gen.id)}
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-accent transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Sparkles className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">{gen.name}</h3>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span>{gen.provider} / {gen.modelId}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {formatDateTime(gen.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">
                      {gen.tasks?.length ?? 0} задач
                    </span>
                    <StatusBadge status={gen.status} />
                    {expandedId === gen.id ? (
                      <ChevronUp className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                </div>

                {/* Expanded results */}
                {expandedId === gen.id && (
                  <div className="border-t border-border p-4 bg-muted/50">
                    {loadingResults === gen.id ? (
                      <div className="text-center py-4 text-muted-foreground">
                        Загрузка результатов...
                      </div>
                    ) : results[gen.id]?.length === 0 ? (
                      <div className="text-center py-4 text-muted-foreground">
                        Нет результатов
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {results[gen.id]?.map((result, index) => (
                          <div
                            key={result.id}
                            className="p-4 bg-card rounded-lg border border-border"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-muted-foreground">
                                Результат #{index + 1}
                              </span>
                              <Badge
                                variant={result.status === 'success' ? 'success' : 'error'}
                              >
                                {result.status === 'success' ? 'Успех' : 'Ошибка'}
                              </Badge>
                            </div>
                            <p className="text-sm text-foreground whitespace-pre-wrap">
                              {result.promptText}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Footer с количеством */}
      {!loading && filteredGenerations.length > 0 && (
        <div className="text-center text-sm text-muted-foreground">
          Показано {filteredGenerations.length} из {generations.length} генераций
        </div>
      )}
    </div>
  );
}
