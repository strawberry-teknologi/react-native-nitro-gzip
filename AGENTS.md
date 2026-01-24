# Agents Guide

This repo is a React Native library (`react-native-nitro-zlib`) that exposes Gzip-compatible `deflate`/`inflate` via [Nitro Modules](https://nitro.margelo.com/). The JS surface is thin; the implementation lives in C++ (zlib) with Nitrogen-generated bindings.

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
  - `src/index.tsx`: exports `inflate(data: ArrayBuffer)` and `deflate(data: ArrayBuffer)`.
  - `src/NitroZlib.nitro.ts`: Nitro interface spec (drives codegen).

- C++ implementation
  - `cpp/NitroZlib.hpp`: implements the generated `HybridNitroZlibSpec`.
  - `cpp/NitroZlib.cpp`: zlib calls; uses `inflateInit2(..., 31)` and `deflateInit2(..., 31, ...)` (GZIP headers enabled).

- Android glue
  - `android/build.gradle`: includes `../nitrogen/generated/android/nitrozlib+autolinking.gradle`; adds `android/generated/{java,jni}` sources.
  - `android/CMakeLists.txt`: builds `nitrozlib` shared lib; includes `../nitrogen/generated/android/nitrozlib+autolinking.cmake`; links `z`.
  - `android/src/main/cpp/cpp-adapter.cpp`: `JNI_OnLoad` calls generated `margelo::nitro::nitrozlib::initialize(vm)`.
  - `android/src/main/java/com/margelo/nitro/nitrozlib/NitroZlibPackage.kt`: loads the `nitrozlib` native library.

- iOS glue
  - `NitroZlib.podspec`: loads `nitrogen/generated/ios/NitroZlib+autolinking.rb`; links system zlib (`s.libraries = 'z'`).
  - Note: there is currently no handwritten `ios/` directory in this repo; iOS integration is via Nitrogen-generated files + the shared C++ implementation.

- Example app
  - `example/src/App.tsx`: demonstrates `deflate` + `inflate` with `react-native-fast-encoder`.

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

## Project Gotchas

- `inflate`/`deflate` currently operate on GZIP-wrapped streams (zlib window bits `31`). If you add "raw deflate" or "zlib wrapper" support, it should be an explicit API choice.
- The root folder name may say "gzip", but the published package name is `react-native-nitro-zlib` (see `package.json`). Use the package name for imports and user-facing docs.
- The root `README.md` still contains placeholder usage (`multiply`) and may not match the current API (`inflate`/`deflate`).
