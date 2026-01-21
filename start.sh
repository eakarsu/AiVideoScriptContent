#!/bin/bash

# AI Content Creator - Startup Script
# This script initializes and starts the full application

set -e

echo "=========================================="
echo "  AI Content Creator - Startup Script"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

# Step 1: Kill processes on ports 3000, 3001, 5432
echo "Step 1: Cleaning up existing processes..."

kill_port() {
    local port=$1
    local pid=$(lsof -ti:$port 2>/dev/null)
    if [ -n "$pid" ]; then
        echo "  Killing process on port $port (PID: $pid)"
        kill -9 $pid 2>/dev/null || true
    fi
}

kill_port 3000
kill_port 3001
# Note: Not killing 5432 as it might affect other PostgreSQL users

print_status "Cleaned up ports 3000 and 3001"

# Step 2: Check if PostgreSQL is running
echo ""
echo "Step 2: Checking PostgreSQL..."

if command -v pg_isready &> /dev/null; then
    if pg_isready -q; then
        print_status "PostgreSQL is running"
    else
        print_warning "PostgreSQL is not running. Attempting to start..."
        if command -v brew &> /dev/null; then
            brew services start postgresql@14 2>/dev/null || brew services start postgresql 2>/dev/null || true
        elif command -v systemctl &> /dev/null; then
            sudo systemctl start postgresql
        fi
        sleep 2
        if pg_isready -q; then
            print_status "PostgreSQL started successfully"
        else
            print_error "Could not start PostgreSQL. Please start it manually."
            exit 1
        fi
    fi
else
    print_warning "pg_isready not found. Assuming PostgreSQL is running."
fi

# Step 3: Create database if it doesn't exist
echo ""
echo "Step 3: Setting up database..."

DB_NAME="ai_content_creator"
DB_USER="postgres"

if command -v createdb &> /dev/null; then
    createdb -U $DB_USER $DB_NAME 2>/dev/null || true
    print_status "Database '$DB_NAME' ready"
else
    print_warning "createdb not found. Please ensure database exists."
fi

# Step 4: Install dependencies
echo ""
echo "Step 4: Installing dependencies..."

echo "  Installing backend dependencies..."
cd backend
npm install
print_status "Backend dependencies installed"

echo "  Installing frontend dependencies..."
cd ../frontend
npm install
print_status "Frontend dependencies installed"

cd ..

# Step 5: Run database seeding
echo ""
echo "Step 5: Seeding database with demo data..."

cd backend
npm run seed
print_status "Database seeded with demo data"
cd ..

# Step 6: Start backend
echo ""
echo "Step 6: Starting backend server..."

cd backend
npm run dev &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 3
print_status "Backend server starting on http://localhost:3001"

# Step 7: Start frontend
echo ""
echo "Step 7: Starting frontend server..."

cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

# Wait for frontend to start
sleep 3
print_status "Frontend server starting on http://localhost:3000"

echo ""
echo "=========================================="
echo "  Application Started Successfully!"
echo "=========================================="
echo ""
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:3001"
echo ""
echo "  Demo Login:"
echo "    Email:    demo@creator.ai"
echo "    Password: demo123"
echo ""
echo "  Press Ctrl+C to stop all servers"
echo "=========================================="
echo ""

# Handle shutdown
cleanup() {
    echo ""
    echo "Shutting down servers..."
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    print_status "Servers stopped"
    exit 0
}

trap cleanup SIGINT SIGTERM

# Keep script running
wait
