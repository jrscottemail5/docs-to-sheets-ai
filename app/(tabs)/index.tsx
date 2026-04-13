import { ScrollView, Text, View, TouchableOpacity, FlatList, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useWebOAuth } from "@/lib/web-oauth-provider";
import { ScreenContainer } from "@/components/screen-container";
import { useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";

interface RecentConversion {
  id: string;
  docName: string;
  sheetName: string;
  timestamp: number;
}

export default function HomeScreen() {
  const router = useRouter();
  const { user, isAuthenticated, signOut } = useWebOAuth();
  const [recentConversions, setRecentConversions] = useState<RecentConversion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecentConversions();
  }, []);

  const loadRecentConversions = async () => {
    try {
      const stored = await SecureStore.getItemAsync("recentConversions");
      if (stored) {
        setRecentConversions(JSON.parse(stored).slice(0, 3));
      }
    } catch (error) {
      console.error("Failed to load recent conversions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewConversion = () => {
    // User is always authenticated when they reach this screen (handled at root level)
    router.push("/document-selection");
  };

  const handleRecentConversion = (conversion: RecentConversion) => {
    // Navigate to preview with the stored conversion data
    router.push({
      pathname: "/preview",
      params: { conversionId: conversion.id },
    });
  };

  if (loading) {
    return (
      <ScreenContainer className="flex items-center justify-center">
        <ActivityIndicator size="large" />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="flex-1 gap-6">
          {/* Header */}
          <View className="items-center gap-2 mb-4">
            <Text className="text-4xl font-bold text-foreground">Docs to Sheets</Text>
            <Text className="text-base text-muted text-center">
              Convert Google Docs to structured data in Google Sheets
            </Text>
          </View>

          {/* Auth Status */}
          {isAuthenticated && user && (
            <View className="bg-surface rounded-2xl p-4 border border-border">
              <Text className="text-sm text-muted mb-1">Logged in as</Text>
              <Text className="text-lg font-semibold text-foreground">{user.email || user.name || "User"}</Text>
            </View>
          )}

          {/* Main CTA */}
          <TouchableOpacity
            onPress={handleNewConversion}
            className="bg-primary rounded-2xl p-6 items-center justify-center active:opacity-80"
          >
            <Text className="text-xl font-bold text-background mb-2">+ New Conversion</Text>
            <Text className="text-sm text-background opacity-90 text-center">
              Select a Google Doc and convert to Sheets
            </Text>
          </TouchableOpacity>

          {/* Recent Conversions */}
          {recentConversions.length > 0 && (
            <View className="gap-3">
              <Text className="text-lg font-semibold text-foreground">Recent Conversions</Text>
              {recentConversions.map((conversion) => (
                <TouchableOpacity
                  key={conversion.id}
                  onPress={() => handleRecentConversion(conversion)}
                  className="bg-surface rounded-xl p-4 border border-border active:opacity-70"
                >
                  <View className="flex-row justify-between items-start">
                    <View className="flex-1">
                      <Text className="font-semibold text-foreground mb-1">{conversion.docName}</Text>
                      <Text className="text-sm text-muted">→ {conversion.sheetName}</Text>
                    </View>
                    <Text className="text-xs text-muted">
                      {new Date(conversion.timestamp).toLocaleDateString()}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Settings & Logout */}
          <View className="gap-3 mt-auto pt-6">
            <TouchableOpacity
              onPress={() => router.push("/settings")}
              className="bg-surface rounded-lg p-4 border border-border active:opacity-70"
            >
              <Text className="font-semibold text-foreground text-center">Settings</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={signOut}
              className="bg-error bg-opacity-10 rounded-lg p-4 border border-error border-opacity-30 active:opacity-70"
            >
              <Text className="font-semibold text-error text-center">Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
