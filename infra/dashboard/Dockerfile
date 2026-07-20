# PrimeCircle VPS Control — Node + docker CLI (voor `docker compose up -d`).
FROM node:22-alpine

# docker-cli + compose-plugin zodat de app containers kan hermaken via de gemounte socket.
RUN apk add --no-cache docker-cli docker-cli-compose

WORKDIR /app
COPY app/ /app/
RUN mkdir -p /app/data

ENV PORT=8095 \
    PROJECTS_ROOT=/opt \
    BACKUP_ROOT=/opt/dashboard-backups \
    DATA_DIR=/app/data \
    NODE_ENV=production

EXPOSE 8095
# Draait als root: nodig voor toegang tot de docker-socket en de /opt/.env-bestanden.
# Acceptabel omdat de app UITSLUITEND op het privé Tailscale-netwerk bereikbaar is.
CMD ["node", "server.js"]
