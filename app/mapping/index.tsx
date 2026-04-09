import { ScrollView, Text, View, TouchableOpacity, TextInput } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useState } from "react";

interface FieldMapping {
  sourceField: string;
  targetColumn: string;
}

export default function MappingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ docId?: string; docName?: string }>();
  const [mappings, setMappings] = useState<FieldMapping[]>([
    { sourceField: "field1", targetColumn: "Column A" },
    { sourceField: "field2", targetColumn: "Column B" },
  ]);

  const handleUpdateMapping = (index: number, field: keyof FieldMapping, value: string) => {
    const updated = [...mappings];
    updated[index] = { ...updated[index], [field]: value };
    setMappings(updated);
  };

  const handleAddMapping = () => {
    setMappings([...mappings, { sourceField: "", targetColumn: "" }]);
  };

  const handleRemoveMapping = (index: number) => {
    setMappings(mappings.filter((_, i) => i !== index));
  };

  const handleProceed = () => {
    router.push({
      pathname: "/export",
      params: { docId: params.docId, docName: params.docName },
    });
  };

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="flex-1 gap-4">
          {/* Header */}
          <View className="gap-2 mb-4">
            <Text className="text-3xl font-bold text-foreground">Configure Mapping</Text>
            <Text className="text-base text-muted">
              Map extracted fields to spreadsheet columns
            </Text>
          </View>

          {/* Mappings List */}
          <View className="gap-3">
            {mappings.map((mapping, index) => (
              <View key={index} className="bg-surface rounded-xl p-4 border border-border gap-3">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="font-semibold text-foreground">Field {index + 1}</Text>
                  {mappings.length > 1 && (
                    <TouchableOpacity
                      onPress={() => handleRemoveMapping(index)}
                      className="px-3 py-1 bg-error bg-opacity-10 rounded-lg active:opacity-70"
                    >
                      <Text className="text-sm font-semibold text-error">Remove</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <View className="gap-2">
                  <Text className="text-xs text-muted font-semibold">Source Field</Text>
                  <TextInput
                    placeholder="e.g., field1"
                    placeholderTextColor="#9BA1A6"
                    value={mapping.sourceField}
                    onChangeText={(text) => handleUpdateMapping(index, "sourceField", text)}
                    className="bg-background rounded-lg px-3 py-2 text-foreground border border-border"
                  />
                </View>

                <View className="gap-2">
                  <Text className="text-xs text-muted font-semibold">Target Column</Text>
                  <TextInput
                    placeholder="e.g., Column A"
                    placeholderTextColor="#9BA1A6"
                    value={mapping.targetColumn}
                    onChangeText={(text) => handleUpdateMapping(index, "targetColumn", text)}
                    className="bg-background rounded-lg px-3 py-2 text-foreground border border-border"
                  />
                </View>
              </View>
            ))}
          </View>

          {/* Add Mapping Button */}
          <TouchableOpacity
            onPress={handleAddMapping}
            className="bg-surface rounded-lg p-4 border border-border border-dashed items-center justify-center active:opacity-70"
          >
            <Text className="font-semibold text-primary">+ Add Another Field</Text>
          </TouchableOpacity>

          {/* Action Buttons */}
          <View className="gap-3 mt-auto pt-6">
            <TouchableOpacity
              onPress={handleProceed}
              className="bg-primary rounded-lg p-4 items-center justify-center active:opacity-80"
            >
              <Text className="font-semibold text-background text-center">Next: Export to Sheets</Text>
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
