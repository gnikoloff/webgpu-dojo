import * as dat from 'dat.gui'

import {
  PerspectiveCamera,
  GeometryUtils,
  OrthographicCamera,
  Transform,
} from '../../lib/hwoa-rang-gl'

import {
  generateGPUBuffersFromGeometry,
  generateInstanceMatrices,
} from './helpers'

import { testForWebGPUSupport } from '../shared/test-for-webgpu-support'

import INSTANCED_MESH_VERTEX_SHADER from './instanced-shader.vert.wglsl'
import INSTANCED_MESH_FRAGMENT_SHADER from './instanced-shader.frag.wglsl'
import QUAD_VERTEX_SHADER from './quad-shader.vert.wglsl'
import QUAD_FRAGMENT_SHADER from './quad-shader.frag.wglsl'

import '../index.css'

testForWebGPUSupport()

const INSTANCES_COUNT = 500
const WORLD_SIZE_X = 20
const WORLD_SIZE_Y = 20
const WORLD_SIZE_Z = 20

const gui = new dat.GUI()

const OPTIONS = {
  animatable: true,
  tweenFactor: 0,
}

gui.add(OPTIONS, 'animatable')
gui.add(OPTIONS, 'tweenFactor').min(0).max(1).step(0.01).listen()

let oldTime = 0

