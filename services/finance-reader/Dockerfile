FROM node:22-bookworm-slim
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY access.mjs server.mjs ./
ENV NODE_ENV=production
USER node
CMD ["node", "server.mjs"]
