# ContentFabric

Монорепозиторий для системы генерации контента с использованием AI.

## Структура проекта

```
ContentFabric/
├── apps/
│   ├── backend/      # NestJS API сервер
│   ├── frontend/     # Next.js веб-приложение
│   └── admin/        # Админ-панель (в разработке)
├── packages/
│   └── shared/       # Общие типы, DTO и утилиты
└── compose.yaml      # Docker Compose для инфраструктуры
```

## Технологии

- **Backend**: NestJS, MongoDB, Redis, BullMQ
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Shared**: TypeScript

## Быстрый старт

### Требования
- Node.js 18+
- Docker и Docker Compose

### Установка

```bash
# Установка зависимостей
npm install

# Запуск инфраструктуры (MongoDB + Redis)
npm run docker:up

# Запуск в режиме разработки
npm run dev
```

### Команды

| Команда | Описание |
|---------|----------|
| `npm run dev` | Запуск backend и frontend |
| `npm run dev:backend` | Только backend |
| `npm run dev:frontend` | Только frontend |
| `npm run build` | Сборка всех пакетов |
| `npm run docker:up` | Запуск Docker контейнеров |
| `npm run docker:down` | Остановка Docker контейнеров |

## Модули Backend

- **Parameters** - управление параметрами генерации (category, style, modifier, length)
- **Prompt Templates** - шаблоны промптов с переменными
- **Generations** - запуск и управление процессами генерации
- **Generated Prompts** - хранение сгенерированных промптов
- **Generation Results** - результаты генерации
- **Queues** - асинхронная обработка через BullMQ

## API Endpoints

### Parameters
- `GET /parameters` - список параметров
- `POST /parameters` - создание параметра
- `PATCH /parameters/:id` - обновление
- `DELETE /parameters/:id` - удаление

### Prompt Templates
- `GET /prompt-templates` - список шаблонов
- `POST /prompt-templates` - создание шаблона
- `PATCH /prompt-templates/:id` - обновление
- `DELETE /prompt-templates/:id` - удаление

### Generations
- `GET /generations` - список генераций
- `POST /generations` - запуск генерации
- `GET /generations/:id` - статус генерации

## Лицензия

MIT
