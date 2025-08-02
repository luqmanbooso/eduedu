#!/bin/bash

echo "🚀 Deploying fixed API structure..."

# Navigate to root directory
cd ..

# Remove any existing Vercel configuration
rm -rf .vercel

# Deploy from root with proper configuration
echo "📦 Deploying with fixed API structure..."
vercel --prod --yes

echo "✅ Fixed deployment completed!"
echo ""
echo "🔍 Test these endpoints:"
echo "1. https://your-new-url.vercel.app/api"
echo "2. https://your-new-url.vercel.app/api/hello"
echo "3. https://your-new-url.vercel.app/api/test"
echo "4. https://your-new-url.vercel.app/api/status"
echo ""
echo "Expected response:"
echo '{"message":"Backend API is working!","timestamp":"...","method":"GET","url":"/api","status":"success"}' 