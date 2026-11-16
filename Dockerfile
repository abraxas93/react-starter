FROM node:24-alpine AS build
WORKDIR /app
RUN corepack enable && corepack install --global pnpm@10.23.0
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
ARG VITE_API_URL=
ARG VITE_ENABLE_MOCK=
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_ENABLE_MOCK=$VITE_ENABLE_MOCK
RUN pnpm build

# Runs as the unprivileged nginx user and therefore listens on 8080, not 80.
FROM nginxinc/nginx-unprivileged:alpine AS runtime
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
