FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
COPY services/notification-service/package*.json ./services/notification-service/
COPY common/package*.json ./common/

# Install dependencies for common
WORKDIR /app/common
RUN npm install

# Install dependencies for service
WORKDIR /app/services/notification-service
RUN npm install

# Copy source code
WORKDIR /app
COPY common ./common
COPY services/notification-service ./services/notification-service
COPY proto ./proto

# Build common
WORKDIR /app/common
RUN npm run build

# Build service
WORKDIR /app/services/notification-service
RUN npm run build

EXPOSE 3007
CMD ["npm", "start"]