function getRandPositionScaleRotation(scaleUniformly = true) {
  const randX = (Math.random() * 2 - 1) * WORLD_SIZE_X
  const randY = (Math.random() * 2 - 1) * WORLD_SIZE_Y
  const randZ = (Math.random() * 2 - 1) * WORLD_SIZE_Z
  const randRotX = Math.random() * Math.PI * 2
  const randRotY = Math.random() * Math.PI * 2
  const randRotZ = Math.random() * Math.PI * 2
  const randScaleX = Math.random() + 0.25
  const randScaleY = scaleUniformly ? randScaleX : Math.random() + 0.25
  const randScaleZ = scaleUniformly ? randScaleX : Math.random() + 0.25
  return {
    randX,
    randY,
    randZ,
    randRotX,
    randRotY,
    randRotZ,
    randScaleX,
    randScaleY,
    randScaleZ,
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
  const presentationSize = [canvas.width, canvas.height]
  const primitiveType = 'triangle-list'

  context.configure({
    device,
    format: presentationFormat,
    usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC,
    size: presentationSize,
  })

  // Set up cameras for the demo
  const perspCamera = new PerspectiveCamera(
    (45 * Math.PI) / 180,
    canvas.width / canvas.height,
    0.1,
    100,
  )

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

  //
  // Prepare geometries
  //

  // Prepare fullscreen quad gpu buffers
  const {
    verticesBuffer: quadVertexBuffer,
    uvsBuffer: quadUvBuffer,
    indexBuffer: quadIndexBuffer,
    indices: quadIndices,
  } = generateGPUBuffersFromGeometry(
    device,
    GeometryUtils.createPlane({
      width: innerWidth,
      height: innerHeight,
    }),
  )

  // Prepare cube gpu buffers
  const {
    verticesBuffer: cubeVertexBuffer,
    normalsBuffer: cubeNormalBuffer,
    indexBuffer: cubeIndexBuffer,
    indices: cubeIndices,
  } = generateGPUBuffersFromGeometry(device, GeometryUtils.createBox())

  // Prepare instanced cube model matrices as gpu buffers
  const {
    instanceModelMatrixData: cubeInstanceModelMatrixData,
    instanceNormalMatrixData: cubeInstanceNormalMatrixData,
  } = generateInstanceMatrices(
    INSTANCES_COUNT,
    getRandPositionScaleRotation.bind(null, false),
  )

  const cubeInstanceModelMatrixBuffer = device.createBuffer({
    size: cubeInstanceModelMatrixData.byteLength,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    mappedAtCreation: true,
  })
  new Float32Array(cubeInstanceModelMatrixBuffer.getMappedRange()).set(
    cubeInstanceModelMatrixData,
  )
  cubeInstanceModelMatrixBuffer.unmap()

  const cubeInstanceNormalMatrixBuffer = device.createBuffer({
    size: cubeInstanceNormalMatrixData.byteLength,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    mappedAtCreation: true,
  })
  new Float32Array(cubeInstanceNormalMatrixBuffer.getMappedRange()).set(
    cubeInstanceNormalMatrixData,
  )
  cubeInstanceNormalMatrixBuffer.unmap()

  // Prepare sphere gpu buffers
  const {
    verticesBuffer: sphereVertexBuffer,
    normalsBuffer: sphereNormalBuffer,
    indexBuffer: sphereIndexBuffer,
    indices: sphereIndices,
  } = generateGPUBuffersFromGeometry(device, GeometryUtils.createSphere())

  // Prepare instanced sphere model matrices as gpu buffers
  const {
    instanceModelMatrixData: sphereInstanceModelMatrixData,
    instanceNormalMatrixData: sphereInstanceNormalMatrixData,
  } = generateInstanceMatrices(INSTANCES_COUNT, getRandPositionScaleRotation)

  const sphereInstanceModelMatrixBuffer = device.createBuffer({
    size: sphereInstanceModelMatrixData.byteLength,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    mappedAtCreation: true,
  })
  new Float32Array(sphereInstanceModelMatrixBuffer.getMappedRange()).set(
    sphereInstanceModelMatrixData,
  )
  sphereInstanceModelMatrixBuffer.unmap()

  const sphereInstanceNormalMatrixBuffer = device.createBuffer({
    size: sphereInstanceNormalMatrixData.byteLength,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    mappedAtCreation: true,
  })
  new Float32Array(sphereInstanceNormalMatrixBuffer.getMappedRange()).set(
    sphereInstanceNormalMatrixData,
  )
  sphereInstanceNormalMatrixBuffer.unmap()

  //
  // Set up needed render pipelines for both scenes and fullscreen quad
  //

  // Fullscreen quad pipeline
  const quadPipeline = device.createRenderPipeline({
    vertex: {
      module: device.createShaderModule({
        code: QUAD_VERTEX_SHADER,
      }),
      entryPoint: 'main',
      buffers: [
        // position attribute
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
        // uv attribute
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

  // Instanced meshes pipeline
  const sceneMeshesPipeline = device.createRenderPipeline({
    vertex: {
      module: device.createShaderModule({
        code: INSTANCED_MESH_VERTEX_SHADER,
      }),
      entryPoint: 'main',
      buffers: [
        // position attribute
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
        // normal attribute
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
        // We need to pass the mat4x4<f32> instance world matrix as 4 vec4<f32>() components
        // It will occupy 4 input slots
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
        // We need to pass the mat4x4<f32> instance normal matrix as 4 vec4<f32>() components
        // It will occupy 4 input slots
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
        code: INSTANCED_MESH_FRAGMENT_SHADER,
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

  //
  // Set up all uniform blocks needed for rendering
  //

  // Perspective camera uniform block
  const perspCameraUniformBuffer = device.createBuffer({
    size: 16 * 2 * Float32Array.BYTES_PER_ELEMENT,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  })

  const perspCameraUniformBindGroup = device.createBindGroup({
    layout: sceneMeshesPipeline.getBindGroupLayout(0),
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

  // Fullscreen quad transform uniform block
  const quadTransform = new Transform()

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

  //
  // Set up texture and sampler needed for postprocessing
  //

  // We will copy the frame's rendering results into this texture and
  // sample it on the next frame.
  const postfx0Texture = device.createTexture({
    size: presentationSize,
    format: presentationFormat,
    usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
  })
  const postfx1Texture = device.createTexture({
    size: presentationSize,
    format: presentationFormat,
    usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
  })

  const sampler = device.createSampler({
    magFilter: 'linear',
    minFilter: 'linear',
  })

  // Load cutoff mask transition texture
  const image = new Image()
  image.src = '/webgpu-dojo/dist/assets/transition2.png'
  await image.decode()
  const imageBitmap = await createImageBitmap(image)

  const cutoffMaskTexture = device.createTexture({
    size: [imageBitmap.width, imageBitmap.height, 1],
    format: presentationFormat,
    usage:
      GPUTextureUsage.TEXTURE_BINDING |
      GPUTextureUsage.COPY_DST |
      GPUTextureUsage.RENDER_ATTACHMENT,
  })
  device.queue.copyExternalImageToTexture(
    { source: imageBitmap },
    { texture: cutoffMaskTexture },
    [imageBitmap.width, imageBitmap.height],
  )

  const quadSamplerUniformBindGroup = device.createBindGroup({
    layout: quadPipeline.getBindGroupLayout(2),
    entries: [
      {
        binding: 0,
        resource: sampler,
      },
      {
        binding: 1,
        resource: postfx0Texture.createView(),
      },
      {
        binding: 2,
        resource: postfx1Texture.createView(),
      },
      {
        binding: 3,
        resource: cutoffMaskTexture.createView(),
      },
    ],
  })

  const tweenFactorUniformBuffer = device.createBuffer({
    size: Float32Array.BYTES_PER_ELEMENT,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  })
  const tweenFactor = new Float32Array([OPTIONS.tweenFactor])
  let tweenFactorTarget = OPTIONS.tweenFactor

  const quadTweenUniformBindGroup = device.createBindGroup({
    layout: quadPipeline.getBindGroupLayout(3),
    entries: [
      {
        binding: 0,
        resource: {
          buffer: tweenFactorUniformBuffer,
        },
      },
    ],
  })

  //
  // Set up instanced scenes lighting and basecolor
  //

  // Light position as a typed 32 bit array
  const lightPosition = new Float32Array([0.5, 0.5, 0.5])

  const lightingUniformBuffer = device.createBuffer({
    size: 4 * Float32Array.BYTES_PER_ELEMENT,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  })

  const lightingUniformBindGroup = device.createBindGroup({
    layout: sceneMeshesPipeline.getBindGroupLayout(1),
    entries: [
      {
        binding: 0,
        resource: {
          buffer: lightingUniformBuffer,
          offset: 0,
          size: 4 * Float32Array.BYTES_PER_ELEMENT,
        },
      },
    ],
  })

  // Basecolor0
  const baseColor0UniformBuffer = device.createBuffer({
    size: 4 * Float32Array.BYTES_PER_ELEMENT,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  })

  const baseColor0UniformBindGroup = device.createBindGroup({
    layout: sceneMeshesPipeline.getBindGroupLayout(2),
    entries: [
      {
        binding: 0,
        resource: {
          buffer: baseColor0UniformBuffer,
          offset: 0,
          size: 4 * Float32Array.BYTES_PER_ELEMENT,
        },
      },
    ],
  })
  device.queue.writeBuffer(
    baseColor0UniformBuffer,
    0,
    new Float32Array([0.3, 0.6, 0.7]),
  )

  // Basecolor1
  const baseColor1UniformBuffer = device.createBuffer({
    size: 4 * Float32Array.BYTES_PER_ELEMENT,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  })

  const baseColor1UniformBindGroup = device.createBindGroup({
    layout: sceneMeshesPipeline.getBindGroupLayout(2),
    entries: [
      {
        binding: 0,
        resource: {
          buffer: baseColor1UniformBuffer,
          offset: 0,
          size: 4 * Float32Array.BYTES_PER_ELEMENT,
        },
      },
    ],
  })
  device.queue.writeBuffer(
    baseColor1UniformBuffer,
    0,
    new Float32Array([1, 0.2, 0.25]),
  )

  // Pass light position to gpu
  device.queue.writeBuffer(lightingUniformBuffer, 0, lightPosition)

  const textureDepth = device.createTexture({
    size: [canvas.width, canvas.height, 1],
    format: 'depth24plus',
    usage: GPUTextureUsage.RENDER_ATTACHMENT,
  })

  // Instanced scene render pass descriptor
  const sceneRenderPassDescriptor: GPURenderPassDescriptor = {
    colorAttachments: [
      {
        view: null,
        loadValue: null,
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
  }

  setTimeout(() => {
    tweenFactorTarget = tweenFactorTarget === 1 ? 0 : 1
  }, 100)

  setInterval(() => {
    if (OPTIONS.animatable) {
      tweenFactorTarget = tweenFactorTarget === 1 ? 0 : 1
    }
  }, 4000)

  requestAnimationFrame(drawFrame)

  function drawFrame(ts) {
    requestAnimationFrame(drawFrame)

    ts /= 1000
    const dt = ts - oldTime
    oldTime = ts

    const swapChainTexture = context.getCurrentTexture()
    const commandEncoder = device.createCommandEncoder()

    sceneRenderPassDescriptor.colorAttachments[0].view =
      swapChainTexture.createView()
    sceneRenderPassDescriptor.colorAttachments[0].loadValue = [
      0.1, 0.1, 0.1, 1.0,
    ]
    const renderPass = commandEncoder.beginRenderPass(sceneRenderPassDescriptor)

    // Write perspective camera projection and view matrix to uniform block
    perspCamera.setPosition({
      x: Math.cos(ts * 0.2) * WORLD_SIZE_X,
      y: 0,
      z: Math.sin(ts * 0.2) * WORLD_SIZE_Z,
    })
    perspCamera.lookAt([0, 0, 0])
    perspCamera.updateProjectionMatrix()
    perspCamera.updateViewMatrix()

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

    // Write ortho camera projection and view matrix to uniform block
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

    // Write fullscreen quad model matrix to uniform block
    quadTransform.setRotation({ x: Math.PI }).updateModelMatrix()
    device.queue.writeBuffer(
      quadTransformUniformBuffer,
      0,
      quadTransform.modelMatrix as ArrayBuffer,
    )

    //
    // Render time
    //

    // Render instanced cubes scene to default swapchainTexture

    renderPass.setPipeline(sceneMeshesPipeline)

    renderPass.setBindGroup(0, perspCameraUniformBindGroup)
    renderPass.setBindGroup(1, lightingUniformBindGroup)
    renderPass.setBindGroup(2, baseColor0UniformBindGroup)
    renderPass.setVertexBuffer(0, cubeVertexBuffer)
    renderPass.setVertexBuffer(1, cubeNormalBuffer)
    renderPass.setVertexBuffer(2, cubeInstanceModelMatrixBuffer)
    renderPass.setVertexBuffer(3, cubeInstanceNormalMatrixBuffer)
    renderPass.setIndexBuffer(
      cubeIndexBuffer,
      cubeIndices instanceof Uint16Array ? 'uint16' : 'uint32',
    )

    // Use basecolo0 as baseColor for cubes
    // device.queue.writeBuffer(lightingUniformBuffer, 0, baseColor0)

    renderPass.drawIndexed(cubeIndices.length, INSTANCES_COUNT)
    renderPass.endPass()

    // Copy swapchainTexture to another texture that will be outputted on the fullscreen quad
    commandEncoder.copyTextureToTexture(
      {
        texture: swapChainTexture,
      },
      {
        texture: postfx0Texture,
      },
      presentationSize,
    )

    sceneRenderPassDescriptor.colorAttachments[0].loadValue = [
      0.225, 0.225, 0.225, 1.0,
    ]
    const renderPass0 = commandEncoder.beginRenderPass(
      sceneRenderPassDescriptor,
    )

    renderPass0.setPipeline(sceneMeshesPipeline)

    renderPass0.setBindGroup(0, perspCameraUniformBindGroup)
    renderPass0.setBindGroup(1, lightingUniformBindGroup)
    renderPass0.setBindGroup(2, baseColor1UniformBindGroup)
    renderPass0.setVertexBuffer(0, sphereVertexBuffer)
    renderPass0.setVertexBuffer(1, sphereNormalBuffer)
    renderPass0.setVertexBuffer(2, sphereInstanceModelMatrixBuffer)
    renderPass0.setVertexBuffer(3, sphereInstanceNormalMatrixBuffer)
    renderPass0.setIndexBuffer(
      sphereIndexBuffer,
      sphereIndices instanceof Uint16Array ? 'uint16' : 'uint32',
    )

    // Use basecolo1 as baseColor for spheres
    // device.queue.writeBuffer(lightingUniformBuffer, 0, baseColor1)

    renderPass0.drawIndexed(sphereIndices.length, INSTANCES_COUNT)
    renderPass0.endPass()

    commandEncoder.copyTextureToTexture(
      {
        texture: swapChainTexture,
      },
      {
        texture: postfx1Texture,
      },
      presentationSize,
    )

    // Render postfx fullscreen quad to screen
    const postfxPass = commandEncoder.beginRenderPass({
      colorAttachments: [
        {
          view: swapChainTexture.createView(),
          loadValue: [0.1, 0.1, 0.1, 1.0],
          storeOp: 'store',
        },
      ],
    })

    if (OPTIONS.animatable) {
      OPTIONS.tweenFactor += (tweenFactorTarget - tweenFactor[0]) * (dt * 2)
    }
    tweenFactor[0] = OPTIONS.tweenFactor

    device.queue.writeBuffer(tweenFactorUniformBuffer, 0, tweenFactor)

    postfxPass.setPipeline(quadPipeline)
    postfxPass.setBindGroup(0, orthoCameraUniformBindGroup)
    postfxPass.setBindGroup(1, quadTransformUniformBindGroup)
    postfxPass.setBindGroup(2, quadSamplerUniformBindGroup)
    postfxPass.setBindGroup(3, quadTweenUniformBindGroup)
    postfxPass.setVertexBuffer(0, quadVertexBuffer)
    postfxPass.setVertexBuffer(1, quadUvBuffer)
    postfxPass.setIndexBuffer(
      quadIndexBuffer,
      quadIndices instanceof Uint16Array ? 'uint16' : 'uint32',
    )
    postfxPass.drawIndexed(quadIndices.length)
    postfxPass.endPass()

    device.queue.submit([commandEncoder.finish()])
  }
})()
