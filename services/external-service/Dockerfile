FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
COPY services/external-service/package*.json ./services/external-service/
COPY common/package*.json ./common/

# Install dependencies for common
WORKDIR /app/common
RUN npm install

# Install dependencies for service
WORKDIR /app/services/external-service
RUN npm install

# Copy source code
WORKDIR /app
COPY common ./common
COPY services/external-service ./services/external-service
COPY proto ./proto

# Build common
WORKDIR /app/common
RUN npm run build

# Build service
WORKDIR /app/services/external-service
RUN npm run build

EXPOSE 3008
EXPOSE 50053

CMD ["npm", "start"]
