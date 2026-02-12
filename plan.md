

# ✅ **README.md — Loan Fintech Microservices Platform (Production Architecture)**

---

# 🏦 Loan Fintech Platform — Express Microservices Architecture

Production-grade loan management platform built using:

* **Express.js microservices**
* **RabbitMQ event-driven architecture**
* **gRPC synchronous communication**
* **Shared PostgreSQL (schema-per-service)**
* **External Integration Service for vendor APIs**
* **Redis caching**
* **Dockerized infrastructure**
* **SOLID design principles**
* **Fintech-grade reliability**

---

# 🎯 System Goals

* True microservices architecture
* Vendor abstraction layer (External Service)
* Independent service deployment
* Schema-per-service database isolation
* Event-driven async communication
* Scalable fintech-grade system
* Strong SOLID design
* Production-ready infra
* Robust loan lifecycle management

---

# 🏗 High Level Architecture (HLD)

```
Clients (Mobile / Web Admin)
            |
        Nginx Gateway (Edge Layer)
            |
     Express API Gateway (Application Layer)
            |
 -----------------------------------------------------------------------
 | Auth | User | Loan | EMI | Payment | Admin | Notification | External |
 -----------------------------------------------------------------------
                              |
                   PostgreSQL (Single Instance)
                     (Schema per Service)
                              |
                            Redis
                              |
                          RabbitMQ
```

---

# 🌐 Gateway Architecture

### 1️⃣ Nginx Gateway (Edge Layer)

Responsibilities:
* SSL termination
* Load balancing
* Reverse proxy
* Request filtering
* Compression
* Basic rate limiting
* Security protection

👉 No business logic allowed.

### 2️⃣ Express API Gateway (Application Layer)

Responsibilities:
* JWT validation
* Request routing
* API versioning
* Request validation
* Logging
* Response aggregation
* Service proxying

👉 No domain business logic allowed.

## Gateway Rules

* Clients communicate only through gateway
* Services never exposed publicly
* Gateway does not contain business logic
* Gateway does not access database

---

# 🧩 Microservices Overview

---

## 1️⃣ Auth Service

Authentication & authorization.

* Login / Logout
* JWT generation
* Refresh tokens
* Role-based access control
* Password hashing
* Session management

Schema: `auth_schema`

---

## 2️⃣ User Service

User identity and KYC data.

* User profile
* KYC data
* Address management
* Bank details
* User lifecycle

Schema: `user_schema`

---

## 3️⃣ Loan Service

Core loan lifecycle.

* Loan application
* Loan approval/rejection
* Loan state machine
* Status tracking
* Loan audit logs

Schema: `loan_schema`

---

## 4️⃣ EMI Service

Payment scheduling engine.

* EMI schedule generation
* EMI tracking
* Late penalty calculation
* Cron jobs
* EMI reminders

Schema: `emi_schema`

---

## 5️⃣ Payment Service

Payment processing orchestration.

* Payment initiation
* Transaction records
* Payment reconciliation
* Idempotency handling
* Webhook processing

👉 **Does NOT call vendors directly**
Uses External Integration Service.

Schema: `payment_schema`

---

## 6️⃣ Admin Service

Administrative operations.

* Dashboard APIs
* Reports
* Manual overrides
* Analytics

Schema: `admin_schema`

---

## 7️⃣ Notification Service

Communication engine.

* SMS
* Email
* Push notifications
* Event listeners

Schema: `notification_schema`

---

# 🔌 8️⃣ External Integration Service ⭐ (Vendor Gateway)

Centralized service for **all third-party APIs**.

---

## Responsibilities

### Payment Providers

* Cashfree integration
* Payment verification
* Webhook validation
* Future provider switching (Razorpay etc.)

---

### Identity Verification

* PAN verification
* Aadhaar verification
* KYC provider APIs
* Document validation

---

### Bank Verification

* Bank account validation
* IFSC validation
* Account ownership checks

---

### Other Vendor APIs

* SMS providers
* Email providers
* Credit bureau APIs
* Fraud detection APIs

---

## Why This Service Exists

* Vendor abstraction
* Centralized API key management
* Retry & circuit breaker
* Standard error handling
* Provider switching capability
* Security isolation
* Audit logging

---

## Design Patterns Used

* Adapter Pattern (vendor wrappers)
* Strategy Pattern (provider selection)
* Circuit Breaker Pattern
* Retry Pattern

---

## External Service Database

Schema: `external_schema`

Stores:

* Verification logs
* Vendor responses
* Audit trails
* Retry state

---

## Usage Rules

```
Loan Service needs PAN verification
→ Call External Service

Payment Service needs Cashfree
→ Call External Service
```

Direct vendor calls are forbidden.

---

# 📦 Shared Library (NOT a service)

Reusable utilities:

```
@platform/common
```

Contains:

* Logger
* DB connection manager
* Error handling
* Response formatter
* Validation utilities
* Auth middleware
* Event publisher
* gRPC client wrapper
* Circuit breaker utilities

No business logic allowed.

---

# 🔗 Communication Strategy

---

