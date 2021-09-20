export class UniformTexture {
  private device: GPUDevice

  texture: GPUTexture
  width: number
  height: number

  constructor(device: GPUDevice, width: number, height: number) {
    this.device = device

    this.width = width
    this.height = height
    this.texture = device.createTexture({
      size: [width, height, 1],
      format: 'rgba8unorm',
      usage:
        GPUTextureUsage.TEXTURE_BINDING |
        GPUTextureUsage.COPY_DST |
        GPUTextureUsage.RENDER_ATTACHMENT,
    })
  }

  copyFromExternalImage(imageBitmap: ImageBitmap): this {
    this.device.queue.copyExternalImageToTexture(
      { source: imageBitmap },
      { texture: this.texture },
      [imageBitmap.width, imageBitmap.height],
    )
    return this
  }

  createView(): GPUTextureView {
    return this.texture.createView()
  }
}
