#include "NitroZlib.hpp"
#include "NitroModules/ArrayBuffer.hpp"
#include <cstring>
#include <memory>
#include <stdexcept>
#include <vector>
#include <zlib.h>

namespace margelo::nitro::nitrozlib {

// Helper to calculate a reasonable initial buffer size
// For deflate, zlib documentation suggests source + 0.1% + 12 bytes
static size_t getEstimateDeflateSize(size_t sourceLen) {
  return sourceLen + (sourceLen >> 3) + (sourceLen >> 7) + 12;
}

// Helper to map ZlibFormat enum to zlib window bits
int NitroZlib::getWindowBits(ZlibFormat format, bool forDeflate) {
  switch (format) {
    case ZlibFormat::RAW:
      return -15;  // Raw deflate, no header/trailer
    case ZlibFormat::ZLIB:
      return 15;   // Zlib wrapper (2-byte header + Adler-32)
    case ZlibFormat::GZIP:
      return 31;   // GZIP wrapper (15 + 16)
    case ZlibFormat::AUTO:
      if (forDeflate) {
        // AUTO not valid for deflate, fall back to GZIP
        return 31;
      }
      return 47;   // Auto-detect zlib/gzip (15 + 32)
    default:
      return 31;   // Default to GZIP
  }
}

std::shared_ptr<ArrayBuffer>
NitroZlib::inflate(const std::shared_ptr<ArrayBuffer> &data, ZlibFormat format) {
  auto source = data->data();
  auto sourceLen = data->size();

  z_stream zs;
  memset(&zs, 0, sizeof(zs));

  int windowBits = getWindowBits(format, false);
  if (inflateInit2(&zs, windowBits) != Z_OK) {
    throw std::runtime_error("Failed to initialize zlib inflate");
  }

  zs.next_in = reinterpret_cast<Bytef *>(source);
  zs.avail_in = static_cast<uInt>(sourceLen);

  // Estimate output size.
  // We don't know the size, so we start with a guess.
  size_t guessSize = sourceLen < 1024 ? 1024 : sourceLen * 4;
  std::vector<uint8_t> outBuffer(guessSize);

  zs.next_out = reinterpret_cast<Bytef *>(outBuffer.data());
  zs.avail_out = static_cast<uInt>(outBuffer.size());

  int ret;
  do {
    ret = ::inflate(&zs, Z_NO_FLUSH);

    if (ret == Z_STREAM_END)
      break;

    if (ret == Z_OK) {
      if (zs.avail_out == 0) {
        size_t oldSize = outBuffer.size();
        size_t newSize = oldSize * 2;
        outBuffer.resize(newSize);

        zs.next_out = reinterpret_cast<Bytef *>(outBuffer.data() + oldSize);
        zs.avail_out = static_cast<uInt>(newSize - oldSize);
      }
    } else {
      inflateEnd(&zs);
      throw std::runtime_error("Zlib inflate failed");
    }
  } while (ret == Z_OK);

  size_t finalSize = zs.total_out;
  inflateEnd(&zs);

  if (ret != Z_STREAM_END) {
    throw std::runtime_error(
        "Zlib inflate failed (corrupted data or wrong format)");
  }

  auto resultBuffer = ArrayBuffer::copy(outBuffer.data(), finalSize);

  return resultBuffer;
}

std::shared_ptr<Promise<std::shared_ptr<ArrayBuffer>>>
NitroZlib::inflateAsync(const std::shared_ptr<ArrayBuffer> &data, ZlibFormat format) {
  // If the data is not owned by us, we must copy it before going to a
  // background thread.
  auto safeData = data->isOwner() ? data : ArrayBuffer::copy(data);

  return Promise<std::shared_ptr<ArrayBuffer>>::async(
      [this, safeData, format]() { return this->inflate(safeData, format); });
}

std::shared_ptr<ArrayBuffer>
NitroZlib::deflate(const std::shared_ptr<ArrayBuffer> &data, ZlibFormat format, double level) {
  auto source = data->data();
  auto sourceLen = data->size();

  z_stream zs;
  memset(&zs, 0, sizeof(zs));
  
  int windowBits = getWindowBits(format, true);
  int compressionLevel = static_cast<int>(level);
  
  // Clamp level to valid range [1-9]
  if (compressionLevel < 1) compressionLevel = 1;
  if (compressionLevel > 9) compressionLevel = 9;
  
  if (deflateInit2(&zs, compressionLevel, Z_DEFLATED, windowBits, 8,
                   Z_DEFAULT_STRATEGY) != Z_OK) {
    throw std::runtime_error("Failed to initialize zlib deflate");
  }

  zs.next_in = reinterpret_cast<Bytef *>(source);
  zs.avail_in = static_cast<uInt>(sourceLen);

  // Initial estimate for output
  size_t outCapacity = getEstimateDeflateSize(sourceLen);
  std::vector<uint8_t> outBuffer(outCapacity);

  zs.next_out = reinterpret_cast<Bytef *>(outBuffer.data());
  zs.avail_out = static_cast<uInt>(outBuffer.size());

  int ret = ::deflate(&zs, Z_FINISH);

  // If output buffer wasn't big enough (rare for deflate with estimate), loop
  // and grow
  while (ret == Z_OK) {
    size_t oldSize = outBuffer.size();
    outBuffer.resize(oldSize * 2);
    zs.next_out = reinterpret_cast<Bytef *>(outBuffer.data() + oldSize);
    zs.avail_out = static_cast<uInt>(oldSize);
    ret = ::deflate(&zs, Z_FINISH);
  }

  if (ret != Z_STREAM_END) {
    deflateEnd(&zs);
    throw std::runtime_error("Zlib deflate failed");
  }

  size_t finalSize = zs.total_out;
  deflateEnd(&zs);

  auto resultBuffer = ArrayBuffer::copy(outBuffer.data(), finalSize);

  return resultBuffer;
}

std::shared_ptr<Promise<std::shared_ptr<ArrayBuffer>>>
NitroZlib::deflateAsync(const std::shared_ptr<ArrayBuffer> &data, ZlibFormat format, double level) {
  // If the data is not owned by us, we must copy it before going to a
  // background thread.
  auto safeData = data->isOwner() ? data : ArrayBuffer::copy(data);

  return Promise<std::shared_ptr<ArrayBuffer>>::async(
      [this, safeData, format, level]() { return this->deflate(safeData, format, level); });
}

} // namespace margelo::nitro::nitrozlib
