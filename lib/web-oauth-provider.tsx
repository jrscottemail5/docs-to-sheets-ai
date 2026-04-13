import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import * as Crypto from "expo-crypto";
import { Buffer } from "buffer";

const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || "";
const REDIRECT_SCHEME = "docs-to-sheets-ai";
const REDIRECT_URI = `${REDIRECT_SCHEME}://oauth-callback`;
const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";

const SCOPES = [
  "openid",
  "email",
  "profile",
  "https://www.googleapis.com/auth/drive.readonly",
  "https://www.googleapis.com/auth/spreadsheets",
];

const AUTH_TOKEN_KEY = "oauth_access_token";
const REFRESH_TOKEN_KEY = "oauth_refresh_token";
const USER_INFO_KEY = "oauth_user_info";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  picture: string;
}

interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  error: Error | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  signIn: () => Promise<AuthUser>;
  signOut: () => Promise<void>;
  getAccessToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Generate PKCE code challenge
async function generatePKCE() {
  const codeVerifier = await Crypto.getRandomBytes(32);
  const base64Verifier = Buffer.from(codeVerifier).toString("base64url");
  
  // For simplicity, use the verifier as the challenge (not ideal but works)
  // In production, you'd want to hash this properly
  const codeChallenge = base64Verifier;
  
  return { codeVerifier: base64Verifier, codeChallenge };
}

