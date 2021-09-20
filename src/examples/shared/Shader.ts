import { ATTRIB_NAME_POSITION } from './constants'
import { Uniform } from './Mesh'

const TRANSFORM_UBO_SNIPPET = `
  [[block]] struct Transform {
    projectionMatrix: mat4x4<f32>;
    viewMatrix: mat4x4<f32>;
    modelMatrix: mat4x4<f32>;
    normalMatrix: mat4x4<f32>;
  };

  [[group(0), binding(0)]] var<uniform> transform: Transform;
`

export class Shader {
  private device: GPUDevice

  module: GPUShaderModule
  source: string = `${TRANSFORM_UBO_SNIPPET}`

  static entryFunction = 'main'

  get shaderModule(): GPUShaderModule {
    if (!this.module) {
      this.module = this.device.createShaderModule({
        code: this.source,
      })
    }
    return this.module
  }

  constructor(device: GPUDevice, shaderSnippetSource: string) {
    this.device = device
    this.source += shaderSnippetSource
  }
}
