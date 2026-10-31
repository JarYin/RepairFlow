# Production does not run this image (ADR-0008). CI builds it to prove the API
# can move off Vercel. Build from the repo root:
#   docker build -f apps/api/Dockerfile -t repairflow-api .
FROM node:24-slim AS build
RUN corepack enable
WORKDIR /repo
COPY . .
RUN pnpm install --frozen-lockfile --filter "api..."
RUN pnpm --filter "api..." build
RUN pnpm --filter api deploy --legacy --prod /app

FROM node:24-slim
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /app .
USER node
EXPOSE 4000
CMD ["node", "dist/main.js"]
