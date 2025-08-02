#!/bin/bash

echo "🚀 Deploying server as separate project..."

# Navigate to server directory
cd lms-charity/server

# Remove any existing Vercel configuration
rm -rf .vercel

# Create a minimal package.json if needed
cat > package.json << EOF
{
  "name": "eduedu-backend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "echo 'Serverless deployment'"
  }
}
EOF

# Deploy as separate project
echo "📦 Deploying server to Vercel..."
vercel --name eduedu-backend --prod --yes

echo "✅ Server deployment completed!"
echo ""
echo "🔍 Your new backend URL will be shown above."
echo "Test these endpoints:"
echo "1. https://your-new-url.vercel.app/api"
echo "2. https://your-new-url.vercel.app/test"
echo ""
echo "Expected response:"
echo '{"message":"Backend API is working!","timestamp":"...","method":"GET","url":"/api","status":"success","deployed":true}' 