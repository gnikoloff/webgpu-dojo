import { mat4, vec3 } from 'gl-matrix'

const instanceMoveVector = vec3.create()
const instanceModelMatrix = mat4.create()
const normalMatrix = mat4.create()

export const generateInstanceMatrices = (count, onItemCallback: Function) => {
  const instanceModelMatrixData = new Float32Array(count * 16)
  const instanceNormalMatrixData = new Float32Array(count * 16)
  for (let i = 0; i < count * 16; i += 16) {
    const {
      randX,
      randY,
      randZ,
      randRotX,
      randRotY,
      randRotZ,
      randScaleX,
      randScaleY,
      randScaleZ,
    } = onItemCallback(i)

    mat4.identity(instanceModelMatrix)
    vec3.set(instanceMoveVector, randX, randY, randZ)

    mat4.translate(instanceModelMatrix, instanceModelMatrix, instanceMoveVector)
    mat4.rotateX(instanceModelMatrix, instanceModelMatrix, randRotX)
    mat4.rotateY(instanceModelMatrix, instanceModelMatrix, randRotY)
    mat4.rotateZ(instanceModelMatrix, instanceModelMatrix, randRotZ)

    vec3.set(instanceMoveVector, randScaleX, randScaleY, randScaleZ)
    mat4.scale(instanceModelMatrix, instanceModelMatrix, instanceMoveVector)

    mat4.invert(normalMatrix, instanceModelMatrix)
    mat4.transpose(normalMatrix, normalMatrix)

    for (let n = 0; n < 16; n++) {
      instanceModelMatrixData[i + n] = instanceModelMatrix[n]
      instanceNormalMatrixData[i + n] = normalMatrix[n]
    }
  }
  return {
    instanceModelMatrixData,
    instanceNormalMatrixData,
  }
}

export const generateGPUBuffersFromGeometry = (
  device: GPUDevice,
  geometry: any,
) => {
  const { vertices, uv, normal, indices } = geometry

  const verticesBuffer = device.createBuffer({
    size: vertices.byteLength,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    mappedAtCreation: true,
  })
  new Float32Array(verticesBuffer.getMappedRange()).set(vertices)
  verticesBuffer.unmap()

  const uvsBuffer = device.createBuffer({
    size: uv.byteLength,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    mappedAtCreation: true,
  })
  new Float32Array(uvsBuffer.getMappedRange()).set(uv)
  uvsBuffer.unmap()

  const normalsBuffer = device.createBuffer({
    size: normal.byteLength,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    mappedAtCreation: true,
  })
  new Float32Array(normalsBuffer.getMappedRange()).set(normal)
  normalsBuffer.unmap()

  const indexBuffer = device.createBuffer({
    size: indices.byteLength,
    usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
    mappedAtCreation: true,
  })
  if (indices instanceof Uint16Array) {
    new Uint16Array(indexBuffer.getMappedRange()).set(indices)
  } else {
    new Uint32Array(indexBuffer.getMappedRange()).set(indices)
  }
  indexBuffer.unmap()

  return {
    verticesBuffer,
    normalsBuffer,
    uvsBuffer,
    indexBuffer,
    indices,
  }
}
