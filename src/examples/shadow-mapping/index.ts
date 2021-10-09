import { load } from '@loaders.gl/core'
import { GLTFLoader } from '@loaders.gl/gltf/dist/esm/gltf-loader'
import parseColor from 'color-parse'
import * as dat from 'dat.gui'
import { mat4, quat } from 'gl-matrix'

import {
  CameraController,
  PerspectiveCamera,
  Mesh,
  Geometry,
  SceneObject,
  GeometryUtils,
  OrthographicCamera,
  Sampler,
  VertexBuffer,
  IndexBuffer,
  Texture,
  UniformInputs,
} from '../../lib/hwoa-rang-gpu'

import '../index.css'
import { testForWebGPUSupport } from '../shared/test-for-webgpu-support'

// const SAMPLE_COUNT = 4
const SHADOW_MAP_SIZE = 2048

const SHADED_FRAGMENT_SNIPPET = `
  let N: vec3<f32> = normalize(input.normal.rgb);
  let L: vec3<f32> = normalize(inputUBO.lightPosition.xyz - input.position.xyz);

  // Lambert's cosine law
  let lambertian = max(dot(N, L), 0.0);

  var specular = 0.0;
  if (lambertian > 0.0) {
    let R: vec3<f32> = reflect(-L, N);
    let V: vec3<f32> = normalize(inputUBO.cameraPosition.xyz - input.position.xyz);
    
    // Compute the specular term
    let specAngle = max(dot(R, V), 0.0);
    
    let lightShininess = 10.0;
    specular = pow(specAngle, lightShininess);
  }

  // Calculate projected UVs from light point of view
  var shadowPos: vec3<f32> = input.shadowPos.xyz / input.shadowPos.w;
  shadowPos = shadowPos * vec3<f32>(0.5, -0.5, 1.0) + vec3<f32>(0.5, 0.5, 0.0);

  // Percentage close filtering
  var visibility : f32 = 0.0;
  for (var y : i32 = -1 ; y <= 1 ; y = y + 1) {
    for (var x : i32 = -1 ; x <= 1 ; x = x + 1) {
      let offset : vec2<f32> = vec2<f32>(
        f32(x) * 0.0009765625,
        f32(y) * 0.0009765625
      );

      visibility = visibility + textureSampleCompare(
        my_depth_texture,
        my_depth_sampler,
        shadowPos.xy + offset,
        shadowPos.z - 0.0055
      );
    }
  }
  visibility = visibility / 9.0;
  
  // Apply shadow visibility to phong lighting
  var finalLight = vec3<f32>(
    vec3<f32>(0.1, 0.1, 0.1) +
    visibility * lambertian * inputUBO.diffuseColor.rgb +
    visibility * specular * inputUBO.specularColor.rgb
  );  

  // Final color
  output.Color = vec4<f32>(inputUBO.baseColor.rgb * finalLight, 1.0);
`

const FRAGMENT_SHADER_WHITE_COLOR = `output.Color = vec4<f32>(1.0);`

const generateVertexShaderSnippet = ({
  useNormal = true,
  useUV = true,
  usePosition = true,
  useLightUv = false,
}) => `
  let worldPosition: vec4<f32> = transform.modelMatrix * input.position;
  
  output.Position = transform.projectionMatrix *
                    transform.viewMatrix *
                    worldPosition;

  ${
    useLightUv
      ? `
        let posFromLight: vec4<f32> = inputUBO.lightCamProjectionMatrix *
                                      inputUBO.lightCamViewMatrix *
                                      worldPosition;

        output.shadowPos = posFromLight;
  `
      : ''
  }
  
  ${useNormal ? 'output.normal = transform.normalMatrix * input.normal;' : ''}
  ${useUV ? 'output.uv = input.uv;' : ''}
  ${usePosition ? 'output.position = worldPosition;' : ''}
`

const normalizeRGB = (rgb) => rgb.map((channel) => channel / 255)

const OPTIONS = {
  lightX: 0,
  lightY: 30,
  lightZ: 10,
  timeScaleFactor: 0.4,
  animateLight: true,
  showDebug: true,
}

