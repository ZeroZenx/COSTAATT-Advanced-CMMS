import { Configuration, PopupRequest } from '@azure/msal-browser';

// MSAL configuration
export const msalConfig: Configuration = {
  auth: {
    clientId: process.env.REACT_APP_AZURE_CLIENT_ID || 'your-client-id-here',
    authority: process.env.REACT_APP_AZURE_AUTHORITY || 'https://login.microsoftonline.com/your-tenant-id',
    redirectUri: process.env.REACT_APP_AZURE_REDIRECT_URI || window.location.origin,
  },
  cache: {
    cacheLocation: 'sessionStorage', // This configures where your cache will be stored
    storeAuthStateInCookie: false, // Set this to "true" if you are having issues on IE11 or Edge
  },
};

// Add scopes here for ID token to be used at Microsoft identity platform endpoints.
export const loginRequest: PopupRequest = {
  scopes: ['User.Read', 'profile', 'email'],
};

// Add the endpoints here for Microsoft Graph API services you'd like to use.
export const graphConfig = {
  graphMeEndpoint: 'https://graph.microsoft.com/v1.0/me',
};

// Microsoft Graph API scopes
export const graphScopes = [
  'User.Read',
  'Mail.Read',
  'Calendars.Read',
  'Calendars.ReadWrite',
  'Files.ReadWrite',
];
