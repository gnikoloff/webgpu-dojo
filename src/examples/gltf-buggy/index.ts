import { load } from '@loaders.gl/core'
import { GLTFLoader } from '@loaders.gl/gltf/dist/esm/gltf-loader'
import { mat4, quat } from 'gl-matrix'

import {
  CameraController,
  PerspectiveCamera,
  Mesh,
  Geometry,
  SceneObject,
  Texture,
  VertexBuffer,
  IndexBuffer,
} from '../../lib/hwoa-rang-gpu'

import '../index.css'

const SAMPLE_COUNT = 4

const VERTEX_SHADER_MAIN_SNIPPET = `
  let worldPosition: vec4<f32> = transform.modelMatrix * input.position;
  output.Position = transform.projectionMatrix *
                    transform.viewMatrix *
                    worldPosition;
  
  output.normal = transform.normalMatrix *
                  input.normal;

  output.position = worldPosition;
`

const FRAGMENT_SHADER_MAIN_SNIPPET = `
  let normal: vec3<f32> = normalize(input.normal.rgb);
  let lightColor: vec3<f32> = vec3<f32>(1.0);

  // ambient light
  let ambientFactor: f32 = 0.1;
  let ambientLight: vec3<f32> = lightColor * ambientFactor;

  // diffuse light
  let lightDirection: vec3<f32> = normalize(vec3<f32>(0.5, 1.0, 4.0) - input.position.rgb);
  let diffuseStrength: f32 = max(dot(normal, lightDirection), 0.0);
  let diffuseLight: vec3<f32> = lightColor * diffuseStrength;

  // combine lighting
  let finalLight: vec3<f32> = diffuseLight + ambientLight;
  output.Color = vec4<f32>(inputUBO.baseColor.rgb * finalLight, 1.0);
`

//
;(async () => {
  const gltf = await load(`${window['ASSETS_BASE_URL']}/Buggy.gltf`, GLTFLoader)
  console.log(gltf)

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
  traverseSceneGraph(gltf.scene, rootNode)
  const duckScale = 0.02
  rootNode
    .setPosition({ x: -0.5, y: -0.1 })
    .setScale({ x: duckScale, y: duckScale, z: duckScale })
    .updateWorldMatrix()

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

  new CameraController(perspCamera, document.body, false, 0.1).lookAt([
    0, 0.5, 0,
  ])

  //
  const textureDepth = new Texture(device, 'texture_depth').fromDefinition({
    size: [canvas.width, canvas.height, 1],
    sampleCount: SAMPLE_COUNT,
    format: 'depth24plus',
    usage: GPUTextureUsage.RENDER_ATTACHMENT,
  })
  const renderTexture = new Texture(device, 'render_texture').fromDefinition({
    size: [canvas.width, canvas.height],
    sampleCount: SAMPLE_COUNT,
    format: presentationFormat,
    usage: GPUTextureUsage.RENDER_ATTACHMENT,
  })

  requestAnimationFrame(drawFrame)

  function drawFrame(ts) {
    requestAnimationFrame(drawFrame)

    ts /= 1000

    const commandEncoder = device.createCommandEncoder()
    const renderPass = commandEncoder.beginRenderPass({
      colorAttachments: [
        {
          view: renderTexture.get().createView(),
          resolveTarget: context.getCurrentTexture().createView(),
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

    rootNode.traverseGraph((node) => {
      if (node.renderable) {
        node.render(renderPass, perspCamera)
      }
    })

    renderPass.endPass()

    device.queue.submit([commandEncoder.finish()])
  }

  function traverseSceneGraph(currentNode, parentNode = null) {
    // handle mesh node
    let sceneNode = new SceneObject()
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

        const indexBuffer = new IndexBuffer(device, primitive.indices.value)
        geometry.addIndexBuffer(indexBuffer)

        const {
          material: {
            pbrMetallicRoughness: { baseColorFactor },
          },
        } = currentNode.mesh.primitives[0]

        const mesh = new Mesh(device, {
          geometry,
          uniforms: {
            baseColor: {
              type: 'vec4<f32>',
              value: new Float32Array(baseColorFactor),
            },
          },
          multisample: {
            count: SAMPLE_COUNT,
          },
          vertexShaderSource: {
            main: VERTEX_SHADER_MAIN_SNIPPET,
          },
          fragmentShaderSource: {
            main: FRAGMENT_SHADER_MAIN_SNIPPET,
          },
          primitiveType,
        })
        mesh.setParent(sceneNode)
      })
    }
    if (currentNode.matrix) {
      sceneNode.copyFromMatrix(currentNode.matrix)
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
    }
    if (parentNode) {
      sceneNode.setParent(parentNode)
    }
    const children = currentNode.nodes || currentNode.children
    if (children && children.length) {
      children.forEach((childNode) => {
        traverseSceneGraph(childNode, sceneNode)
      })
    }
  }
})()
