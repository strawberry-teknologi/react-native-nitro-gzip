#pragma once
#include "HybridNitroZlibSpec.hpp"
#include <NitroModules/Promise.hpp>

namespace margelo::nitro::nitrozlib
{
    class NitroZlib : public HybridNitroZlibSpec
    {
    public:
        NitroZlib() : HybridObject(TAG) {}

    public:
        std::shared_ptr<ArrayBuffer> inflate(const std::shared_ptr<ArrayBuffer> &data, ZlibFormat format) override;
        std::shared_ptr<Promise<std::shared_ptr<ArrayBuffer>>> inflateAsync(const std::shared_ptr<ArrayBuffer> &data, ZlibFormat format) override;
        std::shared_ptr<ArrayBuffer> deflate(const std::shared_ptr<ArrayBuffer> &data, ZlibFormat format, double level) override;
        std::shared_ptr<Promise<std::shared_ptr<ArrayBuffer>>> deflateAsync(const std::shared_ptr<ArrayBuffer> &data, ZlibFormat format, double level) override;

    private:
        static int getWindowBits(ZlibFormat format, bool forDeflate);
    };
};