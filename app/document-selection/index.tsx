import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator, FlatList, TextInput } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";

interface GoogleDoc {
  id: string;
  name: string;
  modifiedTime: string;
}

export default function DocumentSelectionScreen() {
  const router = useRouter();
  const [searchText, setSearchText] = useState("");
  const [selectedDoc, setSelectedDoc] = useState<GoogleDoc | null>(null);
  const [documents, setDocuments] = useState<GoogleDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      // TODO: Call backend API to fetch Google Docs
      // For now, show placeholder
      setDocuments([
        {
          id: "1",
          name: "Sample Document 1",
          modifiedTime: new Date().toISOString(),
        },
        {
          id: "2",
          name: "Sample Document 2",
          modifiedTime: new Date().toISOString(),
        },
      ]);
    } catch (error) {
      console.error("Failed to load documents:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDocs = documents.filter((doc) =>
    doc.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleSelectDoc = (doc: GoogleDoc) => {
    setSelectedDoc(doc);
    router.push({
      pathname: "/preview",
      params: { docId: doc.id, docName: doc.name },
    });
  };

  if (loading) {
    return (
      <ScreenContainer className="flex items-center justify-center">
        <ActivityIndicator size="large" />
        <Text className="mt-4 text-muted">Loading your documents...</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-6">
      <View className="flex-1 gap-4">
        {/* Header */}
        <View className="gap-2 mb-4">
          <Text className="text-3xl font-bold text-foreground">Select Document</Text>
          <Text className="text-base text-muted">
            Choose a Google Doc to convert
          </Text>
        </View>

        {/* Search Bar */}
        <View className="bg-surface rounded-xl border border-border px-4 py-3 flex-row items-center gap-3">
          <Text className="text-xl">🔍</Text>
          <TextInput
            placeholder="Search documents..."
            placeholderTextColor="#9BA1A6"
            value={searchText}
            onChangeText={setSearchText}
            className="flex-1 text-foreground text-base"
          />
        </View>

        {/* Documents List */}
        {filteredDocs.length > 0 ? (
          <FlatList
            data={filteredDocs}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handleSelectDoc(item)}
                className="bg-surface rounded-xl p-4 border border-border mb-3 active:opacity-70"
              >
                <View className="flex-row items-center gap-3">
                  <Text className="text-2xl">📄</Text>
                  <View className="flex-1">
                    <Text className="font-semibold text-foreground mb-1">{item.name}</Text>
                    <Text className="text-xs text-muted">
                      {new Date(item.modifiedTime).toLocaleDateString()}
                    </Text>
                  </View>
                  <Text className="text-lg">›</Text>
                </View>
              </TouchableOpacity>
            )}
            scrollEnabled={false}
          />
        ) : (
          <View className="flex-1 items-center justify-center gap-4">
            <Text className="text-4xl">📭</Text>
            <Text className="text-lg font-semibold text-foreground">No documents found</Text>
            <Text className="text-sm text-muted text-center">
              {searchText ? "Try a different search term" : "Create a Google Doc to get started"}
            </Text>
          </View>
        )}

        {/* Back Button */}
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-surface rounded-lg p-4 border border-border mt-auto active:opacity-70"
        >
          <Text className="font-semibold text-foreground text-center">Back</Text>
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
}
