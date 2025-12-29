package com.margelo.nitro.nitrozlib
  
import com.facebook.proguard.annotations.DoNotStrip

@DoNotStrip
class NitroZlib : HybridNitroZlibSpec() {
  override fun multiply(a: Double, b: Double): Double {
    return a * b
  }
}