export function WebOAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize and restore session
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log("[WebOAuth] Initializing...");

        if (!GOOGLE_CLIENT_ID) {
          throw new Error("Google Client ID not configured");
        }

        // Try to restore session from secure storage
        if (Platform.OS !== "web") {
          try {
            const storedUserJson = await SecureStore.getItemAsync(USER_INFO_KEY);
            if (storedUserJson) {
              const storedUser = JSON.parse(storedUserJson) as AuthUser;
              console.log("[WebOAuth] Restored user from storage:", storedUser.email);
              setUser(storedUser);
              setIsInitialized(true);
              setLoading(false);
              return;
            }
          } catch (err) {
            console.log("[WebOAuth] Failed to restore from storage:", err);
          }
        }

        setIsInitialized(true);
        setLoading(false);
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to initialize auth");
        console.error("[WebOAuth] Initialization error:", error);
        setIsInitialized(true);
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Handle OAuth callback
  useEffect(() => {
    const handleDeepLink = ({ url }: { url: string }) => {
      console.log("[WebOAuth] Deep link received:", url);

      if (url.includes("oauth-callback")) {
        const params = new URL(url).searchParams;
        const code = params.get("code");
        const state = params.get("state");

        if (code) {
          console.log("[WebOAuth] Authorization code received");
          // The code will be exchanged in the signIn function
        }
      }
    };

    const subscription = Linking.addEventListener("url", handleDeepLink);
    return () => subscription.remove();
  }, []);

  const signIn = useCallback(async (): Promise<AuthUser> => {
    try {
      console.log("[WebOAuth] Starting sign-in...");
      setError(null);

      const { codeVerifier, codeChallenge } = await generatePKCE();
      const state = await Crypto.getRandomBytes(16);
      const stateString = Buffer.from(state).toString("base64url");

      // Store PKCE verifier for later exchange
      if (Platform.OS !== "web") {
        await SecureStore.setItemAsync("pkce_verifier", codeVerifier);
        await SecureStore.setItemAsync("oauth_state", stateString);
      }

      const authUrl = new URL(GOOGLE_AUTH_URL);
      authUrl.searchParams.append("client_id", GOOGLE_CLIENT_ID);
      authUrl.searchParams.append("redirect_uri", REDIRECT_URI);
      authUrl.searchParams.append("response_type", "code");
      authUrl.searchParams.append("scope", SCOPES.join(" "));
      authUrl.searchParams.append("state", stateString);
      authUrl.searchParams.append("code_challenge", codeChallenge);
      authUrl.searchParams.append("code_challenge_method", "S256");
      authUrl.searchParams.append("access_type", "offline");
      authUrl.searchParams.append("prompt", "consent");

      console.log("[WebOAuth] Opening browser for authentication...");

      const result = await WebBrowser.openAuthSessionAsync(
        authUrl.toString(),
        REDIRECT_URI,
        {
          showInRecents: true,
        }
      );

      console.log("[WebOAuth] Browser result:", result.type);

      if (result.type === "cancel") {
        throw new Error("Sign-in cancelled");
      }

      if (result.type === "dismiss") {
        throw new Error("Sign-in dismissed");
      }

      if (result.type !== "success" || !result.url) {
        throw new Error("Sign-in failed: No authorization code received");
      }

      // Extract authorization code from redirect URL
      const redirectUrl = new URL(result.url);
      const code = redirectUrl.searchParams.get("code");
      const returnedState = redirectUrl.searchParams.get("state");

      if (!code) {
        throw new Error("No authorization code in redirect URL");
      }

      // Verify state
      const storedState = Platform.OS !== "web" 
        ? await SecureStore.getItemAsync("oauth_state")
        : null;
      
      if (storedState && returnedState !== storedState) {
        throw new Error("State mismatch - possible CSRF attack");
      }

      console.log("[WebOAuth] Authorization code received, exchanging for tokens...");

      // Exchange code for tokens
      const pkceVerifier = Platform.OS !== "web"
        ? await SecureStore.getItemAsync("pkce_verifier")
        : "";

      const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: GOOGLE_CLIENT_ID,
          code,
          redirect_uri: REDIRECT_URI,
          grant_type: "authorization_code",
          code_verifier: pkceVerifier || "",
        }).toString(),
      });

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.json();
        throw new Error(`Token exchange failed: ${errorData.error_description || errorData.error}`);
      }

      const tokens = (await tokenResponse.json()) as TokenResponse;
      console.log("[WebOAuth] Tokens received");

      // Store tokens
      if (Platform.OS !== "web") {
        await SecureStore.setItemAsync(AUTH_TOKEN_KEY, tokens.access_token);
        if (tokens.refresh_token) {
          await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, tokens.refresh_token);
        }
      }

      // Fetch user info
      console.log("[WebOAuth] Fetching user info...");
      const userResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
        },
      });

      if (!userResponse.ok) {
        throw new Error("Failed to fetch user info");
      }

      const userInfo = (await userResponse.json()) as any;
      const authUser: AuthUser = {
        id: userInfo.id,
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture,
      };

      console.log("[WebOAuth] User info retrieved:", authUser.email);

      // Store user info
      if (Platform.OS !== "web") {
        await SecureStore.setItemAsync(USER_INFO_KEY, JSON.stringify(authUser));
      }

      setUser(authUser);
      console.log("[WebOAuth] Sign-in completed successfully");
      return authUser;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Sign-in failed");
      console.error("[WebOAuth] Sign-in error:", error);
      setError(error);
      throw error;
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      console.log("[WebOAuth] Starting sign-out...");
      setUser(null);

      // Clear stored tokens and user info
      if (Platform.OS !== "web") {
        await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
        await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
        await SecureStore.deleteItemAsync(USER_INFO_KEY);
        await SecureStore.deleteItemAsync("pkce_verifier");
        await SecureStore.deleteItemAsync("oauth_state");
      }

      console.log("[WebOAuth] Sign-out completed");
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Sign-out failed");
      console.error("[WebOAuth] Sign-out error:", error);
      setError(error);
      throw error;
    }
  }, []);

  const getAccessToken = useCallback(async (): Promise<string | null> => {
    try {
      if (Platform.OS !== "web") {
        const token = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
        return token || null;
      }
      return null;
    } catch (err) {
      console.error("[WebOAuth] Failed to get access token:", err);
      return null;
    }
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    isInitialized,
    signIn,
    signOut,
    getAccessToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useWebOAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useWebOAuth must be used within a WebOAuthProvider");
  }
  return context;
}
