# @strawberrytech/react-native-nitro-zlib

Gzip-compatible `deflate` and `inflate` for React Native using the native `zlib` library via [Nitro Modules](https://nitro.margelo.com/).

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

`deflate()`/`deflateAsync()` compresses an `ArrayBuffer` into a GZIP-wrapped stream.
`inflate()`/`inflateAsync()` decompresses a GZIP-wrapped stream back into the original bytes.

### Synchronous Usage

```ts
import { deflate, inflate } from 'react-native-nitro-zlib';

// ... (setup codec)
const input = codec.encode('Hello sync').buffer;
const compressed = deflate(input);
const output = inflate(compressed);
```

### Asynchronous Usage (Recommended for large data)

The async versions run on a background thread pool, keeping the JS thread responsive.

```ts
import { deflateAsync, inflateAsync } from 'react-native-nitro-zlib';

const input = codec.encode('Hello async').buffer;
const compressed = await deflateAsync(input);
const output = await inflateAsync(compressed);
```

## API

```ts
export function deflate(data: ArrayBuffer): ArrayBuffer;
export function inflate(data: ArrayBuffer): ArrayBuffer;

export function deflateAsync(data: ArrayBuffer): Promise<ArrayBuffer>;
export function inflateAsync(data: ArrayBuffer): Promise<ArrayBuffer>;
```

## Notes

- This module uses zlib windowBits `31`, so the produced/consumed format is GZIP (not raw deflate, not zlib-wrapped).
- **Thread Safety**: When calling `*Async` methods, the `ArrayBuffer` is copied if it is not already an owning buffer to ensure it remains valid on the background thread.
- For an end-to-end example, see `example/src/App.tsx`.

## Contributing

- Development workflow: `CONTRIBUTING.md`
- Code of conduct: `CODE_OF_CONDUCT.md`

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
