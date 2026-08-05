# Multi-stage build for the NestJS backend (modular monolith).
# Authored to convention; NOT built or linted in the authoring sandbox (no docker).

# ---- build stage ----
FROM node:22-slim AS build
WORKDIR /app
COPY package.json package-lock.json* tsconfig.base.json ./
COPY backend/package.json ./backend/
COPY packages ./packages
RUN npm ci
COPY backend ./backend
RUN npm run build -w @barber-marketplace/backend

# ---- runtime stage ----
FROM node:22-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY package.json package-lock.json* ./
COPY backend/package.json ./backend/
RUN npm ci --omit=dev --workspace @barber-marketplace/backend
COPY --from=build /app/backend/dist ./backend/dist
USER node
EXPOSE 3000
CMD ["node", "backend/dist/app/main.js"]
