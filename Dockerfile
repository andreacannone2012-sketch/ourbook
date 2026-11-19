FROM node:20-bookworm-slim

WORKDIR /app

# Dipendenze Linux richieste dai provider e dalle librerie native.
RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    openjdk-17-jre-headless \
    pdftk-java \
    fonts-liberation \
    ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci --omit=dev --no-audit --no-fund

COPY . .

ENV NODE_ENV=production
ENV PORT=7860

EXPOSE 7860

CMD ["node", "--expose-gc", "server.js"]
