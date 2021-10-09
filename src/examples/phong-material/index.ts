import * as dat from 'dat.gui'
import parseColor from 'color-parse'
import { GLTFLoader } from '@loaders.gl/gltf/dist/esm/gltf-loader'
import { load } from '@loaders.gl/core'

import {
  CameraController,
  PerspectiveCamera,
  SceneObject,
  GridHelper,
  Geometry,
  Mesh,
  GeometryUtils,
  VertexBuffer,
  IndexBuffer,
  UniformInputs,
} from '../../lib/hwoa-rang-gpu'

import '../index.css'

const SAMPLE_COUNT = 4
const WORLD_SIZE = 20

const LIGHT_FRAGMENT_SNIPPET = `
  let N: vec3<f32> = normalize(input.normal.rgb);
  let L: vec3<f32> = normalize(inputUBO.lightPosition.xyz - input.position.xyz);
  var M: f32 = length(inputUBO.lightPosition.xyz - input.position.xyz);

  M = M * M;

  // Lambert's cosine law
  let lambertian = max(dot(N, L), 0.0);

  var specular = 0.0;

  if (lambertian > 0.0) {
    let R: vec3<f32> = reflect(-L, N);                  // Reflected light vector
    let V: vec3<f32> = normalize(inputUBO.cameraPosition.xyz - input.position.xyz); // Vector to viewer
    
    // Compute the specular term
    let specAngle = max(dot(R, V), 0.0);
    specular = pow(specAngle, inputUBO.lightShininessAndPower.r);
  }

  var finalLight: vec3<f32>;

  if (inputUBO.mode == 0) {
    finalLight = vec3<f32>(
      inputUBO.ambientColor.rgb +
      lambertian * inputUBO.diffuseColor.rgb * inputUBO.lightShininessAndPower.g / M +
      specular * inputUBO.specularColor.rgb * inputUBO.lightShininessAndPower.g / M
    );
  } elseif (inputUBO.mode == 1) {
    finalLight = inputUBO.ambientColor.rgb;
  } elseif (inputUBO.mode == 2) {
    finalLight = lambertian * inputUBO.diffuseColor.rgb * inputUBO.lightShininessAndPower.g / M;
  } elseif (inputUBO.mode == 3) {
    finalLight = specular * inputUBO.specularColor.rgb * inputUBO.lightShininessAndPower.g / M;
  }

  output.Color = vec4<f32>(finalLight, 1.0);
`

const getVertexShaderSnippet = ({
  includeNormals = true,
  includeUvs = true,
} = {}) => `
  let worldPosition = transform.modelMatrix * input.position;

  output.Position = transform.projectionMatrix *
                    transform.viewMatrix *
                    worldPosition;

  output.position = worldPosition;

  ${
    includeNormals
      ? `output.normal = transform.normalMatrix * input.normal;`
      : ''
  }
  ${includeUvs ? `output.uv = input.uv;` : ''}
`

const normalizeRGB = (rgb) => rgb.map((channel) => channel / 255)

const DRAW_MODES = [
  'normal mode',
  'ambient only',
  'diffuse only',
  'specular only',
]

const OPTIONS = {
  lightPosX: 0.5,
  lightPosY: 7,
  lightPosZ: 9.5,
  ambientColor: '#3531c5',
  diffuseColor: '#be355e',
  specularColor: '#aca5cf',
  lightShininess: 16,
  lightPower: 78,
  lightMode: DRAW_MODES[0],
}

