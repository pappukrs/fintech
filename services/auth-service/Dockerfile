FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
COPY services/auth-service/package*.json ./services/auth-service/
COPY common/package*.json ./common/

# Install dependencies for common
WORKDIR /app/common
RUN npm install

# Install dependencies for service
WORKDIR /app/services/auth-service
RUN npm install

# Copy source code
WORKDIR /app
COPY common ./common
COPY services/auth-service ./services/auth-service
COPY proto ./proto

# Build common
WORKDIR /app/common
RUN npm run build

# Build service
WORKDIR /app/services/auth-service
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
