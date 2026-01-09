'use client';

import { useState, useEffect } from 'react';
import { Save, Key, Cpu, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button, Input, Select, Card, CardHeader, CardTitle, CardContent } from '@/components/ui';

/**
 * Страница настроек приложения
 * API ключи и настройки по умолчанию
 */
export default function SettingsPage() {
  // API ключи
  const [openaiKey, setOpenaiKey] = useState('');
  const [anthropicKey, setAnthropicKey] = useState('');
  const [googleKey, setGoogleKey] = useState('');

  // Настройки по умолчанию
  const [defaultProvider, setDefaultProvider] = useState('openai');
  const [defaultModel, setDefaultModel] = useState('gpt-4');

  // Состояние
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Сохранение настроек
  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      // Сохраняем в localStorage (в реальном приложении - на бэкенд)
      localStorage.setItem('settings', JSON.stringify({
        openaiKey,
        anthropicKey,
        googleKey,
        defaultProvider,
        defaultModel,
      }));

      setSuccess('Настройки сохранены');
    } catch (err) {
      setError('Ошибка сохранения настроек');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // Загрузка настроек при монтировании
  useEffect(() => {
    const saved = localStorage.getItem('settings');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setOpenaiKey(data.openaiKey || '');
        setAnthropicKey(data.anthropicKey || '');
        setGoogleKey(data.googleKey || '');
        setDefaultProvider(data.defaultProvider || 'openai');
        setDefaultModel(data.defaultModel || 'gpt-4');
      } catch (err) {
        console.error(err);
      }
    }
  }, []);

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Настройки</h1>
        <p className="text-muted-foreground mt-1">
          Управление API ключами и настройками по умолчанию
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

      {/* API ключи */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-primary" />
            <CardTitle>API ключи провайдеров</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="OpenAI API Key"
            type="password"
            value={openaiKey}
            onChange={(e) => setOpenaiKey(e.target.value)}
            placeholder="sk-..."
          />

          <Input
            label="Anthropic API Key"
            type="password"
            value={anthropicKey}
            onChange={(e) => setAnthropicKey(e.target.value)}
            placeholder="sk-ant-..."
          />

          <Input
            label="Google AI API Key"
            type="password"
            value={googleKey}
            onChange={(e) => setGoogleKey(e.target.value)}
            placeholder="AIza..."
          />

          <p className="text-xs text-muted-foreground">
            API ключи хранятся локально и используются для генерации контента
          </p>
        </CardContent>
      </Card>

      {/* Настройки по умолчанию */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-primary" />
            <CardTitle>Настройки по умолчанию</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select
            label="Провайдер по умолчанию"
            value={defaultProvider}
            onChange={(e) => setDefaultProvider(e.target.value)}
            options={[
              { value: 'openai', label: 'OpenAI' },
              { value: 'anthropic', label: 'Anthropic' },
              { value: 'google', label: 'Google AI' },
            ]}
          />

          <Select
            label="Модель по умолчанию"
            value={defaultModel}
            onChange={(e) => setDefaultModel(e.target.value)}
            options={
              defaultProvider === 'openai'
                ? [
                    { value: 'gpt-4', label: 'GPT-4' },
                    { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
                    { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
                  ]
                : defaultProvider === 'anthropic'
                ? [
                    { value: 'claude-3-opus', label: 'Claude 3 Opus' },
                    { value: 'claude-3-sonnet', label: 'Claude 3 Sonnet' },
                    { value: 'claude-3-haiku', label: 'Claude 3 Haiku' },
                  ]
                : [
                    { value: 'gemini-pro', label: 'Gemini Pro' },
                    { value: 'gemini-ultra', label: 'Gemini Ultra' },
                  ]
            }
          />
        </CardContent>
      </Card>

      {/* Кнопка сохранения */}
      <Button
        onClick={handleSave}
        loading={saving}
        className="flex items-center gap-2"
      >
        <Save className="w-4 h-4" />
        Сохранить настройки
      </Button>
    </div>
  );
}
