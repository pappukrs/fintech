FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
COPY services/emi-service/package*.json ./services/emi-service/
COPY common/package*.json ./common/

# Install dependencies for common
WORKDIR /app/common
RUN npm install

# Install dependencies for service
WORKDIR /app/services/emi-service
RUN npm install

# Copy source code
WORKDIR /app
COPY common ./common
COPY services/emi-service ./services/emi-service
COPY proto ./proto

# Build common
WORKDIR /app/common
RUN npm run build

# Build service
WORKDIR /app/services/emi-service
RUN npm run build

EXPOSE 3004

CMD ["npm", "start"]
