# syntax=docker/dockerfile:1
FROM node:20-alpine AS base

FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# public/ is empty in this repo, and git does not track empty directories, so
# a fresh clone has no public/ for the runner stage to copy. Standalone output
# does not bundle it either.
RUN mkdir -p public
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_API_BASE
# Where the prerender pass should reach the backend. Falls back to the public
# URL when unset, which only works if the site is already serving.
ARG MEDINTEL_INTERNAL_API_BASE
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}
ENV NEXT_PUBLIC_API_BASE=${NEXT_PUBLIC_API_BASE}
ENV MEDINTEL_INTERNAL_API_BASE=${MEDINTEL_INTERNAL_API_BASE}
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
CMD ["node", "server.js"]
