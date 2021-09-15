import {
  PerspectiveCamera,
  GeometryUtils,
  CameraController,
} from '../../lib/hwoa-rang-gl'

import { Node } from '../../shared/node'

import VERTEX_SHADER from './shader.vert.wglsl'
import FRAGMENT_SHADER from './shader.frag.wglsl'

import '../index.css'

const SAMPLE_COUNT = 4

class RenderNode extends Node {
  device: GPUDevice = null
  indexBuffer: GPUBuffer = null
  indices: Uint16Array | Uint32Array = null

  transformUniformBuffer: GPUBuffer = null
  transformUniformBindGroup: GPUBindGroup = null

  materialUniformBuffer: GPUBuffer = null
  materialUniformBindGroup: GPUBindGroup = null

  geoBuffers: Array<GPUBuffer> = []

  constructor(device, pipeline, geometry) {
    super()
    this.device = device

    const { vertices, uv, normal, indices } = geometry

    const vertexBuffer = device.createBuffer({
      size: vertices.byteLength,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
      mappedAtCreation: true,
    })
    new Float32Array(vertexBuffer.getMappedRange()).set(vertices)
    vertexBuffer.unmap()

    const normalBuffer = device.createBuffer({
      size: normal.byteLength,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
      mappedAtCreation: true,
    })
    new Float32Array(normalBuffer.getMappedRange()).set(normal)
    normalBuffer.unmap()

    const uvBuffer = device.createBuffer({
      size: uv.byteLength,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
      mappedAtCreation: true,
    })
    new Float32Array(uvBuffer.getMappedRange()).set(uv)
    uvBuffer.unmap()

    const indexBuffer = device.createBuffer({
      size: indices.byteLength,
      usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
      mappedAtCreation: true,
    })
    if (indices instanceof Uint16Array) {
      new Uint16Array(indexBuffer.getMappedRange()).set(indices)
    } else {
      new Uint32Array(indexBuffer.getMappedRange()).set(indices)
    }

    indexBuffer.unmap()

    this.geoBuffers = [vertexBuffer, normalBuffer, uvBuffer]
    this.indexBuffer = indexBuffer
    this.indices = indices

    this.transformUniformBuffer = device.createBuffer({
      size: 16 * Float32Array.BYTES_PER_ELEMENT,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    })

    this.transformUniformBindGroup = device.createBindGroup({
      layout: pipeline.getBindGroupLayout(1),
      entries: [
        {
          binding: 0,
          resource: {
            buffer: this.transformUniformBuffer,
          },
        },
      ],
    })

    this.materialUniformBuffer = device.createBuffer({
      size: 3 * Float32Array.BYTES_PER_ELEMENT,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    })

    const r = Math.random() * 0.35 + 0.65
    const g = Math.random() * 0.35 + 0.65
    const b = Math.random() * 0.35 + 0.65

    device.queue.writeBuffer(
      this.materialUniformBuffer,
      0,
      new Float32Array([r, g, b]),
    )

    this.materialUniformBindGroup = device.createBindGroup({
      layout: pipeline.getBindGroupLayout(2),
      entries: [
        {
          binding: 0,
          resource: {
            buffer: this.materialUniformBuffer,
          },
        },
      ],
    })
  }

  render = (renderPass) => {
    this.geoBuffers.forEach((buffer, i) => {
      renderPass.setVertexBuffer(i, buffer)
    })
    renderPass.setIndexBuffer(
      this.indexBuffer,
      this.indices instanceof Uint16Array ? 'uint16' : 'uint32',
    )
    this.device.queue.writeBuffer(
      this.transformUniformBuffer,
      0,
      this.worldMatrix as ArrayBuffer,
    )
    renderPass.setBindGroup(1, this.transformUniformBindGroup)
    renderPass.setBindGroup(2, this.materialUniformBindGroup)

    renderPass.drawIndexed(this.indices.length)
  }
}

