FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Vite bakes VITE_* vars into the bundle at build time, so it must be provided
# as a build arg (set VITE_API_URL as a variable on this Railway service).
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

FROM node:20-alpine AS runtime
WORKDIR /app
RUN npm install -g serve
COPY --from=build /app/dist ./dist

# Railway injects PORT at runtime; -s enables SPA fallback for react-router-dom.
CMD ["sh", "-c", "serve -s dist -l ${PORT:-3000}"]
