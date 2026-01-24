import { inflate, deflate, inflateAsync, deflateAsync } from '../index';

// Mock NitroModules since we are in a pure JS test environment
jest.mock('react-native-nitro-modules', () => {
  const mockHybridObject = {
    inflate: jest.fn(),
    deflate: jest.fn(),
    inflateAsync: jest.fn(),
    deflateAsync: jest.fn(),
  };
  return {
    NitroModules: {
      createHybridObject: jest.fn(() => mockHybridObject),
    },
  };
});

describe('react-native-nitro-zlib', () => {
  it('exports all functions', () => {
    expect(inflate).toBeDefined();
    expect(deflate).toBeDefined();
    expect(inflateAsync).toBeDefined();
    expect(deflateAsync).toBeDefined();
  });

  it('calls the hybrid object for inflateAsync', async () => {
    const { NitroModules } = require('react-native-nitro-modules');
    const mockHybridObject = NitroModules.createHybridObject();
    
    const buffer = new ArrayBuffer(0);
    await inflateAsync(buffer);
    expect(mockHybridObject.inflateAsync).toHaveBeenCalledWith(buffer);
  });

  it('calls the hybrid object for deflateAsync', async () => {
    const { NitroModules } = require('react-native-nitro-modules');
    const mockHybridObject = NitroModules.createHybridObject();

    const buffer = new ArrayBuffer(0);
    await deflateAsync(buffer);
    expect(mockHybridObject.deflateAsync).toHaveBeenCalledWith(buffer);
  });
});
