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
  Sampler,
  GeometryUtils,
  OrthographicCamera,
} from '../../lib/hwoa-rang-gpu'

import '../index.css'

const getVertexShaderSnippet = ({ useUV = false }) => `
  let worldPosition: vec4<f32> = transform.modelMatrix * input.pos;
  output.Position = transform.projectionMatrix *
                    transform.viewMatrix *
                    worldPosition;
  
  output.normal = transform.normalMatrix *
                  input.normal;

  ${useUV ? 'output.uv = input.uv;' : ''}

  output.pos = worldPosition;
`

const getFragmentShaderSnippet = ({ useTexture = false }) => `
  let normal: vec3<f32> = normalize(input.normal.rgb);
  // TODO: this is hacky, since its hijacking the Color fragment output to output the position
  // for the purposed of the deferred demo. The output variable "Color" is always at location(0)
  // Must think of a better way mark that shader is using MRT and will output to different varyings
  output.Color = vec4<f32>(input.pos.rgb, 1.0);
  output.normal = vec4<f32>(normal, 1.0);
  // output.albedo = vec4<f32>(1.0, 0.0, 0.0, 1.0);
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
                    input.pos;
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

    let lightPos = vec3<f32>(1.0, 1.0, 0.0);
    let lightRadius = 3.0;
    let lightColor = vec3<f32>(0.0, 1.0, 1.0);
    let L = lightPos - position;
    let distance = length(L);
    
    var result = vec3<f32>(0.0);
    if (distance < lightRadius) {
      let lambert = max(dot(normal, normalize(L)), 0.0);
      result = result + vec3<f32>(
        lambert * pow(1.0 - distance / lightRadius, 2.0) * lightColor * diffuse);    
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
      output.Color.x = (output.Color.x + 1.0) * 0.5;
      output.Color.y = (output.Color.y + 1.0) * 0.5;
      output.Color.x = (output.Color.z + 1.0) * 0.5;
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

const OPTIONS = {
  debugMode: false,
}

//
;(async () => {
  const gltf = await load(
    `${window['ASSETS_BASE_URL']}/DragonAttenuation.gltf`,
    GLTFLoader,
  )
  console.log(gltf)

  const gui = new dat.GUI()
  gui.add(OPTIONS, 'debugMode').onChange((v) => {
    quadMesh.setUniform('debugMode', new Uint32Array([v]))
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
    ).addAttribute('pos', 0, 3 * Float32Array.BYTES_PER_ELEMENT, 'float32x3')
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
    uniforms: {
      canvasSize: {
        type: 'vec2<f32>',
        value: new Float32Array([canvas.width, canvas.height]),
      },
      debugMode: {
        type: 'i32',
        value: new Uint32Array([0]),
      },
    },
    vertexShaderSource: {
      main: DEFERRED_RENDER_VERTEX_SNIPPET,
    },
    fragmentShaderSource: {
      inputs: {
        position: {
          format: 'float32x4',
          builtIn: true,
          shaderName: 'coords',
        },
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

    // fullscreen quad postprocessing pass
    quadMesh.render(renderPass, orthoCamera)

    renderPass.endPass()

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
            'pos',
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
