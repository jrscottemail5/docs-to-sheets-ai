import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator, FlatList, TextInput } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useState, useEffect } from "react";

interface GoogleSheet {
  id: string;
  name: string;
  modifiedTime: string;
}

export default function ExportScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ docId?: string; docName?: string }>();
  const [sheets, setSheets] = useState<GoogleSheet[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<GoogleSheet | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [newSheetName, setNewSheetName] = useState("");
  const [showNewSheet, setShowNewSheet] = useState(false);

  useEffect(() => {
    loadSheets();
  }, []);

  const loadSheets = async () => {
    try {
      setLoading(true);
      // TODO: Call backend API to fetch user's Google Sheets
      setSheets([
        {
          id: "1",
          name: "My Spreadsheet 1",
          modifiedTime: new Date().toISOString(),
        },
        {
          id: "2",
          name: "My Spreadsheet 2",
          modifiedTime: new Date().toISOString(),
        },
      ]);
    } catch (error) {
      console.error("Failed to load sheets:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNewSheet = async () => {
    if (!newSheetName.trim()) return;

    try {
      setExporting(true);
      // TODO: Call backend API to create new sheet and export data
      console.log("Creating new sheet:", newSheetName);
      // After successful export, navigate to success screen or home
      router.replace("/(tabs)");
    } catch (error) {
      console.error("Failed to create sheet:", error);
    } finally {
      setExporting(false);
    }
  };

  const handleExportToSheet = async () => {
    if (!selectedSheet) return;

    try {
      setExporting(true);
      // TODO: Call backend API to export data to selected sheet
      console.log("Exporting to sheet:", selectedSheet.name);
      // After successful export, navigate to success screen or home
      router.replace("/(tabs)");
    } catch (error) {
      console.error("Failed to export:", error);
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <ScreenContainer className="flex items-center justify-center">
        <ActivityIndicator size="large" />
        <Text className="mt-4 text-muted">Loading your spreadsheets...</Text>
      </ScreenContainer>
    );
  }

  if (exporting) {
    return (
      <ScreenContainer className="flex items-center justify-center">
        <ActivityIndicator size="large" />
        <Text className="mt-4 text-muted">Exporting data...</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="flex-1 gap-4">
          {/* Header */}
          <View className="gap-2 mb-4">
            <Text className="text-3xl font-bold text-foreground">Export to Sheets</Text>
            <Text className="text-base text-muted">
              Choose where to save your converted data
            </Text>
          </View>

          {/* Existing Sheets */}
          <View className="gap-2">
            <Text className="text-lg font-semibold text-foreground">Select Existing Sheet</Text>
            {sheets.length > 0 ? (
              <FlatList
                data={sheets}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => setSelectedSheet(item)}
                    className={`rounded-xl p-4 border mb-2 flex-row items-center gap-3 active:opacity-70 ${
                      selectedSheet?.id === item.id
                        ? "bg-primary bg-opacity-10 border-primary"
                        : "bg-surface border-border"
                    }`}
                  >
                    <View className="flex-1">
                      <Text className="font-semibold text-foreground mb-1">{item.name}</Text>
                      <Text className="text-xs text-muted">
                        {new Date(item.modifiedTime).toLocaleDateString()}
                      </Text>
                    </View>
                    {selectedSheet?.id === item.id && (
                      <Text className="text-xl text-primary">✓</Text>
                    )}
                  </TouchableOpacity>
                )}
                scrollEnabled={false}
              />
            ) : (
              <View className="bg-surface rounded-xl p-4 border border-border items-center">
                <Text className="text-muted">No spreadsheets found</Text>
              </View>
            )}
          </View>

          {/* Divider */}
          <View className="flex-row items-center gap-3 my-2">
            <View className="flex-1 h-px bg-border" />
            <Text className="text-muted text-sm">OR</Text>
            <View className="flex-1 h-px bg-border" />
          </View>

          {/* Create New Sheet */}
          <View className="gap-2">
            <Text className="text-lg font-semibold text-foreground">Create New Sheet</Text>
            <TextInput
              placeholder="Enter sheet name..."
              placeholderTextColor="#9BA1A6"
              value={newSheetName}
              onChangeText={setNewSheetName}
              className="bg-surface rounded-lg px-4 py-3 text-foreground border border-border"
            />
          </View>

          {/* Action Buttons */}
          <View className="gap-3 mt-auto pt-6">
            {selectedSheet ? (
              <TouchableOpacity
                onPress={handleExportToSheet}
                className="bg-primary rounded-lg p-4 items-center justify-center active:opacity-80"
              >
                <Text className="font-semibold text-background text-center">
                  Export to {selectedSheet.name}
                </Text>
              </TouchableOpacity>
            ) : null}

            {newSheetName.trim() ? (
              <TouchableOpacity
                onPress={handleCreateNewSheet}
                className="bg-success rounded-lg p-4 items-center justify-center active:opacity-80"
              >
                <Text className="font-semibold text-background text-center">
                  Create & Export to {newSheetName}
                </Text>
              </TouchableOpacity>
            ) : null}

            {!selectedSheet && !newSheetName.trim() ? (
              <View className="bg-surface rounded-lg p-4 items-center justify-center border border-border">
                <Text className="text-muted text-center">
                  Select a sheet or enter a name to proceed
                </Text>
              </View>
            ) : null}

            <TouchableOpacity
              onPress={() => router.back()}
              className="bg-surface rounded-lg p-4 border border-border items-center justify-center active:opacity-70"
            >
              <Text className="font-semibold text-foreground text-center">Back</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
