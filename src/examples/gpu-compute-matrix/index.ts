import { OrthographicCamera } from '../../lib/hwoa-rang-gpu'

import { testForWebGPUSupport } from '../shared/test-for-webgpu-support'

import '../index.css'
import { Transform } from '../../lib/hwoa-rang-gpu/src'

const BALLS_COUNT = 100000

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
    ballsData[i * ballsDataStride + 0] = Math.random() * innerWidth * 2
    ballsData[i * ballsDataStride + 1] = Math.random() * innerHeight * 2
    // velocity
    ballsData[i * ballsDataStride + 2] = (Math.random() * 2 - 1) * 400
    ballsData[i * ballsDataStride + 3] = (Math.random() * 2 - 1) * 400
    // radius
    ballsData[i * ballsDataStride + 4] = 3 + Math.random()
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

  const ballsUpdateUniforms = device.createBuffer({
    size: 12 * Float32Array.BYTES_PER_ELEMENT,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  })

  const ballsUniformsArr = new Float32Array([
    // ubo size
    canvas.width,
    canvas.height,
    // ubo deltaFrame
    0,
    // ubo bounceFactor
    0.6,
    // ubo gravity left
    (Math.random() * 2 - 1) * 4,
    (Math.random() * 2 - 1) * 4,
    (Math.random() * 2 - 1) * 4,
    (Math.random() * 2 - 1) * 4,
    // ubo gravity right
    (Math.random() * 2 - 1) * 4,
    (Math.random() * 2 - 1) * 4,
    (Math.random() * 2 - 1) * 4,
    (Math.random() * 2 - 1) * 4,
  ])
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

          [[block]] struct Uniforms {
            canvasSize: vec2<f32>;
            deltaTime: f32;
            bounceFactor: f32;
            gravityLeft: vec4<f32>;
            gravityRight: vec4<f32>;
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

            if (ballsBuffer.balls[index].position.x < canvasWidth * 0.5) {
              if (ballsBuffer.balls[index].position.y > canvasHeight * 0.5) {
                ballsBuffer.balls[index].velocity.x = vx + uniforms.gravityLeft.x;
                ballsBuffer.balls[index].velocity.y = vy + uniforms.gravityLeft.y;
              } else {
                ballsBuffer.balls[index].velocity.x = vx + uniforms.gravityLeft.z;
                ballsBuffer.balls[index].velocity.y = vy + uniforms.gravityLeft.w;
              }
            } else {
              if (ballsBuffer.balls[index].position.y > canvasHeight * 0.5) {
                ballsBuffer.balls[index].velocity.x = vx + uniforms.gravityRight.x;
                ballsBuffer.balls[index].velocity.y = vy + uniforms.gravityRight.y;
              } else {
                ballsBuffer.balls[index].velocity.x = vx + uniforms.gravityRight.z;
                ballsBuffer.balls[index].velocity.y = vy + uniforms.gravityRight.w;
              }
            }

            ballsBuffer.balls[index].position.x = ballsBuffer.balls[index].position.x + ballsBuffer.balls[index].velocity.x * uniforms.deltaTime;
            ballsBuffer.balls[index].position.y = ballsBuffer.balls[index].position.y + ballsBuffer.balls[index].velocity.y * uniforms.deltaTime;
            
            // Handle screen viewport
            if (ballsBuffer.balls[index].position.x + ballRadius * 0.5 > canvasWidth) {
              ballsBuffer.balls[index].position.x = canvasWidth - ballRadius * 0.5;
              ballsBuffer.balls[index].velocity.x = vx * -uniforms.bounceFactor;
            } elseif (ballsBuffer.balls[index].position.x - ballRadius * 0.5 < 0.0) {
              ballsBuffer.balls[index].position.x = ballRadius * 0.5;
              ballsBuffer.balls[index].velocity.x = vx * -uniforms.bounceFactor;
            }

            if (ballsBuffer.balls[index].position.y + ballRadius * 0.5 > canvasHeight) {
              ballsBuffer.balls[index].position.y = canvasHeight - ballRadius * 0.5;
              ballsBuffer.balls[index].velocity.y = vy * -uniforms.bounceFactor;
            } elseif (ballsBuffer.balls[index].position.y - ballRadius * 0.5 < 0.0) {
              ballsBuffer.balls[index].position.y = ballRadius * 0.5;
              ballsBuffer.balls[index].velocity.y = vy * -uniforms.bounceFactor;
            }
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

  setInterval(() => {
    for (let i = 4; i < 12; i++) {
      ballsUniformsArr[i] = (Math.random() * 2 - 1) * 4
    }
  }, 1500)

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

    renderPass.endPass()

    device.queue.submit([commandEncoder.finish()])
  }
})()
