# ===============================
# Base
# ===============================
FROM node:18-alpine

# pnpm
RUN corepack enable

WORKDIR /app

# ===============================
# Copiar manifests del monorepo
# ===============================
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/package.json
COPY packages ./packages

# ===============================
# Instalar deps (INCLUYE devDeps)
# ===============================
RUN pnpm install --filter ./apps/api... --frozen-lockfile

# ===============================
# Copiar código del API
# ===============================
COPY apps/api ./apps/api

# ===============================
# Build (tsc ahora SÍ existe)
# ===============================
RUN pnpm --filter ./apps/api build

# ===============================
# Runtime
# ===============================
EXPOSE 3001

CMD ["node", "apps/api/dist/server.js"]
