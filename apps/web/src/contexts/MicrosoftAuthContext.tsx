import React, { createContext, useContext, useState, useEffect } from 'react';
import { PublicClientApplication, AccountInfo, AuthenticationResult } from '@azure/msal-browser';
import { msalConfig, loginRequest, graphConfig } from '../config/msalConfig';
import { useAuth } from './AuthContext';

interface MicrosoftAuthContextType {
  isMicrosoftAuthEnabled: boolean;
  isMicrosoftLoggedIn: boolean;
  microsoftUser: AccountInfo | null;
  loginWithMicrosoft: () => Promise<void>;
  logoutFromMicrosoft: () => Promise<void>;
  getMicrosoftAccessToken: () => Promise<string | null>;
  getMicrosoftUserInfo: () => Promise<any>;
}

const MicrosoftAuthContext = createContext<MicrosoftAuthContextType | undefined>(undefined);

export function MicrosoftAuthProvider({ children }: { children: React.ReactNode }) {
  const { login: loginToCMMS } = useAuth();
  const [msalInstance] = useState(() => new PublicClientApplication(msalConfig));
  const [isMicrosoftLoggedIn, setIsMicrosoftLoggedIn] = useState(false);
  const [microsoftUser, setMicrosoftUser] = useState<AccountInfo | null>(null);
  const [isMicrosoftAuthEnabled, setIsMicrosoftAuthEnabled] = useState(false);

  // Check if Microsoft auth is enabled
  useEffect(() => {
    const isEnabled = !!(
      process.env.REACT_APP_AZURE_CLIENT_ID &&
      process.env.REACT_APP_AZURE_CLIENT_ID !== 'your-client-id-here' &&
      process.env.REACT_APP_AZURE_AUTHORITY &&
      process.env.REACT_APP_AZURE_AUTHORITY !== 'your-tenant-id'
    );
    setIsMicrosoftAuthEnabled(isEnabled);
  }, []);

  // Initialize MSAL and check for existing accounts
  useEffect(() => {
    if (!isMicrosoftAuthEnabled) return;

    const initializeMsal = async () => {
      try {
        await msalInstance.initialize();
        const accounts = msalInstance.getAllAccounts();
        if (accounts.length > 0) {
          setMicrosoftUser(accounts[0]);
          setIsMicrosoftLoggedIn(true);
        }
      } catch (error) {
        console.error('MSAL initialization error:', error);
      }
    };

    initializeMsal();
  }, [msalInstance, isMicrosoftAuthEnabled]);

  const loginWithMicrosoft = async () => {
    if (!isMicrosoftAuthEnabled) {
      console.warn('Microsoft authentication is not configured');
      return;
    }

    try {
      const response: AuthenticationResult = await msalInstance.loginPopup(loginRequest);
      
      if (response.account) {
        setMicrosoftUser(response.account);
        setIsMicrosoftLoggedIn(true);

        // Get user info from Microsoft Graph
        const userInfo = await getMicrosoftUserInfo();
        
        // Map Microsoft user to CMMS user format
        const cmmsUser = {
          email: response.account.username,
          displayName: userInfo.displayName || response.account.name || 'Microsoft User',
          role: 'STAFF', // Default role, can be updated based on Microsoft groups
          department: userInfo.department || 'IT Services',
          phone: userInfo.mobilePhone || '',
          isMicrosoftUser: true,
          microsoftId: response.account.localAccountId,
        };

        // Login to CMMS with Microsoft user data
        await loginToCMMS({
          email: cmmsUser.email,
          password: '', // No password needed for Microsoft auth
          microsoftAuth: true,
          microsoftUser: cmmsUser,
        });
      }
    } catch (error) {
      console.error('Microsoft login error:', error);
      throw error;
    }
  };

  const logoutFromMicrosoft = async () => {
    if (!isMicrosoftAuthEnabled || !microsoftUser) return;

    try {
      await msalInstance.logoutPopup({
        account: microsoftUser,
        postLogoutRedirectUri: window.location.origin,
      });
      
      setMicrosoftUser(null);
      setIsMicrosoftLoggedIn(false);
    } catch (error) {
      console.error('Microsoft logout error:', error);
    }
  };

  const getMicrosoftAccessToken = async (): Promise<string | null> => {
    if (!isMicrosoftAuthEnabled || !microsoftUser) return null;

    try {
      const response = await msalInstance.acquireTokenSilent({
        ...loginRequest,
        account: microsoftUser,
      });
      return response.accessToken;
    } catch (error) {
      console.error('Error acquiring Microsoft token:', error);
      return null;
    }
  };

  const getMicrosoftUserInfo = async () => {
    if (!isMicrosoftAuthEnabled || !microsoftUser) return null;

    try {
      const accessToken = await getMicrosoftAccessToken();
      if (!accessToken) return null;

      const response = await fetch(graphConfig.graphMeEndpoint, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Error fetching Microsoft user info:', error);
    }
    return null;
  };

  return (
    <MicrosoftAuthContext.Provider
      value={{
        isMicrosoftAuthEnabled,
        isMicrosoftLoggedIn,
        microsoftUser,
        loginWithMicrosoft,
        logoutFromMicrosoft,
        getMicrosoftAccessToken,
        getMicrosoftUserInfo,
      }}
    >
      {children}
    </MicrosoftAuthContext.Provider>
  );
}

export function useMicrosoftAuth() {
  const context = useContext(MicrosoftAuthContext);
  if (context === undefined) {
    throw new Error('useMicrosoftAuth must be used within a MicrosoftAuthProvider');
  }
  return context;
}