;(async () => {
  const canvas = document.getElementById('gpu-c') as HTMLCanvasElement
  canvas.width = innerWidth * devicePixelRatio
  canvas.height = innerHeight * devicePixelRatio
  canvas.style.setProperty('width', `${innerWidth}px`)
  canvas.style.setProperty('height', `${innerHeight}px`)

  const adapter = await navigator.gpu?.requestAdapter()
  const device = await adapter?.requestDevice()
  const context = canvas.getContext('webgpu')

  const presentationFormat = context.getPreferredFormat(adapter)

  const primitiveType = 'triangle-list'

  context.configure({
    device,
    format: presentationFormat,
  })

  const pipeline = device.createRenderPipeline({
    vertex: {
      module: device.createShaderModule({
        code: VERTEX_SHADER,
      }),
      entryPoint: 'main',
      buffers: [
        {
          arrayStride: 3 * Float32Array.BYTES_PER_ELEMENT,
          attributes: [
            {
              shaderLocation: 0,
              format: 'float32x3',
              offset: 0,
            },
          ],
        },
        {
          arrayStride: 3 * Float32Array.BYTES_PER_ELEMENT,
          attributes: [
            {
              shaderLocation: 1,
              format: 'float32x3',
              offset: 0,
            },
          ],
        },
        {
          arrayStride: 2 * Float32Array.BYTES_PER_ELEMENT,
          attributes: [
            {
              shaderLocation: 2,
              format: 'float32x2',
              offset: 0,
            },
          ],
        },
      ],
    },
    fragment: {
      module: device.createShaderModule({
        code: FRAGMENT_SHADER,
      }),
      entryPoint: 'main',
      targets: [
        {
          format: presentationFormat,
        },
      ],
    },
    primitive: {
      topology: primitiveType,
      stripIndexFormat: undefined,
      // cullMode: 'back',
    },
    multisample: {
      count: SAMPLE_COUNT,
    },
    depthStencil: {
      format: 'depth24plus',
      depthWriteEnabled: true,
      depthCompare: 'less',
    },
  })

  const sphereGeometry = GeometryUtils.createSphere({ radius: 1 })

  const sunNodeOrbit = new Node()
  const sunNode = new RenderNode(device, pipeline, sphereGeometry)
  sunNode.setParent(sunNodeOrbit)

  const earthOrbitNode = new Node()
  earthOrbitNode.setParent(sunNodeOrbit)

  const earthNode = new RenderNode(device, pipeline, sphereGeometry)
  earthNode.setParent(earthOrbitNode)

  const moonOrbitNode = new Node()
  moonOrbitNode.setParent(earthOrbitNode)

  const moonNode = new RenderNode(device, pipeline, sphereGeometry)
  moonNode.setParent(moonOrbitNode)

  const moonSatelliteOrbitNode = new Node()
  moonSatelliteOrbitNode.setParent(moonOrbitNode)

  const moonSatelliteNode = new RenderNode(device, pipeline, sphereGeometry)
  moonSatelliteNode.setParent(moonSatelliteOrbitNode)

  const satellite0OrbitNode = new Node()
  satellite0OrbitNode.setParent(sunNodeOrbit)
  const satellite0Node = new RenderNode(device, pipeline, sphereGeometry)
  satellite0Node.setParent(satellite0OrbitNode)

  const satellite1OrbitNode = new Node()
  satellite1OrbitNode.setParent(satellite0OrbitNode)
  const satellite1Node = new RenderNode(device, pipeline, sphereGeometry)
  satellite1Node.setParent(satellite1OrbitNode)

  const cameraUniformBuffer = device.createBuffer({
    size: 16 * 2 * Float32Array.BYTES_PER_ELEMENT,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  })

  const cameraUniformBindGroup = device.createBindGroup({
    layout: pipeline.getBindGroupLayout(0),
    entries: [
      {
        binding: 0,
        resource: {
          buffer: cameraUniformBuffer,
        },
      },
    ],
  })

  const perspCamera = new PerspectiveCamera(
    (45 * Math.PI) / 180,
    canvas.width / canvas.height,
    0.1,
    500,
  )
  perspCamera.setPosition({ x: 0, y: -30, z: 42 })
  perspCamera.lookAt([0, 0, 0])
  perspCamera.updateProjectionMatrix()
  perspCamera.updateViewMatrix()

  new CameraController(perspCamera)

  const textureDepth = device.createTexture({
    size: [canvas.width, canvas.height, 1],
    format: 'depth24plus',
    sampleCount: SAMPLE_COUNT,
    usage: GPUTextureUsage.RENDER_ATTACHMENT,
  })

  const renderTexture = device.createTexture({
    size: [canvas.width, canvas.height],
    sampleCount: SAMPLE_COUNT,
    format: presentationFormat,
    usage: GPUTextureUsage.RENDER_ATTACHMENT,
  })
  let textureView = renderTexture.createView()
  // let textureView

  requestAnimationFrame(drawFrame)

  function drawFrame(ts) {
    requestAnimationFrame(drawFrame)

    ts /= 1000

    const commandEncoder = device.createCommandEncoder()
    const renderPass = commandEncoder.beginRenderPass({
      colorAttachments: [
        {
          view: textureView,
          resolveTarget: context.getCurrentTexture().createView(),
          loadValue: [0.1, 0.1, 0.1, 1.0],
          storeOp: 'store',
        },
      ],
      depthStencilAttachment: {
        view: textureDepth.createView(),
        depthLoadValue: 1,
        depthStoreOp: 'store',
        stencilLoadValue: 0,
        stencilStoreOp: 'store',
      },
    })
    device.queue.writeBuffer(
      cameraUniformBuffer,
      0,
      perspCamera.projectionMatrix as ArrayBuffer,
    )
    device.queue.writeBuffer(
      cameraUniformBuffer,
      16 * Float32Array.BYTES_PER_ELEMENT,
      perspCamera.viewMatrix as ArrayBuffer,
    )

    renderPass.setBindGroup(0, cameraUniformBindGroup)
    renderPass.setPipeline(pipeline)

    sunNodeOrbit.transform
      .setPosition({ x: Math.sin(ts) * 4, y: Math.cos(ts) * 4 })
      .setRotation({ z: ts })
      .updateModelMatrix()

    sunNode.transform.updateModelMatrix()

    earthOrbitNode.transform
      .setPosition({ x: 14 })
      .setRotation({ z: ts * 2 })
      .updateModelMatrix()

    const earthScale = Math.sin(ts) * 1 + 1.5
    earthNode.transform
      .setScale({
        x: earthScale,
        y: earthScale,
        z: earthScale,
      })
      .updateModelMatrix()

    moonOrbitNode.transform
      .setPosition({ x: 8 })
      .setRotation({ z: ts * 4 })
      .updateModelMatrix()
    moonNode.transform.setScale({ x: 0.8, y: 0.8, z: 0.8 }).updateModelMatrix()

    moonSatelliteOrbitNode.transform
      .setPosition({ x: 2.5 })
      .setScale({ x: 0.3, y: 0.3, z: 0.3 })
      .updateModelMatrix()

    satellite0OrbitNode.transform
      .setPosition({ x: -14 })
      .setRotation({ z: ts * -3 })
      .updateModelMatrix()
    satellite0Node.transform
      .setScale({ x: 0.3, y: 0.3, z: 0.3 })
      .updateModelMatrix()

    satellite1OrbitNode.transform.setPosition({ x: 5 }).updateModelMatrix()

    sunNodeOrbit.updateWorldMatrix()

    sunNode.render(renderPass)
    earthNode.render(renderPass)
    moonNode.render(renderPass)
    moonSatelliteNode.render(renderPass)
    satellite0Node.render(renderPass)
    satellite1Node.render(renderPass)

    renderPass.endPass()
    device.queue.submit([commandEncoder.finish()])
  }
})()
