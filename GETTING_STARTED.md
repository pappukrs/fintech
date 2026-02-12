# 🚀 Getting Started with Local Development

Welcome to the Fintech Microservices platform! This guide will walk you through setting up the project on your local machine for development and testing.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18+ recommended)
- **NPM** (v9+)
- **Docker** and **Docker Compose**
- **Git**

---

## 🏗️ 1. Infrastructure Setup (Docker)

The project relies on several infrastructure components (PostgreSQL, RabbitMQ, Redis, etc.). The easiest way to run these is via Docker Compose.

```bash
# Start all infrastructure and services
docker compose up -d
```

### Infrastructure Services:
| Service | Port | Description |
| :--- | :--- | :--- |
| **PostgreSQL** | `5432` | Main database (All schemas) |
| **RabbitMQ** | `5672`, `15672` | Message broker (Management UI on 15672) |
| **Redis** | `6379` | Caching and session management |
| **Prometheus** | `9090` | Metrics collection |
| **Grafana** | `3000` | Dashboards (Login: admin/admin) |

---

## 📦 2. Shared Library Setup

The `@platform/common` library is used by all microservices. You must build it first if you plan to run services locally outside of Docker.

```bash
cd common
npm install
npm run build
```

---

## 🛠️ 3. Running Services Locally (Hybrid Mode)

If you want to develop a specific service locally while keeping others in Docker:

1.  **Stop the service in Docker**:
    ```bash
    docker stop fintech-<service-name>
    ```
2.  **Configure Environment Variables**:
    Create a `.env` file in the service directory (e.g., `services/auth-service/.env`) using the values from `docker-compose.yml`, but replace service names with `localhost`.
    
    Example for `auth-service`:
    ```env
    PORT=3000
    DATABASE_URL=postgres://admin:adminpassword@localhost:5432/fintech_db
    RABBITMQ_URL=amqp://guest:guest@localhost:5672
    JWT_KEY=supersecret
    ```
3.  **Install and Run**:
    ```bash
    cd services/<service-name>
    npm install
    npm run dev
    ```

---

## 🔗 4. Service Discovery & Communication

### Synchronous (gRPC)
Services communicate synchronously via gRPC. If running locally,Ensure you have the proto files available (they are in the root `/proto` directory).

| Service | gRPC Port |
| :--- | :--- |
| **User Service** | `50052` |
| **External Service** | `50053` |
| **Loan Service** | `50051` |

### Asynchronous (RabbitMQ)
Events are published to RabbitMQ. You can monitor exchanges and queues at [http://localhost:15672](http://localhost:15672).

---

## 🗄️ 5. Database Management

The project uses a **Schema-per-Service** strategy.
- All services connect to the `fintech_db` database.
- Each service uses its own schema (e.g., `auth_schema`, `user_schema`).

To initialize or reset the database schemas, you can use the script provided:
```bash
# This is automatically handled by Docker Compose on first run
bash scripts/setup.sh
```

---

## 🧪 6. Testing

Run tests for individual services:
```bash
cd services/<service-name>
npm test
```

---

## 🚩 Common Issues

- **Port Conflicts**: Ensure ports `3000-3008`, `5432`, `5672`, `6379`, and `50051-50053` are free.
- **Shared Library Linking**: If you see `@platform/common` not found, ensure you've run `npm install` in the service directory after building `common`.
