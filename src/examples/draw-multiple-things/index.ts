import {
  PerspectiveCamera,
  GeometryUtils,
  CameraController,
  Transform,
} from '../../lib/hwoa-rang-gl'

import { testForWebGPUSupport } from '../shared/test-for-webgpu-support'

import VERTEX_SHADER from './shader.vert.wglsl'
import FRAGMENT_SHADER from './shader.frag.wglsl'

import '../index.css'

const SAMPLE_COUNT = 4

testForWebGPUSupport()
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

  // Prepare cube gpu buffers
  const {
    vertices: cubeVertices,
    normal: cubeNormal,
    indices: cubeIndices,
  } = GeometryUtils.createBox()
  const cubeVertexBuffer = device.createBuffer({
    size: cubeVertices.byteLength,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    mappedAtCreation: true,
  })
  new Float32Array(cubeVertexBuffer.getMappedRange()).set(cubeVertices)
  cubeVertexBuffer.unmap()
  const cubeNormalBuffer = device.createBuffer({
    size: cubeNormal.byteLength,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    mappedAtCreation: true,
  })
  new Float32Array(cubeNormalBuffer.getMappedRange()).set(cubeNormal)
  cubeNormalBuffer.unmap()
  const cubeIndexBuffer = device.createBuffer({
    size: cubeIndices.byteLength,
    usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
    mappedAtCreation: true,
  })
  if (cubeIndices instanceof Uint16Array) {
    new Uint16Array(cubeIndexBuffer.getMappedRange()).set(cubeIndices)
  } else {
    new Uint32Array(cubeIndexBuffer.getMappedRange()).set(cubeIndices)
  }
  cubeIndexBuffer.unmap()

  // Prepare sphere gpu buffers
  const {
    vertices: sphereVertices,
    normal: sphereNormal,
    indices: sphereIndices,
  } = GeometryUtils.createSphere({
    widthSegments: 30,
    heightSegments: 30,
  })
  const sphereVertexBuffer = device.createBuffer({
    size: sphereVertices.byteLength,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    mappedAtCreation: true,
  })
  new Float32Array(sphereVertexBuffer.getMappedRange()).set(sphereVertices)
  sphereVertexBuffer.unmap()
  const sphereNormalBuffer = device.createBuffer({
    size: sphereNormal.byteLength,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    mappedAtCreation: true,
  })
  new Float32Array(sphereNormalBuffer.getMappedRange()).set(sphereNormal)
  sphereNormalBuffer.unmap()
  const sphereIndexBuffer = device.createBuffer({
    size: sphereIndices.byteLength,
    usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
    mappedAtCreation: true,
  })
  if (sphereIndices instanceof Uint16Array) {
    new Uint16Array(sphereIndexBuffer.getMappedRange()).set(sphereIndices)
  } else {
    new Uint32Array(sphereIndexBuffer.getMappedRange()).set(sphereIndices)
  }
  sphereIndexBuffer.unmap()

  // Prepare torus gpu buffers
  const {
    vertices: torusVertices,
    normal: torusNormal,
    indices: torusIndices,
  } = GeometryUtils.createTorus({
    radialSegments: 25,
    tubularSegments: 25,
  })
  const torusVertexBuffer = device.createBuffer({
    size: torusVertices.byteLength,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    mappedAtCreation: true,
  })
  new Float32Array(torusVertexBuffer.getMappedRange()).set(torusVertices)
  torusVertexBuffer.unmap()
  const torusNormalBuffer = device.createBuffer({
    size: torusNormal.byteLength,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    mappedAtCreation: true,
  })
  new Float32Array(torusNormalBuffer.getMappedRange()).set(torusNormal)
  torusNormalBuffer.unmap()
  const torusIndexBuffer = device.createBuffer({
    size: torusIndices.byteLength,
    usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
    mappedAtCreation: true,
  })
  if (torusIndices instanceof Uint16Array) {
    new Uint16Array(torusIndexBuffer.getMappedRange()).set(torusIndices)
  } else {
    new Uint32Array(torusIndexBuffer.getMappedRange()).set(torusIndices)
  }
  torusIndexBuffer.unmap()

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
          offset: 0,
          size: 16 * 2 * Float32Array.BYTES_PER_ELEMENT,
        },
      },
    ],
  })

  const cubeTransformUniformBuffer = device.createBuffer({
    size: 16 * Float32Array.BYTES_PER_ELEMENT,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  })

  const cubeTransformUniformBindGroup = device.createBindGroup({
    layout: pipeline.getBindGroupLayout(1),
    entries: [
      {
        binding: 0,
        resource: {
          buffer: cubeTransformUniformBuffer,
          offset: 0,
          size: 16 * Float32Array.BYTES_PER_ELEMENT,
        },
      },
    ],
  })

  const sphereTransformUniformBuffer = device.createBuffer({
    size: 16 * Float32Array.BYTES_PER_ELEMENT,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  })

  const sphereTransformUniformBindGroup = device.createBindGroup({
    layout: pipeline.getBindGroupLayout(1),
    entries: [
      {
        binding: 0,
        resource: {
          buffer: sphereTransformUniformBuffer,
          offset: 0,
          size: 16 * Float32Array.BYTES_PER_ELEMENT,
        },
      },
    ],
  })

  const torusTransformUniformBuffer = device.createBuffer({
    size: 16 * Float32Array.BYTES_PER_ELEMENT,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  })

  const torusTransformUniformBindGroup = device.createBindGroup({
    layout: pipeline.getBindGroupLayout(1),
    entries: [
      {
        binding: 0,
        resource: {
          buffer: torusTransformUniformBuffer,
          offset: 0,
          size: 16 * Float32Array.BYTES_PER_ELEMENT,
        },
      },
    ],
  })

  const perspCamera = new PerspectiveCamera(
    (45 * Math.PI) / 180,
    canvas.width / canvas.height,
    0.1,
    100,
  )
  perspCamera.setPosition({ x: 0, y: 1.5, z: -4 })
  perspCamera.lookAt([0, 0, 0])
  perspCamera.updateProjectionMatrix()
  perspCamera.updateViewMatrix()

  new CameraController(perspCamera)

  const cubePositionTransform = new Transform()
  const spherePositionTransform = new Transform()
  const torusPositionTransform = new Transform()

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

    renderPass.setPipeline(pipeline)

    renderPass.setBindGroup(0, cameraUniformBindGroup)
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

    cubePositionTransform
      .setPosition({ x: -2, y: Math.sin(ts) * 0.5 })
      .setRotation({ y: ts * 0.2 })
      .updateModelMatrix()

    renderPass.setBindGroup(1, cubeTransformUniformBindGroup)

    device.queue.writeBuffer(
      cubeTransformUniformBuffer,
      0,
      cubePositionTransform.modelMatrix as ArrayBuffer,
    )

    renderPass.setVertexBuffer(0, cubeVertexBuffer)
    renderPass.setVertexBuffer(1, cubeNormalBuffer)
    renderPass.setIndexBuffer(
      cubeIndexBuffer,
      cubeIndices instanceof Uint16Array ? 'uint16' : 'uint32',
    )
    renderPass.drawIndexed(cubeIndices.length)

    // Render sphere
    spherePositionTransform
      .setPosition({ x: 2, y: Math.sin(ts + 0.5) * 0.5 })
      .setRotation({ y: ts * -0.2 })
      .updateModelMatrix()

    renderPass.setBindGroup(1, sphereTransformUniformBindGroup)

    device.queue.writeBuffer(
      sphereTransformUniformBuffer,
      0,
      spherePositionTransform.modelMatrix as ArrayBuffer,
    )

    renderPass.setVertexBuffer(0, sphereVertexBuffer)
    renderPass.setVertexBuffer(1, sphereNormalBuffer)
    renderPass.setIndexBuffer(
      sphereIndexBuffer,
      sphereIndices instanceof Uint16Array ? 'uint16' : 'uint32',
    )
    renderPass.drawIndexed(sphereIndices.length)

    // Render torus
    torusPositionTransform
      .setPosition({ x: 0, y: Math.sin(ts + 1) * 0.5 })
      .setRotation({ z: ts * -0.2, y: ts * -0.6 })
      .updateModelMatrix()

    renderPass.setBindGroup(1, torusTransformUniformBindGroup)

    device.queue.writeBuffer(
      torusTransformUniformBuffer,
      0,
      torusPositionTransform.modelMatrix as ArrayBuffer,
    )

    renderPass.setVertexBuffer(0, torusVertexBuffer)
    renderPass.setVertexBuffer(1, torusNormalBuffer)
    renderPass.setIndexBuffer(
      torusIndexBuffer,
      torusIndices instanceof Uint16Array ? 'uint16' : 'uint32',
    )
    renderPass.drawIndexed(torusIndices.length)

    renderPass.endPass()
    device.queue.submit([commandEncoder.finish()])
  }
})()
