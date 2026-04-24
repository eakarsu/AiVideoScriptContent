#!/bin/bash

# AI Content Creator - Startup Script
# This script initializes and starts the full application with hot reload

set -e

echo "=========================================="
echo "  AI Content Creator - Startup Script"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

print_info() {
    echo -e "${BLUE}[i]${NC} $1"
}

# Step 1: Kill processes on ports 3000, 3001
echo "Step 1: Cleaning up existing processes..."

kill_port() {
    local port=$1
    local pid=$(lsof -ti:$port 2>/dev/null)
    if [ -n "$pid" ]; then
        echo "  Killing process on port $port (PID: $pid)"
        kill -9 $pid 2>/dev/null || true
        sleep 1
    fi
}

# Clean all potentially used ports (except 5432 for PostgreSQL)
kill_port 3000
kill_port 3001
kill_port 3002
kill_port 3003

print_status "Cleaned up ports 3000, 3001, 3002, 3003"

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

# Step 4: Check for .env file
echo ""
echo "Step 4: Checking environment configuration..."

if [ ! -f ".env" ]; then
    print_warning ".env file not found. Creating default configuration..."
    cat > .env << 'EOF'
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ai_content_creator
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ai_content_creator
DB_USER=postgres
DB_PASSWORD=postgres

# OpenRouter AI
OPENROUTER_API_KEY=your_openrouter_api_key_here
OPENROUTER_MODEL=anthropic/claude-haiku-4.5

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_in_production_2024

# Ports
BACKEND_PORT=3001
FRONTEND_PORT=3000

# Node Environment
NODE_ENV=development
EOF
    print_warning "Please update .env with your OPENROUTER_API_KEY"
else
    print_status ".env file found"
fi

# Step 5: Install dependencies
echo ""
echo "Step 5: Installing dependencies..."

echo "  Installing backend dependencies..."
cd backend
npm install --silent
print_status "Backend dependencies installed"

echo "  Installing frontend dependencies..."
cd ../frontend
npm install --silent
print_status "Frontend dependencies installed"

cd ..

# Step 6: Run database seeding
echo ""
echo "Step 6: Seeding database with demo data..."
print_info "This will create sample data for all 21 AI features..."

cd backend
npm run seed
print_status "Database seeded with demo data (15+ items per feature)"
cd ..

# Step 7: Start backend with hot reload
echo ""
echo "Step 7: Starting backend server with hot reload..."

cd backend
npm run dev &
BACKEND_PID=$!
cd ..

# Wait for backend to start
echo "  Waiting for backend to initialize..."
sleep 4

# Check if backend is running
if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
    print_status "Backend server running on http://localhost:3001"
else
    print_warning "Backend may still be starting..."
fi

# Step 8: Start frontend with hot reload
echo ""
echo "Step 8: Starting frontend server with hot reload..."

cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

# Wait for frontend to start
echo "  Waiting for frontend to initialize..."
sleep 4
print_status "Frontend server running on http://localhost:3000"

echo ""
echo "=========================================="
echo -e "${GREEN}  Application Started Successfully!${NC}"
echo "=========================================="
echo ""
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:3001"
echo "  Health:   http://localhost:3001/api/health"
echo ""
echo "  Demo Login Credentials:"
echo "    Email:    demo@creator.ai"
echo "    Password: demo123"
echo ""
echo "  Features Available (21 AI Tools):"
echo "    Content:  Scripts, Titles, Descriptions, Hashtags,"
echo "              Thumbnails, Hooks, Captions"
echo "    AI Tools: CTA Optimizer, Viral Predictor,"
echo "              Video Summarizer, Podcast Transcriber"
echo "    Research: Trends, SEO, Personas, Repurpose,"
echo "              Calendar, Analytics, Competitors"
echo ""
echo "  Hot Reload: Code changes will automatically reload"
echo ""
echo -e "${YELLOW}  Press Ctrl+C to stop all servers${NC}"
echo "=========================================="
echo ""

# Handle shutdown
cleanup() {
    echo ""
    echo "Shutting down servers..."

    # Kill backend
    if [ -n "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
    fi

    # Kill frontend
    if [ -n "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
    fi

    # Clean up any remaining processes on our ports
    kill_port 3000
    kill_port 3001

    print_status "Servers stopped"
    exit 0
}

trap cleanup SIGINT SIGTERM

# Keep script running and show logs
wait
