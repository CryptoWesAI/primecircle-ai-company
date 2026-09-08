FROM node:24-alpine
WORKDIR /app
# built from the site root so the deterministic core is the same file the game plays with
COPY leaderboard/package.json leaderboard/package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund
COPY leaderboard/server.js leaderboard/admin.js leaderboard/core-prev.js ./
COPY site/game/core.js ./core.js
ENV NODE_ENV=production
RUN mkdir -p /data && chown node:node /data
USER node
EXPOSE 8787
CMD ["node", "server.js"]
