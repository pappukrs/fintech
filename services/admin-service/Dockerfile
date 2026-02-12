FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
COPY services/admin-service/package*.json ./services/admin-service/
COPY common/package*.json ./common/

# Install dependencies for common
WORKDIR /app/common
RUN npm install

# Install dependencies for service
WORKDIR /app/services/admin-service
RUN npm install

# Copy source code
WORKDIR /app
COPY common ./common
COPY services/admin-service ./services/admin-service
COPY proto ./proto

# Build common
WORKDIR /app/common
RUN npm run build

# Build service
WORKDIR /app/services/admin-service
RUN npm run build

EXPOSE 3006
CMD ["npm", "start"]
