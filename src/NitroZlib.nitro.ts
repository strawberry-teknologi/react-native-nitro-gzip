import type { HybridObject } from "react-native-nitro-modules";

export interface NitroZlib
  extends HybridObject<{ ios: "c++"; android: "c++" }> {
  inflate(data: ArrayBuffer): ArrayBuffer;
  inflateAsync(data: ArrayBuffer): Promise<ArrayBuffer>;
  deflate(data: ArrayBuffer): ArrayBuffer;
  deflateAsync(data: ArrayBuffer): Promise<ArrayBuffer>;
}
