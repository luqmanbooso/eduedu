#!/bin/bash

echo "🚀 Deploying minimal API to test Vercel..."

# Navigate to server directory
cd lms-charity/server

# Remove any existing Vercel configuration
rm -rf .vercel

# Create a minimal package.json if needed
if [ ! -f "package.json" ]; then
  echo "Creating minimal package.json..."
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
fi

# Deploy to Vercel
echo "📦 Deploying minimal API..."
vercel --prod --yes

echo "✅ Minimal deployment completed!"
echo ""
echo "🔍 Test these endpoints:"
echo "1. https://your-new-url.vercel.app/api/hello"
echo "2. https://your-new-url.vercel.app/api/test"
echo ""
echo "Expected response:"
echo '{"message":"Hello from Vercel API!","timestamp":"...","method":"GET","url":"/api/hello"}' 