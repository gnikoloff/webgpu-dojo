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

    class BaseBuffer {
        constructor(device) {
            this.device = device;
        }
        get() {
            return this.buffer;
        }
        destroy() {
            this.buffer.destroy();
        }
    }

    class IndexBuffer extends BaseBuffer {
        constructor(device, typedArray) {
            super(device);
            this.itemsCount = typedArray.length;
            this.typedArray = typedArray;
            this.buffer = device.createBuffer({
                size: Math.ceil(typedArray.byteLength / 8) * 8,
                usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
                mappedAtCreation: true,
            });
            if (this.typedArray instanceof Uint16Array) {
                new Uint16Array(this.buffer.getMappedRange()).set(typedArray);
            }
            else {
                new Uint32Array(this.buffer.getMappedRange()).set(typedArray);
            }
            this.buffer.unmap();
        }
        get isInt16() {
            return this.typedArray instanceof Uint16Array;
        }
        bind(renderPass) {
            renderPass.setIndexBuffer(this.buffer, this.isInt16 ? 'uint16' : 'uint32');
            return this;
        }
    }

    class BufferAttribute {
        constructor(offset = 0, size = 3, format = 'float32x4') {
            this.offset = 0;
            this.size = 3;
            this.format = 'float32x4';
            this.offset = offset;
            this.size = size;
            this.format = format;
        }
    }

    class VertexBuffer extends BaseBuffer {
        constructor(device, bindPointIdx, typedArray, arrayStride = 4 * Float32Array.BYTES_PER_ELEMENT, usage = GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST, stepMode = 'vertex') {
            super(device);
            this.attributes = new Map();
            this.stepMode = 'vertex';
            this.bindPointIdx = bindPointIdx;
            this.typedArray = typedArray;
            this.arrayStride = arrayStride;
            this.stepMode = stepMode;
            this.buffer = device.createBuffer({
                size: typedArray.byteLength,
                usage,
                mappedAtCreation: true,
            });
            new Float32Array(this.buffer.getMappedRange()).set(typedArray);
            this.buffer.unmap();
        }
        get itemsCount() {
            return this.typedArray.length / this.arrayStride;
        }
        getLayout(vertexIdx) {
            if (!this.attributes.size) {
                console.error('Vertex buffer has no associated attributes!');
            }
            return {
                arrayStride: this.arrayStride,
                stepMode: this.stepMode,
                attributes: Array.from(this.attributes).map(([_, vertexBuffer], i) => {
                    return {
                        offset: vertexBuffer.offset,
                        format: vertexBuffer.format,
                        shaderLocation: vertexIdx + i,
                    };
                }),
            };
        }
        addAttribute(key, offset = 0, size = 3, format = 'float32x4') {
            const attribute = new BufferAttribute(offset, size, format);
            this.attributes.set(key, attribute);
            return this;
        }
        bind(renderPass) {
            renderPass.setVertexBuffer(this.bindPointIdx, this.buffer);
            return this;
        }
    }

    class UniformBuffer extends BaseBuffer {
        constructor(device, byteLength, usage = GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST) {
            super(device);
            this.byteLength = byteLength;
            this.buffer = device.createBuffer({
                size: byteLength,
                usage,
            });
        }
        write(byteOffset, data) {
            this.device.queue.writeBuffer(this.buffer, byteOffset, data);
            return this;
        }
    }

    class Shader {
        constructor(device) {
            this.source = ``;
            this.device = device;
        }
        static getVertexInputFormat(format) {
            switch (format) {
                case 'float32':
                    return 'f32';
                case 'float32x2':
                    return 'vec2<f32>';
                case 'float32x3':
                    return 'vec4<f32>';
                case 'float32x4':
                    return 'vec4<f32>';
            }
        }
        get shaderModule() {
            if (!this.module) {
                this.module = this.device.createShaderModule({
                    code: this.source,
                });
            }
            return this.module;
        }
        addUniformInputs(uniforms, bindIdx = 1) {
            this.source += `
      [[block]] struct UniformsInput {
        ${Object.entries(uniforms).reduce((acc, [key, { type }]) => {
            acc += `${key}: ${type};`;
            return acc;
        }, '')}
      };

      [[group(0), binding(${bindIdx})]] var<uniform> inputUBO: UniformsInput;
    `;
            return this;
        }
        addTextureInputs(textureBindPoints) {
            this.source += textureBindPoints.reduce((acc, { bindIdx, name, type }) => acc +
                `
          [[group(0), binding(${bindIdx})]] var ${name}: ${type};
        `, '');
            return this;
        }
        addSamplerInputs(samplerBindPoints) {
            this.source += samplerBindPoints.reduce((acc, { bindIdx, name, type }) => acc +
                `
          [[group(0), binding(${bindIdx})]] var ${name}: ${type};
          `, '');
            return this;
        }
        addStorages(storageBindPoints) {
            storageBindPoints.forEach(({ dataStride, bindIdx, name, attributes }) => {
                this.source += `
        struct ${name} {
          ${Object.entries(attributes)
                .map(([key, format]) => `${key}: ${format};`)
                .join('\n')}
        };

        [[block]] struct ${name}Collection {
          ${name.toLowerCase()}s: [[stride(48)]] array<Light>;
        };

        [[group(0), binding(${bindIdx})]] var<storage, read_write> ${name.toLowerCase()}Collection: ${name}Collection;
      `;
            });
            return this;
        }
        addHeadSnippet(shaderSnippet) {
            if (shaderSnippet) {
                this.source += shaderSnippet;
            }
            return this;
        }
    }
    Shader.ENTRY_FUNCTION = 'main';

    class VertexShader extends Shader {
        constructor(device) {
            super(device);
            this.source += VertexShader.TRANSFORM_UBO_SNIPPET;
        }
        addShaderVars(vertexBuffers, customShaderVarsOutputs = {}) {
            let variableIdx = 0;
            let inputDefinitionSnippet = '';
            let outputDefinitionSnippet = '';
            vertexBuffers.forEach(({ attributes }) => {
                for (const [key, { format }] of attributes) {
                    const variableShaderFormat = Shader.getVertexInputFormat(format);
                    if (!variableShaderFormat) {
                        console.error('shader vertex variable has no proper wglsl format');
                    }
                    inputDefinitionSnippet += `
          [[location(${variableIdx})]] ${key}: ${variableShaderFormat};
        `;
                    outputDefinitionSnippet += `
          [[location(${variableIdx})]] ${key}: ${variableShaderFormat};
        `;
                    variableIdx++;
                }
            });
            for (const [key, { format }] of Object.entries(customShaderVarsOutputs)) {
                const variableShaderFormat = Shader.getVertexInputFormat(format);
                if (!variableShaderFormat) {
                    console.error('shader vertex variable has no proper wglsl format');
                }
                outputDefinitionSnippet += `
        [[location(${variableIdx})]] ${key}: ${variableShaderFormat};
      `;
                variableIdx++;
            }
            this.source += `
      struct Input {
        ${inputDefinitionSnippet}
      };

      struct Output {
        [[builtin(position)]] Position: vec4<f32>;
        ${outputDefinitionSnippet}
      };
    `;
            return this;
        }
        addMainFnSnippet(shaderSnippet) {
            this.source += `
      [[stage(vertex)]] fn main (input: Input) -> Output {
        var output: Output;
        ${shaderSnippet}
        return output;
      }
    `;
            return this;
        }
    }
    VertexShader.TRANSFORM_UBO_SNIPPET = `
    [[block]] struct Transform {
      projectionMatrix: mat4x4<f32>;
      viewMatrix: mat4x4<f32>;
      modelMatrix: mat4x4<f32>;
      normalMatrix: mat4x4<f32>;
    };

    [[group(0), binding(0)]] var<uniform> transform: Transform;
  `;

    class FragmentShader extends Shader {
        addShaderVars(vertexBuffers, customShaderVarsInputs = {}, customShaderVarsOutputs = {}) {
            let inputVariableIdx = 0;
            let outputVariableIdx = 0;
            let inputDefinitionSnippet = '';
            let outputDefinitionSnippet = '';
            vertexBuffers.forEach(({ attributes }) => {
                for (const [key, { format }] of attributes) {
                    const variableShaderFormat = Shader.getVertexInputFormat(format);
                    if (!variableShaderFormat) {
                        console.error('shader vertex variable has no proper wglsl format');
                    }
                    inputDefinitionSnippet += `
          [[location(${inputVariableIdx})]] ${key}: ${variableShaderFormat};
        `;
                    inputVariableIdx++;
                }
            });
            for (const [key, { format }] of Object.entries(customShaderVarsInputs)) {
                const variableShaderFormat = Shader.getVertexInputFormat(format);
                if (!variableShaderFormat) {
                    console.error('shader vertex variable has no proper wglsl format');
                }
                inputDefinitionSnippet += `
        [[location(${inputVariableIdx})]] ${key}: ${variableShaderFormat};
      `;
                inputVariableIdx++;
            }
            for (const [key, { format }] of Object.entries(customShaderVarsOutputs)) {
                const variableShaderFormat = Shader.getVertexInputFormat(format);
                if (!variableShaderFormat) {
                    console.error('shader vertex variable has no proper wglsl format');
                }
                outputDefinitionSnippet += `
        [[location(${outputVariableIdx + 1})]] ${key}: ${variableShaderFormat};
      `;
                outputVariableIdx++;
            }
            this.source += `
      struct Input {
        [[builtin(position)]] coords: vec4<f32>;
        ${inputDefinitionSnippet}
      };

      struct Output {
        [[location(0)]] Color: vec4<f32>;
        ${outputDefinitionSnippet}
      };
    `;
            return this;
        }
        addMainFnSnippet(shaderSnippet) {
            this.source += `
      [[stage(fragment)]] fn main (input: Input) -> Output {
        var output: Output;
        ${shaderSnippet}
        return output;
      }
    `;
            return this;
        }
    }

    class BindGroup {
        constructor(device, bindingIndex = 0) {
            this.samplers = [];
            this.textures = [];
            this.uniformBlocks = [];
            this.storageBuffers = [];
            this.device = device;
            this.bindingIndex = bindingIndex;
        }
        bind(renderPass) {
            renderPass.setBindGroup(this.bindingIndex, this.bindGroup);
            return this;
        }
        addSampler(sampler) {
            this.samplers.push(sampler);
            return this;
        }
        addTexture(texture) {
            this.textures.push(texture);
            return this;
        }
        addStorage(storageBuffer) {
            this.storageBuffers.push(storageBuffer);
            return this;
        }
        addUBO(byteLength) {
            const uniformBlock = new UniformBuffer(this.device, byteLength);
            this.uniformBlocks.push(uniformBlock);
            return this;
        }
        writeToUBO(uboIdx, byteOffset, data) {
            const ubo = this.uniformBlocks[uboIdx];
            if (!ubo) {
                console.error('UBO not found');
                return this;
            }
            ubo.write(byteOffset, data);
            return this;
        }
        getLayout() {
            const entries = [];
            let accBindingIndex = 0;
            this.uniformBlocks.forEach(() => {
                entries.push({
                    visibility: GPUShaderStage.VERTEX |
                        GPUShaderStage.FRAGMENT |
                        GPUShaderStage.COMPUTE,
                    binding: accBindingIndex,
                    buffer: {
                        type: 'uniform',
                    },
                });
                accBindingIndex++;
            });
            this.samplers.forEach((sampler) => {
                entries.push({
                    visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
                    binding: accBindingIndex,
                    sampler: {
                        type: sampler.bindingType,
                    },
                });
                accBindingIndex++;
            });
            this.textures.forEach((texture) => {
                entries.push({
                    visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
                    binding: accBindingIndex,
                    texture: {
                        sampleType: texture.sampleType,
                    },
                });
                accBindingIndex++;
            });
            this.storageBuffers.forEach(() => {
                entries.push({
                    visibility: GPUShaderStage.FRAGMENT | GPUShaderStage.COMPUTE,
                    binding: accBindingIndex,
                    buffer: {
                        type: 'storage',
                    },
                });
                accBindingIndex++;
            });
            console.log('layout', { entries });
            const bindGroupLayout = this.device.createBindGroupLayout({
                entries,
            });
            return bindGroupLayout;
        }
        attachToPipeline(pipeline) {
            const entries = [];
            let accBindingIndex = 0;
            this.uniformBlocks.forEach((bufferBlock) => {
                entries.push({
                    binding: accBindingIndex,
                    resource: {
                        buffer: bufferBlock.get(),
                        offset: 0,
                        size: bufferBlock.byteLength,
                    },
                });
                accBindingIndex++;
            });
            this.samplers.forEach((sampler) => {
                entries.push({
                    binding: accBindingIndex,
                    resource: sampler.get(),
                });
                accBindingIndex++;
            });
            this.textures.forEach((texture, i) => {
                entries.push({
                    binding: accBindingIndex,
                    resource: texture.get().createView(),
                });
                accBindingIndex++;
            });
            this.storageBuffers.forEach((storageBuffer, i) => {
                entries.push({
                    binding: accBindingIndex,
                    resource: {
                        buffer: storageBuffer.get(),
                        offset: 0,
                        size: storageBuffer.byteLength,
                    },
                });
                accBindingIndex++;
            });
            this.bindGroup = this.device.createBindGroup({
                layout: pipeline.getBindGroupLayout(this.bindingIndex),
                entries,
            });
            return this;
        }
        destroy() {
            this.uniformBlocks.forEach((ubo) => ubo.destroy());
            this.textures.forEach((texture) => texture.destroy());
            this.samplers.forEach((sampler) => sampler.destroy());
            this.storageBuffers.forEach((storageBuffer) => storageBuffer.destroy());
            // TODO
            // webgpu spec has nothing on destroying GPUBindGroup
        }
    }

    const ATTRIB_NAME_POSITION = 'position';
    const PRIMITIVE_TOPOLOGY_LINE_STRIP = 'line-strip';
    const PRIMITIVE_TOPOLOGY_TRIANGLE_LIST = 'triangle-list';
    const PRIMITIVE_TOPOLOGY_TRIANGLE_STRIP = 'triangle-strip';
    const UNIFORM_TYPES_MAP = new Map([
        ['mat4x4<f32>', [16, Float32Array.BYTES_PER_ELEMENT]],
        ['mat3x3<f32>', [12, Float32Array.BYTES_PER_ELEMENT]],
        ['vec4<f32>', [4, Float32Array.BYTES_PER_ELEMENT]],
        ['vec3<f32>', [3, Float32Array.BYTES_PER_ELEMENT]],
        ['vec2<f32>', [2, Float32Array.BYTES_PER_ELEMENT]],
        ['f32', [1, Float32Array.BYTES_PER_ELEMENT]],
        ['i32', [1, Int32Array.BYTES_PER_ELEMENT]],
        ['u32', [1, Uint32Array.BYTES_PER_ELEMENT]],
        ['i16', [1, Int16Array.BYTES_PER_ELEMENT]],
        ['u16', [1, Uint16Array.BYTES_PER_ELEMENT]],
    ]);

    class Geometry {
        constructor(device) {
            this.vertexCount = 0;
            this.instanceCount = 1;
            this.vertexBuffers = [];
            this.primitiveType = PRIMITIVE_TOPOLOGY_TRIANGLE_LIST;
            this.device = device;
        }
        get hasIndex() {
            return !!this.indexBuffer;
        }
        get stripIndexFormat() {
            var _a;
            let stripIndexFormat = undefined;
            if (this.primitiveType === PRIMITIVE_TOPOLOGY_LINE_STRIP ||
                this.primitiveType === PRIMITIVE_TOPOLOGY_TRIANGLE_STRIP) {
                stripIndexFormat = ((_a = this.indexBuffer) === null || _a === void 0 ? void 0 : _a.isInt16) ? 'uint16' : 'uint32';
            }
            return stripIndexFormat;
        }
        addIndexBuffer(indexBuffer) {
            this.vertexCount = indexBuffer.itemsCount;
            this.indexBuffer = indexBuffer;
            return this;
        }
        addVertexBuffer(vertexBuffer) {
            const holdsPosition = vertexBuffer.attributes.get(ATTRIB_NAME_POSITION);
            if (holdsPosition && !this.vertexCount) {
                this.vertexCount = vertexBuffer.itemsCount;
            }
            this.vertexBuffers.push(vertexBuffer);
            return this;
        }
        getVertexBuffersLayout() {
            const buffers = [];
            let vertexBindIdx = 0;
            for (const vertexBuffer of this.vertexBuffers.values()) {
                buffers.push(vertexBuffer.getLayout(vertexBindIdx));
                vertexBindIdx += vertexBuffer.attributes.size;
            }
            return buffers;
        }
        draw(renderPass) {
            this.vertexBuffers.forEach((vertexBuffer) => vertexBuffer.bind(renderPass));
            if (this.indexBuffer) {
                this.indexBuffer.bind(renderPass);
                renderPass.drawIndexed(this.vertexCount, this.instanceCount);
            }
            else {
                renderPass.draw(this.vertexCount, this.instanceCount);
            }
        }
        destroy() {
            var _a;
            (_a = this.indexBuffer) === null || _a === void 0 ? void 0 : _a.destroy();
            this.vertexBuffers.forEach((buffer) => buffer.destroy());
        }
    }

    /**
     * Common utilities
     * @module glMatrix
     */
    // Configuration Constants
    var EPSILON = 0.000001;
    var ARRAY_TYPE = typeof Float32Array !== 'undefined' ? Float32Array : Array;
    if (!Math.hypot) Math.hypot = function () {
      var y = 0,
          i = arguments.length;

      while (i--) {
        y += arguments[i] * arguments[i];
      }

      return Math.sqrt(y);
    };

    /**
     * 4x4 Matrix<br>Format: column-major, when typed out it looks like row-major<br>The matrices are being post multiplied.
     * @module mat4
     */

    /**
     * Creates a new identity mat4
     *
     * @returns {mat4} a new 4x4 matrix
     */

    function create$2() {
      var out = new ARRAY_TYPE(16);

      if (ARRAY_TYPE != Float32Array) {
        out[1] = 0;
        out[2] = 0;
        out[3] = 0;
        out[4] = 0;
        out[6] = 0;
        out[7] = 0;
        out[8] = 0;
        out[9] = 0;
        out[11] = 0;
        out[12] = 0;
        out[13] = 0;
        out[14] = 0;
      }

      out[0] = 1;
      out[5] = 1;
      out[10] = 1;
      out[15] = 1;
      return out;
    }
    /**
     * Copy the values from one mat4 to another
     *
     * @param {mat4} out the receiving matrix
     * @param {ReadonlyMat4} a the source matrix
     * @returns {mat4} out
     */

    function copy(out, a) {
      out[0] = a[0];
      out[1] = a[1];
      out[2] = a[2];
      out[3] = a[3];
      out[4] = a[4];
      out[5] = a[5];
      out[6] = a[6];
      out[7] = a[7];
      out[8] = a[8];
      out[9] = a[9];
      out[10] = a[10];
      out[11] = a[11];
      out[12] = a[12];
      out[13] = a[13];
      out[14] = a[14];
      out[15] = a[15];
      return out;
    }
    /**
     * Set a mat4 to the identity matrix
     *
     * @param {mat4} out the receiving matrix
     * @returns {mat4} out
     */

    function identity(out) {
      out[0] = 1;
      out[1] = 0;
      out[2] = 0;
      out[3] = 0;
      out[4] = 0;
      out[5] = 1;
      out[6] = 0;
      out[7] = 0;
      out[8] = 0;
      out[9] = 0;
      out[10] = 1;
      out[11] = 0;
      out[12] = 0;
      out[13] = 0;
      out[14] = 0;
      out[15] = 1;
      return out;
    }
    /**
     * Transpose the values of a mat4
     *
     * @param {mat4} out the receiving matrix
     * @param {ReadonlyMat4} a the source matrix
     * @returns {mat4} out
     */

    function transpose(out, a) {
      // If we are transposing ourselves we can skip a few steps but have to cache some values
      if (out === a) {
        var a01 = a[1],
            a02 = a[2],
            a03 = a[3];
        var a12 = a[6],
            a13 = a[7];
        var a23 = a[11];
        out[1] = a[4];
        out[2] = a[8];
        out[3] = a[12];
        out[4] = a01;
        out[6] = a[9];
        out[7] = a[13];
        out[8] = a02;
        out[9] = a12;
        out[11] = a[14];
        out[12] = a03;
        out[13] = a13;
        out[14] = a23;
      } else {
        out[0] = a[0];
        out[1] = a[4];
        out[2] = a[8];
        out[3] = a[12];
        out[4] = a[1];
        out[5] = a[5];
        out[6] = a[9];
        out[7] = a[13];
        out[8] = a[2];
        out[9] = a[6];
        out[10] = a[10];
        out[11] = a[14];
        out[12] = a[3];
        out[13] = a[7];
        out[14] = a[11];
        out[15] = a[15];
      }

      return out;
    }
    /**
     * Inverts a mat4
     *
     * @param {mat4} out the receiving matrix
     * @param {ReadonlyMat4} a the source matrix
     * @returns {mat4} out
     */

    function invert(out, a) {
      var a00 = a[0],
          a01 = a[1],
          a02 = a[2],
          a03 = a[3];
      var a10 = a[4],
          a11 = a[5],
          a12 = a[6],
          a13 = a[7];
      var a20 = a[8],
          a21 = a[9],
          a22 = a[10],
          a23 = a[11];
      var a30 = a[12],
          a31 = a[13],
          a32 = a[14],
          a33 = a[15];
      var b00 = a00 * a11 - a01 * a10;
      var b01 = a00 * a12 - a02 * a10;
      var b02 = a00 * a13 - a03 * a10;
      var b03 = a01 * a12 - a02 * a11;
      var b04 = a01 * a13 - a03 * a11;
      var b05 = a02 * a13 - a03 * a12;
      var b06 = a20 * a31 - a21 * a30;
      var b07 = a20 * a32 - a22 * a30;
      var b08 = a20 * a33 - a23 * a30;
      var b09 = a21 * a32 - a22 * a31;
      var b10 = a21 * a33 - a23 * a31;
      var b11 = a22 * a33 - a23 * a32; // Calculate the determinant

      var det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

      if (!det) {
        return null;
      }

      det = 1.0 / det;
      out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
      out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
      out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
      out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
      out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
      out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
      out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
      out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
      out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
      out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
      out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
      out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
      out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
      out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
      out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
      out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;
      return out;
    }
    /**
     * Multiplies two mat4s
     *
     * @param {mat4} out the receiving matrix
     * @param {ReadonlyMat4} a the first operand
     * @param {ReadonlyMat4} b the second operand
     * @returns {mat4} out
     */

    function multiply(out, a, b) {
      var a00 = a[0],
          a01 = a[1],
          a02 = a[2],
          a03 = a[3];
      var a10 = a[4],
          a11 = a[5],
          a12 = a[6],
          a13 = a[7];
      var a20 = a[8],
          a21 = a[9],
          a22 = a[10],
          a23 = a[11];
      var a30 = a[12],
          a31 = a[13],
          a32 = a[14],
          a33 = a[15]; // Cache only the current line of the second matrix

      var b0 = b[0],
          b1 = b[1],
          b2 = b[2],
          b3 = b[3];
      out[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
      out[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
      out[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
      out[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
      b0 = b[4];
      b1 = b[5];
      b2 = b[6];
      b3 = b[7];
      out[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
      out[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
      out[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
      out[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
      b0 = b[8];
      b1 = b[9];
      b2 = b[10];
      b3 = b[11];
      out[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
      out[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
      out[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
      out[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
      b0 = b[12];
      b1 = b[13];
      b2 = b[14];
      b3 = b[15];
      out[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
      out[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
      out[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
      out[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
      return out;
    }
    /**
     * Translate a mat4 by the given vector
     *
     * @param {mat4} out the receiving matrix
     * @param {ReadonlyMat4} a the matrix to translate
     * @param {ReadonlyVec3} v vector to translate by
     * @returns {mat4} out
     */

    function translate(out, a, v) {
      var x = v[0],
          y = v[1],
          z = v[2];
      var a00, a01, a02, a03;
      var a10, a11, a12, a13;
      var a20, a21, a22, a23;

      if (a === out) {
        out[12] = a[0] * x + a[4] * y + a[8] * z + a[12];
        out[13] = a[1] * x + a[5] * y + a[9] * z + a[13];
        out[14] = a[2] * x + a[6] * y + a[10] * z + a[14];
        out[15] = a[3] * x + a[7] * y + a[11] * z + a[15];
      } else {
        a00 = a[0];
        a01 = a[1];
        a02 = a[2];
        a03 = a[3];
        a10 = a[4];
        a11 = a[5];
        a12 = a[6];
        a13 = a[7];
        a20 = a[8];
        a21 = a[9];
        a22 = a[10];
        a23 = a[11];
        out[0] = a00;
        out[1] = a01;
        out[2] = a02;
        out[3] = a03;
        out[4] = a10;
        out[5] = a11;
        out[6] = a12;
        out[7] = a13;
        out[8] = a20;
        out[9] = a21;
        out[10] = a22;
        out[11] = a23;
        out[12] = a00 * x + a10 * y + a20 * z + a[12];
        out[13] = a01 * x + a11 * y + a21 * z + a[13];
        out[14] = a02 * x + a12 * y + a22 * z + a[14];
        out[15] = a03 * x + a13 * y + a23 * z + a[15];
      }

      return out;
    }
    /**
     * Scales the mat4 by the dimensions in the given vec3 not using vectorization
     *
     * @param {mat4} out the receiving matrix
     * @param {ReadonlyMat4} a the matrix to scale
     * @param {ReadonlyVec3} v the vec3 to scale the matrix by
     * @returns {mat4} out
     **/

    function scale$1(out, a, v) {
      var x = v[0],
          y = v[1],
          z = v[2];
      out[0] = a[0] * x;
      out[1] = a[1] * x;
      out[2] = a[2] * x;
      out[3] = a[3] * x;
      out[4] = a[4] * y;
      out[5] = a[5] * y;
      out[6] = a[6] * y;
      out[7] = a[7] * y;
      out[8] = a[8] * z;
      out[9] = a[9] * z;
      out[10] = a[10] * z;
      out[11] = a[11] * z;
      out[12] = a[12];
      out[13] = a[13];
      out[14] = a[14];
      out[15] = a[15];
      return out;
    }
    /**
     * Rotates a matrix by the given angle around the X axis
     *
     * @param {mat4} out the receiving matrix
     * @param {ReadonlyMat4} a the matrix to rotate
     * @param {Number} rad the angle to rotate the matrix by
     * @returns {mat4} out
     */

    function rotateX(out, a, rad) {
      var s = Math.sin(rad);
      var c = Math.cos(rad);
      var a10 = a[4];
      var a11 = a[5];
      var a12 = a[6];
      var a13 = a[7];
      var a20 = a[8];
      var a21 = a[9];
      var a22 = a[10];
      var a23 = a[11];

      if (a !== out) {
        // If the source and destination differ, copy the unchanged rows
        out[0] = a[0];
        out[1] = a[1];
        out[2] = a[2];
        out[3] = a[3];
        out[12] = a[12];
        out[13] = a[13];
        out[14] = a[14];
        out[15] = a[15];
      } // Perform axis-specific matrix multiplication


      out[4] = a10 * c + a20 * s;
      out[5] = a11 * c + a21 * s;
      out[6] = a12 * c + a22 * s;
      out[7] = a13 * c + a23 * s;
      out[8] = a20 * c - a10 * s;
      out[9] = a21 * c - a11 * s;
      out[10] = a22 * c - a12 * s;
      out[11] = a23 * c - a13 * s;
      return out;
    }
    /**
     * Rotates a matrix by the given angle around the Y axis
     *
     * @param {mat4} out the receiving matrix
     * @param {ReadonlyMat4} a the matrix to rotate
     * @param {Number} rad the angle to rotate the matrix by
     * @returns {mat4} out
     */

    function rotateY(out, a, rad) {
      var s = Math.sin(rad);
      var c = Math.cos(rad);
      var a00 = a[0];
      var a01 = a[1];
      var a02 = a[2];
      var a03 = a[3];
      var a20 = a[8];
      var a21 = a[9];
      var a22 = a[10];
      var a23 = a[11];

      if (a !== out) {
        // If the source and destination differ, copy the unchanged rows
        out[4] = a[4];
        out[5] = a[5];
        out[6] = a[6];
        out[7] = a[7];
        out[12] = a[12];
        out[13] = a[13];
        out[14] = a[14];
        out[15] = a[15];
      } // Perform axis-specific matrix multiplication


      out[0] = a00 * c - a20 * s;
      out[1] = a01 * c - a21 * s;
      out[2] = a02 * c - a22 * s;
      out[3] = a03 * c - a23 * s;
      out[8] = a00 * s + a20 * c;
      out[9] = a01 * s + a21 * c;
      out[10] = a02 * s + a22 * c;
      out[11] = a03 * s + a23 * c;
      return out;
    }
    /**
     * Rotates a matrix by the given angle around the Z axis
     *
     * @param {mat4} out the receiving matrix
     * @param {ReadonlyMat4} a the matrix to rotate
     * @param {Number} rad the angle to rotate the matrix by
     * @returns {mat4} out
     */

    function rotateZ(out, a, rad) {
      var s = Math.sin(rad);
      var c = Math.cos(rad);
      var a00 = a[0];
      var a01 = a[1];
      var a02 = a[2];
      var a03 = a[3];
      var a10 = a[4];
      var a11 = a[5];
      var a12 = a[6];
      var a13 = a[7];

      if (a !== out) {
        // If the source and destination differ, copy the unchanged last row
        out[8] = a[8];
        out[9] = a[9];
        out[10] = a[10];
        out[11] = a[11];
        out[12] = a[12];
        out[13] = a[13];
        out[14] = a[14];
        out[15] = a[15];
      } // Perform axis-specific matrix multiplication


      out[0] = a00 * c + a10 * s;
      out[1] = a01 * c + a11 * s;
      out[2] = a02 * c + a12 * s;
      out[3] = a03 * c + a13 * s;
      out[4] = a10 * c - a00 * s;
      out[5] = a11 * c - a01 * s;
      out[6] = a12 * c - a02 * s;
      out[7] = a13 * c - a03 * s;
      return out;
    }
    /**
     * Generates a orthogonal projection matrix with the given bounds
     *
     * @param {mat4} out mat4 frustum matrix will be written into
     * @param {number} left Left bound of the frustum
     * @param {number} right Right bound of the frustum
     * @param {number} bottom Bottom bound of the frustum
     * @param {number} top Top bound of the frustum
     * @param {number} near Near bound of the frustum
     * @param {number} far Far bound of the frustum
     * @returns {mat4} out
     */

    function ortho(out, left, right, bottom, top, near, far) {
      var lr = 1 / (left - right);
      var bt = 1 / (bottom - top);
      var nf = 1 / (near - far);
      out[0] = -2 * lr;
      out[1] = 0;
      out[2] = 0;
      out[3] = 0;
      out[4] = 0;
      out[5] = -2 * bt;
      out[6] = 0;
      out[7] = 0;
      out[8] = 0;
      out[9] = 0;
      out[10] = 2 * nf;
      out[11] = 0;
      out[12] = (left + right) * lr;
      out[13] = (top + bottom) * bt;
      out[14] = (far + near) * nf;
      out[15] = 1;
      return out;
    }
    /**
     * Generates a look-at matrix with the given eye position, focal point, and up axis.
     * If you want a matrix that actually makes an object look at another object, you should use targetTo instead.
     *
     * @param {mat4} out mat4 frustum matrix will be written into
     * @param {ReadonlyVec3} eye Position of the viewer
     * @param {ReadonlyVec3} center Point the viewer is looking at
     * @param {ReadonlyVec3} up vec3 pointing up
     * @returns {mat4} out
     */

    function lookAt(out, eye, center, up) {
      var x0, x1, x2, y0, y1, y2, z0, z1, z2, len;
      var eyex = eye[0];
      var eyey = eye[1];
      var eyez = eye[2];
      var upx = up[0];
      var upy = up[1];
      var upz = up[2];
      var centerx = center[0];
      var centery = center[1];
      var centerz = center[2];

      if (Math.abs(eyex - centerx) < EPSILON && Math.abs(eyey - centery) < EPSILON && Math.abs(eyez - centerz) < EPSILON) {
        return identity(out);
      }

      z0 = eyex - centerx;
      z1 = eyey - centery;
      z2 = eyez - centerz;
      len = 1 / Math.hypot(z0, z1, z2);
      z0 *= len;
      z1 *= len;
      z2 *= len;
      x0 = upy * z2 - upz * z1;
      x1 = upz * z0 - upx * z2;
      x2 = upx * z1 - upy * z0;
      len = Math.hypot(x0, x1, x2);

      if (!len) {
        x0 = 0;
        x1 = 0;
        x2 = 0;
      } else {
        len = 1 / len;
        x0 *= len;
        x1 *= len;
        x2 *= len;
      }

      y0 = z1 * x2 - z2 * x1;
      y1 = z2 * x0 - z0 * x2;
      y2 = z0 * x1 - z1 * x0;
      len = Math.hypot(y0, y1, y2);

      if (!len) {
        y0 = 0;
        y1 = 0;
        y2 = 0;
      } else {
        len = 1 / len;
        y0 *= len;
        y1 *= len;
        y2 *= len;
      }

      out[0] = x0;
      out[1] = y0;
      out[2] = z0;
      out[3] = 0;
      out[4] = x1;
      out[5] = y1;
      out[6] = z1;
      out[7] = 0;
      out[8] = x2;
      out[9] = y2;
      out[10] = z2;
      out[11] = 0;
      out[12] = -(x0 * eyex + x1 * eyey + x2 * eyez);
      out[13] = -(y0 * eyex + y1 * eyey + y2 * eyez);
      out[14] = -(z0 * eyex + z1 * eyey + z2 * eyez);
      out[15] = 1;
      return out;
    }
    /**
     * Alias for {@link mat4.multiply}
     * @function
     */

    var mul = multiply;

    /**
     * 3 Dimensional Vector
     * @module vec3
     */

    /**
     * Creates a new, empty vec3
     *
     * @returns {vec3} a new 3D vector
     */

    function create$1() {
      var out = new ARRAY_TYPE(3);

      if (ARRAY_TYPE != Float32Array) {
        out[0] = 0;
        out[1] = 0;
        out[2] = 0;
      }

      return out;
    }
    /**
     * Creates a new vec3 initialized with the given values
     *
     * @param {Number} x X component
     * @param {Number} y Y component
     * @param {Number} z Z component
     * @returns {vec3} a new 3D vector
     */

    function fromValues(x, y, z) {
      var out = new ARRAY_TYPE(3);
      out[0] = x;
      out[1] = y;
      out[2] = z;
      return out;
    }
    /**
     * Set the components of a vec3 to the given values
     *
     * @param {vec3} out the receiving vector
     * @param {Number} x X component
     * @param {Number} y Y component
     * @param {Number} z Z component
     * @returns {vec3} out
     */

    function set(out, x, y, z) {
      out[0] = x;
      out[1] = y;
      out[2] = z;
      return out;
    }
    /**
     * Perform some operation over an array of vec3s.
     *
     * @param {Array} a the array of vectors to iterate over
     * @param {Number} stride Number of elements between the start of each vec3. If 0 assumes tightly packed
     * @param {Number} offset Number of elements to skip at the beginning of the array
     * @param {Number} count Number of vec3s to iterate over. If 0 iterates over entire array
     * @param {Function} fn Function to call for each vector in the array
     * @param {Object} [arg] additional argument to pass to fn
     * @returns {Array} a
     * @function
     */

    (function () {
      var vec = create$1();
      return function (a, stride, offset, count, fn, arg) {
        var i, l;

        if (!stride) {
          stride = 3;
        }

        if (!offset) {
          offset = 0;
        }

        if (count) {
          l = Math.min(count * stride + offset, a.length);
        } else {
          l = a.length;
        }

        for (i = offset; i < l; i += stride) {
          vec[0] = a[i];
          vec[1] = a[i + 1];
          vec[2] = a[i + 2];
          fn(vec, vec, arg);
          a[i] = vec[0];
          a[i + 1] = vec[1];
          a[i + 2] = vec[2];
        }

        return a;
      };
    })();

    /**
     * 2 Dimensional Vector
     * @module vec2
     */

    /**
     * Creates a new, empty vec2
     *
     * @returns {vec2} a new 2D vector
     */

    function create() {
      var out = new ARRAY_TYPE(2);

      if (ARRAY_TYPE != Float32Array) {
        out[0] = 0;
        out[1] = 0;
      }

      return out;
    }
    /**
     * Perform some operation over an array of vec2s.
     *
     * @param {Array} a the array of vectors to iterate over
     * @param {Number} stride Number of elements between the start of each vec2. If 0 assumes tightly packed
     * @param {Number} offset Number of elements to skip at the beginning of the array
     * @param {Number} count Number of vec2s to iterate over. If 0 iterates over entire array
     * @param {Function} fn Function to call for each vector in the array
     * @param {Object} [arg] additional argument to pass to fn
     * @returns {Array} a
     * @function
     */

    (function () {
      var vec = create();
      return function (a, stride, offset, count, fn, arg) {
        var i, l;

        if (!stride) {
          stride = 2;
        }

        if (!offset) {
          offset = 0;
        }

        if (count) {
          l = Math.min(count * stride + offset, a.length);
        } else {
          l = a.length;
        }

        for (i = offset; i < l; i += stride) {
          vec[0] = a[i];
          vec[1] = a[i + 1];
          fn(vec, vec, arg);
          a[i] = vec[0];
          a[i + 1] = vec[1];
        }

        return a;
      };
    })();

    /**
     * Base transform class to handle vectors and matrices
     *
     * @public
     */
    class Transform {
        constructor() {
            this.position = fromValues(0, 0, 0);
            this.rotation = fromValues(0, 0, 0);
            this.scale = fromValues(1, 1, 1);
            this.modelMatrix = create$2();
            this.shouldUpdate = true;
        }
        /**
         * @returns {this}
         */
        copyFromMatrix(matrix) {
            copy(this.modelMatrix, matrix);
            this.shouldUpdate = false;
            return this;
        }
        /**
         * @returns {this}
         */
        setPosition(position) {
            const { x = this.position[0], y = this.position[1], z = this.position[2], } = position;
            set(this.position, x, y, z);
            this.shouldUpdate = true;
            return this;
        }
        /**
         * Sets scale
         * @returns {this}
         */
        setScale(scale) {
            const { x = this.scale[0], y = this.scale[1], z = this.scale[2] } = scale;
            set(this.scale, x, y, z);
            this.shouldUpdate = true;
            return this;
        }
        /**
         * Sets rotation
         * @returns {this}
         */
        setRotation(rotation) {
            const { x = this.rotation[0], y = this.rotation[1], z = this.rotation[2], } = rotation;
            set(this.rotation, x, y, z);
            this.shouldUpdate = true;
            return this;
        }
        /**
         * Update model matrix with scale, rotation and translation
         * @returns {this}
         */
        updateModelMatrix() {
            identity(this.modelMatrix);
            translate(this.modelMatrix, this.modelMatrix, this.position);
            rotateX(this.modelMatrix, this.modelMatrix, this.rotation[0]);
            rotateY(this.modelMatrix, this.modelMatrix, this.rotation[1]);
            rotateZ(this.modelMatrix, this.modelMatrix, this.rotation[2]);
            scale$1(this.modelMatrix, this.modelMatrix, this.scale);
            this.shouldUpdate = false;
            return this;
        }
    }

    /**
     * SceneObject that can have SceneObjects as children. Allows for proper scene graph.
     *
     * @public
     */
    class SceneObject extends Transform {
        constructor() {
            super(...arguments);
            this.renderable = false;
            this.parentNode = null;
            this.children = [];
            this.worldMatrix = create$2();
            this.normalMatrix = create$2();
            this.setParent = (parentNode = null) => {
                if (this.parentNode) {
                    const idx = this.parentNode.children.indexOf(this);
                    if (idx >= 0) {
                        this.parentNode.children.splice(idx, 1);
                    }
                }
                if (parentNode) {
                    parentNode.children.push(this);
                }
                this.parentNode = parentNode;
                return this;
            };
            this.updateWorldMatrix = (parentWorldMatrix = null) => {
                if (this.shouldUpdate) {
                    this.updateModelMatrix();
                }
                if (parentWorldMatrix) {
                    mul(this.worldMatrix, parentWorldMatrix, this.modelMatrix);
                }
                else {
                    copy(this.worldMatrix, this.modelMatrix);
                }
                invert(this.normalMatrix, this.worldMatrix);
                transpose(this.normalMatrix, this.normalMatrix);
                this.children.forEach((child) => {
                    child.updateWorldMatrix(this.worldMatrix);
                });
                return this;
            };
            this.traverseGraph = (callback, node = this) => {
                callback(node);
                this.children.forEach((child) => child.traverseGraph(callback));
                return this;
            };
        }
    }

    class OrthographicCamera {
        constructor(left, right, top, bottom, near, far) {
            this.left = -1;
            this.right = 1;
            this.top = 1;
            this.bottom = -1;
            this.near = 0.1;
            this.far = 2000;
            this.zoom = 1;
            this.position = [0, 0, 0];
            this.lookAtPosition = [0, 0, 0];
            this.projectionMatrix = create$2();
            this.viewMatrix = create$2();
            this.left = left;
            this.right = right;
            this.top = top;
            this.bottom = bottom;
            this.near = near;
            this.far = far;
            this.updateProjectionMatrix();
        }
        setPosition({ x = this.position[0], y = this.position[1], z = this.position[2], }) {
            this.position = [x, y, z];
            return this;
        }
        updateViewMatrix() {
            lookAt(this.viewMatrix, this.position, this.lookAtPosition, OrthographicCamera.UP_VECTOR);
            return this;
        }
        updateProjectionMatrix() {
            ortho(this.projectionMatrix, this.left, this.right, this.bottom, this.top, this.near, this.far);
            return this;
        }
        lookAt(target) {
            this.lookAtPosition = target;
            this.updateViewMatrix();
            return this;
        }
    }
    OrthographicCamera.UP_VECTOR = [0, 1, 0];

    /**
     * @public
     */
    class Mesh extends SceneObject {
        constructor(device, { geometry, uniforms = {}, storages = [], textures = [], samplers = [], vertexShaderSource, fragmentShaderSource, multisample = {}, depthStencil = {
            format: 'depth24plus',
            depthWriteEnabled: true,
            depthCompare: 'less',
        }, targets = [{ format: 'bgra8unorm' }], primitiveType = PRIMITIVE_TOPOLOGY_TRIANGLE_LIST, }) {
            super();
            this.renderable = true;
            this.uniforms = {};
            geometry.primitiveType = primitiveType;
            this.device = device;
            this.geometry = geometry;
            // Each Mesh comes with predetermined UBO called Transforms
            // There is a second optional UBO that holds every user-supplied uniform
            let uniformsInputUBOByteLength = 0;
            for (const [key, uniform] of Object.entries(uniforms)) {
                this.uniforms[key] = Object.assign({ byteOffset: uniformsInputUBOByteLength }, uniform);
                const uniformInfo = UNIFORM_TYPES_MAP.get(uniform.type);
                if (!uniformInfo) {
                    throw new Error('cant find uniform mapping');
                }
                const [val, bytesPerElement] = uniformInfo;
                uniformsInputUBOByteLength += val * bytesPerElement;
            }
            // Offset shader binding counter by 1 in case of values for optional UBO
            const numBindOffset = uniformsInputUBOByteLength ? 2 : 1;
            // Generate vertex & fragment shaders based on
            // - vertex inputs
            // - uniform inputs
            // - sampler inputs
            // - texture inputs
            // - custom user string snippets
            const vertexShader = new VertexShader(device);
            const fragmentShader = new FragmentShader(device);
            {
                // Generate vertex shader
                if (uniformsInputUBOByteLength) {
                    vertexShader.addUniformInputs(uniforms);
                }
                vertexShader
                    .addShaderVars(geometry.vertexBuffers, vertexShaderSource.outputs)
                    .addSamplerInputs(samplers.map(({ name, wglslSamplerType }, i) => ({
                    bindIdx: numBindOffset + i,
                    name: name,
                    type: wglslSamplerType,
                })))
                    .addTextureInputs(textures.map(({ name, wglslTextureType }, i) => ({
                    bindIdx: numBindOffset + samplers.length + i,
                    name: name,
                    type: `${wglslTextureType}`,
                })))
                    .addStorages(storages.map(({ dataStride, structDefinition, name }, i) => ({
                    bindIdx: numBindOffset + samplers.length + textures.length + i,
                    name,
                    attributes: structDefinition,
                    dataStride,
                })))
                    .addHeadSnippet(vertexShaderSource.head)
                    .addMainFnSnippet(vertexShaderSource.main);
            }
            {
                // Generate fragment shader
                if (uniformsInputUBOByteLength) {
                    fragmentShader.addUniformInputs(uniforms);
                }
                fragmentShader
                    .addShaderVars(geometry.vertexBuffers, fragmentShaderSource.inputs, fragmentShaderSource.outputs)
                    .addSamplerInputs(samplers.map(({ name, wglslSamplerType }, i) => ({
                    bindIdx: numBindOffset + i,
                    name: name,
                    type: wglslSamplerType,
                })))
                    .addTextureInputs(textures.map(({ name, wglslTextureType }, i) => ({
                    bindIdx: numBindOffset + samplers.length + i,
                    name: name,
                    type: `${wglslTextureType}`,
                })))
                    .addStorages(storages.map(({ name, dataStride, structDefinition }, i) => ({
                    dataStride,
                    bindIdx: numBindOffset + samplers.length + textures.length + i,
                    name,
                    attributes: structDefinition,
                })))
                    .addHeadSnippet(fragmentShaderSource.head)
                    .addMainFnSnippet(fragmentShaderSource.main);
            }
            // console.log(vertexShader.source)
            // console.log(fragmentShader.source)
            this.uboBindGroup = new BindGroup(device, 0);
            // First bind group with dedicated first binding containing required uniforms:
            // 1. camera projection matrix
            // 2. camera view matrix
            // 3. model world matrix
            // 4. model normal matrix
            const numberOfTransformMatrices = 4;
            this.uboBindGroup.addUBO(16 * numberOfTransformMatrices * Float32Array.BYTES_PER_ELEMENT);
            // Bind sectond optional UBO only if extra uniforms are passed
            if (uniformsInputUBOByteLength) {
                this.uboBindGroup.addUBO(uniformsInputUBOByteLength);
            }
            // Pass optional initial uniform values to second binding on GPU
            for (const { value, byteOffset } of Object.values(this.uniforms)) {
                this.uboBindGroup.writeToUBO(1, byteOffset, value);
            }
            // Supply all samplers and textures to bind group
            samplers.forEach((sampler) => this.uboBindGroup.addSampler(sampler));
            textures.map((texture) => this.uboBindGroup.addTexture(texture));
            // Supply storages to bind group
            storages.forEach((storage) => this.uboBindGroup.addStorage(storage));
            const pipelineDesc = {
                layout: this.device.createPipelineLayout({
                    bindGroupLayouts: [this.uboBindGroup.getLayout()],
                }),
                vertex: {
                    module: vertexShader.shaderModule,
                    entryPoint: Shader.ENTRY_FUNCTION,
                    buffers: geometry.getVertexBuffersLayout(),
                },
                fragment: {
                    module: fragmentShader.shaderModule,
                    entryPoint: Shader.ENTRY_FUNCTION,
                    targets,
                },
                primitive: {
                    topology: primitiveType,
                    stripIndexFormat: geometry.stripIndexFormat,
                },
                multisample,
            };
            if (depthStencil) {
                pipelineDesc.depthStencil = depthStencil;
            }
            // TODO
            // Its suboptimal to create new render pipelines for each object.
            // Ideally, objects with similar inputs should reuse pipelines
            // Must think of a good way to dynamically group objects based on inputs
            // For now, just create new pipeline for each mesh
            this.pipeline = device.createRenderPipeline(pipelineDesc);
            this.uboBindGroup.attachToPipeline(this.pipeline);
        }
        setUniform(name, value) {
            const uniform = this.uniforms[name];
            if (!uniform) {
                throw new Error('Uniform does not belong to UBO');
            }
            this.uboBindGroup.writeToUBO(1, uniform.byteOffset, value);
            return this;
        }
        render(renderPass, camera) {
            var _a;
            this.updateWorldMatrix((_a = this.parentNode) === null || _a === void 0 ? void 0 : _a.worldMatrix);
            this.uboBindGroup
                .writeToUBO(0, 16 * 2 * Float32Array.BYTES_PER_ELEMENT, this.worldMatrix)
                .writeToUBO(0, 16 * 3 * Float32Array.BYTES_PER_ELEMENT, this.normalMatrix);
            this.uboBindGroup
                .writeToUBO(0, 0, camera.projectionMatrix)
                .writeToUBO(0, 16 * Float32Array.BYTES_PER_ELEMENT, camera.viewMatrix);
            this.uboBindGroup.bind(renderPass);
            renderPass.setPipeline(this.pipeline);
            this.geometry.draw(renderPass);
        }
        destroy() {
            this.uboBindGroup.destroy();
        }
    }

    const testForWebGPUSupport = () => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const adapter = yield ((_a = navigator.gpu) === null || _a === void 0 ? void 0 : _a.requestAdapter());
        const errorHTMLFragment = `
    <div id="no-webgpu-wrapper">
      <div id="no-webgpu">
        WebGPU is not supported on this browser. Please try modern Google Chrome (Canary) or Firefox Nightly.
      </div>
    </div>
  `;
        window.addEventListener('unhandledrejection', (e) => {
            document.body.innerHTML += errorHTMLFragment;
        });
        window.addEventListener('error', (e) => {
            document.body.innerHTML += errorHTMLFragment;
        });
        if (!adapter) {
            document.body.innerHTML += errorHTMLFragment;
        }
    });

    testForWebGPUSupport();
    (() => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const canvas = document.getElementById('gpu-c');
        canvas.width = innerWidth * devicePixelRatio;
        canvas.height = innerHeight * devicePixelRatio;
        canvas.style.setProperty('width', `${innerWidth}px`);
        canvas.style.setProperty('height', `${innerHeight}px`);
        const adapter = yield ((_a = navigator.gpu) === null || _a === void 0 ? void 0 : _a.requestAdapter());
        const device = yield (adapter === null || adapter === void 0 ? void 0 : adapter.requestDevice());
        const context = canvas.getContext('webgpu');
        const presentationFormat = context.getPreferredFormat(adapter);
        const primitiveType = 'triangle-list';
        context.configure({
            device,
            format: presentationFormat,
        });
        const orthoCamera = new OrthographicCamera(0, canvas.width, canvas.height, 0, 0.1, 3)
            .setPosition({ x: 0, y: 0, z: 2 })
            .lookAt([0, 0, 0])
            .updateProjectionMatrix()
            .updateViewMatrix();
        // vertex positions & colors buffer
        const planeWidth = 480;
        const planeHeight = 480;
        // prettier-ignore
        const vertexData = new Float32Array([
            // position                           // color
            -planeWidth / 2, -planeHeight / 2, 1.0, 0.0, 0.0,
            planeWidth / 2, -planeHeight / 2, 0.0, 1.0, 0.0,
            planeWidth / 2, planeHeight / 2, 0.0, 0.0, 1.0,
            -planeWidth / 2, planeHeight / 2, 1.0, 1.0, 0.0, // index 3
        ]);
        const vertexBuffer = new VertexBuffer(device, 0, vertexData, 5 * Float32Array.BYTES_PER_ELEMENT)
            .addAttribute('position', 0, 2 * Float32Array.BYTES_PER_ELEMENT, 'float32x2')
            .addAttribute('color', 2 * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT, 'float32x3');
        const indexBuffer = new IndexBuffer(device, new Uint16Array([0, 1, 3, 3, 1, 2]));
        const geometry = new Geometry(device)
            .addIndexBuffer(indexBuffer)
            .addVertexBuffer(vertexBuffer);
        const mesh = new Mesh(device, {
            geometry,
            vertexShaderSource: {
                main: `
        output.Position = transform.projectionMatrix *
                          transform.viewMatrix *
                          transform.modelMatrix *
                          vec4<f32>(input.position, 0.0, 1.0);
                    
        output.color = input.color;
      `,
            },
            fragmentShaderSource: {
                main: `
        output.Color = vec4<f32>(input.color.rgb, 1.0);
      `,
            },
            depthStencil: null,
            primitiveType,
        })
            .setPosition({ x: canvas.width / 2, y: canvas.height / 2, z: 0 })
            .updateModelMatrix();
        requestAnimationFrame(drawFrame);
        function drawFrame(ts) {
            requestAnimationFrame(drawFrame);
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
            mesh.render(renderPass, orthoCamera);
            renderPass.endPass();
            device.queue.submit([commandEncoder.finish()]);
        }
    }))();

}());
