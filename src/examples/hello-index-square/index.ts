import {
  Geometry,
  IndexBuffer,
  Mesh,
  OrthographicCamera,
  VertexBuffer,
} from '../../lib/hwoa-rang-gpu'

import { testForWebGPUSupport } from '../shared/test-for-webgpu-support'

import '../index.css'

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
    .setPosition({ x: 0, y: 0, z: 2 })
    .lookAt([0, 0, 0])
    .updateProjectionMatrix()
    .updateViewMatrix()

  // vertex positions & colors buffer
  const planeWidth = 480
  const planeHeight = 480
  // prettier-ignore
  const vertexData = new Float32Array([
    // position                           // color
    -planeWidth / 2, -planeHeight / 2,    1.0, 0.0, 0.0, // index 0
     planeWidth / 2, -planeHeight / 2,    0.0, 1.0, 0.0, // index 1
     planeWidth / 2,  planeHeight / 2,    0.0, 0.0, 1.0, // index 2
    -planeWidth / 2,  planeHeight / 2,    1.0, 1.0, 0.0, // index 3
  ])

  const vertexBuffer = new VertexBuffer(
    device,
    0,
    vertexData,
    5 * Float32Array.BYTES_PER_ELEMENT,
  )
    .addAttribute(
      'position',
      0,
      2 * Float32Array.BYTES_PER_ELEMENT,
      'float32x2',
    )
    .addAttribute(
      'color',
      2 * Float32Array.BYTES_PER_ELEMENT,
      3 * Float32Array.BYTES_PER_ELEMENT,
      'float32x3',
    )

  const indexBuffer = new IndexBuffer(
    device,
    new Uint16Array([0, 1, 3, 3, 1, 2]),
  )

  const geometry = new Geometry(device)
    .addIndexBuffer(indexBuffer)
    .addVertexBuffer(vertexBuffer)

  const mesh = new Mesh(device, {
    geometry,
    vertexShaderSource: {
      main: `
        output.Position = transform.projectionMatrix *
                          transform.viewMatrix *
                          transform.modelMatrix *
                          vec4<f32>(input.position, 0.0, 1.0);
                    
        output.color = input.color;
      `,
    },
    fragmentShaderSource: {
      main: `
        output.Color = vec4<f32>(input.color.rgb, 1.0);
      `,
    },
    depthStencil: null,
    primitiveType,
  })
    .setPosition({ x: canvas.width / 2, y: canvas.height / 2, z: 0 })
    .updateModelMatrix()

  requestAnimationFrame(drawFrame)

  function drawFrame(ts) {
    ts /= 1000
    requestAnimationFrame(drawFrame)

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

    mesh.render(renderPass, orthoCamera)

    renderPass.endPass()
    device.queue.submit([commandEncoder.finish()])
  }
})()
