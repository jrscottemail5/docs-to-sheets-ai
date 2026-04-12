import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useGoogleAuth } from "@/hooks/use-google-auth";
import { ScreenContainer } from "@/components/screen-container";
import { useEffect, useState } from "react";

export default function AuthScreen() {
  const router = useRouter();
  const { user, isAuthenticated, loading, signIn, error: authError } = useGoogleAuth();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [navigationError, setNavigationError] = useState<string | null>(null);

  // Navigate to home when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log("[AuthScreen] User authenticated, navigating to home");
      setNavigationError(null);
      // Add a small delay to ensure state is fully committed
      const timer = setTimeout(() => {
        router.replace("/(tabs)");
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, user, router]);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    setNavigationError(null);
    try {
      console.log("[AuthScreen] Starting sign-in...");
      const result = await signIn();
      console.log("[AuthScreen] Sign-in successful:", result?.email);
      // Don't set isLoggingIn to false here - let the useEffect handle navigation
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Sign-in failed";
      console.error("[AuthScreen] Login failed:", errorMsg);
      setNavigationError(errorMsg);
      setIsLoggingIn(false);
    }
  };

  // Show loading state during initial auth check
  if (loading && !isLoggingIn) {
    return (
      <ScreenContainer className="flex items-center justify-center">
        <ActivityIndicator size="large" />
        <Text className="mt-4 text-muted">Checking authentication...</Text>
      </ScreenContainer>
    );
  }

  // Show loading state during sign-in
  if (isLoggingIn) {
    return (
      <ScreenContainer className="flex items-center justify-center">
        <ActivityIndicator size="large" />
        <Text className="mt-4 text-muted">Signing in with Google...</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="flex-1 justify-center gap-6">
          {/* Header */}
          <View className="items-center gap-4 mb-8">
            <View className="bg-primary bg-opacity-10 rounded-full p-6">
              <Text className="text-5xl">📄</Text>
            </View>
            <View className="items-center gap-2">
              <Text className="text-3xl font-bold text-foreground">Welcome</Text>
              <Text className="text-base text-muted text-center">
                Sign in with Google to get started
              </Text>
            </View>
          </View>

          {/* Error Message - Only show if there's actual error text */}
          {navigationError && (
            <View className="bg-error bg-opacity-10 rounded-lg p-4 border border-error border-opacity-30">
              <Text className="text-error font-semibold">{navigationError}</Text>
            </View>
          )}

          {/* Info Cards */}
          <View className="gap-3 mb-8">
            <View className="bg-surface rounded-xl p-4 border border-border flex-row gap-3">
              <Text className="text-2xl">🔐</Text>
              <View className="flex-1">
                <Text className="font-semibold text-foreground mb-1">Secure Access</Text>
                <Text className="text-sm text-muted">
                  We only access your Google Docs and Sheets
                </Text>
              </View>
            </View>

            <View className="bg-surface rounded-xl p-4 border border-border flex-row gap-3">
              <Text className="text-2xl">✨</Text>
              <View className="flex-1">
                <Text className="font-semibold text-foreground mb-1">AI-Powered</Text>
                <Text className="text-sm text-muted">
                  Automatically parse paragraphs into structured data
                </Text>
              </View>
            </View>

            <View className="bg-surface rounded-xl p-4 border border-border flex-row gap-3">
              <Text className="text-2xl">⚡</Text>
              <View className="flex-1">
                <Text className="font-semibold text-foreground mb-1">Fast & Easy</Text>
                <Text className="text-sm text-muted">
                  Convert documents in seconds with simple configuration
                </Text>
              </View>
            </View>
          </View>

          {/* Login Button */}
          <TouchableOpacity
            onPress={handleLogin}
            disabled={isLoggingIn}
            className="bg-primary rounded-2xl p-4 items-center justify-center active:opacity-80 disabled:opacity-50"
          >
            <Text className="text-lg font-bold text-background">Sign in with Google</Text>
          </TouchableOpacity>

          {/* Footer */}
          <View className="items-center gap-2 mt-8 pt-6 border-t border-border">
            <Text className="text-xs text-muted text-center">
              By signing in, you agree to our Terms of Service and Privacy Policy
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
