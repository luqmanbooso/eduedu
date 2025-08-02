# Deploy to Railway (Alternative to Vercel)

## 🚨 Why Railway?

Since Vercel is having issues with your backend deployment, Railway is often more reliable for Node.js applications.

## 🔧 Step 1: Install Railway CLI

```bash
npm install -g @railway/cli
```

## 🔧 Step 2: Login to Railway

```bash
railway login
```

## 🔧 Step 3: Deploy Backend

```bash
# Navigate to server directory
cd lms-charity/server

# Initialize Railway project
railway init

# Deploy to Railway
railway up
```

## 🔧 Step 4: Get Your URL

After deployment, Railway will give you a URL like:
`https://your-app-name-production.up.railway.app`

## 🔧 Step 5: Set Environment Variables

In Railway dashboard, add these environment variables:

```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=https://eduedu-dh5w.vercel.app
NODE_ENV=production
```

## 🔧 Step 6: Update Frontend

Update your frontend API URL to use the Railway URL:

```javascript
// In your frontend code
const API_URL = 'https://your-app-name-production.up.railway.app/api';
```

## 🧪 Test Your API

Visit your Railway URL to test:
- `https://your-app-name-production.up.railway.app/api`
- `https://your-app-name-production.up.railway.app/api/health`

## ✅ Advantages of Railway

1. **Better Node.js Support** - Designed for backend applications
2. **Database Integration** - Easy MongoDB Atlas connection
3. **Environment Variables** - Simple to manage
4. **Logs** - Better debugging capabilities
5. **Custom Domains** - Easy to set up

## 📋 Railway vs Vercel

| Feature | Railway | Vercel |
|---------|---------|--------|
| Node.js Support | ✅ Excellent | ⚠️ Limited |
| Backend Focus | ✅ Yes | ❌ Frontend Focus |
| Database Support | ✅ Built-in | ❌ External |
| Environment Variables | ✅ Easy | ✅ Easy |
| Logs | ✅ Detailed | ✅ Basic |

## 🚀 Quick Deploy Command

```bash
# One command deployment
cd lms-charity/server && railway up --service
```

This should resolve your backend deployment issues! 