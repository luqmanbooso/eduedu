# Deployment Checklist - Fix Backend 404 Issue

## ✅ Current Status
- **Frontend**: ✅ Deployed at https://eduedu-dh5w.vercel.app/
- **Backend**: ❌ 404 Error at https://eduedu-ten.vercel.app/

## 🔧 Steps to Fix Backend

### 1. Redeploy Backend
```bash
# Navigate to server directory
cd lms-charity/server

# Deploy backend to Vercel
vercel --prod
```

### 2. Set Environment Variables in Vercel Dashboard

Go to your Vercel project dashboard and add these environment variables:

#### Backend Environment Variables:
```
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
GMAIL_USER=your_gmail_address
GMAIL_APP_PASSWORD=your_gmail_app_password
CLIENT_URL=https://eduedu-dh5w.vercel.app
NODE_ENV=production
```

#### Frontend Environment Variables:
```
VITE_API_URL=https://eduedu-ten.vercel.app/api
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### 3. Test Backend Endpoints

After redeployment, test these endpoints:

1. **Health Check**: https://eduedu-ten.vercel.app/api/health
2. **Test Endpoint**: https://eduedu-ten.vercel.app/api/test

### 4. Verify Database Connection

Make sure your MongoDB Atlas:
- Is accessible from Vercel
- Has the correct connection string
- Has proper network access settings

### 5. Check Vercel Function Logs

In Vercel dashboard:
1. Go to Functions tab
2. Check for any deployment errors
3. Look at function execution logs

## 🚨 Common Issues & Solutions

### Issue: 404 Not Found
**Solution**: 
- Ensure `api/index.js` exists in server directory
- Check that vercel.json routes are correct
- Redeploy the backend

### Issue: Database Connection Error
**Solution**:
- Verify MongoDB URI in environment variables
- Check MongoDB Atlas network access
- Ensure database exists

### Issue: CORS Errors
**Solution**:
- Update `CLIENT_URL` in backend environment variables
- Check CORS configuration in `api/index.js`

## 📋 Post-Deployment Testing

1. **Test API Health**: Visit https://eduedu-ten.vercel.app/api/health
2. **Test Frontend**: Visit https://eduedu-dh5w.vercel.app/
3. **Test Authentication**: Try login/register
4. **Test File Upload**: Try uploading a file
5. **Test Course Creation**: Create a test course

## 🔄 Redeployment Commands

```bash
# Redeploy backend only
cd lms-charity/server
vercel --prod

# Redeploy frontend only
cd lms-charity/client
vercel --prod

# Redeploy entire project
cd lms-charity
vercel --prod
```

## 📞 Support

If issues persist:
1. Check Vercel deployment logs
2. Verify all environment variables are set
3. Test database connection locally
4. Check function execution logs in Vercel dashboard 