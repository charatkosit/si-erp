FROM node:24.21.0-bookworm-slim AS build

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts
COPY angular.json tsconfig.json tsconfig.app.json ./
COPY src ./src
RUN npm run build

FROM nginx:1.30.5-alpine

COPY --from=build /app/dist/browser /usr/share/nginx/html
