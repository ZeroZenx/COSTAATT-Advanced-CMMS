#!/bin/bash

echo "🚀 COSTAATT CMMS - Quick Start"
echo "================================"

# Install dependencies
echo "📦 Installing dependencies..."
npm install
cd apps/api && npm install
cd ../web && npm install
cd ../..

# Start database
echo "🗄️ Starting database..."
docker compose up -d

# Wait for database
echo "⏳ Waiting for database to be ready..."
sleep 15

# Setup database
echo "🔧 Setting up database..."
cd apps/api
npx prisma db push
npx prisma db seed
cd ../..

echo ""
echo "✅ Setup complete!"
echo ""
echo "🌐 Access your CMMS system:"
echo "   Frontend: http://localhost:5174"
echo "   API: http://localhost:4000"
echo "   phpMyAdmin: http://localhost:8081"
echo ""
echo "🔑 Login credentials:"
echo "   Admin: admin@costaatt.edu.tt / password"
echo "   Supervisor: supervisor@costaatt.edu.tt / password"
echo "   Technician: technician1@costaatt.edu.tt / password"
echo "   Faculty: faculty@costaatt.edu.tt / password"
echo ""
echo "🚀 Starting development servers..."
npm run dev:all