testForWebGPUSupport()
;(async () => {
  const gltf = await load(
    `${window['ASSETS_BASE_URL']}/2CylinderEngine.gltf`,
    GLTFLoader,
  )

  const canvas = document.getElementById('gpu-c') as HTMLCanvasElement
  canvas.width = innerWidth * devicePixelRatio
  canvas.height = innerHeight * devicePixelRatio
  canvas.style.setProperty('width', `${innerWidth}px`)
  canvas.style.setProperty('height', `${innerHeight}px`)

  const adapter = await navigator.gpu?.requestAdapter()

  const device = await adapter?.requestDevice()

  const gui = new dat.GUI()
  gui.add(OPTIONS, 'timeScaleFactor').min(0.05).max(1).step(0.05)
  gui.add(OPTIONS, 'animateLight')
  gui.add(OPTIONS, 'showDebug')

  const context = canvas.getContext('webgpu')

  const presentationFormat = context.getPreferredFormat(adapter)
  const presentationSize = [canvas.width, canvas.height]

  context.configure({
    device,
    format: presentationFormat,
  })

  const primitiveType: GPUPrimitiveTopology = 'triangle-list'

  const textureDepth = new Texture(device, 'texture_depth').fromDefinition({
    size: presentationSize,
    format: 'depth24plus',
    usage: GPUTextureUsage.RENDER_ATTACHMENT,
  })

  const shadowDepthTexture = new Texture(
    device,
    'my_depth_texture',
    'depth',
    '2d',
    'texture_depth_2d',
  ).fromDefinition({
    size: [SHADOW_MAP_SIZE, SHADOW_MAP_SIZE, 1],
    usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
    format: 'depth32float',
  })

  const depthDebugSampler = new Sampler(device, 'my_depth_debug_sampler')
  const depthSampler = new Sampler(
    device,
    'my_depth_sampler',
    'comparison',
    'sampler_comparison',
    {
      compare: 'less',
    },
  )

  // cameras
  const perspCamera = new PerspectiveCamera(
    (45 * Math.PI) / 180,
    canvas.width / canvas.height,
    0.1,
    400,
  )
    .setPosition({ x: 46, y: 23, z: 132 })
    .lookAt([0, 0, 0])
    .updateProjectionMatrix()
    .updateViewMatrix()

  const cameraTypedPosition = new Float32Array(perspCamera.position)
  const lightTypedPosition = new Float32Array([20, 20, 20, 0])

  const lightCamera = new OrthographicCamera(-50, 50, -50, 50, -200, 200)
    .setPosition({
      x: lightTypedPosition[0],
      y: lightTypedPosition[1],
      z: lightTypedPosition[2],
    })
    .lookAt([0, 0, 0])
    .updateProjectionMatrix()
    .updateViewMatrix()

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

  const ctrl = new CameraController(perspCamera, canvas, false)
  ctrl.lookAt([0, 0.5, 0])

  // Shared uniforms for all lighted and shadowed meshes
  const lightUniforms = {
    diffuseColor: {
      type: 'vec4<f32>',
      value: new Float32Array(normalizeRGB(parseColor('#aca5cf').values)),
    },
    specularColor: {
      type: 'vec4<f32>',
      value: new Float32Array(normalizeRGB(parseColor('#be355e').values)),
    },
    lightPosition: {
      type: 'vec4<f32>',
      value: lightTypedPosition,
    },
    cameraPosition: {
      type: 'vec4<f32>',
      value: cameraTypedPosition,
    },
    lightCamViewMatrix: {
      type: 'mat4x4<f32>',
      value: lightCamera.viewMatrix as ArrayBuffer,
    },
    lightCamProjectionMatrix: {
      type: 'mat4x4<f32>',
      value: lightCamera.projectionMatrix as ArrayBuffer,
    },
  }

  // Scene graph nodes
  const rootNode = new SceneObject()
  const lighedMeshesRoot = new SceneObject()

  const gltfRootNode = new SceneObject()
  const shadowGltfRootNode = new SceneObject()

  const shadowRoot = new SceneObject()

  shadowGltfRootNode
    .setScale({ x: 0.1, y: 0.1, z: 0.1 })
    .setRotation({ y: Math.PI })
    .updateModelMatrix()
    .setParent(shadowRoot)

  lighedMeshesRoot.setParent(rootNode)

  gltfRootNode
    .setScale({ x: 0.1, y: 0.1, z: 0.1 })
    .setRotation({ y: Math.PI })
    .updateModelMatrix()
    .setParent(lighedMeshesRoot)

  traverseSceneGraph(gltf.scene, gltfRootNode, shadowGltfRootNode)

  // Floor mesh
  const floorGeometry = new Geometry(device)
  {
    const { vertices, indices, normal } = GeometryUtils.createPlane({
      width: 150,
      height: 150,
    })
    const indexBuffer = new IndexBuffer(device, indices)
    const vertexBuffer = new VertexBuffer(
      device,
      0,
      vertices,
      3 * Float32Array.BYTES_PER_ELEMENT,
    ).addAttribute('position', 0, 3, 'float32x3')

    const normalBuffer = new VertexBuffer(
      device,
      1,
      normal,
      3 * Float32Array.BYTES_PER_ELEMENT,
    ).addAttribute('normal', 0, 3, 'float32x3')

    floorGeometry
      .addIndexBuffer(indexBuffer)
      .addVertexBuffer(vertexBuffer)
      .addVertexBuffer(normalBuffer)
  }
  const floorMesh = new Mesh(device, {
    geometry: floorGeometry,

    uniforms: {
      baseColor: {
        type: 'vec4<f32>',
        value: new Float32Array([0.8, 0.8, 0.8]),
      },
      ...(lightUniforms as UniformInputs),
    },
    samplers: [depthSampler],
    textures: [shadowDepthTexture],
    vertexShaderSource: {
      outputs: {
        shadowPos: {
          format: 'float32x3',
        },
      },
      main: generateVertexShaderSnippet({
        useLightUv: true,
        useUV: false,
      }),
    },
    fragmentShaderSource: {
      inputs: {
        shadowPos: {
          format: 'float32x3',
        },
      },
      main: SHADED_FRAGMENT_SNIPPET,
    },
  })
  floorMesh.setRotation({ x: -Math.PI / 2 }).setPosition({ y: -23 })
  floorMesh.setParent(lighedMeshesRoot)

  const floorMeshLight = new Mesh(device, {
    geometry: floorGeometry,
    vertexShaderSource: {
      main: generateVertexShaderSnippet({
        useNormal: true,
        useUV: false,
      }),
    },
    fragmentShaderSource: {
      // this should be omitted and we can use a vertex-only pipeline, but it's
      // not yet implemented.
      main: FRAGMENT_SHADER_WHITE_COLOR,
    },
    targets: [],
    depthStencil: {
      depthWriteEnabled: true,
      depthCompare: 'less',
      format: 'depth32float',
    },
  })
  floorMeshLight.setRotation({ x: -Math.PI / 2 }).setPosition({ y: -23 })
  floorMeshLight.setParent(shadowRoot)

  // light mesh
  const lightGeometry = new Geometry(device)
  {
    const { vertices, uv, indices } = GeometryUtils.createSphere()
    const indexBuffer = new IndexBuffer(device, indices)
    const vertexBuffer = new VertexBuffer(
      device,
      0,
      vertices,
      3 * Float32Array.BYTES_PER_ELEMENT,
    ).addAttribute('position', 0, 3, 'float32x3')
    const uvBuffer = new VertexBuffer(
      device,
      1,
      uv,
      2 * Float32Array.BYTES_PER_ELEMENT,
    ).addAttribute('uv', 0, 2, 'float32x2')

    lightGeometry.addIndexBuffer(indexBuffer)
    lightGeometry.addVertexBuffer(vertexBuffer)
    lightGeometry.addVertexBuffer(uvBuffer)
  }

  const lightMesh = new Mesh(device, {
    geometry: lightGeometry,
    uniforms: {},
    vertexShaderSource: {
      main: generateVertexShaderSnippet({
        useNormal: false,
        useUV: false,
      }),
    },
    fragmentShaderSource: {
      main: FRAGMENT_SHADER_WHITE_COLOR,
    },
  })
  lightMesh
    .setPosition({
      x: lightTypedPosition[0],
      y: lightTypedPosition[1],
      z: lightTypedPosition[2],
    })
    .setParent(rootNode)

  rootNode.updateWorldMatrix()
  shadowRoot.updateWorldMatrix()

  // debug mesh
  const debugPlaneGeometry = new Geometry(device)
  const debugPlaneWidth = SHADOW_MAP_SIZE * 0.1
  const debugPlaneHeight = SHADOW_MAP_SIZE * 0.1
  const debugPlanePadding = 24
  {
    const { vertices, uv, indices } = GeometryUtils.createPlane({
      width: debugPlaneWidth,
      height: debugPlaneHeight,
    })
    const indexBuffer = new IndexBuffer(device, indices)
    const vertexBuffer = new VertexBuffer(
      device,
      0,
      vertices,
      3 * Float32Array.BYTES_PER_ELEMENT,
    ).addAttribute('position', 0, 3, 'float32x3')
    const uvBuffer = new VertexBuffer(
      device,
      1,
      uv,
      2 * Float32Array.BYTES_PER_ELEMENT,
    ).addAttribute('uv', 0, 2, 'float32x2')

    debugPlaneGeometry
      .addIndexBuffer(indexBuffer)
      .addVertexBuffer(vertexBuffer)
      .addVertexBuffer(uvBuffer)
  }

  const debugPlaneMesh = new Mesh(device, {
    geometry: debugPlaneGeometry,
    vertexShaderSource: {
      main: generateVertexShaderSnippet({
        useNormal: false,
        useUV: true,
      }),
    },
    textures: [shadowDepthTexture],
    samplers: [depthDebugSampler],
    fragmentShaderSource: {
      main: `
        let depth: f32 = textureSample(
          my_depth_texture,
          my_depth_debug_sampler,
          vec2<f32>(input.uv.x, 1.0 - input.uv.y)
        );
        output.Color = vec4<f32>(vec3<f32>(depth), 1.0);
      `,
    },
    targets: [
      {
        format: presentationFormat,
      },
    ],
  })
    .setPosition({
      x: -canvas.width / 2 + debugPlaneWidth / 2 + debugPlanePadding,
      y: -canvas.height / 2 + debugPlaneHeight / 2 + debugPlanePadding,
    })
    .setRotation({ x: Math.PI })
    .updateModelMatrix()

  requestAnimationFrame(drawFrame)

  function drawFrame(ts) {
    ts /= 1000

    requestAnimationFrame(drawFrame)

    // Update lights & camera for shading
    if (OPTIONS.animateLight) {
      lightTypedPosition[0] = Math.cos(ts * OPTIONS.timeScaleFactor) * 40
      // lightTypedPosition[1] = 20 + Math.sin(lightTypedPosition[0] * 0.15) * 2
      lightTypedPosition[2] = Math.sin(ts * OPTIONS.timeScaleFactor) * 40
    }

    lightMesh.setPosition({
      x: lightTypedPosition[0],
      y: lightTypedPosition[1],
      z: lightTypedPosition[2],
    })

    lightCamera
      .setPosition({
        x: lightTypedPosition[0],
        y: lightTypedPosition[1],
        z: lightTypedPosition[2],
      })
      .updateViewMatrix()
      .updateProjectionMatrix()

    cameraTypedPosition[0] = perspCamera.position[0]
    cameraTypedPosition[1] = perspCamera.position[1]
    cameraTypedPosition[2] = perspCamera.position[2]

    const swapChainTexture = context.getCurrentTexture()
    const commandEncoder = device.createCommandEncoder()

    // Shadow render pass
    {
      const shadowPassDescriptor: GPURenderPassDescriptor = {
        colorAttachments: [],
        depthStencilAttachment: {
          view: shadowDepthTexture.get().createView(),
          depthLoadValue: 1.0,
          depthStoreOp: 'store',
          stencilLoadValue: 0,
          stencilStoreOp: 'store',
        },
      }

      const shadowRenderPass =
        commandEncoder.beginRenderPass(shadowPassDescriptor)

      shadowRoot.traverseGraph((node) => {
        if (node.renderable) {
          node.render(shadowRenderPass, lightCamera)
        }
      })

      shadowRenderPass.endPass()
    }

    // Result render pass
    {
      const renderPassDescriptor: GPURenderPassDescriptor = {
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
      }

      const renderPass = commandEncoder.beginRenderPass(renderPassDescriptor)

      rootNode.traverseGraph((node) => {
        if (node.renderable) {
          node.render(renderPass, perspCamera)
        }
      })

      lighedMeshesRoot.traverseGraph((node) => {
        if (node.renderable) {
          node
            .setUniform('lightPosition', lightTypedPosition)
            .setUniform('cameraPosition', cameraTypedPosition)
            .setUniform(
              'lightCamViewMatrix',
              lightCamera.viewMatrix as ArrayBuffer,
            )
            .setUniform(
              'lightCamProjectionMatrix',
              lightCamera.projectionMatrix as ArrayBuffer,
            )
        }
      })

      if (OPTIONS.showDebug) {
        debugPlaneMesh.render(renderPass, orthoCamera)
      }

      renderPass.endPass()
    }

    device.queue.submit([commandEncoder.finish()])
  }

  function traverseSceneGraph(
    currentNode,
    parentNode = null,
    shadowParentNode = null,
  ) {
    // handle mesh node
    const sceneNode = new SceneObject()
    const shadowSceneNode = new SceneObject()
    if (currentNode.mesh) {
      currentNode.mesh.primitives.map((primitive) => {
        const geometry = new Geometry(device)

        if (primitive.attributes.POSITION) {
          const buffer = new VertexBuffer(
            device,
            0,
            primitive.attributes.POSITION.value,
            primitive.attributes.POSITION.bytesPerElement,
          ).addAttribute('position', 0, 3, 'float32x3')
          geometry.addVertexBuffer(buffer)
        }

        if (primitive.attributes.NORMAL) {
          const buffer = new VertexBuffer(
            device,
            1,
            primitive.attributes.NORMAL.value,
            primitive.attributes.NORMAL.bytesPerElement,
          ).addAttribute('normal', 0, 3, 'float32x3')
          geometry.addVertexBuffer(buffer)
        }
        if (primitive.attributes.TEXCOORD_0) {
          const buffer = new VertexBuffer(
            device,
            2,
            primitive.attributes.TEXCOORD_0.value,
            primitive.attributes.TEXCOORD_0.bytesPerElement,
          ).addAttribute('uv', 0, 2, 'float32x2')
          geometry.addVertexBuffer(buffer)
        }

        const indexBuffer = new IndexBuffer(device, primitive.indices.value)
        geometry.addIndexBuffer(indexBuffer)

        const {
          material: {
            pbrMetallicRoughness: { baseColorFactor },
          },
        } = currentNode.mesh.primitives[0]

        const baseMeshState = {
          geometry,
          primitiveType,
        }

        const mesh = new Mesh(device, {
          ...baseMeshState,
          uniforms: {
            ...(lightUniforms as UniformInputs),
            baseColor: {
              type: 'vec4<f32>',
              value: new Float32Array(baseColorFactor),
            },
          },
          vertexShaderSource: {
            outputs: {
              shadowPos: {
                format: 'float32x3',
              },
            },
            main: generateVertexShaderSnippet({
              useUV: false,
              useLightUv: true,
            }),
          },
          samplers: [depthSampler],
          textures: [shadowDepthTexture],
          fragmentShaderSource: {
            inputs: {
              shadowPos: {
                format: 'float32x3',
              },
            },
            main: SHADED_FRAGMENT_SNIPPET,
          },
          targets: [
            {
              format: presentationFormat,
            },
          ],
        })
        mesh.setParent(sceneNode)

        const shadowMesh = new Mesh(device, {
          ...baseMeshState,
          vertexShaderSource: {
            main: generateVertexShaderSnippet({
              useUV: false,
              useNormal: false,
              usePosition: false,
            }),
          },
          fragmentShaderSource: {
            // this should be omitted and we can use a vertex-only pipeline, but it's
            // not yet implemented.
            main: FRAGMENT_SHADER_WHITE_COLOR,
          },
          targets: [],
          depthStencil: {
            depthWriteEnabled: true,
            depthCompare: 'less',
            format: 'depth32float',
          },
        })

        shadowMesh.setParent(shadowSceneNode)
      })
    }
    if (currentNode.matrix) {
      sceneNode.copyFromMatrix(currentNode.matrix)
      shadowSceneNode.copyFromMatrix(currentNode.matrix)
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
      shadowSceneNode.copyFromMatrix(matrix)
    }
    if (parentNode) {
      sceneNode.setParent(parentNode)
    }
    if (shadowParentNode) {
      shadowSceneNode.setParent(shadowParentNode)
    }
    const children = currentNode.nodes || currentNode.children
    if (children && children.length) {
      children.forEach((childNode) => {
        traverseSceneGraph(childNode, sceneNode, shadowSceneNode)
      })
    }
  }
})()
