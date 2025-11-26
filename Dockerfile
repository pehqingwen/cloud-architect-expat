FROM node:20 AS client-build 
WORKDIR /client

COPY client/package*.json ./
RUN npm ci

COPY client/ .

# 👇 add a default so it's never empty
ARG VITE_API_URL=/api
ENV VITE_API_URL=${VITE_API_URL}

RUN npm run build

# ---------- Server deps stage ----------
FROM node:20-alpine AS server-deps

WORKDIR /server

COPY server/package*.json ./
RUN npm ci --omit=dev


# ---------- Runtime stage ----------
FROM node:20-alpine AS runner

ENV NODE_ENV=production
WORKDIR /server

# If you want healthcheck using curl, uncomment:
# RUN apk add --no-cache curl

# Copy node_modules from deps stage
COPY --from=server-deps /server/node_modules ./node_modules

# Copy server source
COPY server/ .

# Copy built client into server's public folder
# (make sure your Express app serves ./public as static)
COPY --from=client-build /client/dist ./public

EXPOSE 3000

# Optional healthcheck if you add curl above and a /healthz route:
# HEALTHCHECK --interval=30s --timeout=3s CMD curl -f http://127.0.0.1:3000/healthz || exit 1

CMD ["node", "server.js"]
