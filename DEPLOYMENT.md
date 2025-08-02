# Vercel Deployment Guide

This guide will help you deploy your Charity LMS application to Vercel.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub/GitLab/Bitbucket**: Your code should be in a Git repository
3. **Environment Variables**: You'll need to set up environment variables

## Step 1: Prepare Your Repository

Your project is already configured with the necessary Vercel configuration files:
- `vercel.json` (root) - Monorepo configuration
- `lms-charity/client/vercel.json` - Frontend configuration
- `lms-charity/server/vercel.json` - Backend configuration

## Step 2: Set Up Environment Variables

### Backend Environment Variables (Server)

In your Vercel dashboard, go to your project settings and add these environment variables:

```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
GMAIL_USER=your_gmail_address
GMAIL_APP_PASSWORD=your_gmail_app_password
CLIENT_URL=https://your-frontend-domain.vercel.app
```

### Frontend Environment Variables (Client)

```
VITE_API_URL=https://your-backend-domain.vercel.app/api
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

## Step 3: Deploy to Vercel

### Option 1: Deploy via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your Git repository
4. Configure the following settings:
   - **Framework Preset**: Other
   - **Root Directory**: `lms-charity`
   - **Build Command**: `npm run build` (for client)
   - **Output Directory**: `client/dist`
   - **Install Command**: `npm install`

### Option 2: Deploy via Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy from your project root:
   ```bash
   vercel
   ```

## Step 4: Configure Domains

After deployment, you'll get two URLs:
- Frontend: `https://your-app.vercel.app`
- Backend: `https://your-app-api.vercel.app`

Update your environment variables to use these URLs.

## Step 5: Database Setup

1. **MongoDB Atlas**: 
   - Create a cluster at [mongodb.com](https://mongodb.com)
   - Get your connection string
   - Add it to your Vercel environment variables

2. **Cloudinary**:
   - Sign up at [cloudinary.com](https://cloudinary.com)
   - Get your credentials
   - Add them to your Vercel environment variables

## Step 6: Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project or use existing one
3. Add a web app to your project
4. Copy the configuration and add to Vercel environment variables

## Troubleshooting

### Common Issues:

1. **Build Errors**: Check that all dependencies are in `package.json`
2. **Environment Variables**: Ensure all required variables are set in Vercel
3. **CORS Issues**: Update `CLIENT_URL` in backend environment variables
4. **Database Connection**: Verify MongoDB connection string is correct

### Debugging:

- Check Vercel deployment logs in the dashboard
- Use `vercel logs` command for detailed logs
- Test API endpoints using the Vercel function logs

## Post-Deployment

1. Test all functionality:
   - User registration/login
   - Course creation
   - File uploads
   - Email notifications

2. Set up custom domains (optional):
   - Go to Vercel dashboard
   - Add custom domain
   - Update DNS settings

3. Monitor performance:
   - Use Vercel Analytics
   - Monitor API response times
   - Check error rates

## Support

If you encounter issues:
1. Check Vercel documentation
2. Review deployment logs
3. Verify environment variables
4. Test locally with production environment variables 