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

`deflate()` compresses an `ArrayBuffer` into a GZIP-wrapped stream.
`inflate()` decompresses a GZIP-wrapped stream back into the original bytes.

```ts
import { deflate, inflate } from '@strawberrytech/react-native-nitro-zlib';

// React Native doesn't always ship TextEncoder/TextDecoder. A common option is:
//   yarn add react-native-fast-encoder
import FastTextCodec from 'react-native-fast-encoder';

const codec = new FastTextCodec();
const input = codec.encode('Hello from Nitro + zlib').buffer;

const compressed = deflate(input);
const output = inflate(compressed);

const text = codec.decode(new Uint8Array(output));
```

## API

```ts
export function deflate(data: ArrayBuffer): ArrayBuffer;
export function inflate(data: ArrayBuffer): ArrayBuffer;
```

## Notes

- This module uses zlib windowBits `31`, so the produced/consumed format is GZIP (not raw deflate, not zlib-wrapped).
- For an end-to-end example, see `example/src/App.tsx`.

## Contributing

- Development workflow: `CONTRIBUTING.md`
- Code of conduct: `CODE_OF_CONDUCT.md`

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
