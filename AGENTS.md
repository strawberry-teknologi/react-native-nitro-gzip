# Agents Guide

This repo is a React Native library (`react-native-nitro-zlib`) that exposes zlib compression/decompression (`deflate`/`inflate`) with support for multiple formats (GZIP, Zlib, Raw deflate) via [Nitro Modules](https://nitro.margelo.com/). The JS surface is thin; the implementation lives in C++ (zlib) with Nitrogen-generated bindings.

## Quick Start

- Prereqs: Node from `.nvmrc` (currently `v22.20.0`), Yarn 4 (`packageManager`), Ruby/Bundler for iOS example.
- Install deps (monorepo with Yarn workspaces):
  - `yarn install --immutable`
- Generate Nitro bindings (required on a fresh clone, and after editing any `*.nitro.ts`):
  - `yarn nitrogen`
- Library checks:
  - `yarn typecheck`
  - `yarn test`
- Example app:
  - `yarn example start`
  - `yarn example android`
  - `yarn example ios`

## Repo Layout (Key Files)

- JS entrypoints
  - `src/index.tsx`: exports `inflate()`, `deflate()`, `inflateAsync()`, `deflateAsync()`, and `Format` constants.
  - `src/NitroZlib.nitro.ts`: Nitro interface spec (drives codegen). Uses TypeScript union types for format parameter.

- C++ implementation
  - `cpp/NitroZlib.hpp`: implements the generated `HybridNitroZlibSpec`.
  - `cpp/NitroZlib.cpp`: zlib calls with configurable format (via `getWindowBits()` helper) and compression level support.

- Android glue
  - `android/build.gradle`: includes `../nitrogen/generated/android/nitrozlib+autolinking.gradle`; adds `android/generated/{java,jni}` sources.
  - `android/CMakeLists.txt`: builds `nitrozlib` shared lib; includes `../nitrogen/generated/android/nitrozlib+autolinking.cmake`; links `z`.
  - `android/src/main/cpp/cpp-adapter.cpp`: `JNI_OnLoad` calls generated `margelo::nitro::nitrozlib::initialize(vm)`.
  - `android/src/main/java/com/margelo/nitro/nitrozlib/NitroZlibPackage.kt`: loads the `nitrozlib` native library.

- iOS glue
  - `NitroZlib.podspec`: loads `nitrogen/generated/ios/NitroZlib+autolinking.rb`; links system zlib (`s.libraries = 'z'`).
  - Note: there is currently no handwritten `ios/` directory in this repo; iOS integration is via Nitrogen-generated files + the shared C++ implementation.

- Example app
  - `example/src/App.tsx`: demonstrates all compression formats (GZIP, Zlib, Raw) and compression levels with interactive UI.

## Generated/Build Outputs (Do Not Hand-Edit)

These are intentionally not committed and/or are build outputs:

- `nitrogen/` (Nitrogen output; required for native builds)
- `android/generated/` and `ios/generated/` (RN codegen output)
- `lib/` (react-native-builder-bob output)

If an agent needs to change behavior, change the source specs/implementation instead:

- API shape: `src/NitroZlib.nitro.ts`
- JS wrapper: `src/index.tsx`
- Native logic: `cpp/NitroZlib.{hpp,cpp}`
- Then re-run: `yarn nitrogen`

## Making API Changes (Typical Workflow)

1. Update the Nitro interface in `src/NitroZlib.nitro.ts`.
2. Implement the new method(s) in `cpp/NitroZlib.{hpp,cpp}`.
3. Run `yarn nitrogen` to regenerate bindings.
4. Re-export from `src/index.tsx` (or adjust its wrapper as needed).
5. Validate with the example app (`yarn example android` / `yarn example ios`).
6. Add/extend tests in `src/__tests__/` (currently mostly stubbed).

## CI/Checks You Should Match Locally

GitHub Actions (`.github/workflows/ci.yml`) runs:

- `yarn typecheck`
- `yarn test --maxWorkers=2 --coverage`
- `yarn prepare` (bob build)
- Native example builds (after `yarn nitrogen`) via Turbo tasks: `build:android`, `build:ios`

## Current API (Multi-Format Support)

The library now supports multiple compression formats:

```typescript
import { inflate, deflate, Format } from 'react-native-nitro-zlib';

// Format constants
Format.GZIP  // GZIP wrapper (window bits 31) - default for deflate
Format.ZLIB  // Zlib wrapper (window bits 15)
Format.RAW   // Raw deflate (window bits -15) - no headers
Format.AUTO  // Auto-detect (window bits 47) - inflate only, default

// API signatures
inflate(data: ArrayBuffer, format?: ZlibFormat): ArrayBuffer
inflateAsync(data: ArrayBuffer, format?: ZlibFormat): Promise<ArrayBuffer>
deflate(data: ArrayBuffer, format?: ZlibFormat, level?: number): ArrayBuffer
deflateAsync(data: ArrayBuffer, format?: ZlibFormat, level?: number): Promise<ArrayBuffer>

// Examples
const gzipped = deflate(data);                      // GZIP, level 9 (default)
const fast = deflate(data, Format.GZIP, 1);         // GZIP, fastest
const zlibData = deflate(data, Format.ZLIB, 6);     // Zlib wrapper, balanced
const rawData = deflate(data, Format.RAW, 9);       // Raw deflate, best

const result = inflate(compressed);                  // AUTO-detects format
const result2 = inflate(rawData, Format.RAW);       // Explicit format
```

### Format-to-Window Bits Mapping (C++)

The C++ implementation uses `getWindowBits()` helper to map format strings:

| Format | Window Bits | Description |
|--------|-------------|-------------|
| `"raw"` | `-15` | Raw deflate (no wrapper) |
| `"zlib"` | `15` | Zlib wrapper (2-byte header + Adler-32) |
| `"gzip"` | `31` | GZIP wrapper (gzip header + CRC-32 + size trailer) |
| `"auto"` | `47` | Auto-detect zlib/gzip (inflate only) |

**Note**: TypeScript union types (`"raw" | "zlib" | "gzip" | "auto"`) are used instead of enums because Nitrogen doesn't support string enums in C++ generation.

## Project Gotchas

- **Breaking change**: The API now requires format and level parameters. Inflate defaults to AUTO (auto-detects zlib/gzip), deflate defaults to GZIP with level 9.
- **RAW format requires explicit matching**: `Format.AUTO` cannot detect raw deflate because it has no headers. When using `Format.RAW` for deflate, you **must** use `Format.RAW` for inflate as well.
- **TypeScript unions, not enums**: `ZlibFormat` is a union type (`"raw" | "zlib" | "gzip" | "auto"`) because Nitrogen cannot generate C++ code from TypeScript string enums.
- The root folder name may say "gzip", but the published package name is `react-native-nitro-zlib` (see `package.json`). Use the package name for imports and user-facing docs.

## Format Compatibility Matrix

| Deflate Format | Compatible Inflate Formats | Notes |
|----------------|---------------------------|-------|
| `Format.GZIP` | `Format.AUTO`, `Format.GZIP` | AUTO works - GZIP has magic headers |
| `Format.ZLIB` | `Format.AUTO`, `Format.ZLIB` | AUTO works - Zlib has headers |
| `Format.RAW` | **`Format.RAW` only** | AUTO fails - no headers to detect |
