import { load } from '@loaders.gl/core'
import { GLTFLoader } from '@loaders.gl/gltf/dist/esm/gltf-loader'

import {
  PerspectiveCamera,
  GeometryUtils,
  CameraController,
  Transform,
} from '../../lib/hwoa-rang-gl'

import VERTEX_SHADER from './shader.vert.wglsl'
import FRAGMENT_SHADER from './shader.frag.wglsl'

import '../index.css'

const SAMPLE_COUNT = 4

;(async () => {
  const gltf = await load('/webgpu-dojo/dist/assets/Triangle.gltf', GLTFLoader)

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

  // const { vertices, indices } = GeometryUtils.createBox()
  const vertices = gltf.accessors[1].value
  const vertexBuffer = device.createBuffer({
    size: vertices.byteLength,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    mappedAtCreation: true,
  })
  new Float32Array(vertexBuffer.getMappedRange()).set(vertices)
  vertexBuffer.unmap()

  const indices = gltf.accessors[0].value
  const indexBuffer = device.createBuffer({
    // indices.bytLength takes up 6 bytes, but we need it to be 8 bytes aligned
    // thats why we need to add 2 bytes extra padding - Uint16Array.BYTES_PER_ELEMENT
    // round it up to the nearest higher value of 8
    size: Math.ceil(indices.byteLength / 8) * 8,
    usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
    mappedAtCreation: true,
  })
  if (indices instanceof Uint16Array) {
    new Uint16Array(indexBuffer.getMappedRange()).set(indices)
  } else {
    new Uint32Array(indexBuffer.getMappedRange()).set(indices)
  }

  indexBuffer.unmap()

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

  const vertexUniformBuffer = device.createBuffer({
    size: 16 * 3 * Float32Array.BYTES_PER_ELEMENT,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  })

  const uniformBindGroup = device.createBindGroup({
    layout: pipeline.getBindGroupLayout(0),
    entries: [
      {
        binding: 0,
        resource: {
          buffer: vertexUniformBuffer,
          offset: 0,
          size: 16 * 3 * Float32Array.BYTES_PER_ELEMENT,
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
  perspCamera.setPosition({ x: 0, y: 0, z: 3 })
  perspCamera.lookAt([0, 0, 0])
  perspCamera.updateProjectionMatrix()
  perspCamera.updateViewMatrix()

  new CameraController(perspCamera)

  const cubeTransform = new Transform()

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

  // debugger

  cubeTransform
    .setPosition({
      x: -gltf.accessors[0].max[0] / 4,
      y: -gltf.accessors[0].max[0] / 4,
    })
    .updateModelMatrix()

  device.queue.writeBuffer(
    vertexUniformBuffer,
    16 * 2 * Float32Array.BYTES_PER_ELEMENT,
    cubeTransform.modelMatrix as ArrayBuffer,
  )

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
      vertexUniformBuffer,
      0,
      perspCamera.projectionMatrix as ArrayBuffer,
    )
    device.queue.writeBuffer(
      vertexUniformBuffer,
      16 * Float32Array.BYTES_PER_ELEMENT,
      perspCamera.viewMatrix as ArrayBuffer,
    )

    renderPass.setPipeline(pipeline)
    renderPass.setVertexBuffer(0, vertexBuffer)
    renderPass.setIndexBuffer(
      indexBuffer,
      indices instanceof Uint16Array ? 'uint16' : 'uint32',
    )
    renderPass.setBindGroup(0, uniformBindGroup)
    renderPass.drawIndexed(indices.length)
    renderPass.endPass()
    device.queue.submit([commandEncoder.finish()])
  }
})()
