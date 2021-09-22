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

  source: string = `${TRANSFORM_UBO_SNIPPET}`
  isVertex: boolean

  static entryFunction = 'main'

  static getVertexInputFormat(format: GPUVertexFormat) {
    switch (format) {
      case 'float32':
        return '<f32>'
      case 'float32x2':
        return 'vec4<f32>'
      case 'float32x3':
        return 'vec4<f32>'
      case 'float32x4':
        return 'vec4<f32>'
    }
  }

  constructor(device: GPUDevice, isVertex: boolean) {
    this.device = device
    this.isVertex = isVertex
  }

  addMainShaderSnippet(snippet: string): this {
    const shaderStageSnippet = this.isVertex
      ? '[[stage(vertex)]]'
      : '[[stage(fragment)'
    this.source += `
      ${shaderStageSnippet} fn main (input: Input) -> Output {
        var output: Output;

        ${snippet}

        return output;
      }
    `
    return this
  }

  addUniformInputs(inputDefinitions: [string, Uniform][]): this {
    this.source += `
      struct UniformsInput {
        ${inputDefinitions.reduce((acc, [key, { type }]) => {
          acc += `${key}: ${type};`
          return acc
        }, '')}
      };

      [[group(0), binding(1)]] var<uniform> inputUBO: UniformsInput;
    `
    return this
  }

  addVertexInputs(inputDefinitions): this {
    const varyingDefinitions = inputDefinitions
      .filter(([key]) => key !== ATTRIB_NAME_POSITION)
      .reduce((acc, [key, { bindPointIdx, format }]) => {
        const inputFormat = Shader.getVertexInputFormat(format)
        // We need to offset them by 1, since worldPosition is at location(0)
        const offsetBindPointIdx = bindPointIdx + 1
        acc += `[[location(${offsetBindPointIdx})]] ${key}: ${inputFormat};\n`
        return acc
      }, '')

    if (this.isVertex) {
      this.source += `
        struct Input {
          ${inputDefinitions.reduce((acc, [key, { bindPointIdx, format }]) => {
            const inputFormat = Shader.getVertexInputFormat(format)
            acc += `[[location(${bindPointIdx})]] ${key}: ${inputFormat};\n`
            return acc
          }, '')}
        }

        struct Output {
          [[builtin(position)]] Position: vec4<f32>;
          ${varyingDefinitions}
        }
      `
    } else {
      this.source += `
        struct Input {
          ${varyingDefinitions}
        }
      `
    }
    return this
  }
}
