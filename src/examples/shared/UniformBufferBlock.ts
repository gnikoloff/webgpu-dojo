export class UniformBufferBlock {
  private device: GPUDevice

  public byteLength: number
  public buffer: GPUBuffer

  constructor(device: GPUDevice, byteLength: GPUSize64) {
    this.device = device
    this.byteLength = byteLength

    this.buffer = device.createBuffer({
      size: byteLength,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    })
  }

  write(byteOffset: GPUSize64, data: SharedArrayBuffer | ArrayBuffer) {
    this.device.queue.writeBuffer(this.buffer, byteOffset, data)
  }

  destroy() {
    this.buffer.destroy()
  }
}
