import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useState, useEffect } from "react";

interface ParsedData {
  [key: string]: string | number | boolean;
}

export default function PreviewScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ docId?: string; docName?: string }>();
  const [loading, setLoading] = useState(true);
  const [rawText, setRawText] = useState("");
  const [parsedData, setParsedData] = useState<ParsedData[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAndParseDocument();
  }, [params.docId]);

  const loadAndParseDocument = async () => {
    try {
      setLoading(true);
      setError(null);

      // TODO: Call backend API to fetch document content and parse with AI
      // For now, show placeholder data
      setRawText("Sample paragraph 1. Sample paragraph 2. Sample paragraph 3.");
      setParsedData([
        { field1: "Value 1", field2: "Value 2" },
        { field1: "Value 3", field2: "Value 4" },
      ]);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load document";
      setError(message);
      console.error("Error loading document:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleProceed = () => {
    router.push({
      pathname: "/mapping",
      params: { docId: params.docId, docName: params.docName },
    });
  };

  if (loading) {
    return (
      <ScreenContainer className="flex items-center justify-center">
        <ActivityIndicator size="large" />
        <Text className="mt-4 text-muted">Extracting and parsing document...</Text>
      </ScreenContainer>
    );
  }

  if (error) {
    return (
      <ScreenContainer className="p-6">
        <View className="flex-1 items-center justify-center gap-4">
          <Text className="text-4xl">⚠️</Text>
          <Text className="text-lg font-semibold text-error">Error</Text>
          <Text className="text-base text-muted text-center">{error}</Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="bg-primary rounded-lg p-4 mt-4"
          >
            <Text className="font-semibold text-background">Go Back</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="flex-1 gap-4">
          {/* Header */}
          <View className="gap-2 mb-4">
            <Text className="text-3xl font-bold text-foreground">Preview</Text>
            <Text className="text-base text-muted">
              {params.docName || "Document"}
            </Text>
          </View>

          {/* Raw Text Section */}
          <View className="gap-2">
            <Text className="text-lg font-semibold text-foreground">Original Text</Text>
            <View className="bg-surface rounded-xl p-4 border border-border">
              <Text className="text-sm text-foreground leading-relaxed">{rawText}</Text>
            </View>
          </View>

          {/* Parsed Data Section */}
          <View className="gap-2 mt-4">
            <Text className="text-lg font-semibold text-foreground">Parsed Data</Text>
            {parsedData.length > 0 ? (
              <View className="gap-3">
                {parsedData.map((item, index) => (
                  <View key={index} className="bg-surface rounded-xl p-4 border border-border">
                    {Object.entries(item).map(([key, value]) => (
                      <View key={key} className="flex-row justify-between mb-2 last:mb-0">
                        <Text className="font-semibold text-muted flex-1">{key}</Text>
                        <Text className="text-foreground flex-1 text-right">{String(value)}</Text>
                      </View>
                    ))}
                  </View>
                ))}
              </View>
            ) : (
              <View className="bg-surface rounded-xl p-4 border border-border items-center">
                <Text className="text-muted">No data parsed</Text>
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <View className="gap-3 mt-auto pt-6">
            <TouchableOpacity
              onPress={handleProceed}
              className="bg-primary rounded-lg p-4 items-center justify-center active:opacity-80"
            >
              <Text className="font-semibold text-background text-center">Next: Configure Mapping</Text>
            </TouchableOpacity>
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
