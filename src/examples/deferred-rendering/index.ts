import { load } from '@loaders.gl/core'
import { GLTFLoader } from '@loaders.gl/gltf/dist/esm/gltf-loader'
import { mat4, quat } from 'gl-matrix'
import * as dat from 'dat.gui'

import {
  CameraController,
  PerspectiveCamera,
  Mesh,
  Geometry,
  SceneObject,
  Texture,
  VertexBuffer,
  IndexBuffer,
  StorageBuffer,
  Sampler,
  GeometryUtils,
  OrthographicCamera,
} from '../../lib/hwoa-rang-gpu'

import '../index.css'

const MAX_LIGHTS_COUNT = 1024

const OPTIONS = {
  lightsCount: 256,
  debugMode: false,
}

const getVertexShaderSnippet = ({ useUV = false }) => `
  output.position = transform.modelMatrix * input.position;
  output.Position = transform.projectionMatrix *
                    transform.viewMatrix *
                    output.position;
  
  output.normal = transform.normalMatrix *
                  input.normal;

  ${useUV ? 'output.uv = input.uv;' : ''}
`

const getFragmentShaderSnippet = ({ useTexture = false }) => `
  let normal: vec3<f32> = normalize(input.normal.rgb);
  // TODO: this is hacky, since its hijacking the Color fragment output to output the position
  output.Color = vec4<f32>(input.position.rgb / input.position.a, 1.0);
  output.normal = vec4<f32>(normal, 1.0);
  ${
    useTexture
      ? 'output.albedo = textureSample(sampler_texture, my_sampler, vec2<f32>(input.uv.x, 1.0 - input.uv.y));'
      : 'output.albedo = vec4<f32>(inputUBO.baseColor.rgb, 1.0);'
  }
`

const DEFERRED_RENDER_VERTEX_SNIPPET = `
  output.Position = transform.projectionMatrix *
                    transform.viewMatrix *
                    transform.modelMatrix *
                    input.position;
  output.uv = input.uv;
`

const DEFERRED_RENDER_FRAGMENT_SNIPPET = `
  let normalisedCoords = input.coords.xy / inputUBO.canvasSize;

  if (inputUBO.debugMode == 0) {
    let position = textureLoad(
      position_texture,
      vec2<i32>(floor(input.coords.xy)),
      0
    ).xyz;

    if (position.z > 10000.0) {
      discard;
    }

    let normal = textureLoad(
      normal_texture,
      vec2<i32>(floor(input.coords.xy)),
      0
    ).xyz;

    let diffuse = textureLoad(
      diffuse_texture,
      vec2<i32>(floor(input.coords.xy)),
      0
    ).rgb;

    var result = vec3<f32>(0.0);

    for (var i : u32 = 0u; i < inputUBO.maxLightsCount; i = i + 1u) {
      let L = lightCollection.lights[i].position.xyz - position;
      let distance = length(L);
      
      if (distance > lightCollection.lights[i].radius) {
        continue;
      }

      let lambert = max(dot(normal, normalize(L)), 0.0);
      result = result + vec3<f32>(
        lambert *
        pow(1.0 - distance / lightCollection.lights[i].radius, 2.0) *
        lightCollection.lights[i].color.rgb *
        diffuse
      );
    }

    output.Color = vec4<f32>(result, 1.0);
  } else {
    if (normalisedCoords.x < 0.33) {
      output.Color = textureLoad(
        position_texture,
        vec2<i32>(floor(input.coords.xy)),
        0
      );

    } elseif (normalisedCoords.x < 0.667) {
      output.Color = textureLoad(
        normal_texture,
        vec2<i32>(floor(input.coords.xy)),
        0
      );
    } else {
      output.Color = textureLoad(
        diffuse_texture,
        vec2<i32>(floor(input.coords.xy)),
        0
      );
      // output.Color = vec4<f32>(0.0, 1.0, 0.0, 1.0);
    }
  }
`

