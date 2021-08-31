(function () {
    'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */

    function __awaiter(thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }

    // @ts-nocheck
    const VERTEX_SHADER = `
  struct Output {
    [[builtin(position)]] Position : vec4<f32>;
  };

  [[stage(vertex)]]

  fn main ([[builtin(vertex_index)]] VertexIndex: u32) -> Output {
    var pos = array<vec2<f32>, 6>(
      vec2<f32>(0.2, -0.2),
      vec2<f32>(-0.2, -0.1),
      vec2<f32>(0.2,  0.0),
      vec2<f32>(0.4, -0.4),
      vec2<f32>(-0.7, -0.5),
      vec2<f32>(0.3,  0.1),
    );

    var output: Output;

    output.Position = vec4<f32>(pos[VertexIndex], 0.0, 1.0);
    return output;
  }
`;
    const FRAGMENT_SHADER = `
  [[stage(fragment)]]
  fn main () -> [[location(0)]] vec4<f32> {
    return vec4<f32>(1.0, 1.0, 0.0, 1.0);
  }
`;
    (() => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const canvas = document.getElementById('canvas-webgpu');
        // @ts-ignore
        const adapter = yield ((_a = navigator.gpu) === null || _a === void 0 ? void 0 : _a.requestAdapter());
        const device = yield (adapter === null || adapter === void 0 ? void 0 : adapter.requestDevice());
        const context = canvas.getContext('webgpu');
        const format = 'bgra8unorm';
        const primitiveType = 'triangle-strip';
        let stripIndexFormat = 'uint32';
        context.configure({
            device,
            format,
        });
        const pipeline = device.createRenderPipeline({
            vertex: {
                module: device.createShaderModule({
                    code: VERTEX_SHADER,
                }),
                entryPoint: 'main',
            },
            fragment: {
                module: device.createShaderModule({
                    code: FRAGMENT_SHADER,
                }),
                entryPoint: 'main',
                targets: [
                    {
                        format,
                    },
                ],
            },
            primitive: {
                topology: primitiveType,
                stripIndexFormat,
            },
        });
        const commandEncoder = device.createCommandEncoder();
        const textureView = context.getCurrentTexture().createView();
        const renderPass = commandEncoder.beginRenderPass({
            colorAttachments: [
                {
                    view: textureView,
                    loadValue: [0.1, 0.1, 0.1, 1.0],
                    storeOp: 'store',
                },
            ],
        });
        renderPass.setPipeline(pipeline);
        renderPass.draw(6);
        renderPass.endPass();
        device.queue.submit([commandEncoder.finish()]);
    }))();
    // const VERTEX_SHADER = `
    //   struct Output {
    //     [[builtin(position)]] Position : vec4<f32>;
    //   };
    //   [[stage(vertex)]]
    //   fn main ([[builtin(vertex_index)]] VertexIndex: u32) -> Output {
    //     var pos = array<vec2<f32>, 3>(
    //       vec2<f32>(0.2, -0.2),
    //       vec2<f32>(-0.2, -0.1),
    //       vec2<f32>(0.2,  0.0),
    //     );
    //     var output: Output;
    //     output.Position = vec4<f32>(pos[VertexIndex], 0.0, 1.0);
    //     return output;
    //   }
    // `
    // const FRAGMENT_SHADER = `
    //   [[stage(fragment)]]
    //   fn main () -> [[location(0)]] vec4<f32> {
    //     return vec4<f32>(1.0, 1.0, 0.0, 1.0);
    //   }
    // `
    // ;(async () => {
    //   const canvas = document.getElementById('canvas-webgpu') as HTMLCanvasElement
    //   // @ts-ignore
    //   const adapter = await navigator.gpu?.requestAdapter()
    //   const device = await adapter?.requestDevice()
    //   const context = canvas.getContext('webgpu')
    //   const format = 'bgra8unorm'
    //   const glslLang = await glslangModule()
    //   const primitiveType = 'line-strip'
    //   let stripIndexFormat
    //   if (primitiveType === 'line-strip') {
    //     stripIndexFormat = 'uint32'
    //   }
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
    //       topology: primitiveType,
    //       stripIndexFormat,
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
    //   renderPass.draw(3)
    //   renderPass.endPass()
    //   device.queue.submit([commandEncoder.finish()])
    // })()
    ////// oooooooold
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

}());
