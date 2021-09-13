import { mat4, vec3 } from 'gl-matrix'
import {
  PerspectiveCamera,
  GeometryUtils,
  Transform,
} from '../../lib/hwoa-rang-gl'

import VERTEX_SHADER from './shader.vert.wglsl'
import FRAGMENT_SHADER from './shader.frag.wglsl'

import '../index.css'

const UP_VECTOR = vec3.fromValues(0, 1, 0)
const SAMPLE_COUNT = 4
const COUNT_X = 4
const COUNT_Y = 4
const WORLD_SIZE_X = 5
const WORLD_SIZE_Y = 5
const NUM_INSTANCES = COUNT_X * COUNT_Y

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

  const { vertices, normal, indices } = GeometryUtils.createSphere({
    widthSegments: 32,
    heightSegments: 32,
  })
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

  const image = new Image()
  image.src = '/webgpu-dojo/dist/assets/eye-texture.jpeg'
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

  const instanceVertexUniformBuffer = device.createBuffer({
    size: NUM_INSTANCES * 16 * Float32Array.BYTES_PER_ELEMENT,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  })

  const instancePositionsVertexUniformBuffer = device.createBuffer({
    size: NUM_INSTANCES * 3 * Float32Array.BYTES_PER_ELEMENT,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  })

  const instanceMatrix = new Float32Array(16 * NUM_INSTANCES)
  const instancePositions = new Float32Array(3 * NUM_INSTANCES)
  const tempEyeTransformMatrix = mat4.create()

  device.queue.writeBuffer(
    instancePositionsVertexUniformBuffer,
    0,
    instancePositions,
  )

  const uniformBindGroup = device.createBindGroup({
    layout: pipeline.getBindGroupLayout(0),
    entries: [
      {
        binding: 0,
        resource: {
          buffer: vertexUniformBuffer,
        },
      },
      {
        binding: 1,
        resource: {
          buffer: instanceVertexUniformBuffer,
        },
      },
      // {
      //   binding: 2,
      //   resource: {
      //     buffer: instancePositionsVertexUniformBuffer,
      //   },
      // },
      {
        binding: 2,
        resource: sampler,
      },
      {
        binding: 3,
        resource: cubeTexture.createView(),
      },
    ],
  })

  const cameraFOV = (45 * Math.PI) / 180
  const cameraAspect = canvas.width / canvas.height
  const cameraPosZ = 7

  const cameraFrustumHeight = 2 * Math.tan(cameraFOV / 2) * cameraPosZ // visible height
  const cameraFrustumWidth = cameraFrustumHeight * (innerWidth / innerHeight)

  const perspCamera = new PerspectiveCamera(cameraFOV, cameraAspect, 0.1, 100)
  perspCamera.setPosition({ x: 0, y: 0, z: cameraPosZ })
  perspCamera.lookAt([0, 0, 0])
  perspCamera.updateProjectionMatrix()
  perspCamera.updateViewMatrix()

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

  const mousePos = new Float32Array([0, 0])
  const mousePosTarget = new Float32Array([0, 0])

  let clickFactor = 0
  let clickFactorTarget = clickFactor
  let oldTime = 0

  requestAnimationFrame(drawFrame)
  document.body.addEventListener('mousemove', onMouseMove)
  canvas.addEventListener('click', onMouseClick)

  function onMouseMove(e) {
    const x = ((e.pageX / innerWidth) * 2 - 1) * cameraFrustumWidth * 0.5
    const y = ((1 - e.pageY / innerHeight) * 2 - 1) * cameraFrustumHeight * 0.5
    mousePosTarget[0] = x
    mousePosTarget[1] = y
  }

  function onMouseClick() {
    clickFactorTarget++
  }

  function drawFrame(ts) {
    requestAnimationFrame(drawFrame)

    ts /= 1000

    const dt = ts - oldTime
    oldTime = ts

    const clickMoveSpeed = dt * 5

    clickFactorTarget += -clickFactorTarget * clickMoveSpeed
    clickFactor += (clickFactorTarget - clickFactor) * clickMoveSpeed

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

    const lookAtSpeed = dt * 1
    mousePos[0] += (mousePosTarget[0] - mousePos[0]) * lookAtSpeed
    mousePos[1] += (mousePosTarget[1] - mousePos[1]) * lookAtSpeed
    let n = 0
    const deltaX = WORLD_SIZE_X / COUNT_X
    const deltaY = WORLD_SIZE_Y / COUNT_Y
    for (let x = 0; x < COUNT_X; x++) {
      for (let y = 0; y < COUNT_Y; y++) {
        const offsetX = Math.cos(n) * 2
        const offsetY = Math.sin(n) * 2
        const offsetZ = Math.sin(n * 2) * n
        const worldX =
          x * deltaX - WORLD_SIZE_X / 2 + 0.5 + offsetX * clickFactor
        const worldY =
          y * deltaY - WORLD_SIZE_Y / 2 + 0.5 + offsetY * clickFactor
        const mixX = worldX + (offsetX - worldX) * clickFactor
        const mixY = worldY + (offsetY - worldY) * clickFactor
        const mixZ = offsetZ * clickFactor

        const worldXYZ = vec3.fromValues(mixX, mixY, mixZ)
        mat4.identity(tempEyeTransformMatrix)
        mat4.translate(tempEyeTransformMatrix, tempEyeTransformMatrix, worldXYZ)
        mat4.targetTo(
          tempEyeTransformMatrix,
          worldXYZ,
          vec3.fromValues(mousePos[0], mousePos[1], 1),
          UP_VECTOR,
        )
        instanceMatrix.set(tempEyeTransformMatrix, n * 16)
        instancePositions.set(worldXYZ, n * 3)
        n++
      }
    }

    device.queue.writeBuffer(instanceVertexUniformBuffer, 0, instanceMatrix)

    renderPass.setPipeline(pipeline)
    renderPass.setVertexBuffer(0, vertexBuffer)
    renderPass.setVertexBuffer(1, normalBuffer)
    renderPass.setIndexBuffer(
      indexBuffer,
      indices instanceof Uint16Array ? 'uint16' : 'uint32',
    )
    renderPass.setBindGroup(0, uniformBindGroup)
    renderPass.drawIndexed(indices.length, NUM_INSTANCES)
    renderPass.endPass()
    device.queue.submit([commandEncoder.finish()])
  }
})()
