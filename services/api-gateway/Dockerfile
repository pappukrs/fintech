FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
COPY services/api-gateway/package*.json ./services/api-gateway/
COPY common/package*.json ./common/

# Install dependencies for common
WORKDIR /app/common
RUN npm install

# Install dependencies for service
WORKDIR /app/services/api-gateway
RUN npm install

# Copy source code
WORKDIR /app
COPY common ./common
COPY services/api-gateway ./services/api-gateway

# Build common
WORKDIR /app/common
RUN npm run build

# Build service
WORKDIR /app/services/api-gateway
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