//
;(async () => {
  const gltf = await load(
    `${window['ASSETS_BASE_URL']}/DragonAttenuation.gltf`,
    GLTFLoader,
  )
  console.log(gltf)

  const gui = new dat.GUI()
  gui.add(OPTIONS, 'debugMode').onChange((v) => {
    quadMesh.setUniform('debugMode', new Int32Array([v]))
  })
  gui
    .add(OPTIONS, 'lightsCount')
    .min(1)
    .max(MAX_LIGHTS_COUNT)
    .step(1)
    .onChange((v) => {
      quadMesh.setUniform('maxLightsCount', new Uint32Array([v]))
    })

  const canvas = document.getElementById('gpu-c') as HTMLCanvasElement
  canvas.width = innerWidth * devicePixelRatio
  canvas.height = innerHeight * devicePixelRatio
  canvas.style.setProperty('width', `${innerWidth}px`)
  canvas.style.setProperty('height', `${innerHeight}px`)

  const adapter = await navigator.gpu?.requestAdapter()
  const device = await adapter?.requestDevice()

  const context = canvas.getContext('webgpu')
  const presentationFormat = context.getPreferredFormat(adapter)
  const primitiveType: GPUPrimitiveTopology = 'triangle-list'

  context.configure({
    device,
    format: presentationFormat,
  })

  // Parse glTF to scene graph
  const rootNode = new SceneObject()
  const gBufferRootNode = new SceneObject()

  traverseSceneGraph(gltf.scene, rootNode, gBufferRootNode)
  const duckScale = 0.5
  rootNode
    .setScale({ x: duckScale, y: duckScale, z: duckScale })
    .updateWorldMatrix()
  gBufferRootNode
    .setScale({ x: duckScale, y: duckScale, z: duckScale })
    .updateWorldMatrix()

  //
  const perspCamera = new PerspectiveCamera(
    (45 * Math.PI) / 180,
    canvas.width / canvas.height,
    0.1,
    20,
  )
    .setPosition({ x: 0.81, y: 0.31, z: 3.91 })
    .lookAt([0, 0, 0])
    .updateProjectionMatrix()
    .updateViewMatrix()

  new CameraController(perspCamera, canvas, false, 0.1).lookAt([0, 0, 0])

  //
  const orthoCamera = new OrthographicCamera(
    -canvas.width / 2,
    canvas.width / 2,
    canvas.height / 2,
    -canvas.height / 2,
    0.1,
    3,
  )
    .setPosition({ z: 2 })
    .lookAt([0, 0, 0])
    .updateProjectionMatrix()
    .updateViewMatrix()

  //
  const textureDepth = new Texture(device, 'texture_depth').fromDefinition({
    size: [canvas.width, canvas.height, 1],
    format: 'depth24plus',
    usage: GPUTextureUsage.RENDER_ATTACHMENT,
  })

  // GPU Compute pipeline for lights
  const lightsDataStride = 10
  const lightsData = new Float32Array(MAX_LIGHTS_COUNT * lightsDataStride)
  for (let i = 0; i < MAX_LIGHTS_COUNT; i++) {
    // position
    lightsData[i * lightsDataStride + 0] = (Math.random() * 2 - 1) * 0.8
    lightsData[i * lightsDataStride + 1] = 0.2
    lightsData[i * lightsDataStride + 2] = Math.random() * 2

    // velocity
    lightsData[i * lightsDataStride + 3] = (Math.random() * 2 - 1) * 1
    lightsData[i * lightsDataStride + 4] = (Math.random() * 2 - 1) * 1
    lightsData[i * lightsDataStride + 5] = (Math.random() * 2 - 1) * 1

    // color
    lightsData[i * lightsDataStride + 6] = Math.random()
    lightsData[i * lightsDataStride + 7] = Math.random()
    lightsData[i * lightsDataStride + 8] = Math.random()

    // radius
    lightsData[i * lightsDataStride + 9] = 2
  }

  const lightsBuffer = new StorageBuffer(
    device,
    lightsData,
    lightsDataStride * Float32Array.BYTES_PER_ELEMENT,
    GPUBufferUsage.VERTEX | GPUBufferUsage.STORAGE,
  ).addAttribute('Light', {
    position: 'vec3<f32>',
    velocity: 'vec3<f32>',
    color: 'vec3<f32>',
    radius: 'f32',
  })

  const lightsUpdateComputePipeline = device.createComputePipeline({
    compute: {
      entryPoint: 'main',
      module: device.createShaderModule({
        code: `
          struct Light {
            position: vec3<f32>;
            velocity: vec3<f32>;
            color: vec3<f32>;
            radius: f32;
          };

          [[block]] struct LightsBuffer {
            lights: array<Light>;
          };

          [[group(0), binding(0)]] var<storage, read_write> lightsBuffer: LightsBuffer;

          let worldSize: vec3<f32> = vec3<f32>(3.0);

          [[stage(compute), workgroup_size(64, 1, 1)]]
          fn main([[builtin(global_invocation_id)]] GlobalInvocationID : vec3<u32>) {
            let index = GlobalInvocationID.x;

            if (lightsBuffer.lights[index].position.x > worldSize.x * 0.5) {
              lightsBuffer.lights[index].position.x = worldSize.x * 0.5;
              lightsBuffer.lights[index].velocity.x = lightsBuffer.lights[index].velocity.x * -1.0;
            } elseif (lightsBuffer.lights[index].position.x < -worldSize.x * 0.5) {
              lightsBuffer.lights[index].position.x = -worldSize.x * 0.5;
              lightsBuffer.lights[index].velocity.x = lightsBuffer.lights[index].velocity.x * -1.0;
            }

            if (lightsBuffer.lights[index].position.y > worldSize.x * 0.5) {
              lightsBuffer.lights[index].position.y = worldSize.x * 0.5;
              lightsBuffer.lights[index].velocity.y = lightsBuffer.lights[index].velocity.y * -1.0;
            } elseif (lightsBuffer.lights[index].position.y < -worldSize.x * 0.5) {
              lightsBuffer.lights[index].position.y = -worldSize.x * 0.5;
              lightsBuffer.lights[index].velocity.y = lightsBuffer.lights[index].velocity.y * -1.0;
            }

            if (lightsBuffer.lights[index].position.z > worldSize.x * 0.5) {
              lightsBuffer.lights[index].position.z = worldSize.x * 0.5;
              lightsBuffer.lights[index].velocity.z = lightsBuffer.lights[index].velocity.z * -1.0;
            } elseif (lightsBuffer.lights[index].position.z < -worldSize.x * 0.5) {
              lightsBuffer.lights[index].position.z = -worldSize.x * 0.5;
              lightsBuffer.lights[index].velocity.z = lightsBuffer.lights[index].velocity.z * -1.0;
            }
            
            lightsBuffer.lights[index].position.x = lightsBuffer.lights[index].position.x + lightsBuffer.lights[index].velocity.x * 0.01;
            lightsBuffer.lights[index].position.y = lightsBuffer.lights[index].position.y + lightsBuffer.lights[index].velocity.y * 0.01;
            lightsBuffer.lights[index].position.z = lightsBuffer.lights[index].position.z + lightsBuffer.lights[index].velocity.z * 0.01;
          }
        `,
      }),
    },
  })
  const lightsUpdateBindGroup = device.createBindGroup({
    layout: lightsUpdateComputePipeline.getBindGroupLayout(0),
    entries: [
      {
        binding: 0,
        resource: {
          buffer: lightsBuffer.get(),
        },
      },
    ],
  })

  // debug lights please
  let lightsDebugMesh

  {
    const radius = 0.15
    const { vertices, indices } = GeometryUtils.createBox({
      width: radius,
      height: radius,
      depth: radius,
    })
    const geometry = new Geometry(device)
    geometry.instanceCount = MAX_LIGHTS_COUNT
    const vertexBuffer = new VertexBuffer(
      device,
      0,
      vertices,
      3 * Float32Array.BYTES_PER_ELEMENT,
    ).addAttribute(
      'position',
      0,
      3 * Float32Array.BYTES_PER_ELEMENT,
      'float32x3',
    )
    const lightsDebugBuffer = new VertexBuffer(
      device,
      1,
      lightsData,
      lightsDataStride * Float32Array.BYTES_PER_ELEMENT,
      GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
      'instance',
    ).addAttribute(
      'offsetPosition',
      0,
      3 * Float32Array.BYTES_PER_ELEMENT,
      'float32x3',
    )
    const indexBuffer = new IndexBuffer(device, indices)
    geometry
      .addIndexBuffer(indexBuffer)
      .addVertexBuffer(vertexBuffer)
      .addVertexBuffer(lightsDebugBuffer)

    lightsDebugMesh = new Mesh(device, {
      geometry,
      vertexShaderSource: {
        main: `
        output.Position = transform.projectionMatrix *
                          transform.viewMatrix *
                          (input.position + input.offsetPosition);
      `,
      },
      fragmentShaderSource: {
        main: `
          output.Color = vec4<f32>(1.0, 0.0, 0.0, 1.0);
        `,
      },
      depthStencil: null,
    })
  }

  // g-buffer pipeline descriptor
  const gBufferTexturePosition = new Texture(
    device,
    'position_texture',
    'unfilterable-float',
  ).fromDefinition({
    size: [canvas.width, canvas.height, 3],
    usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
    format: 'rgba32float',
  })
  const gBufferTextureNormal = new Texture(
    device,
    'normal_texture',
    'unfilterable-float',
  ).fromDefinition({
    size: [canvas.width, canvas.height, 3],
    usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
    format: 'rgba32float',
  })
  const gBufferTextureDiffuse = new Texture(
    device,
    'diffuse_texture',
    'unfilterable-float',
  ).fromDefinition({
    size: [canvas.width, canvas.height],
    usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
    format: 'bgra8unorm',
  })
  const gBufferPassDescriptor: GPURenderPassDescriptor = {
    colorAttachments: [
      {
        view: gBufferTexturePosition.get().createView(),
        loadValue: [0, 0, 0, 1],
        storeOp: 'store',
      },
      {
        view: gBufferTextureNormal.get().createView(),
        loadValue: [Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE, 1],
        storeOp: 'store',
      },
      {
        view: gBufferTextureDiffuse.get().createView(),
        loadValue: [0, 0, 0, 1],
        storeOp: 'store',
      },
    ],
    depthStencilAttachment: {
      view: textureDepth.get().createView(),

      depthLoadValue: 1.0,
      depthStoreOp: 'store',
      stencilLoadValue: 0,
      stencilStoreOp: 'store',
    },
  }

  //
  const quadGeometry = new Geometry(device)
  {
    const { vertices, uv, indices } = GeometryUtils.createPlane({
      width: innerWidth,
      height: innerHeight,
    })
    const vertexBuffer = new VertexBuffer(
      device,
      0,
      vertices,
      3 * Float32Array.BYTES_PER_ELEMENT,
    ).addAttribute(
      'position',
      0,
      3 * Float32Array.BYTES_PER_ELEMENT,
      'float32x3',
    )
    const uvBuffer = new VertexBuffer(
      device,
      1,
      uv,
      2 * Float32Array.BYTES_PER_ELEMENT,
    ).addAttribute('uv', 0, 2 * Float32Array.BYTES_PER_ELEMENT, 'float32x2')
    const indexBuffer = new IndexBuffer(device, indices)
    quadGeometry
      .addVertexBuffer(vertexBuffer)
      .addVertexBuffer(uvBuffer)
      .addIndexBuffer(indexBuffer)
  }
  const quadMesh = new Mesh(device, {
    geometry: quadGeometry,
    textures: [
      gBufferTexturePosition,
      gBufferTextureNormal,
      gBufferTextureDiffuse,
    ],
    storages: [lightsBuffer],
    uniforms: {
      canvasSize: {
        type: 'vec2<f32>',
        value: new Float32Array([canvas.width, canvas.height]),
      },
      debugMode: {
        type: 'i32',
        value: new Int32Array([0]),
      },
      maxLightsCount: {
        type: 'u32',
        value: new Uint32Array([OPTIONS.lightsCount]),
      },
    },
    vertexShaderSource: {
      main: DEFERRED_RENDER_VERTEX_SNIPPET,
    },
    fragmentShaderSource: {
      inputs: {
        // position: {
        //   format: 'float32x4',
        //   builtIn: true,
        //   shaderName: 'coords',
        // },
      },
      main: DEFERRED_RENDER_FRAGMENT_SNIPPET,
    },
  })
    .setRotation({ x: Math.PI })
    .updateModelMatrix()

  requestAnimationFrame(drawFrame)

  function drawFrame(ts) {
    requestAnimationFrame(drawFrame)

    ts /= 1000

    const commandEncoder = device.createCommandEncoder()

    const computeLightPositionPass = commandEncoder.beginComputePass()
    computeLightPositionPass.setPipeline(lightsUpdateComputePipeline)
    computeLightPositionPass.setBindGroup(0, lightsUpdateBindGroup)
    computeLightPositionPass.dispatch(Math.ceil(MAX_LIGHTS_COUNT / 64))
    computeLightPositionPass.endPass()

    // gbuffers pass
    const gBufferPass = commandEncoder.beginRenderPass(gBufferPassDescriptor)
    gBufferRootNode.traverseGraph((node) => {
      if (node.renderable) {
        node.render(gBufferPass, perspCamera)
      }
    })
    gBufferPass.endPass()

    const swapChainTexture = context.getCurrentTexture()
    const renderPass = commandEncoder.beginRenderPass({
      colorAttachments: [
        {
          view: swapChainTexture.createView(),
          loadValue: [0.1, 0.1, 0.1, 1.0],
          storeOp: 'store',
        },
      ],
      depthStencilAttachment: {
        view: textureDepth.get().createView(),
        depthLoadValue: 1,
        depthStoreOp: 'store',
        stencilLoadValue: 0,
        stencilStoreOp: 'store',
      },
    })

    // // fullscreen quad postprocessing pass
    quadMesh.render(renderPass, orthoCamera)

    renderPass.endPass()

    // lights debug meshes
    // const debugRenderPass = commandEncoder.beginRenderPass({
    //   colorAttachments: [
    //     {
    //       view: swapChainTexture.createView(),
    //       loadValue: [0.1, 0.1, 0.1, 0.1],
    //       storeOp: 'store',
    //     },
    //   ],
    // })
    // lightsDebugMesh.render(debugRenderPass, perspCamera)
    // debugRenderPass.endPass()

    device.queue.submit([commandEncoder.finish()])
  }

  function traverseSceneGraph(
    currentNode,
    parentNode = null,
    gBufferParentNode = null,
  ) {
    // handle mesh node
    const sceneNode = new SceneObject()
    const gBufferSceneNode = new SceneObject()
    if (currentNode.mesh) {
      currentNode.mesh.primitives.map((primitive) => {
        const geometry = new Geometry(device)

        if (primitive.attributes.POSITION) {
          const vertexBuffer = new VertexBuffer(
            device,
            0,
            primitive.attributes.POSITION.value,
            primitive.attributes.POSITION.bytesPerElement,
          ).addAttribute(
            'position',
            0,
            primitive.attributes.POSITION.bytesPerElement,
            'float32x3',
          )
          geometry.addVertexBuffer(vertexBuffer)
        }

        if (primitive.attributes.NORMAL) {
          const vertexBuffer = new VertexBuffer(
            device,
            1,
            primitive.attributes.NORMAL.value,
            primitive.attributes.NORMAL.bytesPerElement,
          ).addAttribute(
            'normal',
            0,
            primitive.attributes.NORMAL.bytesPerElement,
            'float32x3',
          )
          geometry.addVertexBuffer(vertexBuffer)
        }

        if (primitive.attributes.TEXCOORD_0) {
          const vertexBuffer = new VertexBuffer(
            device,
            2,
            primitive.attributes.TEXCOORD_0.value,
            primitive.attributes.TEXCOORD_0.bytesPerElement,
          ).addAttribute(
            'uv',
            0,
            primitive.attributes.TEXCOORD_0.bytesPerElement,
            'float32x2',
          )
          geometry.addVertexBuffer(vertexBuffer)
        }

        const indexBuffer = new IndexBuffer(device, primitive.indices.value)
        geometry.addIndexBuffer(indexBuffer)

        const {
          material: {
            pbrMetallicRoughness: { baseColorFactor, baseColorTexture },
          },
        } = currentNode.mesh.primitives[0]

        const uniforms = {}
        const textures = []
        const samplers = []

        if (baseColorTexture) {
          const {
            texture: {
              source: { image },
            },
          } = baseColorTexture
          const texture = new Texture(
            device,
            'sampler_texture',
          ).fromImageBitmap(image)
          const sampler = new Sampler(device, 'my_sampler')
          samplers.push(sampler)
          textures.push(texture)
        }

        if (baseColorFactor) {
          uniforms['baseColor'] = {
            type: 'vec4<f32>',
            value: new Float32Array(baseColorFactor),
          }
        }

        const gBufferMesh = new Mesh(device, {
          geometry,
          uniforms,
          textures,
          samplers,
          vertexShaderSource: {
            main: getVertexShaderSnippet({
              useUV: !!baseColorTexture,
            }),
          },
          fragmentShaderSource: {
            outputs: {
              normal: {
                format: 'float32x4',
              },
              albedo: {
                format: 'float32x4',
              },
            },
            main: getFragmentShaderSnippet({ useTexture: !!baseColorTexture }),
          },
          primitiveType,
          depthStencil: {
            depthWriteEnabled: true,
            depthCompare: 'less',
            format: 'depth24plus',
          },
          targets: [
            // position
            { format: 'rgba32float' },
            // normal
            { format: 'rgba32float' },
            // albedo
            { format: 'bgra8unorm' },
          ],
        })
        if (!baseColorTexture) {
          gBufferMesh.setPosition({ y: 5 }).updateModelMatrix()
        }
        gBufferMesh.setParent(gBufferSceneNode)
      })
    }
    if (currentNode.matrix) {
      sceneNode.copyFromMatrix(currentNode.matrix)
      gBufferSceneNode.copyFromMatrix(currentNode.matrix)
    } else {
      const matrix = mat4.create()
      if (currentNode.translation) {
        mat4.translate(matrix, matrix, currentNode.translation)
      }
      if (currentNode.rotation) {
        const rot = quat.fromValues(
          currentNode.rotation[0],
          currentNode.rotation[1],
          currentNode.rotation[2],
          1,
        )
        const rotMat = mat4.create()
        mat4.fromQuat(rotMat, rot)

        mat4.mul(matrix, matrix, rotMat)
      }
      if (currentNode.scale) {
        mat4.scale(matrix, matrix, currentNode.scale)
      }
      sceneNode.copyFromMatrix(matrix)
      gBufferSceneNode.copyFromMatrix(matrix)
    }
    if (parentNode) {
      sceneNode.setParent(parentNode)
    }
    if (gBufferParentNode) {
      gBufferSceneNode.setParent(gBufferParentNode)
    }
    const children = currentNode.nodes || currentNode.children
    if (children && children.length) {
      children.forEach((childNode) => {
        traverseSceneGraph(childNode, sceneNode, gBufferSceneNode)
      })
    }
  }
})()
