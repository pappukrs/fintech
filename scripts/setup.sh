#!/bin/bash

# 1. Create DB schemas (already handled by init.sql if using Docker, but good for manual setup)
echo "Setting up database schemas..."
# In a real scenario, we'd use a psql command here if the DB is already up.

# 2. Configure RabbitMQ (Exchanges/Queues)
echo "Configuring RabbitMQ..."
# For now, this is a placeholder. Real script would use rabbitmqadmin or a small node script.

# 3. Setup initial configs/env files
echo "Initializing environment files..."
if [ ! -f .env ]; then
  cat <<EOF > .env
PORT=3000
DATABASE_URL=postgres://admin:adminpassword@localhost:5432/fintech_db
RABBITMQ_URL=amqp://guest:guest@localhost:5672
REDIS_URL=redis://localhost:6379
JWT_SECRET=supersecret
EOF
  echo ".env created"
fi

echo "Setup complete!"
