import { useState } from "react";
import {
  Alert,
  Button,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import TextEncoder from "react-native-fast-encoder";
import { deflate, inflate, deflateAsync, inflateAsync } from "react-native-nitro-zlib";

export default function App() {
  const [inputText, setInputText] = useState(
    "Hello, World! This is a test string for compression."
  );
  const [compressedSize, setCompressedSize] = useState<number | null>(null);
  const [decompressedText, setDecompressedText] = useState<string>("");
  const [originalSize, setOriginalSize] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const stringToArrayBuffer = (str: string): ArrayBuffer => {
    const encoder = new TextEncoder();
    return encoder.encode(str).buffer;
  };

  const arrayBufferToString = (buffer: ArrayBuffer): string => {
    const decoder = new TextEncoder();
    return decoder.decode(new Uint8Array(buffer));
  };

  const handleCompress = async (useAsync = false) => {
    setIsProcessing(true);
    try {
      const inputBuffer = stringToArrayBuffer(inputText);
      setOriginalSize(inputBuffer.byteLength);

      const compressed = useAsync 
        ? await deflateAsync(inputBuffer)
        : deflate(inputBuffer);
      setCompressedSize(compressed.byteLength);

      const decompressed = useAsync
        ? await inflateAsync(compressed)
        : inflate(compressed);
      const result = arrayBufferToString(decompressed);
      setDecompressedText(result);

      const compressionRatio = (
        (1 - compressed.byteLength / inputBuffer.byteLength) *
        100
      ).toFixed(2);

      Alert.alert(
        "Success",
        `${useAsync ? 'Async' : 'Sync'} Operation\nOriginal: ${inputBuffer.byteLength} bytes\nCompressed: ${compressed.byteLength} bytes\nCompression: ${compressionRatio}%`
      );
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Unknown error"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Nitro Zlib Demo</Text>

        <Text style={styles.label}>Input Text:</Text>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          multiline
          placeholder="Enter text to compress..."
        />

        <View style={styles.buttonContainer}>
          <View style={{ marginBottom: 10 }}>
            <Button 
              title={isProcessing ? "Processing..." : "Sync Compress & Decompress"} 
              onPress={() => handleCompress(false)} 
              disabled={isProcessing}
            />
          </View>
          <Button 
            title={isProcessing ? "Processing..." : "Async Compress & Decompress"} 
            onPress={() => handleCompress(true)} 
            disabled={isProcessing}
            color="#4caf50"
          />
        </View>

        {originalSize !== null && (
          <View style={styles.statsContainer}>
            <Text style={styles.statsTitle}>Statistics:</Text>
            <Text style={styles.stat}>Original Size: {originalSize} bytes</Text>
            <Text style={styles.stat}>
              Compressed Size: {compressedSize} bytes
            </Text>
            <Text style={styles.stat}>
              Saved: {originalSize - (compressedSize || 0)} bytes (
              {((1 - (compressedSize || 0) / originalSize) * 100).toFixed(2)}%)
            </Text>
          </View>
        )}

        {decompressedText ? (
          <View>
            <Text style={styles.label}>Decompressed Text:</Text>
            <View style={styles.output}>
              <Text style={styles.outputText}>{decompressedText}</Text>
            </View>
            <Text style={styles.success}>
              {decompressedText === inputText
                ? "✓ Decompression matches original!"
                : "✗ Mismatch!"}
            </Text>
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 15,
    marginBottom: 8,
    color: "#555",
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 100,
    textAlignVertical: "top",
  },
  buttonContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
  statsContainer: {
    backgroundColor: "#e3f2fd",
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#1976d2",
  },
  stat: {
    fontSize: 14,
    marginBottom: 5,
    color: "#333",
  },
  output: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    minHeight: 80,
  },
  outputText: {
    fontSize: 14,
    color: "#333",
  },
  success: {
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 10,
    textAlign: "center",
    color: "#4caf50",
  },
});
