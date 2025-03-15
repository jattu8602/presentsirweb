#!/bin/bash

# Kill any existing processes
pkill ngrok
pkill -f "npm run dev"
pkill -f "npm start"

# Start the server
NODE_ENV=production npm start &

# Wait for the server to start
sleep 3

# Start ngrok tunnels in the background
echo "Starting frontend tunnel..."
ngrok http 5173 > ngrok_frontend.log 2>&1 &

echo "Starting backend tunnel..."
ngrok http 3000 > ngrok_backend.log 2>&1 &

# Wait for ngrok to start
sleep 3

# Get the URLs
FRONTEND_URL=$(curl -s http://localhost:4040/api/tunnels | grep -o '"public_url":"[^"]*"' | cut -d'"' -f4)
BACKEND_URL=$(curl -s http://localhost:4041/api/tunnels | grep -o '"public_url":"[^"]*"' | cut -d'"' -f4)

# Export the backend URL for the frontend to use
export BACKEND_URL=$BACKEND_URL

# Display the URLs
echo "Your public URLs are:"
echo "Frontend: $FRONTEND_URL"
echo "Backend: $BACKEND_URL"

echo -e "\nTunnels are running. Press Ctrl+C to stop."
tail -f ngrok_*.log