const WEBGL_FILTER_NEAREST = 0x2600

const WEBGL_FILTER_LINEAR = 0x2601

const WEBGL_TEXTURE_WRAP_REPEAT = 0x2901
const WEBGL_TEXTURE_CLAMP_TO_EDGE = 0x812f
const WEBGL_TEXTURE_MIRRORED_REPEAT = 0x8370

export class UniformSampler {
  private device: GPUDevice
  sampler: GPUSampler

  static parseGLFilterMode(filterMode: GLenum) {
    // if (filterMode === WEBGL_FILTER_NEAREST) {
    //   return 'nearest'
    // }
    // if (filterMode === WEBGL_FILTER_LINEAR) {
    //   return 'linear'
    // }
    // console.log(filterMode)
    // throw new Error(`Can't parse gl filter mode`)
    return 'nearest'
  }

  static parseGLWrapMode(wrapMode: GLenum) {
    // if (wrapMode === WEBGL_TEXTURE_WRAP_REPEAT) {
    //   return 'repeat'
    // }
    // if (wrapMode === WEBGL_TEXTURE_CLAMP_TO_EDGE) {
    //   return 'clamp-to-edge'
    // }
    // if (wrapMode === WEBGL_TEXTURE_MIRRORED_REPEAT) {
    //   return 'mirror-repeat'
    // }
    // throw new Error(`Can't parse gl wrap mode`)
    return 'repeat'
  }

  constructor(device: GPUDevice, samplerOptions) {
    this.device = device

    let {
      addressModeU = 'repeat',
      addressModeV = 'repeat',
      magFilter = 'nearest',
      minFilter = 'nearest',
    } = samplerOptions

    if (typeof addressModeU === 'number') {
      addressModeU = UniformSampler.parseGLWrapMode(addressModeU)
    }
    if (typeof addressModeV === 'number') {
      addressModeV = UniformSampler.parseGLWrapMode(addressModeV)
    }
    if (typeof minFilter === 'number') {
      minFilter = UniformSampler.parseGLFilterMode(minFilter)
    }
    if (typeof magFilter === 'number') {
      magFilter = UniformSampler.parseGLFilterMode(magFilter)
    }

    if (addressModeU)
      this.sampler = device.createSampler({
        addressModeU,
        addressModeV,
        magFilter,
        minFilter,
      })
  }
}
