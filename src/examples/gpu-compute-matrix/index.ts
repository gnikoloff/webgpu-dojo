import { OrthographicCamera } from '../../lib/hwoa-rang-gpu'

import { testForWebGPUSupport } from '../shared/test-for-webgpu-support'

import '../index.css'
import { Transform } from '../../lib/hwoa-rang-gpu/src'

const BALLS_COUNT = 100
const LINES_COUNT = 10
const PARTICLE_RADIUS = 100
const LINE_PADDING_Y = innerHeight * 0.1
const LINE_STEP_Y = (innerHeight - LINE_PADDING_Y * 2) / LINES_COUNT
const LINES_DATA = new Array(LINES_COUNT).fill(null).map((_, i) => {
  const width = 200
  const x = innerWidth / 2 + (i % 2 === 0 ? -200 : 200)
  const y = LINE_PADDING_Y + i * LINE_STEP_Y
  const rotation = i % 2 === 0 ? Math.PI / 6 : -Math.PI / 6
  // const x = 400
  // const y = innerHeight / 2
  // const rotation = 0
  const transform = new Transform()
    .setRotation({ z: rotation })
    .setPosition({ x, y })
    .updateModelMatrix()
  return {
    x,
    y,
    width,
    rotation,
    transform,
  }
})

testForWebGPUSupport()
;(async () => {
  let oldTime = 0

  const canvas = document.getElementById('gpu-c') as HTMLCanvasElement
  canvas.width = innerWidth * devicePixelRatio
  canvas.height = innerHeight * devicePixelRatio
  canvas.style.setProperty('width', `${innerWidth}px`)
  canvas.style.setProperty('height', `${innerHeight}px`)

  const adapter = await navigator.gpu?.requestAdapter()
  const device = await adapter?.requestDevice()
  const context = canvas.getContext('webgpu')
  const presentationFormat = context.getPreferredFormat(adapter)

  const orthoCamera = new OrthographicCamera(
    0,
    innerWidth,
    0,
    innerHeight,
    -2,
    3,
  )
    .setPosition({ z: 2 })
    .lookAt([0, 0, 0])
    .updateViewMatrix()
    .updateProjectionMatrix()

  context.configure({
    device,
    format: presentationFormat,
  })

  const transformBufferUBO = device.createBuffer({
    size: 2 * 16 * Float32Array.BYTES_PER_ELEMENT,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  })

  // Horizontal bounce off lines
  const lines = []
  for (let i = 0; i < LINES_COUNT; i++) {
    const buffer = device.createBuffer({
      size: 4 * Float32Array.BYTES_PER_ELEMENT,
      usage: GPUBufferUsage.VERTEX,
      mappedAtCreation: true,
    })
    new Float32Array(buffer.getMappedRange()).set([
      -LINES_DATA[i].width / 2,
      0,
      LINES_DATA[i].width / 2,
      0,
    ])
    buffer.unmap()

    const transform = LINES_DATA[i].transform

    const pipeline = device.createRenderPipeline({
      primitive: {
        topology: 'line-list',
      },
      vertex: {
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
        ],
        module: device.createShaderModule({
          code: `
            [[block]] struct Camera {
              projectionMatrix: mat4x4<f32>;
              viewMatrix: mat4x4<f32>;
            };

            [[group(0), binding(0)]] var<uniform> camera: Camera;

            [[block]] struct Transform {
              modelMatrix: mat4x4<f32>;
            };

            [[group(0), binding(1)]] var<uniform> transform: Transform;

            struct Input {
              [[location(0)]] position: vec4<f32>;
            };

            struct Output {
              [[builtin(position)]] position : vec4<f32>;
            };

            [[stage(vertex)]]
            fn main (input: Input) -> Output {
              var output: Output;
              
              output.position = camera.projectionMatrix *
                                camera.viewMatrix *
                                transform.modelMatrix *
                                input.position;

              return output;
            }
          `,
        }),
        entryPoint: 'main',
      },
      fragment: {
        module: device.createShaderModule({
          code: `
            [[stage(fragment)]]

            fn main () -> [[location(0)]] vec4<f32> {
              return vec4<f32>(1.0);
            }
          `,
        }),
        entryPoint: 'main',
        targets: [{ format: presentationFormat }],
      },
    })

    const modelTransformBuffer = device.createBuffer({
      size: 16 * Float32Array.BYTES_PER_ELEMENT,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    })

    const lineTransformUBO = device.createBindGroup({
      layout: pipeline.getBindGroupLayout(0),
      entries: [
        {
          binding: 0,
          resource: {
            size: 16 * 2 * Float32Array.BYTES_PER_ELEMENT,
            buffer: transformBufferUBO,
            offset: 0,
          },
        },
        {
          binding: 1,
          resource: {
            size: 16 * Float32Array.BYTES_PER_ELEMENT,
            buffer: modelTransformBuffer,
            offset: 0,
          },
        },
      ],
    })

    lines.push({
      lineTransformUBO,
      pipeline,
      transform,
      modelTransformBuffer,
      buffer,
    })
  }

  // Update compute matrix for particles physics
  const ballsDataStride = 8
  const ballsBuffer = device.createBuffer({
    size: BALLS_COUNT * ballsDataStride * Float32Array.BYTES_PER_ELEMENT,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.STORAGE,
    mappedAtCreation: true,
  })

  const ballsData = new Float32Array(ballsBuffer.getMappedRange())
  for (let i = 0; i < BALLS_COUNT; i++) {
    // position
    ballsData[i * ballsDataStride + 0] = Math.random() * innerWidth
    ballsData[i * ballsDataStride + 1] = 1
    // velocity
    ballsData[i * ballsDataStride + 2] = (Math.random() * 2 - 1) * 400
    ballsData[i * ballsDataStride + 3] = Math.random() * 4
    // radius
    ballsData[i * ballsDataStride + 4] = PARTICLE_RADIUS
    // color rgb
    ballsData[i * ballsDataStride + 5] = Math.random()
    ballsData[i * ballsDataStride + 6] = Math.random()
    ballsData[i * ballsDataStride + 7] = Math.random()
  }
  ballsBuffer.unmap()

  // const ballsDataStride = 8
  // const ballsBuffer = device.createBuffer({
  //   size: BALLS_COUNT * ballsDataStride * Float32Array.BYTES_PER_ELEMENT,
  //   usage: GPUBufferUsage.VERTEX | GPUBufferUsage.STORAGE,
  //   mappedAtCreation: true,
  // })

  const linesDataStride = 4
  const linesBuffer = device.createBuffer({
    size: LINES_COUNT * linesDataStride * Float32Array.BYTES_PER_ELEMENT,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.STORAGE,
    mappedAtCreation: true,
  })
  const linesData = new Float32Array(linesBuffer.getMappedRange())
  for (let i = 0; i < LINES_COUNT; i++) {
    linesData[i * linesDataStride + 0] = LINES_DATA[i].x
    linesData[i * linesDataStride + 1] = LINES_DATA[i].y
    linesData[i * linesDataStride + 2] = LINES_DATA[i].width
    linesData[i * linesDataStride + 3] = LINES_DATA[i].rotation
  }
  linesBuffer.unmap()

  const ballsUpdateUniforms = device.createBuffer({
    size: 3 * Float32Array.BYTES_PER_ELEMENT,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  })

  const ballsUniformsArr = new Float32Array([canvas.width, canvas.height, 0])
  device.queue.writeBuffer(ballsUpdateUniforms, 0, ballsUniformsArr)

  const ballsUpdatePipeline = device.createComputePipeline({
    compute: {
      module: device.createShaderModule({
        code: `
          struct BallData {
            position: vec2<f32>;
            velocity: vec2<f32>;
            radius: f32;
          };

          [[block]] struct BallsBuffer {
            balls: [[stride(32)]] array<BallData>;
          };
          
          [[group(0), binding(0)]] var<storage, read_write> ballsBuffer: BallsBuffer;

          struct LineData {
            pos: vec2<f32>;
            width: f32;
            rotation: f32;
          };

          [[block]] struct LinesBuffer {
            lines: [[stride(16)]] array<LineData>;
          };

          [[group(0), binding(1)]] var<storage, read_write> linesBuffer: LinesBuffer;

          [[block]] struct Uniforms {
            canvasSize: vec2<f32>;
            deltaTime: f32;
          };

          [[group(0), binding(2)]] var<uniform> uniforms : Uniforms;

          [[stage(compute), workgroup_size(64, 1, 1)]]
          fn main([[builtin(global_invocation_id)]] GlobalInvocationID : vec3<u32>) {
            let index = GlobalInvocationID.x;

            let canvasWidth = uniforms.canvasSize.x * 2.0;
            let canvasHeight = uniforms.canvasSize.y * 2.0;
            
            let ballRadius = ballsBuffer.balls[index].radius;
            let vx = ballsBuffer.balls[index].velocity.x;
            let vy = ballsBuffer.balls[index].velocity.y;

            ballsBuffer.balls[index].velocity.y = vy + 2.0;
            ballsBuffer.balls[index].position.x = ballsBuffer.balls[index].position.x + ballsBuffer.balls[index].velocity.x * uniforms.deltaTime;
            ballsBuffer.balls[index].position.y = ballsBuffer.balls[index].position.y + ballsBuffer.balls[index].velocity.y * uniforms.deltaTime;
            
            // Handle screen viewport
            if (ballsBuffer.balls[index].position.x + ballRadius * 0.5 > canvasWidth) {
              ballsBuffer.balls[index].position.x = canvasWidth - ballRadius * 0.5;
              ballsBuffer.balls[index].velocity.x = vx * -1.0;
            } elseif (ballsBuffer.balls[index].position.x - ballRadius * 0.5 < 0.0) {
              ballsBuffer.balls[index].position.x = ballRadius * 0.5;
              ballsBuffer.balls[index].velocity.x = vx * -1.0;
            }
            if (ballsBuffer.balls[index].position.y + ballRadius * 0.5 > canvasHeight) {
              ballsBuffer.balls[index].position.y = 0.0;
            } 

            for (var i: u32 = 0u; i < arrayLength(&linesBuffer.lines); i = i + 1u) {
              let lineRotation = linesBuffer.lines[i].rotation;
              let lineX = linesBuffer.lines[i].pos.x * 2.0;
              let lineY = linesBuffer.lines[i].pos.y * 2.0;
              let lineWidth = linesBuffer.lines[i].width;
              let lineCos = cos(lineRotation);
              let lineSin = sin(lineRotation);
              for (var n: u32 = 0u; n < arrayLength(&ballsBuffer.balls); n = n + 1u) {
                if (
                  ballsBuffer.balls[n].position.x + ballRadius * 0.5 >= lineX - lineWidth * 0.5 &&
                  ballsBuffer.balls[n].position.x - ballRadius * 0.5 <= lineX + lineWidth * 0.5
                ) {
                  var x = ballsBuffer.balls[n].position.x - lineX;
                  var y = ballsBuffer.balls[n].position.y - lineY;

                  let vx1 = lineCos * vx + lineSin * vy;
                  var vy1 = lineCos * vy - lineSin * vx;

                  var y1 = lineCos * y - lineSin * x;

                  if (y1 > -ballRadius * 0.5 && y1 < vy1) {
                    let x2 = lineCos * x + lineSin * y;

                    y1 = -ballRadius;
                    vy1 = vy1 * -0.35;
                    
                    x = lineCos * x2 - lineSin * y1;
                    y = lineCos * y1 + lineSin * x2; 
                    
                    ballsBuffer.balls[n].velocity.x = lineCos * vx1 - lineSin * vy1;
                    ballsBuffer.balls[n].velocity.y = lineCos * vy1 + lineSin * vx1;
                    
                    ballsBuffer.balls[n].position.x = lineX + x;
                    ballsBuffer.balls[n].position.y = lineY + y;
                  }
                }
              }
            }

            // // Handle lines collision
            // for (var n: u32 = 0u; n < arrayLength(&linesBuffer.lines); n = n + 1u) {
              

              
            // }

          }
        `,
      }),
      entryPoint: 'main',
    },
  })

  const ballsUpdateBindGroup = device.createBindGroup({
    layout: ballsUpdatePipeline.getBindGroupLayout(0),
    entries: [
      {
        binding: 0,
        resource: {
          buffer: ballsBuffer,
        },
      },
      {
        binding: 1,
        resource: {
          buffer: linesBuffer,
        },
      },
      {
        binding: 2,
        resource: {
          buffer: ballsUpdateUniforms,
        },
      },
    ],
  })

  // Drawing program
  const vertexBuffer = device.createBuffer({
    usage: GPUBufferUsage.VERTEX,
    size: 8 * Float32Array.BYTES_PER_ELEMENT,
    mappedAtCreation: true,
  })
  const particleRadius = 1
  // prettier-ignore
  new Float32Array(vertexBuffer.getMappedRange()).set([
    -particleRadius / 2, -particleRadius / 2,
     particleRadius / 2, -particleRadius / 2,
     particleRadius / 2,  particleRadius / 2,
    -particleRadius / 2,  particleRadius / 2,
  ])
  vertexBuffer.unmap()

  const indexBuffer = device.createBuffer({
    size: 6 * Uint16Array.BYTES_PER_ELEMENT,
    usage: GPUBufferUsage.INDEX,
    mappedAtCreation: true,
  })
  new Uint16Array(indexBuffer.getMappedRange()).set([0, 1, 3, 3, 1, 2])
  indexBuffer.unmap()

  const ballsDrawPipeline = device.createRenderPipeline({
    vertex: {
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
          arrayStride: ballsDataStride * Float32Array.BYTES_PER_ELEMENT,
          attributes: [
            {
              shaderLocation: 1,
              format: 'float32x2',
              offset: 0,
            },
            {
              shaderLocation: 2,
              format: 'float32',
              offset: 4 * Float32Array.BYTES_PER_ELEMENT,
            },
            {
              shaderLocation: 3,
              format: 'float32x3',
              offset: 5 * Float32Array.BYTES_PER_ELEMENT,
            },
          ],
          stepMode: 'instance',
        },
      ],
      module: device.createShaderModule({
        code: `
          [[block]] struct Transform {
            projectionMatrix: mat4x4<f32>;
            viewMatrix: mat4x4<f32>;
          };

          [[group(0), binding(0)]] var<uniform> transform: Transform;

          struct Input {
            [[location(0)]] position: vec4<f32>;
            [[location(1)]] instancePosition: vec4<f32>;
            [[location(2)]] scaleFactor: f32;
            [[location(3)]] color: vec3<f32>;
          };

          struct Output {
            [[builtin(position)]] Position : vec4<f32>;
            [[location(0)]] color : vec4<f32>;
          };

          [[stage(vertex)]]
          fn main (input: Input) -> Output {
            var output: Output;

            let scaleMatrix = mat4x4<f32>(
              vec4<f32>(input.scaleFactor,  0.0,                0.0,               0.0),
              vec4<f32>(0.0,                input.scaleFactor,  0.0,               0.0),
              vec4<f32>(0.0,                0.0,                input.scaleFactor, 0.0),
              vec4<f32>(0.0,                0.0,                0.0,               1.0)
            );
            
            let transformedPos = scaleMatrix * input.position + input.instancePosition;
            // let transformedPos = input.position + input.instancePosition;

            output.Position = transform.projectionMatrix * 
                              transform.viewMatrix *
                              transformedPos;
            
            output.color = vec4<f32>(input.color, 1.0);

            return output;
          }
        `,
      }),
      entryPoint: 'main',
    },
    fragment: {
      module: device.createShaderModule({
        code: `
          struct Input {
            [[location(0)]] color: vec4<f32>;
          };

          [[stage(fragment)]]

          fn main (input: Input) -> [[location(0)]] vec4<f32> {
            return input.color;
          }
        `,
      }),
      entryPoint: 'main',
      targets: [{ format: presentationFormat }],
    },
  })

  const transformsBindGroup = device.createBindGroup({
    layout: ballsDrawPipeline.getBindGroupLayout(0),
    entries: [
      {
        binding: 0,
        resource: {
          size: 16 * 2 * Float32Array.BYTES_PER_ELEMENT,
          buffer: transformBufferUBO,
          offset: 0,
        },
      },
    ],
  })

  requestAnimationFrame(updateFrame)

  function updateFrame(ts) {
    ts /= 1000
    const dt = ts - oldTime
    oldTime = ts

    requestAnimationFrame(updateFrame)

    const commandEncoder = device.createCommandEncoder()

    const computePass = commandEncoder.beginComputePass()
    computePass.setPipeline(ballsUpdatePipeline)
    computePass.setBindGroup(0, ballsUpdateBindGroup)
    computePass.dispatch(Math.ceil(BALLS_COUNT / 64))
    computePass.endPass()

    const renderPass = commandEncoder.beginRenderPass({
      colorAttachments: [
        {
          view: context.getCurrentTexture().createView(),
          loadValue: [0.1, 0.1, 0.1, 1.0],
          storeOp: 'store',
        },
      ],
    })

    device.queue.writeBuffer(
      transformBufferUBO,
      0,
      orthoCamera.projectionMatrix as ArrayBuffer,
    )
    device.queue.writeBuffer(
      transformBufferUBO,
      16 * Float32Array.BYTES_PER_ELEMENT,
      orthoCamera.viewMatrix as ArrayBuffer,
    )

    ballsUniformsArr[2] = dt
    device.queue.writeBuffer(ballsUpdateUniforms, 0, ballsUniformsArr)

    renderPass.setPipeline(ballsDrawPipeline)
    renderPass.setBindGroup(0, transformsBindGroup)
    renderPass.setVertexBuffer(0, vertexBuffer)
    renderPass.setVertexBuffer(1, ballsBuffer)
    renderPass.setIndexBuffer(indexBuffer, 'uint16')
    renderPass.drawIndexed(6, BALLS_COUNT)

    lines.forEach(
      ({
        lineTransformUBO,
        pipeline,
        buffer,
        transform,
        modelTransformBuffer,
      }) => {
        device.queue.writeBuffer(
          modelTransformBuffer,
          0,
          transform.modelMatrix as ArrayBuffer,
        )

        renderPass.setPipeline(pipeline)
        renderPass.setBindGroup(0, lineTransformUBO)
        renderPass.setVertexBuffer(0, buffer)
        renderPass.draw(2)
      },
    )

    renderPass.endPass()

    device.queue.submit([commandEncoder.finish()])
  }
})()
