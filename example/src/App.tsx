import {
  deflate,
  deflateAsync,
  Format,
  inflate,
  inflateAsync,
} from "@strawberrytech/react-native-nitro-zlib";
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

export default function App() {
  const [inputText, setInputText] = useState(
    "Hello, World! This is a test string for compression.",
  );
  const [compressedSize, setCompressedSize] = useState<number | null>(null);
  const [decompressedText, setDecompressedText] = useState<string>("");
  const [originalSize, setOriginalSize] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [benchmarkResult, setBenchmarkResult] = useState<{
    sync: { deflate: number; inflate: number };
    async: { deflate: number; inflate: number };
  } | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<"gzip" | "zlib" | "raw">("gzip");
  const [compressionLevel, setCompressionLevel] = useState(9);

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
        ? await deflateAsync(inputBuffer, selectedFormat, compressionLevel)
        : deflate(inputBuffer, selectedFormat, compressionLevel);
      setCompressedSize(compressed.byteLength);

      // For RAW format, we must use RAW for inflate (AUTO can't detect raw deflate)
      // For GZIP/ZLIB, AUTO works fine
      const inflateFormat = selectedFormat === "raw" ? Format.RAW : Format.AUTO;
      
      const decompressed = useAsync
        ? await inflateAsync(compressed, inflateFormat)
        : inflate(compressed, inflateFormat);
      const result = arrayBufferToString(decompressed);
      setDecompressedText(result);

      // Run Benchmark
      const runs = 10;
      let syncDeflateTotal = 0;
      let syncInflateTotal = 0;
      let asyncDeflateTotal = 0;
      let asyncInflateTotal = 0;

      for (let i = 0; i < runs; i++) {
        const startSyncDeflate = performance.now();
        const syncCompressed = deflate(inputBuffer, selectedFormat, compressionLevel);
        syncDeflateTotal += performance.now() - startSyncDeflate;

        const startSyncInflate = performance.now();
        inflate(syncCompressed, inflateFormat);
        syncInflateTotal += performance.now() - startSyncInflate;

        const startAsyncDeflate = performance.now();
        const asyncCompressed = await deflateAsync(inputBuffer, selectedFormat, compressionLevel);
        asyncDeflateTotal += performance.now() - startAsyncDeflate;

        const startAsyncInflate = performance.now();
        await inflateAsync(asyncCompressed, inflateFormat);
        asyncInflateTotal += performance.now() - startAsyncInflate;
      }

      setBenchmarkResult({
        sync: {
          deflate: syncDeflateTotal / runs,
          inflate: syncInflateTotal / runs,
        },
        async: {
          deflate: asyncDeflateTotal / runs,
          inflate: asyncInflateTotal / runs,
        },
      });

      const compressionRatio = (
        (1 - compressed.byteLength / inputBuffer.byteLength) *
        100
      ).toFixed(2);

      Alert.alert(
        "Success",
        `${useAsync ? "Async" : "Sync"} Operation\nFormat: ${selectedFormat.toUpperCase()}\nLevel: ${compressionLevel}\nOriginal: ${inputBuffer.byteLength} bytes\nCompressed: ${compressed.byteLength} bytes\nCompression: ${compressionRatio}%`,
      );
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Unknown error",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Nitro Zlib Demo</Text>

        <Text style={styles.label}>Format:</Text>
        <View style={styles.formatContainer}>
          <Button
            title="GZIP"
            onPress={() => setSelectedFormat("gzip")}
            color={selectedFormat === "gzip" ? "#2196f3" : "#9e9e9e"}
          />
          <Button
            title="ZLIB"
            onPress={() => setSelectedFormat("zlib")}
            color={selectedFormat === "zlib" ? "#2196f3" : "#9e9e9e"}
          />
          <Button
            title="RAW"
            onPress={() => setSelectedFormat("raw")}
            color={selectedFormat === "raw" ? "#2196f3" : "#9e9e9e"}
          />
        </View>

        <Text style={styles.label}>Compression Level: {compressionLevel}</Text>
        <View style={styles.levelContainer}>
          {[1, 3, 6, 9].map((level) => (
            <Button
              key={level}
              title={`${level}`}
              onPress={() => setCompressionLevel(level)}
              color={compressionLevel === level ? "#4caf50" : "#9e9e9e"}
            />
          ))}
        </View>

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
              title={
                isProcessing ? "Processing..." : "Sync Compress & Decompress"
              }
              onPress={() => handleCompress(false)}
              disabled={isProcessing}
            />
          </View>
          <Button
            title={
              isProcessing ? "Processing..." : "Async Compress & Decompress"
            }
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

        {benchmarkResult && (
          <View style={styles.benchmarkContainer}>
            <Text style={styles.statsTitle}>Benchmark (avg of 10 runs):</Text>
            <View style={styles.benchmarkRow}>
              <View style={styles.benchmarkCell}>
                <Text style={styles.benchmarkLabel}>Method</Text>
              </View>
              <View style={styles.benchmarkCell}>
                <Text style={styles.benchmarkLabel}>Sync</Text>
              </View>
              <View style={styles.benchmarkCell}>
                <Text style={styles.benchmarkLabel}>Async</Text>
              </View>
            </View>
            <View style={styles.benchmarkRow}>
              <View style={styles.benchmarkCell}>
                <Text style={styles.stat}>Deflate</Text>
              </View>
              <View style={styles.benchmarkCell}>
                <Text style={styles.stat}>
                  {benchmarkResult.sync.deflate.toFixed(3)}ms
                </Text>
              </View>
              <View style={styles.benchmarkCell}>
                <Text style={styles.stat}>
                  {benchmarkResult.async.deflate.toFixed(3)}ms
                </Text>
              </View>
            </View>
            <View style={styles.benchmarkRow}>
              <View style={styles.benchmarkCell}>
                <Text style={styles.stat}>Inflate</Text>
              </View>
              <View style={styles.benchmarkCell}>
                <Text style={styles.stat}>
                  {benchmarkResult.sync.inflate.toFixed(3)}ms
                </Text>
              </View>
              <View style={styles.benchmarkCell}>
                <Text style={styles.stat}>
                  {benchmarkResult.async.inflate.toFixed(3)}ms
                </Text>
              </View>
            </View>
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
  formatContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 15,
  },
  levelContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 15,
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
  benchmarkContainer: {
    backgroundColor: "#f1f8e9",
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  benchmarkRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#c8e6c9",
    paddingVertical: 5,
  },
  benchmarkCell: {
    flex: 1,
    alignItems: "center",
  },
  benchmarkLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2e7d32",
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
