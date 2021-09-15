import { OrthographicCamera, Transform } from '../../lib/hwoa-rang-gl'

import { testForWebGPUSupport } from '../shared/test-for-webgpu-support'

import '../index.css'

import VERTEX_SHADER from './shader.vert.wglsl'
import FRAGMENT_SHADER from './shader.frag.wglsl'

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

  const orthoCamera = new OrthographicCamera(
    0,
    canvas.width,
    canvas.height,
    0,
    0.1,
    3,
  )
  orthoCamera.setPosition({ x: 0, y: 0, z: 2 })
  orthoCamera.lookAt([0, 0, 0])
  orthoCamera.updateProjectionMatrix()
  orthoCamera.updateViewMatrix()

  const quadTransform = new Transform()
    .setPosition({ x: canvas.width / 2, y: canvas.height / 2, z: 0 })
    .updateModelMatrix()

  const triangleWidth = 400
  const triangleHeight = 400
  // prettier-ignore
  const vertices = new Float32Array([
    0.0, triangleHeight / 2,
    triangleWidth / 2, -triangleHeight / 2,
    -triangleWidth / 2, -triangleHeight / 2,
  ])
  const vertexBuffer = device.createBuffer({
    size: vertices.byteLength,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    mappedAtCreation: true,
  })
  new Float32Array(vertexBuffer.getMappedRange()).set(vertices)
  vertexBuffer.unmap()

  // prettier-ignore
  const colors = new Float32Array([
    1.0, 0.0, 0.0, 
    0.0, 1.0, 0.0,
    0.0, 0.0, 1.0
  ])
  const colorsBuffer = device.createBuffer({
    size: colors.byteLength,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    mappedAtCreation: true,
  })
  new Float32Array(colorsBuffer.getMappedRange()).set(colors)
  colorsBuffer.unmap()

  const pipeline = device.createRenderPipeline({
    vertex: {
      module: device.createShaderModule({
        code: VERTEX_SHADER,
      }),
      entryPoint: 'main',
      buffers: [
        {
          arrayStride: 2 * Float32Array.BYTES_PER_ELEMENT,
          attributes: [
            {
              shaderLocation: 0,
              format: 'float32x2',
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

  device.queue.writeBuffer(
    vertexUniformBuffer,
    0,
    orthoCamera.projectionMatrix as ArrayBuffer,
  )

  device.queue.writeBuffer(
    vertexUniformBuffer,
    16 * Float32Array.BYTES_PER_ELEMENT,
    orthoCamera.viewMatrix as ArrayBuffer,
  )

  device.queue.writeBuffer(
    vertexUniformBuffer,
    16 * 2 * Float32Array.BYTES_PER_ELEMENT,
    quadTransform.modelMatrix as ArrayBuffer,
  )

  const commandEncoder = device.createCommandEncoder()
  const textureView = context.getCurrentTexture().createView()
  const renderPass = commandEncoder.beginRenderPass({
    colorAttachments: [
      {
        view: textureView,
        loadValue: [0.1, 0.1, 0.1, 1.0],
        storeOp: 'store',
      },
    ],
  })
  renderPass.setPipeline(pipeline)
  renderPass.setVertexBuffer(0, vertexBuffer)
  renderPass.setVertexBuffer(1, colorsBuffer)
  renderPass.setBindGroup(0, uniformBindGroup)
  renderPass.draw(3)
  renderPass.endPass()

  device.queue.submit([commandEncoder.finish()])
})()
