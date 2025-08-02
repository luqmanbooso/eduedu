#!/bin/bash

# Vercel Deployment Script for Charity LMS
echo "🚀 Starting Vercel deployment for Charity LMS..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI is not installed. Installing now..."
    npm install -g vercel
fi

# Check if user is logged in to Vercel
if ! vercel whoami &> /dev/null; then
    echo "🔐 Please login to Vercel..."
    vercel login
fi

# Deploy to Vercel
echo "📦 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment completed!"
echo "📋 Next steps:"
echo "1. Set up environment variables in Vercel dashboard"
echo "2. Configure your database (MongoDB Atlas)"
echo "3. Set up Cloudinary for file uploads"
echo "4. Configure Firebase for authentication"
echo "5. Test your application"

echo "📖 For detailed instructions, see DEPLOYMENT.md" 