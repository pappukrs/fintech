FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
COPY services/user-service/package*.json ./services/user-service/
COPY common/package*.json ./common/

# Install dependencies for common
WORKDIR /app/common
RUN npm install

# Install dependencies for service
WORKDIR /app/services/user-service
RUN npm install

# Copy source code
WORKDIR /app
COPY common ./common
COPY services/user-service ./services/user-service
COPY proto ./proto

# Build common
WORKDIR /app/common
RUN npm run build

# Build service
WORKDIR /app/services/user-service
RUN npm run build

EXPOSE 3002
EXPOSE 50052

CMD ["npm", "start"]
