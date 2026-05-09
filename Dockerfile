FROM node:20-bookworm-slim AS base

ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

FROM base AS deps

COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder

ARG DATABASE_URL=postgresql://postgres:postgres@localhost:5432/myblog002?schema=public
ENV NODE_ENV=production
ENV DATABASE_URL=${DATABASE_URL}

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npx prisma generate
RUN npm run build

FROM base AS runner

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=8080

RUN groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid 1001 nextjs

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

USER nextjs

EXPOSE 8080

CMD ["node", "server.js"]

FROM base AS migrator

ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json ./
COPY prisma ./prisma

CMD ["npx", "prisma", "migrate", "deploy"]
