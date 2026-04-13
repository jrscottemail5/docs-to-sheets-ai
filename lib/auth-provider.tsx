import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || "";
const GOOGLE_TOKEN_KEY = "google_auth_token";
const GOOGLE_USER_KEY = "google_user_info";

export interface AuthUser {
  id: string;
  email: string | null;
  name: string | null;
  photo: string | null;
  idToken: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  error: Error | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  signIn: () => Promise<AuthUser>;
  signOut: () => Promise<void>;
  getIdToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize Google Sign-In and restore session
  useEffect(() => {
    const initializeGoogleSignIn = async () => {
      try {
        console.log("[AuthProvider] Initializing...");

        if (!GOOGLE_CLIENT_ID) {
          throw new Error("Google Client ID not configured");
        }

        GoogleSignin.configure({
          webClientId: GOOGLE_CLIENT_ID,
          offlineAccess: true,
          scopes: [
            "https://www.googleapis.com/auth/drive.readonly",
            "https://www.googleapis.com/auth/spreadsheets",
          ],
        });

        console.log("[AuthProvider] GoogleSignin configured");

        // Try to restore session from secure storage
        if (Platform.OS !== "web") {
          try {
            const storedUserJson = await SecureStore.getItemAsync(GOOGLE_USER_KEY);
            if (storedUserJson) {
              const storedUser = JSON.parse(storedUserJson) as AuthUser;
              console.log("[AuthProvider] Restored user from storage:", storedUser.email);
              setUser(storedUser);
              setIsInitialized(true);
              setLoading(false);
              return;
            }
          } catch (err) {
            console.log("[AuthProvider] Failed to restore from storage:", err);
          }
        }

        // Try to get current user from GoogleSignin
        try {
          const currentUser = await GoogleSignin.getCurrentUser();
          if (currentUser) {
            console.log("[AuthProvider] Found existing user:", (currentUser as any).user?.email);
            const typedUser = currentUser as any;
            const authUser: AuthUser = {
              id: typedUser.user.id,
              email: typedUser.user.email,
              name: typedUser.user.name,
              photo: typedUser.user.photo,
              idToken: typedUser.idToken || "",
            };
            setUser(authUser);
            // Store for future restores
            if (Platform.OS !== "web") {
              await SecureStore.setItemAsync(GOOGLE_USER_KEY, JSON.stringify(authUser));
            }
          } else {
            console.log("[AuthProvider] No existing user found");
          }
        } catch (err) {
          console.log("[AuthProvider] Error checking current user:", err instanceof Error ? err.message : err);
        }

        setIsInitialized(true);
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to initialize Google Sign-In");
        console.error("[AuthProvider] Initialization error:", error);
        // Don't set error state - initialization errors are expected
        setIsInitialized(true);
      } finally {
        setLoading(false);
      }
    };

    initializeGoogleSignIn();
  }, []);

  const signIn = useCallback(async (): Promise<AuthUser> => {
    try {
      console.log("[AuthProvider] Starting sign-in...");
      setError(null);

      await GoogleSignin.hasPlayServices();
      console.log("[AuthProvider] Play Services available");

      const response = await GoogleSignin.signIn();
      const typedResponse = response as any;

      console.log("[AuthProvider] Sign-in response received:", typedResponse.user?.email);

      const idToken = typedResponse.idToken || "";

      const authUser: AuthUser = {
        id: typedResponse.user.id,
        email: typedResponse.user.email,
        name: typedResponse.user.name,
        photo: typedResponse.user.photo,
        idToken: idToken,
      };

      console.log("[AuthProvider] Setting user state:", authUser.email);
      setUser(authUser);

      // Store token and user info for persistence
      if (Platform.OS !== "web") {
        try {
          await SecureStore.setItemAsync(GOOGLE_USER_KEY, JSON.stringify(authUser));
          if (idToken) {
            await SecureStore.setItemAsync(GOOGLE_TOKEN_KEY, idToken);
          }
          console.log("[AuthProvider] User data stored securely");
        } catch (storageErr) {
          console.warn("[AuthProvider] Failed to store user data:", storageErr);
        }
      }

      console.log("[AuthProvider] Sign-in completed successfully");
      return authUser;
    } catch (err) {
      let errorMessage = "Sign-in failed";

      if (err instanceof Error) {
        console.error("[AuthProvider] Sign-in error details:", err.message);

        if (err.message.includes(statusCodes.SIGN_IN_CANCELLED)) {
          errorMessage = "Sign-in cancelled";
        } else if (err.message.includes(statusCodes.IN_PROGRESS)) {
          errorMessage = "Sign-in in progress";
        } else if (err.message.includes(statusCodes.PLAY_SERVICES_NOT_AVAILABLE)) {
          errorMessage = "Google Play Services not available";
        } else {
          errorMessage = err.message;
        }
      }

      const error = new Error(errorMessage);
      console.error("[AuthProvider] Final error:", error);
      setError(error);
      throw error;
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      console.log("[AuthProvider] Starting sign-out...");
      await GoogleSignin.signOut();
      setUser(null);

      // Clear stored data
      if (Platform.OS !== "web") {
        try {
          await SecureStore.deleteItemAsync(GOOGLE_TOKEN_KEY);
          await SecureStore.deleteItemAsync(GOOGLE_USER_KEY);
          console.log("[AuthProvider] Stored user data cleared");
        } catch {
          console.log("[AuthProvider] No stored data to clear");
        }
      }

      console.log("[AuthProvider] Sign-out completed");
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Sign-out failed");
      console.error("[AuthProvider] Sign-out error:", error);
      setError(error);
      throw error;
    }
  }, []);

  const getIdToken = useCallback(async (): Promise<string | null> => {
    try {
      if (!user) return null;

      if (Platform.OS !== "web") {
        const token = await SecureStore.getItemAsync(GOOGLE_TOKEN_KEY);
        return token || null;
      }

      return user.idToken || null;
    } catch (err) {
      console.error("[AuthProvider] Failed to get ID token:", err);
      return null;
    }
  }, [user]);

  const value: AuthContextType = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    isInitialized,
    signIn,
    signOut,
    getIdToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
