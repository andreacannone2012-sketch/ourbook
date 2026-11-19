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

ENV NODE_ENV=production
ENV PORT=7860

COPY package*.json ./
RUN npm install --omit=dev --no-audit --no-fund

COPY . .

EXPOSE 7860

CMD ["node", "--expose-gc", "server.js"]
