export class IndexBuffer {
  device: GPUDevice
  buffer: GPUBuffer
  length: number
  typedArray: Uint16Array | Uint32Array

  get isInt16() {
    return this.typedArray instanceof Uint16Array
  }

  constructor(device: GPUDevice, typedArray: Uint16Array | Uint32Array) {
    this.device = device
    this.length = typedArray.length
    this.typedArray = typedArray

    this.buffer = device.createBuffer({
      size: Math.ceil(typedArray.byteLength / 8) * 8,
      usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
      mappedAtCreation: true,
    })

    if (this.isInt16) {
      new Uint16Array(this.buffer.getMappedRange()).set(typedArray)
    } else {
      new Uint32Array(this.buffer.getMappedRange()).set(typedArray)
    }
    this.buffer.unmap()
  }

  setActive(renderPass: GPURenderPassEncoder): this {
    renderPass.setIndexBuffer(this.buffer, this.isInt16 ? 'uint16' : 'uint32')
    return this
  }

  destroy(): void {
    this.buffer.destroy()
  }
}
