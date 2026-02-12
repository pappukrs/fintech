FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
COPY services/loan-service/package*.json ./services/loan-service/
COPY common/package*.json ./common/

# Install dependencies for common
WORKDIR /app/common
RUN npm install

# Install dependencies for service
WORKDIR /app/services/loan-service
RUN npm install

# Copy source code
WORKDIR /app
COPY common ./common
COPY services/loan-service ./services/loan-service
COPY proto ./proto

# Build common
WORKDIR /app/common
RUN npm run build

# Build service
WORKDIR /app/services/loan-service
RUN npm run build

EXPOSE 3003

CMD ["npm", "start"]
