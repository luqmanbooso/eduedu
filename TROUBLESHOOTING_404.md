# Troubleshooting 404 Error - Backend Deployment

## 🚨 Current Issue
Your backend at https://eduedu-ten.vercel.app/ is returning 404 NOT_FOUND error.

## 🔧 Step-by-Step Fix

### Step 1: Clean Redeployment
```bash
# Navigate to server directory
cd lms-charity/server

# Remove existing Vercel config
rm -rf .vercel

# Redeploy with fresh configuration
vercel --prod --yes
```

### Step 2: Verify API Structure
The server now has these API endpoints:
- `/api/health` - Health check
- `/api/hello` - Simple test endpoint
- `/api/test` - Test endpoint
- `/api/[...path]` - Catch-all for other routes

### Step 3: Test Individual Endpoints
After redeployment, test these URLs:
1. https://eduedu-ten.vercel.app/api/health
2. https://eduedu-ten.vercel.app/api/hello
3. https://eduedu-ten.vercel.app/api/test

### Step 4: Check Vercel Dashboard
1. Go to your Vercel project dashboard
2. Check the "Functions" tab
3. Look for any deployment errors
4. Check function execution logs

## 🚨 Common Causes & Solutions

### Issue 1: Function Not Deployed
**Symptoms**: 404 on all endpoints
**Solution**: 
- Ensure `api/` folder exists in server directory
- Check that API files are properly formatted
- Redeploy with `vercel --prod`

### Issue 2: Route Configuration
**Symptoms**: Some endpoints work, others don't
**Solution**:
- Check `vercel.json` route configuration
- Ensure all API files are listed in functions

### Issue 3: Environment Variables
**Symptoms**: Function deployed but returns errors
**Solution**:
- Set all required environment variables in Vercel dashboard
- Check MongoDB connection string
- Verify CORS settings

## 📋 Environment Variables Checklist

Make sure these are set in Vercel dashboard:

### Required for Basic Functionality:
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=https://eduedu-dh5w.vercel.app
NODE_ENV=production
```

### Required for Full Features:
```
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
GMAIL_USER=your_gmail
GMAIL_APP_PASSWORD=your_gmail_app_password
```

## 🔍 Debugging Steps

### 1. Check Vercel Logs
```bash
# View function logs
vercel logs

# View specific function logs
vercel logs --function api/health
```

### 2. Test Locally
```bash
# Test the API locally first
cd lms-charity/server
npm start
# Then visit http://localhost:5000/api/health
```

### 3. Check Network Tab
- Open browser dev tools
- Go to Network tab
- Visit the failing URL
- Check response status and headers

## 🆘 If Still Not Working

### Option 1: Manual Function Creation
Create individual API files for each route:

```javascript
// api/auth.js
export default function handler(req, res) {
  // Auth logic here
}

// api/courses.js
export default function handler(req, res) {
  // Courses logic here
}
```

### Option 2: Use Vercel CLI Debug
```bash
vercel --debug
```

### Option 3: Check Vercel Documentation
- [Vercel Serverless Functions](https://vercel.com/docs/concepts/functions/serverless-functions)
- [Vercel API Routes](https://vercel.com/docs/concepts/functions/api-routes)

## 📞 Get Help

If the issue persists:
1. Check Vercel community forums
2. Review Vercel documentation
3. Check function execution logs in dashboard
4. Verify all environment variables are set correctly 