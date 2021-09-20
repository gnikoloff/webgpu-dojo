import { IndexBuffer } from './IndexBuffer'
import { VertexBuffer } from './VertexBuffer'

import {
  ATTRIB_NAME_POSITION,
  PRIMITIVE_TOPOLOGY_LINE_STRIP,
  PRIMITIVE_TOPOLOGY_TRIANGLE_STRIP,
} from './constants'

export class Geometry {
  private device: GPUDevice
  primitiveType: GPUPrimitiveTopology

  indexBuffer: IndexBuffer
  attributes = new Map()
  vertexCount = 0

  constructor(device: GPUDevice) {
    this.device = device
  }

  get hasIndex(): boolean {
    return !!this.indexBuffer
  }

  get stripIndexFormat(): GPUIndexFormat | undefined {
    let stripIndexFormat = undefined
    if (
      this.primitiveType === PRIMITIVE_TOPOLOGY_LINE_STRIP ||
      this.primitiveType === PRIMITIVE_TOPOLOGY_TRIANGLE_STRIP
    ) {
      stripIndexFormat = this.indexBuffer.isInt16 ? 'uint16' : 'uint32'
    }
    return stripIndexFormat
  }

  addIndex(typedArray): this {
    this.vertexCount = typedArray.length
    this.indexBuffer = new IndexBuffer(this.device, typedArray)
    return this
  }

  addAttribute(
    key: String,
    typedArray,
    arrayStride: GPUSize64 = 4 * Float32Array.BYTES_PER_ELEMENT,
    format: GPUVertexFormat = 'float32x4',
  ): this {
    if (key === ATTRIB_NAME_POSITION && !this.vertexCount) {
      this.vertexCount = typedArray.length / arrayStride
    }
    const buffer = new VertexBuffer(
      this.device,
      this.attributes.size,
      typedArray,
      arrayStride,
      format,
    )
    this.attributes.set(key, buffer)
    return this
  }

  getVertexBuffers() {
    return [...this.attributes.entries()]
  }

  getVertexBuffersLayout() {
    const buffers = []
    for (const attrib of this.attributes.values()) {
      buffers.push({
        arrayStride: attrib.arrayStride,
        attributes: [
          {
            offset: 0,
            shaderLocation: attrib.bindPointIdx,
            format: attrib.format,
          },
        ],
      })
    }
    return buffers
  }

  draw(renderPass: GPURenderPassEncoder) {
    for (const [key, attrib] of this.attributes.entries()) {
      attrib.setActive(renderPass)
    }
    if (this.indexBuffer) {
      this.indexBuffer.setActive(renderPass)
      renderPass.drawIndexed(this.vertexCount)
    } else {
      renderPass.draw(this.vertexCount)
    }
  }

  destroy(): void {
    this.attributes.forEach((buffer) => {
      buffer.destroy()
    })
  }
}
