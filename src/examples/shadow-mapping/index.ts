import { load } from '@loaders.gl/core'
import { GLTFLoader } from '@loaders.gl/gltf/dist/esm/gltf-loader'
import parseColor from 'color-parse'

import {
  CameraController,
  PerspectiveCamera,
  Mesh,
  Geometry,
  SceneObject,
  GeometryUtils,
  OrthographicCamera,
} from '../../lib/hwoa-rang-gpu'

import '../index.css'

const SAMPLE_COUNT = 4

const BLINN_PHONG_LIGHT_SNIPPET = `
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

  let lightPower = 90.0;

  var finalLight = vec3<f32>(
    // inputUBO.ambientColor.rgb +
    vec3<f32>(0.1, 0.1, 0.1) +
    lambertian * inputUBO.diffuseColor.rgb +
    specular * inputUBO.specularColor.rgb
  );

  // var finalLight = lambertian * inputUBO.diffuseColor.rgb; // specular * inputUBO.specularColor.rgb;
  
`

const normalizeRGB = (rgb) => rgb.map((channel) => channel / 255)

//
;(async () => {
  const gltf = await load(
    '/webgpu-dojo/dist/assets/2CylinderEngine.gltf',
    GLTFLoader,
  )
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

  // cameras
  const perspCamera = new PerspectiveCamera(
    (45 * Math.PI) / 180,
    canvas.width / canvas.height,
    0.1,
    400,
  )
  perspCamera.setPosition({ x: 46, y: 23, z: 132 })
  perspCamera.lookAt([0, 0, 0])
  perspCamera.updateProjectionMatrix()
  perspCamera.updateViewMatrix()

  const cameraTypedPosition = new Float32Array(perspCamera.position)
  const lightTypedPosition = new Float32Array([40, 20, 40, 0])

  const lightCamera = new PerspectiveCamera(
    (90 * Math.PI) / 180,
    canvas.width / canvas.height,
    0.1,
    200,
  )
  lightCamera.setPosition({
    x: lightTypedPosition[0],
    y: lightTypedPosition[1],
    z: lightTypedPosition[2],
  })
  lightCamera.lookAt([0, 0, 0])
  lightCamera.updateProjectionMatrix()
  lightCamera.updateViewMatrix()

  const orthoCamera = new OrthographicCamera(
    -canvas.width / 2,
    canvas.width / 2,
    canvas.height / 2,
    -canvas.height / 2,
    0.1,
    3,
  )
  orthoCamera.setPosition({ z: 2 })
  orthoCamera.lookAt([0, 0, 0])
  orthoCamera.updateProjectionMatrix()
  orthoCamera.updateViewMatrix()

  const ctrl = new CameraController(perspCamera, document.body, false)
  ctrl.lookAt([0, 0.5, 0])

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
  }

  const rootNode = new SceneObject()
  const lighedMeshesRoot = new SceneObject()
  const gltfRootNode = new SceneObject()

  lighedMeshesRoot.setParent(rootNode)

  gltfRootNode
    .setScale({ x: 0.1, y: 0.1, z: 0.1 })
    .updateModelMatrix()
    .setParent(lighedMeshesRoot)

  // glTF
  traverseSceneGraph(gltf.scene, gltfRootNode)

  // Floor
  const floorGeometry = new Geometry(device)
  {
    const { vertices, indices, normal } = GeometryUtils.createPlane({
      width: 150,
      height: 150,
    })
    floorGeometry
      .addIndex(indices)
      .addAttribute(
        'position',
        vertices,
        3 * Float32Array.BYTES_PER_ELEMENT,
        'float32x3',
      )
      .addAttribute(
        'normal',
        normal,
        3 * Float32Array.BYTES_PER_ELEMENT,
        'float32x3',
      )
  }
  const floorMesh = new Mesh(device, {
    geometry: floorGeometry,
    multisample: {
      count: SAMPLE_COUNT,
    },
    uniforms: {
      ...lightUniforms,
    },
    vertexShaderSnippetMain: `
      let worldPosition: vec4<f32> = transform.modelMatrix * input.position;
      output.Position = transform.projectionMatrix *
                        transform.viewMatrix *
                        worldPosition;

      output.normal = transform.normalMatrix * input.normal;
      output.position = worldPosition;
    `,
    fragmentShaderSnippetMain: `
      ${BLINN_PHONG_LIGHT_SNIPPET}
      return vec4<f32>(finalLight, 1.0);
    `,
  })
  floorMesh.setRotation({ x: -Math.PI / 2 }).setPosition({ y: -23 })
  floorMesh.setParent(lighedMeshesRoot)

  // light
  const lightGeometry = new Geometry(device)
  {
    const { vertices, indices } = GeometryUtils.createSphere({ radius: 3 })
    lightGeometry
      .addIndex(indices)
      .addAttribute(
        'position',
        vertices,
        3 * Float32Array.BYTES_PER_ELEMENT,
        'float32x3',
      )
  }
  const lightMesh = new Mesh(device, {
    geometry: lightGeometry,
    multisample: {
      count: SAMPLE_COUNT,
    },
    vertexShaderSnippetMain: `
      let worldPosition: vec4<f32> = transform.modelMatrix * input.position;
      output.Position = transform.projectionMatrix *
                        transform.viewMatrix *
                        worldPosition;

      output.position = worldPosition;
    `,
    fragmentShaderSnippetMain: `
      return vec4<f32>(1.0);
    `,
  })
  lightMesh.setPosition({
    x: lightTypedPosition[0],
    y: lightTypedPosition[1],
    z: lightTypedPosition[2],
  })
  lightMesh.setParent(rootNode)

  const duckScale = 0.1
  rootNode
    // .setPosition({ x: -0.5, y: -0.1 })
    // .setScale({ x: duckScale, y: duckScale, z: duckScale })
    // .setRotation({ y: -Math.PI })
    .updateModelMatrix()

  rootNode.updateWorldMatrix()

  // debug mesh
  const debugPlaneGeometry = new Geometry(device)
  const debugPlaneWidth = innerWidth * 0.2
  const debugPlaneHeight = innerHeight * 0.2
  const debugPlanePadding = 24
  {
    const { vertices, uv, indices } = GeometryUtils.createPlane({
      width: debugPlaneWidth,
      height: debugPlaneHeight,
    })
    debugPlaneGeometry
      .addIndex(indices)
      .addAttribute(
        'position',
        vertices,
        3 * Float32Array.BYTES_PER_ELEMENT,
        'float32x3',
      )
      .addAttribute('uv', uv, 2 * Float32Array.BYTES_PER_ELEMENT, 'float32x2')
  }
  const debugPlaneMesh = new Mesh(device, {
    geometry: debugPlaneGeometry,
    multisample: {
      count: SAMPLE_COUNT,
    },
    vertexShaderSnippetMain: `
      let worldPosition: vec4<f32> = transform.modelMatrix * input.position;
      output.Position = transform.projectionMatrix *
                        transform.viewMatrix *
                        worldPosition;

      output.position = worldPosition;
      output.uv = input.uv;
    `,
    fragmentShaderSnippetMain: `
      return vec4<f32>(input.uv, 0.0, 1.0);
    `,
  })
    .setPosition({
      x: -innerWidth / 2 + debugPlaneWidth / 2 + debugPlanePadding,
      y: -innerHeight / 2 + debugPlaneHeight / 2 + debugPlanePadding,
    })
    .setRotation({ x: Math.PI })
    .updateModelMatrix()

  const textureDepth = device.createTexture({
    size: [canvas.width, canvas.height, 1],
    sampleCount: SAMPLE_COUNT,
    format: 'depth24plus',
    usage: GPUTextureUsage.RENDER_ATTACHMENT,
  })

  const renderTexture = device.createTexture({
    size: [canvas.width, canvas.height],
    sampleCount: SAMPLE_COUNT,
    format: presentationFormat,
    usage: GPUTextureUsage.RENDER_ATTACHMENT,
  })
  let renderTextureView = renderTexture.createView()

  requestAnimationFrame(drawFrame)

  function drawFrame(ts) {
    requestAnimationFrame(drawFrame)

    ts /= 1000

    const commandEncoder = device.createCommandEncoder()
    const renderPass = commandEncoder.beginRenderPass({
      colorAttachments: [
        {
          view: renderTextureView,
          resolveTarget: context.getCurrentTexture().createView(),
          loadValue: [0.1, 0.1, 0.1, 1.0],
          storeOp: 'store',
        },
      ],
      depthStencilAttachment: {
        view: textureDepth.createView(),
        depthLoadValue: 1,
        depthStoreOp: 'store',
        stencilLoadValue: 0,
        stencilStoreOp: 'store',
      },
    })

    lightTypedPosition[0] = Math.cos(ts) * 60
    lightTypedPosition[2] = Math.sin(ts) * 60

    lightMesh.setPosition({
      x: lightTypedPosition[0],
      z: lightTypedPosition[2],
    })

    cameraTypedPosition[0] = perspCamera.position[0]
    cameraTypedPosition[1] = perspCamera.position[1]
    cameraTypedPosition[2] = perspCamera.position[2]

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
      }
    })

    debugPlaneMesh.render(renderPass, orthoCamera)

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
          geometry.addAttribute(
            'position',
            primitive.attributes.POSITION.value,
            primitive.attributes.POSITION.bytesPerElement,
            'float32x3',
          )
        }

        if (primitive.attributes.NORMAL) {
          geometry.addAttribute(
            'normal',
            primitive.attributes.NORMAL.value,
            primitive.attributes.NORMAL.bytesPerElement,
            'float32x3',
          )
        }
        if (primitive.attributes.TEXCOORD_0) {
          geometry.addAttribute(
            'uv',
            primitive.attributes.TEXCOORD_0.value,
            primitive.attributes.TEXCOORD_0.bytesPerElement,
            'float32x2',
          )
        }

        geometry.addIndex(primitive.indices.value)

        const {
          material: {
            pbrMetallicRoughness: { baseColorFactor },
          },
        } = currentNode.mesh.primitives[0]

        const mesh = new Mesh(device, {
          geometry,
          uniforms: {
            ...lightUniforms,
            baseColor: {
              type: 'vec4<f32>',
              value: new Float32Array(baseColorFactor),
            },
          },
          multisample: {
            count: SAMPLE_COUNT,
          },
          vertexShaderSnippetMain: `
          let worldPosition: vec4<f32> = transform.modelMatrix * input.position;
          output.Position = transform.projectionMatrix *
                            transform.viewMatrix *
                            worldPosition;
          
          // output.uv = input.uv;
          
          output.normal = transform.normalMatrix *
                          input.normal;

          output.position = worldPosition;
        `,
          fragmentShaderSnippetMain: `
            ${BLINN_PHONG_LIGHT_SNIPPET}
            return vec4<f32>(inputUBO.baseColor.rgb * finalLight, 1.0);
          `,
          presentationFormat,
          primitiveType,
        })
        mesh.setParent(sceneNode)
      })
    }
    if (currentNode.matrix) {
      sceneNode.copyFromMatrix(currentNode.matrix)
    } else {
      // const matrix = mat4.create()
      // if (currentNode.translation) {
      //   mat4.translate(matrix, matrix, currentNode.translation)
      // }
      // if (currentNode.rotation) {
      //   const rot = quat.fromValues(
      //     currentNode.rotation[0],
      //     currentNode.rotation[1],
      //     currentNode.rotation[2],
      //     1,
      //   )
      //   const rotMat = mat4.create()
      //   mat4.fromQuat(rotMat, rot)
      //   mat4.mul(matrix, matrix, rotMat)
      // }
      // if (currentNode.scale) {
      //   mat4.scale(matrix, matrix, currentNode.scale)
      // }
      // sceneNode.copyFromMatrix(matrix)
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
