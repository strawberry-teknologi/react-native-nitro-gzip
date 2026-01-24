import { NitroModules } from "react-native-nitro-modules";
import type { NitroZlib } from "./NitroZlib.nitro";

const NitroZlibHybridObject =
  NitroModules.createHybridObject<NitroZlib>("NitroZlib");

export function inflate(data: ArrayBuffer): ArrayBuffer {
  return NitroZlibHybridObject.inflate(data);
}

export function inflateAsync(data: ArrayBuffer): Promise<ArrayBuffer> {
  return NitroZlibHybridObject.inflateAsync(data);
}

export function deflate(data: ArrayBuffer): ArrayBuffer {
  return NitroZlibHybridObject.deflate(data);
}

export function deflateAsync(data: ArrayBuffer): Promise<ArrayBuffer> {
  return NitroZlibHybridObject.deflateAsync(data);
}
