import type { HybridObject } from "react-native-nitro-modules";

export interface NitroZlib
  extends HybridObject<{ ios: "c++"; android: "c++" }> {
  inflate(data: ArrayBuffer): ArrayBuffer;
  deflate(data: ArrayBuffer): ArrayBuffer;
}
