# Dockerfile для Admin панели (BullMQ Board)
# Контекст сборки: корень monorepo (для pnpm workspaces)

FROM node:20-alpine

# Включаем corepack для pnpm
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

WORKDIR /app

# Копируем конфигурацию workspaces
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY .npmrc* ./
COPY apps/admin/package.json ./apps/admin/

# Устанавливаем зависимости
RUN pnpm install --frozen-lockfile

# Копируем исходники admin
COPY apps/admin/ ./apps/admin/

# Собираем проект
RUN pnpm --filter @content-fabric/admin build

EXPOSE 3002

CMD ["pnpm", "--filter", "@content-fabric/admin", "start"]
