# ---- Backend Dockerfile ----
FROM node:20-alpine

# Create app directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy the rest of your backend code
COPY . .

# Set environment (we'll override with real values in K8s later)
ENV NODE_ENV=production
# ENV PORT=3000

# Your backend listens on this port (change if yours is different)
EXPOSE 3000

# Replace server.js with your actual entry file (e.g. index.js/app.js)
CMD ["node", "server.js"]
