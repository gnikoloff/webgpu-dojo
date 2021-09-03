import '../index.css'

const VERTEX_SHADER = `
  struct Input {
    [[location(0)]] position: vec4<f32>;
    [[location(1)]] color: vec3<f32>;
  };

  struct Output {
    [[builtin(position)]] Position : vec4<f32>;
    [[location(0)]] vColor: vec3<f32>;
  };

  [[stage(vertex)]]

  fn main (input: Input) -> Output {
    var output: Output;
    output.Position = input.position;
    output.vColor = input.color;
    return output;
  }
`

const FRAGMENT_SHADER = `
  struct Input {
    [[location(0)]] vColor: vec3<f32>;
  };

  [[stage(fragment)]]

  fn main (input: Input) -> [[location(0)]] vec4<f32> {
    return vec4<f32>(input.vColor, 1.0);
  }
`

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

  // vertex positions & colors buffer
  // prettier-ignore
  const vertexData = new Float32Array([
    // position     // color
    -0.5, -0.5,     1.0, 0.0, 0.0, // index 0
     0.5, -0.5,     0.0, 1.0, 0.0, // index 1
     0.5,  0.5,     0.0, 0.0, 1.0, // index 2
    -0.5,  0.5,     1.0, 1.0, 0.0, // index 3
  ])
  const vertexBuffer = device.createBuffer({
    size: vertexData.byteLength,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    mappedAtCreation: true,
  })
  new Float32Array(vertexBuffer.getMappedRange()).set(vertexData)
  vertexBuffer.unmap()

  // vertex indices buffer
  const indexData = new Uint32Array([0, 1, 3, 3, 1, 2])
  const indexBuffer = device.createBuffer({
    size: indexData.byteLength,
    usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
    mappedAtCreation: true,
  })
  new Uint32Array(indexBuffer.getMappedRange()).set(indexData)
  indexBuffer.unmap()

  const pipeline = device.createRenderPipeline({
    vertex: {
      module: device.createShaderModule({
        code: VERTEX_SHADER,
      }),
      entryPoint: 'main',
      buffers: [
        {
          arrayStride: (2 + 3) * Float32Array.BYTES_PER_ELEMENT,
          attributes: [
            {
              shaderLocation: 0,
              format: 'float32x2',
              offset: 0,
            },
            {
              shaderLocation: 1,
              format: 'float32x3',
              offset: 2 * Float32Array.BYTES_PER_ELEMENT,
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
  renderPass.setIndexBuffer(indexBuffer, 'uint32')
  renderPass.drawIndexed(6)
  renderPass.endPass()
  device.queue.submit([commandEncoder.finish()])
})()
