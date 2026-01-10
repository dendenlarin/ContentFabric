# Dockerfile для Admin панели (BullMQ Board)
# Контекст сборки: ./apps/admin

FROM node:20-alpine

# Включаем corepack для pnpm
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

WORKDIR /app

# Копируем package.json
COPY package.json pnpm-lock.yaml* ./

# Устанавливаем зависимости
RUN pnpm install --frozen-lockfile

# Копируем исходники
COPY . .

# Собираем проект
RUN pnpm build

EXPOSE 3002

CMD ["pnpm", "start"]
