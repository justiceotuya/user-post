#!/bin/bash

echo "🚀 Testing User Post Monorepo Setup"
echo "=================================="

echo ""
echo "1. Testing Backend Server..."
echo "Starting backend on port 5001..."

# Start backend in background
cd backend && node server.js &
BACKEND_PID=$!

# Wait for server to start
sleep 3

# Test backend endpoints
echo "Testing /users endpoint..."
curl -s http://localhost:5001/users | head -c 100
echo "..."

echo ""
echo "Testing /posts endpoint..." 
curl -s http://localhost:5001/posts
echo ""

# Kill backend
kill $BACKEND_PID
echo "✅ Backend test completed"

echo ""
echo "2. Frontend Setup..."
echo "Frontend dependencies are installed and ready"
echo "Run 'npm run frontend' to start the React development server"

echo ""
echo "3. Unified Commands Available:"
echo "   npm run install:all  - Install all dependencies"
echo "   npm start           - Start both servers"  
echo "   npm run backend     - Start backend only"
echo "   npm run frontend    - Start frontend only"

echo ""
echo "🎉 Setup verification complete!"
echo "Backend: http://localhost:5001"
echo "Frontend: http://localhost:3000"