//
;(async () => {
  const gui = new dat.GUI()

  gui.add(OPTIONS, 'lightMode', DRAW_MODES).onChange((newDrawMode) => {
    const idx = DRAW_MODES.indexOf(newDrawMode)
    drawMode[0] = idx
    duckMesh.setUniform('mode', drawMode)
    boxMesh.setUniform('mode', drawMode)
    sphereMesh.setUniform('mode', drawMode)
  })

  const posFolder = gui.addFolder('light position')

  posFolder
    .add(OPTIONS, 'lightPosX')
    .min(-WORLD_SIZE / 2)
    .max(WORLD_SIZE / 2)
  posFolder
    .add(OPTIONS, 'lightPosY')
    .min(-WORLD_SIZE / 2)
    .max(WORLD_SIZE / 2)
  posFolder
    .add(OPTIONS, 'lightPosZ')
    .min(-WORLD_SIZE / 2)
    .max(WORLD_SIZE / 2)

  const lightFolder = gui.addFolder('point light')
  lightFolder
    .add(OPTIONS, 'lightShininess')
    .min(2)
    .max(128)
    .step(2)
    .onChange((v) => {
      lightShininessAndPower[0] = v
      duckMesh.setUniform('lightShininessAndPower', lightShininessAndPower)
      boxMesh.setUniform('lightShininessAndPower', lightShininessAndPower)
      sphereMesh.setUniform('lightShininessAndPower', lightShininessAndPower)
    })
  lightFolder
    .add(OPTIONS, 'lightPower')
    .min(10)
    .max(300)
    .onChange((v) => {
      lightShininessAndPower[1] = v
      duckMesh.setUniform('lightShininessAndPower', lightShininessAndPower)
      boxMesh.setUniform('lightShininessAndPower', lightShininessAndPower)
      sphereMesh.setUniform('lightShininessAndPower', lightShininessAndPower)
    })

  const meshColorFolder = gui.addFolder('mesh color')
  meshColorFolder.addColor(OPTIONS, 'ambientColor').onChange((v) => {
    const ambientColor = new Float32Array(normalizeRGB(parseColor(v).values))
    duckMesh.setUniform('ambientColor', ambientColor)
    boxMesh.setUniform('ambientColor', ambientColor)
    sphereMesh.setUniform('ambientColor', ambientColor)
  })
  meshColorFolder.addColor(OPTIONS, 'diffuseColor').onChange((v) => {
    const diffuseColor = new Float32Array(normalizeRGB(parseColor(v).values))
    duckMesh.setUniform('diffuseColor', diffuseColor)
    boxMesh.setUniform('diffuseColor', diffuseColor)
    sphereMesh.setUniform('diffuseColor', diffuseColor)
  })
  meshColorFolder.addColor(OPTIONS, 'specularColor').onChange((v) => {
    const specularColor = new Float32Array(normalizeRGB(parseColor(v).values))
    duckMesh.setUniform('specularColor', specularColor)
    boxMesh.setUniform('specularColor', specularColor)
    sphereMesh.setUniform('specularColor', specularColor)
  })

  const canvas = document.getElementById('gpu-c') as HTMLCanvasElement
  canvas.width = innerWidth * devicePixelRatio
  canvas.height = innerHeight * devicePixelRatio
  canvas.style.setProperty('width', `${innerWidth}px`)
  canvas.style.setProperty('height', `${innerHeight}px`)

  const adapter = await navigator.gpu?.requestAdapter()

  const device = await adapter?.requestDevice()
  const context = canvas.getContext('webgpu')

  const helper = new GridHelper(device, WORLD_SIZE, 20)

  const presentationFormat = context.getPreferredFormat(adapter)

  context.configure({
    device,
    format: presentationFormat,
  })

  const perspCamera = new PerspectiveCamera(
    (45 * Math.PI) / 180,
    canvas.width / canvas.height,
    0.1,
    200,
  )
  perspCamera.setPosition({ x: 9.2, y: 8, z: 23 })
  perspCamera.lookAt([0, 0, 0])
  perspCamera.updateProjectionMatrix()
  perspCamera.updateViewMatrix()

  const ctrl = new CameraController(perspCamera, canvas)
  ctrl.lookAt([0, 0.5, 0])

  const lightPosition = new Float32Array([1, 1, 1, 1])
  const lightShininessAndPower = new Float32Array([
    OPTIONS.lightShininess,
    OPTIONS.lightPower,
  ])
  const drawMode = new Int32Array([0])
  const cameraPosition = new Float32Array(perspCamera.position)

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

  const rootNode = new SceneObject()

  // all meshes beside the light itself share the same lighting uniforms
  const sharedUniforms = {
    mode: {
      type: 'i32',
      value: drawMode,
    },
    ambientColor: {
      type: 'vec4<f32>',
      value: new Float32Array(
        normalizeRGB(parseColor(OPTIONS.ambientColor).values),
      ),
    },
    diffuseColor: {
      type: 'vec4<f32>',
      value: new Float32Array(
        normalizeRGB(parseColor(OPTIONS.diffuseColor).values),
      ),
    },
    specularColor: {
      type: 'vec4<f32>',
      value: new Float32Array(
        normalizeRGB(parseColor(OPTIONS.specularColor).values),
      ),
    },
    lightPosition: {
      type: 'vec3<f32>',
      value: new Float32Array([1, 0, 1]),
    },
    cameraPosition: {
      type: 'vec3<f32>',
      value: cameraPosition,
    },
    lightShininessAndPower: {
      type: 'vec2<f32>',
      value: lightShininessAndPower,
    },
  }

  const duckGLTF = await load(
    `${window['ASSETS_BASE_URL']}/Duck.gltf`,
    GLTFLoader,
  )

  const duckGeometry = new Geometry(device)
  {
    const indexBuffer = new IndexBuffer(
      device,
      duckGLTF.meshes[0].primitives[0].indices.value,
    )
    const vertexBuffer = new VertexBuffer(
      device,
      0,
      duckGLTF.meshes[0].primitives[0].attributes.POSITION.value,
      3 * Float32Array.BYTES_PER_ELEMENT,
    ).addAttribute(
      'position',
      0,
      3 * Float32Array.BYTES_PER_ELEMENT,
      'float32x3',
    )
    const normalBuffer = new VertexBuffer(
      device,
      1,
      duckGLTF.meshes[0].primitives[0].attributes.NORMAL.value,
      3 * Float32Array.BYTES_PER_ELEMENT,
    ).addAttribute('normal', 0, 3 * Float32Array.BYTES_PER_ELEMENT, 'float32x3')
    const uvBuffer = new VertexBuffer(
      device,
      2,
      duckGLTF.meshes[0].primitives[0].attributes.TEXCOORD_0.value,
      2 * Float32Array.BYTES_PER_ELEMENT,
    ).addAttribute('uv', 0, 2 * Float32Array.BYTES_PER_ELEMENT, 'float32x2')

    duckGeometry
      .addVertexBuffer(vertexBuffer)
      .addVertexBuffer(normalBuffer)
      .addVertexBuffer(uvBuffer)
      .addIndexBuffer(indexBuffer)
  }
  // Duck
  const duckMesh = new Mesh(device, {
    geometry: duckGeometry,
    multisample: {
      count: SAMPLE_COUNT,
    },
    uniforms: {
      ...(sharedUniforms as UniformInputs),
    },
    vertexShaderSource: {
      main: getVertexShaderSnippet(),
    },

    fragmentShaderSource: {
      main: LIGHT_FRAGMENT_SNIPPET,
    },
  })
    .copyFromMatrix(duckGLTF.scene.nodes[0].matrix)
    .setPosition({ y: -0.3 })
    .setRotation({ y: -Math.PI / 2 })
    .setScale({ x: 0.03, y: 0.03, z: 0.03 })
    .setParent(rootNode)

  rootNode.updateWorldMatrix()

  // Box
  const boxGeometry = new Geometry(device)
  {
    const { vertices, normal, indices } = GeometryUtils.createBox()
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
    const normalBuffer = new VertexBuffer(
      device,
      1,
      normal,
      3 * Float32Array.BYTES_PER_ELEMENT,
    ).addAttribute('normal', 0, 3 * Float32Array.BYTES_PER_ELEMENT, 'float32x3')
    const indexBuffer = new IndexBuffer(device, indices)
    boxGeometry
      .addVertexBuffer(vertexBuffer)
      .addVertexBuffer(normalBuffer)
      .addIndexBuffer(indexBuffer)
  }
  const boxMesh = new Mesh(device, {
    geometry: boxGeometry,
    multisample: {
      count: SAMPLE_COUNT,
    },
    uniforms: {
      ...(sharedUniforms as UniformInputs),
    },
    vertexShaderSource: {
      main: getVertexShaderSnippet({ includeUvs: false }),
    },
    fragmentShaderSource: {
      main: LIGHT_FRAGMENT_SNIPPET,
    },
  })

  const boxScale = 3
  boxMesh
    .setScale({ x: boxScale, y: boxScale, z: boxScale })
    .setPosition({ x: 5, y: boxScale / 2, z: 0.9 })
    .setRotation({ y: Math.PI * 0.4 })
    .setParent(rootNode)

  // sphere
  const sphereGeometry = new Geometry(device)
  {
    const { vertices, normal, indices } = GeometryUtils.createSphere({
      widthSegments: 30,
      heightSegments: 30,
    })
    const indexBuffer = new IndexBuffer(device, indices)
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
    const normalBuffer = new VertexBuffer(
      device,
      1,
      normal,
      3 * Float32Array.BYTES_PER_ELEMENT,
    ).addAttribute('normal', 0, 3 * Float32Array.BYTES_PER_ELEMENT, 'float32x3')

    sphereGeometry
      .addVertexBuffer(vertexBuffer)
      .addVertexBuffer(normalBuffer)
      .addIndexBuffer(indexBuffer)
  }
  const sphereMesh = new Mesh(device, {
    geometry: sphereGeometry,
    multisample: {
      count: SAMPLE_COUNT,
    },
    uniforms: {
      ...(sharedUniforms as UniformInputs),
    },
    vertexShaderSource: {
      main: getVertexShaderSnippet({ includeUvs: false }),
    },
    fragmentShaderSource: {
      main: LIGHT_FRAGMENT_SNIPPET,
    },
  })

  const sphereScale = 4
  sphereMesh
    .setScale({ x: sphereScale, y: sphereScale, z: sphereScale })
    .setPosition({ x: -4.5, y: sphereScale / 2, z: 2 })
    .setRotation({ y: -Math.PI * 0.2 })
    .setParent(rootNode)

  // light
  const lightMesh = new Mesh(device, {
    geometry: sphereGeometry,
    multisample: {
      count: 4,
    },
    vertexShaderSource: {
      main: getVertexShaderSnippet({
        includeUvs: false,
        includeNormals: false,
      }),
    },
    fragmentShaderSource: {
      main: `
        output.Color = vec4<f32>(1.0);
      `,
    },
  })
  lightMesh.setParent(rootNode)

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

    lightPosition[0] = OPTIONS.lightPosX
    lightPosition[1] = OPTIONS.lightPosY
    lightPosition[2] = OPTIONS.lightPosZ

    lightMesh.setPosition({
      x: lightPosition[0],
      y: lightPosition[1],
      z: lightPosition[2],
    })

    cameraPosition[0] = perspCamera.position[0]
    cameraPosition[1] = perspCamera.position[1]
    cameraPosition[2] = perspCamera.position[2]

    helper.render(renderPass, perspCamera)

    duckMesh
      .setUniform('lightPosition', lightPosition)
      .setUniform('cameraPosition', cameraPosition)
      .render(renderPass, perspCamera)

    boxMesh
      .setUniform('lightPosition', lightPosition)
      .setUniform('cameraPosition', cameraPosition)
      .render(renderPass, perspCamera)

    sphereMesh
      .setUniform('lightPosition', lightPosition)
      .setUniform('cameraPosition', cameraPosition)
      .render(renderPass, perspCamera)

    lightMesh.render(renderPass, perspCamera)

    renderPass.endPass()
    device.queue.submit([commandEncoder.finish()])
  }
})()
