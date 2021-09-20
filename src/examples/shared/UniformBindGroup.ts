import { UniformBufferBlock } from './UniformBufferBlock'
import { UniformSampler } from './UniformSampler'
import { UniformTexture } from './UniformTexture'

export class UniformBindGroup {
  private device: GPUDevice
  private bindGroup: GPUBindGroup

  bindingIndex: number

  samplers: Map<number, UniformSampler> = new Map()
  textures: Map<number, UniformTexture> = new Map()
  uniformBlocks: Map<number, UniformBufferBlock> = new Map()

  constructor(device: GPUDevice, bindingIndex = 0) {
    this.device = device
    this.bindingIndex = bindingIndex
  }

  setActive(renderPass: GPURenderPassEncoder): this {
    renderPass.setBindGroup(this.bindingIndex, this.bindGroup)
    return this
  }

  addUBO(uboIdx: number, byteLength): this {
    const uniformBlock = new UniformBufferBlock(this.device, byteLength)
    this.uniformBlocks.set(uboIdx, uniformBlock)
    return this
  }

  writeToUBO(uboIdx: number, byteOffset, data): this {
    const ubo = this.uniformBlocks.get(uboIdx)
    if (!ubo) {
      // ...
    }
    ubo.write(byteOffset, data)
    return this
  }

  addSampler(samplerIdx: number, samplerOptions = {}): this {
    const sampler = new UniformSampler(this.device, samplerOptions)
    this.samplers.set(samplerIdx, sampler)
    return this
  }

  addTexture(textureIdx: number, imageBitmap: ImageBitmap): this {
    const texture = new UniformTexture(
      this.device,
      imageBitmap.width,
      imageBitmap.height,
    ).copyFromExternalImage(imageBitmap)
    this.textures.set(textureIdx, texture)
    return this
  }

  init(pipeline: GPURenderPipeline): this {
    const ubos = this.uniformBlocks.entries()
    const entries = []
    for (const [idx, { buffer, byteLength }] of ubos) {
      entries.push({
        binding: idx,
        resource: {
          buffer: buffer,
          offset: 0,
          size: byteLength,
        },
      })
    }

    const samplers = this.samplers.entries()
    for (const [idx, { sampler }] of samplers) {
      entries.push({
        binding: idx,
        resource: sampler,
      })
    }

    const textures = this.textures.entries()
    for (const [idx, { texture }] of textures) {
      entries.push({
        binding: idx,
        resource: texture.createView(),
      })
    }

    // debugger
    this.bindGroup = this.device.createBindGroup({
      layout: pipeline.getBindGroupLayout(this.bindingIndex),
      entries: entries,
    })
    return this
  }

  destroy(): void {
    this.uniformBlocks.forEach((ubo) => ubo.destroy())
  }
}
