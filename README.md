# @strawberrytech/react-native-nitro-zlib

High-performance `deflate` and `inflate` compression/decompression for React Native with support for multiple formats (GZIP, Zlib, Raw deflate) using the native `zlib` library via [Nitro Modules](https://nitro.margelo.com/).

## Requirements

- React Native New Architecture enabled (Nitro Modules / JSI)
- `react-native-nitro-modules` installed

## Installation

```sh
npm install @strawberrytech/react-native-nitro-zlib react-native-nitro-modules
```

```sh
yarn add @strawberrytech/react-native-nitro-zlib react-native-nitro-modules
```

On iOS, install pods:

```sh
npx pod-install
```

## Usage

### Basic Compression/Decompression

```ts
import { deflate, inflate, Format } from '@strawberrytech/react-native-nitro-zlib';

// Setup encoder (e.g., using react-native-fast-encoder)
const encoder = new TextEncoder();
const decoder = new TextDecoder();

// Compress with GZIP (default)
const input = encoder.encode('Hello World').buffer;
const compressed = deflate(input);
const decompressed = inflate(compressed);
const result = decoder.decode(decompressed); // 'Hello World'
```

### Format Options

The library supports multiple compression formats:

```ts
import { deflate, inflate, Format } from '@strawberrytech/react-native-nitro-zlib';

// GZIP format (default) - most common, used for .gz files and HTTP compression
const gzipped = deflate(input, Format.GZIP);
const ungzipped = inflate(gzipped); // AUTO-detects format

// Zlib format - used in PNG, PDF, and some network protocols
const zlibbed = deflate(input, Format.ZLIB);
const unzlibbed = inflate(zlibbed); // AUTO-detects format

// Raw deflate - no headers, used inside ZIP, PNG, and other containers
// ⚠️ IMPORTANT: RAW format requires explicit matching - AUTO cannot detect it!
const rawCompressed = deflate(input, Format.RAW);
const rawDecompressed = inflate(rawCompressed, Format.RAW); // Must use Format.RAW!

// Auto-detect format on inflate (default) - works with GZIP and Zlib only
const autoDetected = inflate(compressed); // Automatically detects GZIP or Zlib
```

> **Warning**: `Format.AUTO` cannot detect raw deflate because it has no headers. When using `Format.RAW` for compression, you **must** use `Format.RAW` for decompression as well.

### Compression Levels

Control the compression ratio vs. speed tradeoff with the `level` parameter (1-9):

```ts
// Level 1: Fastest compression, larger output
const fast = deflate(input, Format.GZIP, 1);

// Level 6: Balanced (good for most use cases)
const balanced = deflate(input, Format.GZIP, 6);

// Level 9: Best compression, slower (default)
const best = deflate(input, Format.GZIP, 9);
```

### Asynchronous Usage (Recommended for Large Data)

The async versions run on a background thread pool, keeping the JS thread responsive:

```ts
import { deflateAsync, inflateAsync, Format } from '@strawberrytech/react-native-nitro-zlib';

const input = encoder.encode('Large data...').buffer;

// Compress asynchronously with GZIP
const compressed = await deflateAsync(input, Format.GZIP, 9);

// Decompress asynchronously (AUTO-detects GZIP/Zlib)
const decompressed = await inflateAsync(compressed);

// For RAW format, must use matching format for both
const rawCompressed = await deflateAsync(input, Format.RAW, 9);
const rawDecompressed = await inflateAsync(rawCompressed, Format.RAW);
```

## API

### Types

```ts
type ZlibFormat = "raw" | "zlib" | "gzip" | "auto";
```

### Constants

The `Format` object provides convenient constants, but you can also use string literals directly:

```ts
// Using Format constants (recommended)
Format.GZIP  // "gzip" - GZIP wrapper (default for deflate)
Format.ZLIB  // "zlib" - Zlib wrapper  
Format.RAW   // "raw"  - Raw deflate (no headers)
Format.AUTO  // "auto" - Auto-detect format (inflate only, default)

// Or use string literals directly
deflate(data, "gzip");
inflate(data, "raw");
```

### Functions

```ts
// Synchronous compression
function deflate(
  data: ArrayBuffer,
  format?: ZlibFormat,  // Default: Format.GZIP
  level?: number        // Default: 9 (best compression)
): ArrayBuffer;

// Synchronous decompression
function inflate(
  data: ArrayBuffer,
  format?: ZlibFormat   // Default: Format.AUTO (auto-detects zlib/gzip)
): ArrayBuffer;

// Asynchronous compression (background thread)
function deflateAsync(
  data: ArrayBuffer,
  format?: ZlibFormat,  // Default: Format.GZIP
  level?: number        // Default: 9 (best compression)
): Promise<ArrayBuffer>;

// Asynchronous decompression (background thread)
function inflateAsync(
  data: ArrayBuffer,
  format?: ZlibFormat   // Default: Format.AUTO (auto-detects zlib/gzip)
): Promise<ArrayBuffer>;
```

### Compression Levels

- **1**: Fastest compression, largest output size
- **2-5**: Progressive tradeoff between speed and size
- **6**: Balanced (good default for most cases)
- **7-8**: Better compression, slower
- **9**: Best compression, slowest (library default)

### Format Details

| Format | Window Bits | Use Cases | Headers/Trailers |
|--------|-------------|-----------|------------------|
| `Format.GZIP` | 31 | `.gz` files, HTTP compression | 10+ byte header, 8-byte trailer (CRC-32 + size) |
| `Format.ZLIB` | 15 | PNG, PDF, network protocols | 2-byte header, 4-byte trailer (Adler-32) |
| `Format.RAW` | -15 | ZIP files, PNG chunks, custom containers | None |
| `Format.AUTO` | 47 | Auto-detection (inflate only) | Automatically detects GZIP or Zlib |

## Performance Tips

- **Use async methods for data > 100KB** to avoid blocking the JS thread
- **Choose the right format**:
  - GZIP: Best for standalone files, HTTP responses
  - Zlib: Good for embedding in other formats
  - Raw: Smallest overhead when you manage headers yourself
- **Adjust compression level based on your needs**:
  - Level 1-3: Fast, good for real-time compression
  - Level 6: Balanced, recommended for most cases
  - Level 9: Best ratio, use when size matters more than speed

## Notes

- **Thread Safety**: When calling async methods, the `ArrayBuffer` is copied if it is not already an owning buffer to ensure it remains valid on the background thread.
- **Auto-detect**: `Format.AUTO` only works with `inflate()` and automatically detects GZIP or Zlib format. It cannot be used with `deflate()`.
- **Compatibility**: GZIP output is compatible with command-line `gzip` and standard HTTP `Content-Encoding: gzip`.
- For a complete working example with UI, see `example/src/App.tsx`.

## Contributing

- Development workflow: `CONTRIBUTING.md`
- Code of conduct: `CODE_OF_CONDUCT.md`

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
