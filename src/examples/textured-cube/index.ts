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

  const { vertices, uv, indices } = GeometryUtils.createBox()
  const vertexBuffer = device.createBuffer({
    size: vertices.byteLength,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    mappedAtCreation: true,
  })
  new Float32Array(vertexBuffer.getMappedRange()).set(vertices)
  vertexBuffer.unmap()

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
          arrayStride: 2 * Float32Array.BYTES_PER_ELEMENT,
          attributes: [
            {
              shaderLocation: 1,
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

  const image = new Image()
  image.src = '/webgpu-dojo/dist/assets/webgpu-logo-pot.png'
  await image.decode()
  const imageBitmap = await createImageBitmap(image)

  const cubeTexture = device.createTexture({
    size: [imageBitmap.width, imageBitmap.height, 1],
    format: presentationFormat,
    usage:
      GPUTextureUsage.TEXTURE_BINDING |
      GPUTextureUsage.COPY_DST |
      GPUTextureUsage.RENDER_ATTACHMENT,
  })
  device.queue.copyExternalImageToTexture(
    { source: imageBitmap },
    { texture: cubeTexture },
    [imageBitmap.width, imageBitmap.height],
  )

  const sampler = device.createSampler({
    magFilter: 'linear',
    minFilter: 'linear',
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
      {
        binding: 1,
        resource: sampler,
      },
      {
        binding: 2,
        resource: cubeTexture.createView(),
      },
    ],
  })

  const perspCamera = new PerspectiveCamera(
    (45 * Math.PI) / 180,
    canvas.width / canvas.height,
    0.1,
    100,
  )
  perspCamera.setPosition({ x: 1.5, y: 1.5, z: 3 })
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

  requestAnimationFrame(drawFrame)

  function drawFrame(ts) {
    requestAnimationFrame(drawFrame)

    ts /= 1000

    const speed = ts * 0.2
    cubeTransform.setRotation({ y: speed }).updateModelMatrix()

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
    device.queue.writeBuffer(
      vertexUniformBuffer,
      16 * 2 * Float32Array.BYTES_PER_ELEMENT,
      cubeTransform.modelMatrix as ArrayBuffer,
    )

    renderPass.setPipeline(pipeline)
    renderPass.setVertexBuffer(0, vertexBuffer)
    renderPass.setVertexBuffer(1, uvBuffer)
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