## ✅ Synchronous → gRPC

Used when immediate response required.

Examples:

```
Loan → User Service (verify user)
Loan → External Service (PAN verification)
Payment → External Service (Cashfree)
Admin → Loan Service
```

---

## ✅ Asynchronous → RabbitMQ

Event-driven communication.

Events:

```
loan.created
loan.approved
emi.generated
payment.completed
payment.failed
user.kyc.verified
verification.completed
verification.failed
```

Consumers subscribe independently.

---

# 🗄 Database Strategy

---

## Shared PostgreSQL Instance

Schema-per-service:

```
auth_schema
user_schema
loan_schema
emi_schema
payment_schema
admin_schema
notification_schema
external_schema
```

---

## Database Rules (STRICT)

* Service accesses only its schema
* No cross-service joins
* No foreign keys across schemas
* No direct DB access between services
* Communication only via APIs/events

---

# ⚡ Caching Strategy (Redis)

Used for:

* JWT blacklist
* OTP storage
* Loan summaries
* Dashboard metrics
* EMI reminders
* Vendor response caching
* Rate limiting

---

# 🔄 Loan Lifecycle Flow

---

## Loan Application

```
Client → Nginx Gateway → Express API Gateway → Loan Service
Loan → User Service (gRPC validation)
Loan → External Service (PAN/KYC verification)
Loan → Store application
Loan → Publish loan.created
```

---

## Loan Approval

```
Admin → Admin Service → Loan Service
Loan → Update status
Loan → Publish loan.approved
```

---

## EMI Generation

```
EMI Service listens loan.approved
Generate EMI schedule
Store EMI records
Publish emi.generated
```

---

## Payment Flow

```
User pays → Payment Service
Payment → External Service → Cashfree
External → Verify payment
Payment → Store transaction
Publish payment.completed
EMI Service updates EMI status
```

---

## Notification Flow

```
Notification Service listens events
Send SMS/Email/Push
```

---

# 🧠 Design Principles (MANDATORY)

---

## SOLID Principles

* Single Responsibility per service
* Dependency injection
* Interface-based design
* Loose coupling
* Open/Closed modules

---

## Design Patterns

* Repository Pattern
* Factory Pattern
* Observer Pattern
* Strategy Pattern
* Saga Pattern
* Adapter Pattern
* Circuit Breaker Pattern

---

# 🔁 Transaction Strategy

Use **Saga Pattern** for distributed workflows.

Example:

```
Loan Approved → EMI generation fails
→ Compensation event → revert loan status
```

No distributed transactions.

---

# 🐳 Docker Architecture

Each service includes:

```
Dockerfile
.env
src/
```

---

## docker-compose.yml should start

* Nginx Gateway (Edge Layer)
* Express API Gateway (Application Layer)
* All services
* PostgreSQL
* RabbitMQ
* Redis
* Prometheus
* Grafana

Run:

```
docker compose up
```

---

# 🌱 Initial Setup & Seeding

Script:

```
scripts/setup.sh
```

Responsibilities:

* Create DB schemas
* Create DB users
* Seed roles
* Seed admin user
* Configure RabbitMQ queues
* Configure Redis
* Setup initial configs

Run:

```
bash scripts/setup.sh
```

---

# 📁 Repository Structure

```
loan-platform/
│
├── services/
│   ├── auth-service/
│   ├── user-service/
│   ├── loan-service/
│   ├── emi-service/
│   ├── payment-service/
│   ├── admin-service/
│   ├── notification-service/
│   ├── external-service/
│   └── api-gateway/        ← Express gateway
│
├── gateway/
│   └── nginx/              ← Nginx config
│
├── common/
├── scripts/
├── docker-compose.yml
└── README.md
```

---

# 📦 Service Structure

Each service:

```
src/
├── controllers/
├── routes/
├── services/
├── repositories/
├── models/
├── events/
├── grpc/
├── middleware/
├── adapters/      (for external-service)
├── config/
└── app.ts
```

---

# 🔐 Security Requirements

* JWT authentication
* Role-based access control
* Request validation
* Rate limiting
* Audit logs
* Encrypted secrets
* HTTPS only
* Vendor API key isolation (external service only)

---

# 📊 Observability

* Centralized logging
* Prometheus metrics
* Distributed tracing
* Health endpoints `/health`

---

# ⚡ Scaling Rules

* Stateless services
* Horizontal scaling
* Idempotent APIs
* Retry strategy
* Circuit breaker pattern

---

# 🚫 Strict Rules

* No shared business logic outside services
* No direct vendor calls except external service
* No cross-service DB queries
* No synchronous dependency loops
* No tight coupling

---

# 🎯 Technology Stack

* Node.js + Express + typescript
* PostgreSQL
* RabbitMQ
* gRPC
* Redis
* Docker
* Cashfree Payment Gateway
* Prometheus + Grafana

---

# 🎯 Expected System Properties

* Horizontally scalable
* Fault tolerant
* Vendor independent
* Event-driven
* Strong data isolation
* Fintech-grade reliability
* Production-ready architecture

---

