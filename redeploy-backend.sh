#!/bin/bash

echo "🚀 Redeploying backend to fix 404 issue..."

# Navigate to server directory
cd lms-charity/server

# Remove any existing Vercel configuration
rm -rf .vercel

# Deploy to Vercel with fresh configuration
echo "📦 Deploying backend to Vercel..."
vercel --prod --yes

echo "✅ Backend redeployment completed!"
echo ""
echo "🔍 Test these endpoints after deployment:"
echo "1. Health check: https://eduedu-ten.vercel.app/api/health"
echo "2. Hello endpoint: https://eduedu-ten.vercel.app/api/hello"
echo "3. Test endpoint: https://eduedu-ten.vercel.app/api/test"
echo ""
echo "📋 If still getting 404 errors:"
echo "1. Check Vercel dashboard for deployment logs"
echo "2. Verify environment variables are set"
echo "3. Check function execution logs in Vercel dashboard" 