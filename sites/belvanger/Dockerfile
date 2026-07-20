# Belvanger — website + chat-assistent in één geïsoleerde container (node-chatbotserver).
# De server serveert de statische site (STATIC_DIR) én /api/chat + /api/config same-origin.
FROM node:22-alpine

WORKDIR /app

# App (server + klant-config + dashboard), gebouwd door assemble.mjs, + de volledige site.
COPY app/ ./
COPY site/ ./site/

# Analytics-map + alles eigendom van de non-root 'node' gebruiker.
RUN mkdir -p /app/data && chown -R node:node /app

ENV NODE_ENV=production
ENV STATIC_DIR=/app/site
ENV DATA_DIR=/app/data
ENV CUSTOMER=belvanger
ENV PORT=8092
EXPOSE 8092

# Draai NIET als root.
USER node

# Geen dependencies → geen npm install nodig.
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:8092/',r=>process.exit(r.statusCode<500?0:1)).on('error',()=>process.exit(1))"

CMD ["node", "server.js"]
