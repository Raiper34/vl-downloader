FROM node:18.20.4-alpine AS builder
WORKDIR /vl-downloader
COPY . .
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
RUN npm ci
RUN npm run build

FROM node:18.20.4-alpine
WORKDIR /vl-downloader
COPY --from=builder /vl-downloader/dist .
COPY --from=builder /vl-downloader/src ./src
COPY --from=builder /vl-downloader/package.json ./package.json
COPY --from=builder /vl-downloader/package-lock.json ./package-lock.json
COPY --from=builder /vl-downloader/src/backend/.env.default ./.env
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
ENV PUPPETEER_EXECUTABLE_PATH /usr/bin/chromium-browser
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    redis
RUN rm -rf node_modules
RUN npm ci --omit=dev
RUN rm -rf src package.json package-lock.json
EXPOSE 3000
CMD ["node", "backend/src/main.js"]