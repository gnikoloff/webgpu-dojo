export class VertexBuffer {
  private device: GPUDevice
  private bindPointIdx: number

  typedArray: Float32Array
  arrayStride: GPUSize64
  format: GPUVertexFormat
  stepMode: GPUVertexStepMode
  buffer: GPUBuffer

  constructor(
    device: GPUDevice,
    bindPointIdx: number,
    typedArray: Float32Array,
    arrayStride: GPUSize64 = 4 * Float32Array.BYTES_PER_ELEMENT,
    format: GPUVertexFormat = 'float32x4',
    stepMode: GPUVertexStepMode = 'vertex',
  ) {
    this.device = device
    this.bindPointIdx = bindPointIdx
    this.stepMode = stepMode
    this.typedArray = typedArray
    this.arrayStride = arrayStride
    this.format = format

    this.buffer = device.createBuffer({
      size: typedArray.byteLength,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
      mappedAtCreation: true,
    })
    new Float32Array(this.buffer.getMappedRange()).set(typedArray)
    this.buffer.unmap()
  }

  setActive(renderPass: GPURenderPassEncoder): this {
    renderPass.setVertexBuffer(this.bindPointIdx, this.buffer)
    return this
  }

  // write(data: SharedArrayBuffer | ArrayBuffer): this {
  //   this.device.queue.writeBuffer(this.buffer, 0, data)
  //   return this
  // }

  destroy(): void {
    this.buffer.destroy()
  }
}
