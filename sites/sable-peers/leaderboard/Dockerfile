FROM node:24-alpine
WORKDIR /app
COPY package.json server.js admin.js ./
ENV NODE_ENV=production
RUN mkdir -p /data && chown node:node /data
USER node
EXPOSE 8787
CMD ["node", "server.js"]
