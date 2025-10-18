# Microsoft Azure AD Authentication Setup

This guide will help you set up Microsoft Azure AD authentication for the COSTAATT CMMS system.

## Prerequisites

1. An Azure AD tenant
2. Admin access to create app registrations
3. The CMMS application deployed or accessible via HTTPS

## Step 1: Create Azure AD App Registration

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** > **App registrations**
3. Click **New registration**
4. Fill in the details:
   - **Name**: COSTAATT CMMS
   - **Supported account types**: Accounts in this organizational directory only
   - **Redirect URI**: 
     - Development: `http://localhost:5174`
     - Production: `https://your-domain.com`

## Step 2: Configure Authentication

1. In your app registration, go to **Authentication**
2. Add platform: **Single-page application (SPA)**
3. Add redirect URIs:
   - `http://localhost:5174` (development)
   - `https://your-domain.com` (production)
4. Enable **ID tokens** and **Access tokens**
5. Save the configuration

## Step 3: Configure API Permissions

1. Go to **API permissions**
2. Add permissions:
   - **Microsoft Graph** > **User.Read** (Delegated)
   - **Microsoft Graph** > **Mail.Read** (Delegated) - for email integration
   - **Microsoft Graph** > **Calendars.Read** (Delegated) - for calendar sync
3. Click **Grant admin consent**

## Step 4: Get Configuration Values

1. Go to **Overview** in your app registration
2. Copy the **Application (client) ID**
3. Copy the **Directory (tenant) ID**

## Step 5: Configure Environment Variables

Create a `.env` file in `apps/web/` with:

```env
# Microsoft Azure AD Configuration
REACT_APP_AZURE_CLIENT_ID=your-application-client-id
REACT_APP_AZURE_AUTHORITY=https://login.microsoftonline.com/your-tenant-id
REACT_APP_AZURE_REDIRECT_URI=http://localhost:5174

# API Configuration
REACT_APP_API_URL=http://localhost:4000/api/v1
```

## Step 6: Production Configuration

For production deployment:

1. Update the redirect URI in Azure AD to your production domain
2. Update the environment variables:
   ```env
   REACT_APP_AZURE_REDIRECT_URI=https://your-production-domain.com
   REACT_APP_API_URL=https://your-api-domain.com/api/v1
   ```

## Step 7: User Role Mapping

The system currently assigns all Microsoft users the `STAFF` role by default. To customize this:

1. Edit `apps/web/src/contexts/MicrosoftAuthContext.tsx`
2. Modify the role assignment logic in the `loginWithMicrosoft` function
3. You can map Azure AD groups to CMMS roles

## Features Enabled

With Microsoft authentication configured:

- ✅ **Single Sign-On (SSO)** - Users can sign in with their Microsoft accounts
- ✅ **Automatic User Creation** - New Microsoft users are automatically created in CMMS
- ✅ **Profile Sync** - User information is synced from Microsoft Graph
- ✅ **Calendar Integration** - Access to user calendars for maintenance scheduling
- ✅ **Email Integration** - Access to user emails for notifications
- ✅ **Security** - Enterprise-grade authentication and authorization

## Troubleshooting

### Common Issues

1. **"Microsoft login failed"**
   - Check that environment variables are set correctly
   - Verify the redirect URI matches exactly
   - Ensure the app registration is configured for SPA

2. **"Invalid client"**
   - Verify the client ID is correct
   - Check that the app registration is active

3. **"Redirect URI mismatch"**
   - Ensure the redirect URI in Azure AD matches your application URL
   - Check for trailing slashes or protocol mismatches

### Testing

1. Start the development server: `npm run dev`
2. Go to `http://localhost:5174/login`
3. Click "Sign in with Microsoft"
4. Complete the Microsoft authentication flow
5. Verify you're logged into the CMMS system

## Security Considerations

- Always use HTTPS in production
- Regularly rotate client secrets (if using confidential client)
- Implement proper user role mapping
- Consider implementing conditional access policies
- Monitor authentication logs for suspicious activity
