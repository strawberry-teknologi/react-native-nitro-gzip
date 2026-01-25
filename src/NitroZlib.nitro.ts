import type { HybridObject } from "react-native-nitro-modules";

// Zlib format union type
// RAW: Raw deflate (-15): no header/trailer
// ZLIB: Zlib wrapper (15): 2-byte header + Adler-32
// GZIP: GZIP wrapper (31): gzip header/trailer
// AUTO: Auto-detect (47): inflate only, detects zlib/gzip
export type ZlibFormat = "raw" | "zlib" | "gzip" | "auto";

export interface NitroZlib
  extends HybridObject<{ ios: "c++"; android: "c++" }> {
  inflate(data: ArrayBuffer, format: ZlibFormat): ArrayBuffer;
  inflateAsync(data: ArrayBuffer, format: ZlibFormat): Promise<ArrayBuffer>;
  deflate(data: ArrayBuffer, format: ZlibFormat, level: number): ArrayBuffer;
  deflateAsync(
    data: ArrayBuffer,
    format: ZlibFormat,
    level: number
  ): Promise<ArrayBuffer>;
}
