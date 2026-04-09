import { ScrollView, Text, View, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/hooks/use-auth";
import { ScreenContainer } from "@/components/screen-container";

export default function SettingsScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.replace("/(tabs)");
  };

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="flex-1 gap-6">
          {/* Header */}
          <View className="gap-2 mb-4">
            <Text className="text-3xl font-bold text-foreground">Settings</Text>
            <Text className="text-base text-muted">Manage your account and preferences</Text>
          </View>

          {/* Account Section */}
          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">Account</Text>
            <View className="bg-surface rounded-xl p-4 border border-border gap-3">
              <View>
                <Text className="text-xs text-muted font-semibold mb-1">Email</Text>
                <Text className="text-base text-foreground">{user?.email || "Not set"}</Text>
              </View>
              <View>
                <Text className="text-xs text-muted font-semibold mb-1">Name</Text>
                <Text className="text-base text-foreground">{user?.name || "Not set"}</Text>
              </View>
              <View>
                <Text className="text-xs text-muted font-semibold mb-1">Last Signed In</Text>
                <Text className="text-base text-foreground">
                  {user?.lastSignedIn
                    ? new Date(user.lastSignedIn).toLocaleDateString()
                    : "Never"}
                </Text>
              </View>
            </View>
          </View>

          {/* Preferences Section */}
          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">Preferences</Text>
            <View className="bg-surface rounded-xl p-4 border border-border gap-4">
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="font-semibold text-foreground">Dark Mode</Text>
                  <Text className="text-sm text-muted">Coming soon</Text>
                </View>
                <View className="w-12 h-7 bg-border rounded-full" />
              </View>
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="font-semibold text-foreground">Notifications</Text>
                  <Text className="text-sm text-muted">Coming soon</Text>
                </View>
                <View className="w-12 h-7 bg-border rounded-full" />
              </View>
            </View>
          </View>

          {/* About Section */}
          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">About</Text>
            <View className="bg-surface rounded-xl p-4 border border-border gap-3">
              <View className="flex-row justify-between">
                <Text className="text-muted">Version</Text>
                <Text className="text-foreground font-semibold">1.0.0</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-muted">Build</Text>
                <Text className="text-foreground font-semibold">1</Text>
              </View>
            </View>
          </View>

          {/* Logout Button */}
          <TouchableOpacity
            onPress={handleLogout}
            className="bg-error bg-opacity-10 rounded-lg p-4 border border-error border-opacity-30 items-center justify-center mt-auto active:opacity-70"
          >
            <Text className="font-semibold text-error text-center">Logout</Text>
          </TouchableOpacity>

          {/* Back Button */}
          <TouchableOpacity
            onPress={() => router.back()}
            className="bg-surface rounded-lg p-4 border border-border items-center justify-center active:opacity-70"
          >
            <Text className="font-semibold text-foreground text-center">Back</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
