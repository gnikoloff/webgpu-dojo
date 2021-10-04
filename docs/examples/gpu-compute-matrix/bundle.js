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

    const testForWebGPUSupport = () => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const adapter = yield ((_a = navigator.gpu) === null || _a === void 0 ? void 0 : _a.requestAdapter());
        if (!adapter) {
            document.body.innerHTML += `
      <div id="no-webgpu-wrapper">
        <div id="no-webgpu">
          WebGPU is available for now in Chrome Canary on desktop behind an experimental flag. You can enable it at <code>chrome://flags/#enable-unsafe-webgpu</code>.
          <br />
          <br />
          The API is constantly changing and currently unsafe. As GPU sandboxing isn't implemented yet for the WebGPU API, it is possible to read GPU data for other processes! Don't browse the web with it enabled.
        </div>
      </div>
    `;
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
        const writeBuffer = device.createBuffer({
            mappedAtCreation: true,
            size: 4,
            usage: GPUBufferUsage.MAP_WRITE | GPUBufferUsage.COPY_SRC,
        });
        new Uint8Array(writeBuffer.getMappedRange()).set([4, 3, 2, 1]);
        writeBuffer.unmap();
        yield writeBuffer.mapAsync(GPUMapMode.WRITE);
        new Uint8Array(writeBuffer.getMappedRange()).set([9, 8, 7, 6]);
        writeBuffer.unmap();
        const readBuffer = device.createBuffer({
            size: 4,
            usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
        });
        const commandEncoder = device.createCommandEncoder();
        commandEncoder.copyBufferToBuffer(writeBuffer, 0, readBuffer, 0, 4);
        const copyCommands = commandEncoder.finish();
        device.queue.submit([copyCommands]);
        yield readBuffer.mapAsync(GPUMapMode.READ);
        const copyArrayBuffer = readBuffer.getMappedRange();
        console.log(new Uint8Array(copyArrayBuffer));
    }))();

}());
