import { NitroModules } from "react-native-nitro-modules";
import type { NitroZlib, ZlibFormat } from "./NitroZlib.nitro";

const NitroZlibHybridObject =
  NitroModules.createHybridObject<NitroZlib>("NitroZlib");

// Export format constants for users
export const Format = {
  RAW: "raw" as const,   // Raw deflate (-15): no header/trailer
  ZLIB: "zlib" as const, // Zlib wrapper (15): 2-byte header + Adler-32
  GZIP: "gzip" as const, // GZIP wrapper (31): gzip header/trailer
  AUTO: "auto" as const, // Auto-detect (47): inflate only, detects zlib/gzip
} as const;

// Default compression level (best compression)
const DEFAULT_LEVEL = 9;

/**
 * Inflate (decompress) data.
 * @param data - The compressed data to inflate
 * @param format - The compression format (defaults to AUTO which auto-detects zlib/gzip)
 * @returns The decompressed data
 */
export function inflate(
  data: ArrayBuffer,
  format: ZlibFormat = Format.AUTO
): ArrayBuffer {
  return NitroZlibHybridObject.inflate(data, format);
}

/**
 * Inflate (decompress) data asynchronously.
 * @param data - The compressed data to inflate
 * @param format - The compression format (defaults to AUTO which auto-detects zlib/gzip)
 * @returns Promise that resolves to the decompressed data
 */
export function inflateAsync(
  data: ArrayBuffer,
  format: ZlibFormat = Format.AUTO
): Promise<ArrayBuffer> {
  return NitroZlibHybridObject.inflateAsync(data, format);
}

/**
 * Deflate (compress) data.
 * @param data - The data to compress
 * @param format - The compression format (defaults to GZIP)
 * @param level - Compression level 1-9, where 1 is fastest and 9 is best compression (defaults to 9)
 * @returns The compressed data
 */
export function deflate(
  data: ArrayBuffer,
  format: ZlibFormat = Format.GZIP,
  level: number = DEFAULT_LEVEL
): ArrayBuffer {
  return NitroZlibHybridObject.deflate(data, format, level);
}

/**
 * Deflate (compress) data asynchronously.
 * @param data - The data to compress
 * @param format - The compression format (defaults to GZIP)
 * @param level - Compression level 1-9, where 1 is fastest and 9 is best compression (defaults to 9)
 * @returns Promise that resolves to the compressed data
 */
export function deflateAsync(
  data: ArrayBuffer,
  format: ZlibFormat = Format.GZIP,
  level: number = DEFAULT_LEVEL
): Promise<ArrayBuffer> {
  return NitroZlibHybridObject.deflateAsync(data, format, level);
}
