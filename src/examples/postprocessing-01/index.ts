import { mat4, vec3 } from 'gl-matrix'

import {
  PerspectiveCamera,
  GeometryUtils,
  CameraController,
  OrthographicCamera,
  Transform,
} from '../../lib/hwoa-rang-gl'

import CUBE_VERTEX_SHADER from './cube-shader.vert.wglsl'
import CUBE_FRAGMENT_SHADER from './cube-shader.frag.wglsl'
import QUAD_VERTEX_SHADER from './quad-shader.vert.wglsl'
import QUAD_FRAGMENT_SHADER from './quad-shader.frag.wglsl'

import '../index.css'
import { transform } from 'typescript'

const INSTANCES_COUNT = 500
const WORLD_SIZE_X = 20
const WORLD_SIZE_Y = 20
const WORLD_SIZE_Z = 20

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
  const presentationSize = [canvas.width, canvas.height]
  const primitiveType = 'triangle-list'

  context.configure({
    device,
    format: presentationFormat,
    usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC,
    size: presentationSize,
  })

  const lightPosition = new Float32Array([0.5, 0.5, 0.5])

  const perspCamera = new PerspectiveCamera(
    (45 * Math.PI) / 180,
    canvas.width / canvas.height,
    0.1,
    100,
  )
  perspCamera.setPosition({
    x: WORLD_SIZE_X,
    y: WORLD_SIZE_Y,
    z: WORLD_SIZE_Z,
  })
  perspCamera.lookAt([0, 0, 0])
  perspCamera.updateProjectionMatrix()
  perspCamera.updateViewMatrix()

  new CameraController(perspCamera)

  const orthoCamera = new OrthographicCamera(
    -canvas.width / 2,
    canvas.width / 2,
    canvas.height / 2,
    -canvas.height / 2,
    0.1,
    3,
  )
  orthoCamera.setPosition({
    x: 0,
    y: 0,
    z: 2,
  })
  orthoCamera.lookAt([0, 0, 0])
  orthoCamera.updateProjectionMatrix()
  orthoCamera.updateViewMatrix()

  // We will copy the frame's rendering results into this texture and
  // sample it on the next frame.
  const postfxTexture = device.createTexture({
    size: presentationSize,
    format: presentationFormat,
    usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
  })

  // Prepare fullscreen quad gpu buffers
  const {
    vertices: quadVertices,
    uv: quadUv,
    indices: quadIndices,
  } = GeometryUtils.createPlane({
    width: innerWidth,
    height: innerHeight,
  })
  const quadVertexBuffer = device.createBuffer({
    size: quadVertices.byteLength,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    mappedAtCreation: true,
  })
  new Float32Array(quadVertexBuffer.getMappedRange()).set(quadVertices)
  quadVertexBuffer.unmap()

  const quadUvBuffer = device.createBuffer({
    size: quadUv.byteLength,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    mappedAtCreation: true,
  })
  new Float32Array(quadUvBuffer.getMappedRange()).set(quadUv)
  quadUvBuffer.unmap()

  const quadIndexBuffer = device.createBuffer({
    size: quadIndices.byteLength,
    usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
    mappedAtCreation: true,
  })
  if (quadIndices instanceof Uint16Array) {
    new Uint16Array(quadIndexBuffer.getMappedRange()).set(quadIndices)
  } else {
    new Uint32Array(quadIndexBuffer.getMappedRange()).set(quadIndices)
  }
  quadIndexBuffer.unmap()

  // Prepare cube gpu buffers
  const { vertices, normal, indices } = GeometryUtils.createBox()
  const cubeVertexBuffer = device.createBuffer({
    size: vertices.byteLength,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    mappedAtCreation: true,
  })
  new Float32Array(cubeVertexBuffer.getMappedRange()).set(vertices)
  cubeVertexBuffer.unmap()
  const cubeNormalBuffer = device.createBuffer({
    size: normal.byteLength,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    mappedAtCreation: true,
  })
  new Float32Array(cubeNormalBuffer.getMappedRange()).set(normal)
  cubeNormalBuffer.unmap()
  const cubeIndexBuffer = device.createBuffer({
    size: indices.byteLength,
    usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
    mappedAtCreation: true,
  })
  if (indices instanceof Uint16Array) {
    new Uint16Array(cubeIndexBuffer.getMappedRange()).set(indices)
  } else {
    new Uint32Array(cubeIndexBuffer.getMappedRange()).set(indices)
  }
  cubeIndexBuffer.unmap()

  // Prepare instances model matrices as gpu buffers
  const instanceMoveVector = vec3.create()
  const instanceModelMatrix = mat4.create()
  const normalMatrix = mat4.create()

  const instanceModelMatrixData = new Float32Array(INSTANCES_COUNT * 16)
  const instanceNormalMatrixData = new Float32Array(INSTANCES_COUNT * 16)

  for (let i = 0; i < INSTANCES_COUNT * 16; i += 16) {
    const randX = (Math.random() * 2 - 1) * WORLD_SIZE_X
    const randY = (Math.random() * 2 - 1) * WORLD_SIZE_Y
    const randZ = (Math.random() * 2 - 1) * WORLD_SIZE_Z

    mat4.identity(instanceModelMatrix)
    vec3.set(instanceMoveVector, randX, randY, randZ)
    mat4.translate(instanceModelMatrix, instanceModelMatrix, instanceMoveVector)

    const randRotX = Math.random() * Math.PI * 2
    const randRotY = Math.random() * Math.PI * 2
    const randRotZ = Math.random() * Math.PI * 2
    mat4.rotateX(instanceModelMatrix, instanceModelMatrix, randRotX)
    mat4.rotateY(instanceModelMatrix, instanceModelMatrix, randRotY)
    mat4.rotateZ(instanceModelMatrix, instanceModelMatrix, randRotZ)

    const randScale = Math.random() + 0.25
    vec3.set(instanceMoveVector, randScale, randScale, randScale)
    mat4.scale(instanceModelMatrix, instanceModelMatrix, instanceMoveVector)

    mat4.invert(normalMatrix, instanceModelMatrix)
    mat4.transpose(normalMatrix, normalMatrix)

    for (let n = 0; n < 16; n++) {
      instanceModelMatrixData[i + n] = instanceModelMatrix[n]
      instanceNormalMatrixData[i + n] = normalMatrix[n]
    }
  }

  const instanceModelMatrixBuffer = device.createBuffer({
    size: instanceModelMatrixData.byteLength,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    mappedAtCreation: true,
  })
  const mappedModelMatrixRange = new Float32Array(
    instanceModelMatrixBuffer.getMappedRange(),
  )
  mappedModelMatrixRange.set(instanceModelMatrixData)
  instanceModelMatrixBuffer.unmap()

  const instanceNormalMatrixBuffer = device.createBuffer({
    size: instanceNormalMatrixData.byteLength,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    mappedAtCreation: true,
  })
  new Float32Array(instanceNormalMatrixBuffer.getMappedRange()).set(
    instanceNormalMatrixData,
  )
  instanceNormalMatrixBuffer.unmap()

  const quadPipeline = device.createRenderPipeline({
    vertex: {
      module: device.createShaderModule({
        code: QUAD_VERTEX_SHADER,
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
        code: QUAD_FRAGMENT_SHADER,
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

  const cubesPipeline = device.createRenderPipeline({
    vertex: {
      module: device.createShaderModule({
        code: CUBE_VERTEX_SHADER,
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
          arrayStride: 16 * Float32Array.BYTES_PER_ELEMENT,
          stepMode: 'instance',
          attributes: [
            {
              shaderLocation: 2,
              format: 'float32x4',
              offset: 0,
            },
            {
              shaderLocation: 3,
              format: 'float32x4',
              offset: 4 * Float32Array.BYTES_PER_ELEMENT,
            },
            {
              shaderLocation: 4,
              format: 'float32x4',
              offset: 8 * Float32Array.BYTES_PER_ELEMENT,
            },
            {
              shaderLocation: 5,
              format: 'float32x4',
              offset: 12 * Float32Array.BYTES_PER_ELEMENT,
            },
          ],
        },
        {
          arrayStride: 16 * Float32Array.BYTES_PER_ELEMENT,
          stepMode: 'instance',
          attributes: [
            {
              shaderLocation: 6,
              format: 'float32x4',
              offset: 0,
            },
            {
              shaderLocation: 7,
              format: 'float32x4',
              offset: 4 * Float32Array.BYTES_PER_ELEMENT,
            },
            {
              shaderLocation: 8,
              format: 'float32x4',
              offset: 8 * Float32Array.BYTES_PER_ELEMENT,
            },
            {
              shaderLocation: 9,
              format: 'float32x4',
              offset: 12 * Float32Array.BYTES_PER_ELEMENT,
            },
          ],
        },
      ],
    },
    fragment: {
      module: device.createShaderModule({
        code: CUBE_FRAGMENT_SHADER,
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
    depthStencil: {
      format: 'depth24plus',
      depthWriteEnabled: true,
      depthCompare: 'less',
    },
  })

  // Perspective camera uniform block
  const perspCameraUniformBuffer = device.createBuffer({
    size: 16 * 2 * Float32Array.BYTES_PER_ELEMENT,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  })

  const perspCameraUniformBindGroup = device.createBindGroup({
    layout: cubesPipeline.getBindGroupLayout(0),
    entries: [
      {
        binding: 0,
        resource: {
          buffer: perspCameraUniformBuffer,
          offset: 0,
          size: 16 * 2 * Float32Array.BYTES_PER_ELEMENT,
        },
      },
    ],
  })

  // Orthographic camera uniform block
  const orthoCameraUniformBuffer = device.createBuffer({
    size: 16 * 2 * Float32Array.BYTES_PER_ELEMENT,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  })

  const orthoCameraUniformBindGroup = device.createBindGroup({
    layout: quadPipeline.getBindGroupLayout(0),
    entries: [
      {
        binding: 0,
        resource: {
          buffer: orthoCameraUniformBuffer,
          offset: 0,
          size: 16 * 2 * Float32Array.BYTES_PER_ELEMENT,
        },
      },
    ],
  })

  // Quad transform uniform block
  const quadTransformUniformBuffer = device.createBuffer({
    size: 16 * Float32Array.BYTES_PER_ELEMENT,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  })

  const quadTransformUniformBindGroup = device.createBindGroup({
    layout: quadPipeline.getBindGroupLayout(1),
    entries: [
      {
        binding: 0,
        resource: {
          buffer: quadTransformUniformBuffer,
          offset: 0,
          size: 16 * Float32Array.BYTES_PER_ELEMENT,
        },
      },
    ],
  })

  const sampler = device.createSampler({
    magFilter: 'linear',
    minFilter: 'linear',
  })

  const quadSamplerUniformBindGroup = device.createBindGroup({
    layout: quadPipeline.getBindGroupLayout(2),
    entries: [
      {
        binding: 0,
        resource: sampler,
      },
      {
        binding: 1,
        resource: postfxTexture.createView(),
      },
    ],
  })

  const quadTransform = new Transform()

  const lightUniformBuffer = device.createBuffer({
    size: 16 * Float32Array.BYTES_PER_ELEMENT,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  })

  const lightUniformBindGroup = device.createBindGroup({
    layout: cubesPipeline.getBindGroupLayout(1),
    entries: [
      {
        binding: 0,
        resource: {
          buffer: lightUniformBuffer,
          offset: 0,
          size: 16 * Float32Array.BYTES_PER_ELEMENT,
        },
      },
    ],
  })

  const textureDepth = device.createTexture({
    size: [canvas.width, canvas.height, 1],
    format: 'depth24plus',
    usage: GPUTextureUsage.RENDER_ATTACHMENT,
  })

  // Pass light position to gpu
  device.queue.writeBuffer(lightUniformBuffer, 0, lightPosition)

  requestAnimationFrame(drawFrame)

  function drawFrame(ts) {
    requestAnimationFrame(drawFrame)

    ts /= 1000

    const swapChainTexture = context.getCurrentTexture()

    const commandEncoder = device.createCommandEncoder()

    const renderPass = commandEncoder.beginRenderPass({
      colorAttachments: [
        {
          view: swapChainTexture.createView(),
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
      perspCameraUniformBuffer,
      0,
      perspCamera.projectionMatrix as ArrayBuffer,
    )
    device.queue.writeBuffer(
      perspCameraUniformBuffer,
      16 * Float32Array.BYTES_PER_ELEMENT,
      perspCamera.viewMatrix as ArrayBuffer,
    )

    device.queue.writeBuffer(
      orthoCameraUniformBuffer,
      0,
      orthoCamera.projectionMatrix as ArrayBuffer,
    )
    device.queue.writeBuffer(
      orthoCameraUniformBuffer,
      16 * Float32Array.BYTES_PER_ELEMENT,
      orthoCamera.viewMatrix as ArrayBuffer,
    )

    renderPass.setPipeline(cubesPipeline)
    renderPass.setBindGroup(0, perspCameraUniformBindGroup)
    renderPass.setBindGroup(1, lightUniformBindGroup)
    renderPass.setVertexBuffer(0, cubeVertexBuffer)
    renderPass.setVertexBuffer(1, cubeNormalBuffer)
    renderPass.setVertexBuffer(2, instanceModelMatrixBuffer)
    renderPass.setVertexBuffer(3, instanceNormalMatrixBuffer)
    renderPass.setIndexBuffer(
      cubeIndexBuffer,
      indices instanceof Uint16Array ? 'uint16' : 'uint32',
    )
    renderPass.drawIndexed(indices.length, INSTANCES_COUNT)

    quadTransform
      .setRotation({ x: Math.PI })
      // .setPosition({ y: -ts })
      .updateModelMatrix()
    device.queue.writeBuffer(
      quadTransformUniformBuffer,
      0,
      quadTransform.modelMatrix as ArrayBuffer,
    )

    renderPass.endPass()

    commandEncoder.copyTextureToTexture(
      {
        texture: swapChainTexture,
      },
      {
        texture: postfxTexture,
      },
      presentationSize,
    )
    const renderPass1 = commandEncoder.beginRenderPass({
      colorAttachments: [
        {
          view: swapChainTexture.createView(),
          loadValue: [0.1, 0.1, 0.1, 1.0],
          storeOp: 'store',
        },
      ],
    })

    renderPass1.setPipeline(quadPipeline)

    renderPass1.setBindGroup(0, orthoCameraUniformBindGroup)
    renderPass1.setBindGroup(1, quadTransformUniformBindGroup)
    renderPass1.setBindGroup(2, quadSamplerUniformBindGroup)

    renderPass1.setVertexBuffer(0, quadVertexBuffer)
    renderPass1.setVertexBuffer(1, quadUvBuffer)
    renderPass1.setIndexBuffer(
      quadIndexBuffer,
      quadIndices instanceof Uint16Array ? 'uint16' : 'uint32',
    )
    renderPass1.drawIndexed(quadIndices.length)

    renderPass1.endPass()

    device.queue.submit([commandEncoder.finish()])
  }
})()
