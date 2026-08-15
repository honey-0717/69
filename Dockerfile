FROM node:22-alpine AS builder

WORKDIR /app

COPY backend/package*.json ./backend/
RUN cd backend && npm ci

COPY backend/tsconfig.json ./backend/
COPY backend/src ./backend/src

RUN cd backend && npm run build

FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY backend/package*.json ./backend/
RUN cd backend && npm ci --omit=dev

COPY --from=builder /app/backend/dist ./backend/dist

WORKDIR /app/backend

CMD ["node", "dist/server.js"]
