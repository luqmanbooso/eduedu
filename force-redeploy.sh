#!/bin/bash

echo "🚀 Force redeploying backend with clean configuration..."

# Navigate to server directory
cd lms-charity/server

# Remove all Vercel configuration
rm -rf .vercel
rm -rf .vercelignore

# Remove node_modules and reinstall
rm -rf node_modules
npm install

# Deploy with fresh configuration
echo "📦 Deploying to Vercel with clean config..."
vercel --prod --yes --force

echo "✅ Force redeployment completed!"
echo ""
echo "🔍 Test the backend now:"
echo "https://eduedu-ten.vercel.app/"
echo ""
echo "Expected response:"
echo '{"message":"Backend API is working!","timestamp":"...","method":"GET","url":"/","path":"/"}' 