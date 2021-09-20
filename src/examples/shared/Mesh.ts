import { TypedArray } from '@loaders.gl/loader-utils/src/types'
import {
  SceneObject,
  OrthographicCamera,
  PerspectiveCamera,
} from '../../lib/hwoa-rang-gl'

import { PRIMITIVE_TOPOLOGY_TRIANGLE_LIST } from './constants'

import { Geometry } from './Geometry'
import { gpuPipelineFactory } from './gpu-pipeline-factory'
import { Shader } from './Shader'
import { UniformBindGroup } from './UniformBindGroup'

export class Mesh extends SceneObject {
  private device: GPUDevice

  geometry: Geometry
  pipeline: GPURenderPipeline
  uniforms: { [name: string]: Uniform }
  uboBindGroup: UniformBindGroup

  static getUBOByteLength(uniforms: Uniform[]) {
    return Object.values(uniforms).reduce((acc: number, { type }) => {
      switch (type as string) {
        case 'mat4x4<f32>':
          acc += 16 * Float32Array.BYTES_PER_ELEMENT
        case 'mat3x3<f32>':
          acc += 12 * Float32Array.BYTES_PER_ELEMENT
        case 'vec4<f32>':
          acc += 4 * Float32Array.BYTES_PER_ELEMENT
        case 'vec3<f32>':
          acc += 3 * Float32Array.BYTES_PER_ELEMENT
        case 'vec2<f32>':
          acc += 2 * Float32Array.BYTES_PER_ELEMENT
        case '<f32>':
          acc += Float32Array.BYTES_PER_ELEMENT
      }
      return acc
    }, 0)
  }

  constructor(device: GPUDevice, props: MeshProps) {
    super()

    const {
      geometry,
      uniforms = {},
      textures = [],
      vertexShaderSource,
      fragmentShaderSource,
      presentationFormat = 'bgra8unorm',
      primitiveType = PRIMITIVE_TOPOLOGY_TRIANGLE_LIST,
    } = props

    geometry.primitiveType = primitiveType

    this.device = device
    this.geometry = geometry
    this.uniforms = uniforms

    const vertexShader = new Shader(device as GPUDevice, vertexShaderSource)
    const fragmentShader = new Shader(device as GPUDevice, fragmentShaderSource)

    this.uboBindGroup = new UniformBindGroup(device, 0)
    // First bind group with dedicated first binding containing required uniforms:

    // 1. camera projection matrix
    // 2. camera view matrix
    // 3. model world matrix
    // 4. model normal matrix
    this.uboBindGroup.addUBO(0, 16 * 4 * Float32Array.BYTES_PER_ELEMENT)

    const uboIndividualPropsByteLength = Mesh.getUBOByteLength(
      Object.values(uniforms),
    )
    if (uboIndividualPropsByteLength) {
      // Second binding with optional uniforms
      this.uboBindGroup.addUBO(1, uboIndividualPropsByteLength)
    }
    // Pass initial uniform values to second binding on GPU
    Object.values(this.uniforms)
      .filter(({ value }) => value)
      .forEach(({ value }) => {
        this.uboBindGroup.writeToUBO(1, 0, value)
      })

    this.pipeline = gpuPipelineFactory(device, {
      vertex: {
        module: vertexShader.shaderModule,
        entryPoint: Shader.entryFunction,
        buffers: geometry.getVertexBuffersLayout(),
      },
      fragment: {
        module: fragmentShader.shaderModule,
        entryPoint: Shader.entryFunction,
        targets: [
          {
            format: presentationFormat,
          },
        ],
      },
      primitive: {
        topology: primitiveType,
        stripIndexFormat: geometry.stripIndexFormat,
      },
      depthStencil: {
        format: 'depth24plus',
        depthWriteEnabled: true,
        depthCompare: 'less',
      },
    })

    textures.map(({ imageBitmap }, i) => {
      this.uboBindGroup.addSampler(2 + i)
      this.uboBindGroup.addTexture(2 + i + 1, imageBitmap)
    })

    this.uboBindGroup.init(this.pipeline)
  }

  render(
    renderPass: GPURenderPassEncoder,
    camera: PerspectiveCamera | OrthographicCamera,
    updateCameraMatrix = false,
  ) {
    if (this.shouldUpdate) {
      // this.updateModelMatrix()
      this.updateWorldMatrix(this.parentNode?.worldMatrix || null)

      this.uboBindGroup
        .writeToUBO(
          0,
          16 * 2 * Float32Array.BYTES_PER_ELEMENT,
          this.worldMatrix as ArrayBuffer,
        )
        .writeToUBO(
          0,
          16 * 3 * Float32Array.BYTES_PER_ELEMENT,
          this.normalMatrix as ArrayBuffer,
        )
      this.shouldUpdate = false
      console.log('updated matrix')
    }

    this.uboBindGroup
      .writeToUBO(0, 0, camera.projectionMatrix as ArrayBuffer)
      .writeToUBO(
        0,
        16 * Float32Array.BYTES_PER_ELEMENT,
        camera.viewMatrix as ArrayBuffer,
      )

    this.uboBindGroup.setActive(renderPass)

    renderPass.setPipeline(this.pipeline)
    this.geometry.draw(renderPass)
  }
}

interface MeshProps {
  geometry: Geometry
  uniforms?: { [name: string]: Uniform }
  textures?: [{ sampler: {}; imageBitmap: ImageBitmap }]
  vertexShaderSource: string
  fragmentShaderSource: string
  /**
   * @default 'bgra8unorm'
   */
  presentationFormat?: GPUTextureFormat
  /**
   * @default 'triangle-list'
   */
  primitiveType?: GPUPrimitiveTopology
}

export interface Uniform {
  type: GPUVertexFormat
  value: TypedArray
}
