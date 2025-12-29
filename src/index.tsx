import { NitroModules } from 'react-native-nitro-modules';
import type { NitroZlib } from './NitroZlib.nitro';

const NitroZlibHybridObject =
  NitroModules.createHybridObject<NitroZlib>('NitroZlib');

export function multiply(a: number, b: number): number {
  return NitroZlibHybridObject.multiply(a, b);
}
