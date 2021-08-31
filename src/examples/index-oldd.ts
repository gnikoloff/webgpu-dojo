// @ts-nocheck

import glslangModule from '@webgpu/glslang/dist/web-devel-onefile/glslang'

import './index.css'

// const VERTEX_SHADER = `
//   struct Output {
//     [[builtin(position)]] Position : vec4<f32>;
//     [[location(0)]] vColor : vec4<f32>;
//   };

//   [[stage(vertex)]]

//   fn main ([[builtin(vertex_index)]] VertexIndex: u32) -> Output {
//     var pos = array<vec2<f32>, 3>(
//       vec2<f32>(0.0, 0.5),
//       vec2<f32>(-0.5, -0.5),
//       vec2<f32>(0.5, -0.5),
//     );

//     var colors = array<vec3<f32>, 3>(
//       vec3<f32>(1.0, 0.0, 0.0),
//       vec3<f32>(0.0, 1.0, 0.0),
//       vec3<f32>(0.0, 0.0, 1.0)
//     );

//     var output: Output;

//     output.Position = vec4<f32>(pos[VertexIndex], 0.0, 1.0);
//     output.vColor = vec4<f32>(colors[VertexIndex], 1.0);
//     return output;
//   }
// `

// const FRAGMENT_SHADER = `
//   [[stage(fragment)]]
//   fn main ([[location(0)]] vColor: vec4<f32>) -> [[location(0)]] vec4<f32> {
//     return vColor;
//   }
// `

const VERTEX_SHADER = `
  #version 450
  const vec2 positions[3] = vec2[3](
    vec2(0.0f, 0.5f),
    vec2(-0.5f, -0.5f),
    vec2(0.5f, -0.5f)
  );
  const vec3 colors[3] = vec3[3](
    vec3(1.0f, 0.0f, 0.0f),
    vec3(0.0f, 1.0f, 0.0f),
    vec3(0.0f, 0.0f, 1.0f)
  );
  layout(location = 0) out vec4 vColor;

  void main () {
    gl_Position = vec4(positions[gl_VertexIndex], 0.0f, 1.0f);
    vColor = vec4(colors[gl_VertexIndex], 1.0f);
  }
`

const FRAGMENT_SHADER = `
  #version 450
  layout(location = 0) in vec4 vColor;
  layout(location = 0) out vec4 fragColor;
  void main () {
    fragColor = vColor;
  }
`

;(async () => {
  const canvas = document.getElementById('canvas-webgpu') as HTMLCanvasElement
  // @ts-ignore
  const adapter = await navigator.gpu?.requestAdapter()
  const device = await adapter?.requestDevice()
  const context = canvas.getContext('webgpu')
  const format = 'bgra8unorm'

  const glslLang = await glslangModule()

  context.configure({
    device,
    format,
  })
  const pipeline = device.createRenderPipeline({
    vertex: {
      module: device.createShaderModule({
        code: glslLang.compileGLSL(VERTEX_SHADER, 'vertex'),
      }),
      entryPoint: 'main',
    },
    fragment: {
      module: device.createShaderModule({
        code: glslLang.compileGLSL(FRAGMENT_SHADER, 'fragment'),
      }),
      entryPoint: 'main',
      targets: [
        {
          format,
        },
      ],
    },
    primitive: {
      topology: 'triangle-list',
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
  renderPass.draw(3, 1, 0, 0)
  renderPass.endPass()

  device.queue.submit([commandEncoder.finish()])
})()

// // @ts-nocheck

// import './index.css'

// const VERTEX_SHADER = `
//   [[stage(vertex)]]
//   fn main ([[builtin(vertex_index)]] VertexIndex: u32) -> [[builtin(position)]] vec4<f32> {
//     var pos = array<vec2<f32>, 3>(
//       vec2<f32>(0.0, 0.5),
//       vec2<f32>(-0.5, -0.5),
//       vec2<f32>(0.5, -0.5),
//     );
//     return vec4<f32>(pos[VertexIndex], 0.0, 1.0);
//   }
// `

// const FRAGMENT_SHADER = `
//   [[stage(fragment)]]
//   fn main () -> [[location(0)]] vec4<f32> {
//     return vec4<f32>(1.0, 0.0, 1.0, 1.0);
//   }
// `

// ;(async () => {
//   const canvas = document.getElementById('canvas-webgpu') as HTMLCanvasElement
//   // @ts-ignore
//   const adapter = await navigator.gpu?.requestAdapter()
//   const device = await adapter?.requestDevice()
//   const context = canvas.getContext('webgpu')
//   const format = 'bgra8unorm'
//   context.configure({
//     device,
//     format,
//   })
//   const pipeline = device.createRenderPipeline({
//     vertex: {
//       module: device.createShaderModule({
//         code: VERTEX_SHADER,
//       }),
//       entryPoint: 'main',
//     },
//     fragment: {
//       module: device.createShaderModule({
//         code: FRAGMENT_SHADER,
//       }),
//       entryPoint: 'main',
//       targets: [
//         {
//           format,
//         },
//       ],
//     },
//     primitive: {
//       topology: 'triangle-list',
//     },
//   })
//   const commandEncoder = device.createCommandEncoder()
//   const textureView = context.getCurrentTexture().createView()
//   const renderPass = commandEncoder.beginRenderPass({
//     colorAttachments: [
//       {
//         view: textureView,
//         loadValue: [0.1, 0.1, 0.1, 1.0],
//         storeOp: 'store',
//       },
//     ],
//   })
//   renderPass.setPipeline(pipeline)
//   renderPass.draw(3, 1, 0, 0)
//   renderPass.endPass()

//   device.queue.submit([commandEncoder.finish()])
// })()
