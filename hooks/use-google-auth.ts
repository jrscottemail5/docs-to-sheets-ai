import { useCallback, useEffect, useState } from "react";
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

export function useGoogleAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize Google Sign-In
  useEffect(() => {
    const initializeGoogleSignIn = async () => {
      try {
        console.log("[GoogleAuth] Initializing...");
        
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

        console.log("[GoogleAuth] GoogleSignin configured");

        // Check if user is already signed in
        try {
          const currentUser = await GoogleSignin.getCurrentUser();
          if (currentUser) {
            console.log("[GoogleAuth] Found existing user:", (currentUser as any).user?.email);
            const typedUser = currentUser as any;
            const authUser: AuthUser = {
              id: typedUser.user.id,
              email: typedUser.user.email,
              name: typedUser.user.name,
              photo: typedUser.user.photo,
              idToken: typedUser.idToken || "",
            };
            setUser(authUser);
            // Store user info for persistence
            if (Platform.OS !== "web") {
              await SecureStore.setItemAsync(GOOGLE_USER_KEY, JSON.stringify(authUser));
            }
            if (typedUser.idToken) {
              await SecureStore.setItemAsync(GOOGLE_TOKEN_KEY, typedUser.idToken);
            }
          } else {
            console.log("[GoogleAuth] No existing user found");
          }
        } catch (err) {
          console.log("[GoogleAuth] Error checking current user:", err instanceof Error ? err.message : err);
        }

        setIsInitialized(true);
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to initialize Google Sign-In");
        console.error("[GoogleAuth] Initialization error:", error);
        setError(error);
        setIsInitialized(true);
      } finally {
        setLoading(false);
      }
    };

    initializeGoogleSignIn();
  }, []);

  const signIn = useCallback(async () => {
    try {
      console.log("[GoogleAuth] Starting sign-in...");
      setError(null);
      setLoading(true);

      await GoogleSignin.hasPlayServices();
      console.log("[GoogleAuth] Play Services available");
      
      const response = await GoogleSignin.signIn();
      const typedResponse = response as any;

      console.log("[GoogleAuth] Sign-in response received:", typedResponse.user?.email);

      // Get ID token from the response
      const idToken = typedResponse.idToken || "";

      const authUser: AuthUser = {
        id: typedResponse.user.id,
        email: typedResponse.user.email,
        name: typedResponse.user.name,
        photo: typedResponse.user.photo,
        idToken: idToken,
      };

      console.log("[GoogleAuth] Setting user state:", authUser.email);
      setUser(authUser);

      // Store token and user info for persistence
      if (Platform.OS !== "web") {
        try {
          await SecureStore.setItemAsync(GOOGLE_USER_KEY, JSON.stringify(authUser));
          if (idToken) {
            await SecureStore.setItemAsync(GOOGLE_TOKEN_KEY, idToken);
          }
          console.log("[GoogleAuth] User data stored securely");
        } catch (storageErr) {
          console.warn("[GoogleAuth] Failed to store user data:", storageErr);
        }
      }

      console.log("[GoogleAuth] Sign-in completed successfully");
      return authUser;
    } catch (err) {
      let errorMessage = "Sign-in failed";

      if (err instanceof Error) {
        console.error("[GoogleAuth] Sign-in error details:", err.message);
        
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
      console.error("[GoogleAuth] Final error:", error);
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      console.log("[GoogleAuth] Starting sign-out...");
      setLoading(true);
      await GoogleSignin.signOut();
      setUser(null);

      // Clear stored data
      if (Platform.OS !== "web") {
        try {
          await SecureStore.deleteItemAsync(GOOGLE_TOKEN_KEY);
          await SecureStore.deleteItemAsync(GOOGLE_USER_KEY);
          console.log("[GoogleAuth] Stored user data cleared");
        } catch {
          console.log("[GoogleAuth] No stored data to clear");
        }
      }
      
      console.log("[GoogleAuth] Sign-out completed");
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Sign-out failed");
      console.error("[GoogleAuth] Sign-out error:", error);
      setError(error);
      throw error;
    } finally {
      setLoading(false);
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
      console.error("[GoogleAuth] Failed to get ID token:", err);
      return null;
    }
  }, [user]);

  return {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    isInitialized,
    signIn,
    signOut,
    getIdToken,
  };
}
