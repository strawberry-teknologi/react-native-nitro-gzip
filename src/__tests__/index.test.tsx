import { inflate, deflate, inflateAsync, deflateAsync, Format } from '../index';

// Mock NitroModules since we are in a pure JS test environment
jest.mock('react-native-nitro-modules', () => {
  const mockHybridObject = {
    inflate: jest.fn((data) => data),
    deflate: jest.fn((data) => data),
    inflateAsync: jest.fn((data) => Promise.resolve(data)),
    deflateAsync: jest.fn((data) => Promise.resolve(data)),
  };
  return {
    NitroModules: {
      createHybridObject: jest.fn(() => mockHybridObject),
    },
  };
});

describe('react-native-nitro-zlib', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('exports all functions and Format constants', () => {
    expect(inflate).toBeDefined();
    expect(deflate).toBeDefined();
    expect(inflateAsync).toBeDefined();
    expect(deflateAsync).toBeDefined();
    expect(Format).toBeDefined();
    expect(Format.GZIP).toBe('gzip');
    expect(Format.ZLIB).toBe('zlib');
    expect(Format.RAW).toBe('raw');
    expect(Format.AUTO).toBe('auto');
  });

  describe('inflate', () => {
    it('calls the hybrid object with AUTO format by default', () => {
      const { NitroModules } = require('react-native-nitro-modules');
      const mockHybridObject = NitroModules.createHybridObject();
      
      const buffer = new ArrayBuffer(0);
      inflate(buffer);
      expect(mockHybridObject.inflate).toHaveBeenCalledWith(buffer, 'auto');
    });

    it('calls the hybrid object with specified format', () => {
      const { NitroModules } = require('react-native-nitro-modules');
      const mockHybridObject = NitroModules.createHybridObject();
      
      const buffer = new ArrayBuffer(0);
      inflate(buffer, Format.GZIP);
      expect(mockHybridObject.inflate).toHaveBeenCalledWith(buffer, 'gzip');
    });
  });

  describe('inflateAsync', () => {
    it('calls the hybrid object with AUTO format by default', async () => {
      const { NitroModules } = require('react-native-nitro-modules');
      const mockHybridObject = NitroModules.createHybridObject();
      
      const buffer = new ArrayBuffer(0);
      await inflateAsync(buffer);
      expect(mockHybridObject.inflateAsync).toHaveBeenCalledWith(buffer, 'auto');
    });

    it('calls the hybrid object with specified format', async () => {
      const { NitroModules } = require('react-native-nitro-modules');
      const mockHybridObject = NitroModules.createHybridObject();
      
      const buffer = new ArrayBuffer(0);
      await inflateAsync(buffer, Format.ZLIB);
      expect(mockHybridObject.inflateAsync).toHaveBeenCalledWith(buffer, 'zlib');
    });
  });

  describe('deflate', () => {
    it('calls the hybrid object with GZIP format and level 9 by default', () => {
      const { NitroModules } = require('react-native-nitro-modules');
      const mockHybridObject = NitroModules.createHybridObject();
      
      const buffer = new ArrayBuffer(0);
      deflate(buffer);
      expect(mockHybridObject.deflate).toHaveBeenCalledWith(buffer, 'gzip', 9);
    });

    it('calls the hybrid object with specified format and level', () => {
      const { NitroModules } = require('react-native-nitro-modules');
      const mockHybridObject = NitroModules.createHybridObject();
      
      const buffer = new ArrayBuffer(0);
      deflate(buffer, Format.RAW, 6);
      expect(mockHybridObject.deflate).toHaveBeenCalledWith(buffer, 'raw', 6);
    });

    it('calls the hybrid object with custom compression level', () => {
      const { NitroModules } = require('react-native-nitro-modules');
      const mockHybridObject = NitroModules.createHybridObject();
      
      const buffer = new ArrayBuffer(0);
      deflate(buffer, Format.GZIP, 1);
      expect(mockHybridObject.deflate).toHaveBeenCalledWith(buffer, 'gzip', 1);
    });
  });

  describe('deflateAsync', () => {
    it('calls the hybrid object with GZIP format and level 9 by default', async () => {
      const { NitroModules } = require('react-native-nitro-modules');
      const mockHybridObject = NitroModules.createHybridObject();

      const buffer = new ArrayBuffer(0);
      await deflateAsync(buffer);
      expect(mockHybridObject.deflateAsync).toHaveBeenCalledWith(buffer, 'gzip', 9);
    });

    it('calls the hybrid object with specified format and level', async () => {
      const { NitroModules } = require('react-native-nitro-modules');
      const mockHybridObject = NitroModules.createHybridObject();

      const buffer = new ArrayBuffer(0);
      await deflateAsync(buffer, Format.ZLIB, 3);
      expect(mockHybridObject.deflateAsync).toHaveBeenCalledWith(buffer, 'zlib', 3);
    });
  });

  describe('Format options', () => {
    it('supports all format types', () => {
      const { NitroModules } = require('react-native-nitro-modules');
      const mockHybridObject = NitroModules.createHybridObject();
      const buffer = new ArrayBuffer(0);

      // Test all formats
      deflate(buffer, Format.RAW, 9);
      expect(mockHybridObject.deflate).toHaveBeenCalledWith(buffer, 'raw', 9);

      deflate(buffer, Format.ZLIB, 9);
      expect(mockHybridObject.deflate).toHaveBeenCalledWith(buffer, 'zlib', 9);

      deflate(buffer, Format.GZIP, 9);
      expect(mockHybridObject.deflate).toHaveBeenCalledWith(buffer, 'gzip', 9);
    });

    it('supports all compression levels', () => {
      const { NitroModules } = require('react-native-nitro-modules');
      const mockHybridObject = NitroModules.createHybridObject();
      const buffer = new ArrayBuffer(0);

      // Test different compression levels
      for (let level = 1; level <= 9; level++) {
        deflate(buffer, Format.GZIP, level);
        expect(mockHybridObject.deflate).toHaveBeenCalledWith(buffer, 'gzip', level);
      }
    });
  });
});
