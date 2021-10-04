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

    function assert$7(condition, message) {
      if (!condition) {
        throw new Error(message || 'loader assertion failed.');
      }
    }

    const globals$4 = {
      self: typeof self !== 'undefined' && self,
      window: typeof window !== 'undefined' && window,
      global: typeof global !== 'undefined' && global,
      document: typeof document !== 'undefined' && document
    };
    const global_$2 = globals$4.global || globals$4.self || globals$4.window || {};
    const isBrowser$6 = typeof process !== 'object' || String(process) !== '[object process]' || process.browser;
    const matches$5 = typeof process !== 'undefined' && process.version && /v([0-9]*)/.exec(process.version);
    matches$5 && parseFloat(matches$5[1]) || 0;

    const VERSION$6 = "3.0.11" ;

    function assert$6(condition, message) {
      if (!condition) {
        throw new Error(message || 'loaders.gl assertion failed.');
      }
    }

    const globals$3 = {
      self: typeof self !== 'undefined' && self,
      window: typeof window !== 'undefined' && window,
      global: typeof global !== 'undefined' && global,
      document: typeof document !== 'undefined' && document
    };
    const global_$1 = globals$3.global || globals$3.self || globals$3.window || {};
    const isBrowser$5 = typeof process !== 'object' || String(process) !== '[object process]' || process.browser;
    const isWorker = typeof importScripts === 'function';
    const isMobile$1 = typeof window !== 'undefined' && typeof window.orientation !== 'undefined';
    const matches$4 = typeof process !== 'undefined' && process.version && /v([0-9]*)/.exec(process.version);
    matches$4 && parseFloat(matches$4[1]) || 0;

    function _defineProperty$1(obj, key, value) {
      if (key in obj) {
        Object.defineProperty(obj, key, {
          value: value,
          enumerable: true,
          configurable: true,
          writable: true
        });
      } else {
        obj[key] = value;
      }

      return obj;
    }

    class WorkerJob$1 {
      constructor(jobName, workerThread) {
        _defineProperty$1(this, "name", void 0);

        _defineProperty$1(this, "workerThread", void 0);

        _defineProperty$1(this, "isRunning", void 0);

        _defineProperty$1(this, "result", void 0);

        _defineProperty$1(this, "_resolve", void 0);

        _defineProperty$1(this, "_reject", void 0);

        this.name = jobName;
        this.workerThread = workerThread;
        this.isRunning = true;

        this._resolve = () => {};

        this._reject = () => {};

        this.result = new Promise((resolve, reject) => {
          this._resolve = resolve;
          this._reject = reject;
        });
      }

      postMessage(type, payload) {
        this.workerThread.postMessage({
          source: 'loaders.gl',
          type,
          payload
        });
      }

      done(value) {
        assert$6(this.isRunning);
        this.isRunning = false;

        this._resolve(value);
      }

      error(error) {
        assert$6(this.isRunning);
        this.isRunning = false;

        this._reject(error);
      }

    }

    const workerURLCache$1 = new Map();
    function getLoadableWorkerURL$1(props) {
      assert$6(props.source && !props.url || !props.source && props.url);
      let workerURL = workerURLCache$1.get(props.source || props.url);

      if (!workerURL) {
        if (props.url) {
          workerURL = getLoadableWorkerURLFromURL$1(props.url);
          workerURLCache$1.set(props.url, workerURL);
        }

        if (props.source) {
          workerURL = getLoadableWorkerURLFromSource$1(props.source);
          workerURLCache$1.set(props.source, workerURL);
        }
      }

      assert$6(workerURL);
      return workerURL;
    }

    function getLoadableWorkerURLFromURL$1(url) {
      if (!url.startsWith('http')) {
        return url;
      }

      const workerSource = buildScriptSource$1(url);
      return getLoadableWorkerURLFromSource$1(workerSource);
    }

    function getLoadableWorkerURLFromSource$1(workerSource) {
      const blob = new Blob([workerSource], {
        type: 'application/javascript'
      });
      return URL.createObjectURL(blob);
    }

    function buildScriptSource$1(workerUrl) {
      return `\
try {
  importScripts('${workerUrl}');
} catch (error) {
  console.error(error);
  throw error;
}`;
    }

    function getTransferList$1(object, recursive = true, transfers) {
      const transfersSet = transfers || new Set();

      if (!object) ; else if (isTransferable$1(object)) {
        transfersSet.add(object);
      } else if (isTransferable$1(object.buffer)) {
        transfersSet.add(object.buffer);
      } else if (ArrayBuffer.isView(object)) ; else if (recursive && typeof object === 'object') {
        for (const key in object) {
          getTransferList$1(object[key], recursive, transfersSet);
        }
      }

      return transfers === undefined ? Array.from(transfersSet) : [];
    }

    function isTransferable$1(object) {
      if (!object) {
        return false;
      }

      if (object instanceof ArrayBuffer) {
        return true;
      }

      if (typeof MessagePort !== 'undefined' && object instanceof MessagePort) {
        return true;
      }

      if (typeof ImageBitmap !== 'undefined' && object instanceof ImageBitmap) {
        return true;
      }

      if (typeof OffscreenCanvas !== 'undefined' && object instanceof OffscreenCanvas) {
        return true;
      }

      return false;
    }

    const NOOP$1 = () => {};

    class WorkerThread$1 {
      static isSupported() {
        return typeof Worker !== 'undefined';
      }

      constructor(props) {
        _defineProperty$1(this, "name", void 0);

        _defineProperty$1(this, "source", void 0);

        _defineProperty$1(this, "url", void 0);

        _defineProperty$1(this, "terminated", false);

        _defineProperty$1(this, "worker", void 0);

        _defineProperty$1(this, "onMessage", void 0);

        _defineProperty$1(this, "onError", void 0);

        _defineProperty$1(this, "_loadableURL", '');

        const {
          name,
          source,
          url
        } = props;
        assert$6(source || url);
        this.name = name;
        this.source = source;
        this.url = url;
        this.onMessage = NOOP$1;

        this.onError = error => console.log(error);

        this.worker = this._createBrowserWorker();
      }

      destroy() {
        this.onMessage = NOOP$1;
        this.onError = NOOP$1;
        this.worker.terminate();
        this.terminated = true;
      }

      get isRunning() {
        return Boolean(this.onMessage);
      }

      postMessage(data, transferList) {
        transferList = transferList || getTransferList$1(data);
        this.worker.postMessage(data, transferList);
      }

      _getErrorFromErrorEvent(event) {
        let message = 'Failed to load ';
        message += `worker ${this.name}. `;

        if (event.message) {
          message += `${event.message} in `;
        }

        if (event.lineno) {
          message += `:${event.lineno}:${event.colno}`;
        }

        return new Error(message);
      }

      _createBrowserWorker() {
        this._loadableURL = getLoadableWorkerURL$1({
          source: this.source,
          url: this.url
        });
        const worker = new Worker(this._loadableURL, {
          name: this.name
        });

        worker.onmessage = event => {
          if (!event.data) {
            this.onError(new Error('No data received'));
          } else {
            this.onMessage(event.data);
          }
        };

        worker.onerror = error => {
          this.onError(this._getErrorFromErrorEvent(error));
          this.terminated = true;
        };

        worker.onmessageerror = event => console.error(event);

        return worker;
      }

    }

    class WorkerPool$1 {
      constructor(props) {
        _defineProperty$1(this, "name", 'unnamed');

        _defineProperty$1(this, "source", void 0);

        _defineProperty$1(this, "url", void 0);

        _defineProperty$1(this, "maxConcurrency", 1);

        _defineProperty$1(this, "maxMobileConcurrency", 1);

        _defineProperty$1(this, "onDebug", () => {});

        _defineProperty$1(this, "reuseWorkers", true);

        _defineProperty$1(this, "props", {});

        _defineProperty$1(this, "jobQueue", []);

        _defineProperty$1(this, "idleQueue", []);

        _defineProperty$1(this, "count", 0);

        _defineProperty$1(this, "isDestroyed", false);

        this.source = props.source;
        this.url = props.url;
        this.setProps(props);
      }

      destroy() {
        this.idleQueue.forEach(worker => worker.destroy());
        this.isDestroyed = true;
      }

      setProps(props) {
        this.props = { ...this.props,
          ...props
        };

        if (props.name !== undefined) {
          this.name = props.name;
        }

        if (props.maxConcurrency !== undefined) {
          this.maxConcurrency = props.maxConcurrency;
        }

        if (props.maxMobileConcurrency !== undefined) {
          this.maxMobileConcurrency = props.maxMobileConcurrency;
        }

        if (props.reuseWorkers !== undefined) {
          this.reuseWorkers = props.reuseWorkers;
        }

        if (props.onDebug !== undefined) {
          this.onDebug = props.onDebug;
        }
      }

      async startJob(name, onMessage = (job, type, data) => job.done(data), onError = (job, error) => job.error(error)) {
        const startPromise = new Promise(onStart => {
          this.jobQueue.push({
            name,
            onMessage,
            onError,
            onStart
          });
          return this;
        });

        this._startQueuedJob();

        return await startPromise;
      }

      async _startQueuedJob() {
        if (!this.jobQueue.length) {
          return;
        }

        const workerThread = this._getAvailableWorker();

        if (!workerThread) {
          return;
        }

        const queuedJob = this.jobQueue.shift();

        if (queuedJob) {
          this.onDebug({
            message: 'Starting job',
            name: queuedJob.name,
            workerThread,
            backlog: this.jobQueue.length
          });
          const job = new WorkerJob$1(queuedJob.name, workerThread);

          workerThread.onMessage = data => queuedJob.onMessage(job, data.type, data.payload);

          workerThread.onError = error => queuedJob.onError(job, error);

          queuedJob.onStart(job);

          try {
            await job.result;
          } finally {
            this.returnWorkerToQueue(workerThread);
          }
        }
      }

      returnWorkerToQueue(worker) {
        const shouldDestroyWorker = this.isDestroyed || !this.reuseWorkers || this.count > this._getMaxConcurrency();

        if (shouldDestroyWorker) {
          worker.destroy();
          this.count--;
        } else {
          this.idleQueue.push(worker);
        }

        if (!this.isDestroyed) {
          this._startQueuedJob();
        }
      }

      _getAvailableWorker() {
        if (this.idleQueue.length > 0) {
          return this.idleQueue.shift() || null;
        }

        if (this.count < this._getMaxConcurrency()) {
          this.count++;
          const name = `${this.name.toLowerCase()} (#${this.count} of ${this.maxConcurrency})`;
          return new WorkerThread$1({
            name,
            source: this.source,
            url: this.url
          });
        }

        return null;
      }

      _getMaxConcurrency() {
        return isMobile$1 ? this.maxMobileConcurrency : this.maxConcurrency;
      }

    }

    const DEFAULT_PROPS$1 = {
      maxConcurrency: 3,
      maxMobileConcurrency: 1,
      onDebug: () => {},
      reuseWorkers: true
    };
    class WorkerFarm$1 {
      static isSupported() {
        return WorkerThread$1.isSupported();
      }

      static getWorkerFarm(props = {}) {
        WorkerFarm$1._workerFarm = WorkerFarm$1._workerFarm || new WorkerFarm$1({});

        WorkerFarm$1._workerFarm.setProps(props);

        return WorkerFarm$1._workerFarm;
      }

      constructor(props) {
        _defineProperty$1(this, "props", void 0);

        _defineProperty$1(this, "workerPools", new Map());

        this.props = { ...DEFAULT_PROPS$1
        };
        this.setProps(props);
        this.workerPools = new Map();
      }

      destroy() {
        for (const workerPool of this.workerPools.values()) {
          workerPool.destroy();
        }
      }

      setProps(props) {
        this.props = { ...this.props,
          ...props
        };

        for (const workerPool of this.workerPools.values()) {
          workerPool.setProps(this._getWorkerPoolProps());
        }
      }

      getWorkerPool(options) {
        const {
          name,
          source,
          url
        } = options;
        let workerPool = this.workerPools.get(name);

        if (!workerPool) {
          workerPool = new WorkerPool$1({
            name,
            source,
            url
          });
          workerPool.setProps(this._getWorkerPoolProps());
          this.workerPools.set(name, workerPool);
        }

        return workerPool;
      }

      _getWorkerPoolProps() {
        return {
          maxConcurrency: this.props.maxConcurrency,
          maxMobileConcurrency: this.props.maxMobileConcurrency,
          reuseWorkers: this.props.reuseWorkers,
          onDebug: this.props.onDebug
        };
      }

    }

    _defineProperty$1(WorkerFarm$1, "_workerFarm", void 0);

    const NPM_TAG = 'latest';
    function getWorkerURL(worker, options = {}) {
      const workerOptions = options[worker.id] || {};
      const workerFile = `${worker.id}-worker.js`;
      let url = workerOptions.workerUrl;

      if (options._workerType === 'test') {
        url = `modules/${worker.module}/dist/${workerFile}`;
      }

      if (!url) {
        let version = worker.version;

        if (version === 'latest') {
          version = NPM_TAG;
        }

        const versionTag = version ? `@${version}` : '';
        url = `https://unpkg.com/@loaders.gl/${worker.module}${versionTag}/dist/${workerFile}`;
      }

      assert$6(url);
      return url;
    }

    function validateWorkerVersion(worker, coreVersion = VERSION$6) {
      assert$6(worker, 'no worker provided');
      const workerVersion = worker.version;

      if (!coreVersion || !workerVersion) {
        return false;
      }

      return true;
    }

    const VERSION$5 = "3.0.11" ;
    const loadLibraryPromises = {};
    async function loadLibrary(libraryUrl, moduleName = null, options = {}) {
      if (moduleName) {
        libraryUrl = getLibraryUrl(libraryUrl, moduleName, options);
      }

      loadLibraryPromises[libraryUrl] = loadLibraryPromises[libraryUrl] || loadLibraryFromFile(libraryUrl);
      return await loadLibraryPromises[libraryUrl];
    }
    function getLibraryUrl(library, moduleName, options) {
      if (library.startsWith('http')) {
        return library;
      }

      const modules = options.modules || {};

      if (modules[library]) {
        return modules[library];
      }

      if (!isBrowser$5) {
        return `modules/${moduleName}/dist/libs/${library}`;
      }

      if (options.CDN) {
        assert$6(options.CDN.startsWith('http'));
        return `${options.CDN}/${moduleName}@${VERSION$5}/dist/libs/${library}`;
      }

      if (isWorker) {
        return `../src/libs/${library}`;
      }

      return `modules/${moduleName}/src/libs/${library}`;
    }

    async function loadLibraryFromFile(libraryUrl) {
      if (libraryUrl.endsWith('wasm')) {
        const response = await fetch(libraryUrl);
        return await response.arrayBuffer();
      }

      if (!isBrowser$5) {
        return undefined && (await undefined(libraryUrl));
      }

      if (isWorker) {
        return importScripts(libraryUrl);
      }

      const response = await fetch(libraryUrl);
      const scriptSource = await response.text();
      return loadLibraryFromString(scriptSource, libraryUrl);
    }

    function loadLibraryFromString(scriptSource, id) {
      if (!isBrowser$5) {
        return undefined && undefined(scriptSource, id);
      }

      if (isWorker) {
        eval.call(global_$1, scriptSource);
        return null;
      }

      const script = document.createElement('script');
      script.id = id;

      try {
        script.appendChild(document.createTextNode(scriptSource));
      } catch (e) {
        script.text = scriptSource;
      }

      document.body.appendChild(script);
      return null;
    }

    function canParseWithWorker(loader, options) {
      if (!WorkerFarm$1.isSupported()) {
        return false;
      }

      return loader.worker && (options === null || options === void 0 ? void 0 : options.worker);
    }
    async function parseWithWorker(loader, data, options, context, parseOnMainThread) {
      const name = loader.id;
      const url = getWorkerURL(loader, options);
      const workerFarm = WorkerFarm$1.getWorkerFarm(options);
      const workerPool = workerFarm.getWorkerPool({
        name,
        url
      });
      options = JSON.parse(JSON.stringify(options));
      const job = await workerPool.startJob('process-on-worker', onMessage.bind(null, parseOnMainThread));
      job.postMessage('process', {
        input: data,
        options
      });
      const result = await job.result;
      return await result.result;
    }

    async function onMessage(parseOnMainThread, job, type, payload) {
      switch (type) {
        case 'done':
          job.done(payload);
          break;

        case 'error':
          job.error(payload.error);
          break;

        case 'process':
          const {
            id,
            input,
            options
          } = payload;

          try {
            const result = await parseOnMainThread(input, options);
            job.postMessage('done', {
              id,
              result
            });
          } catch (error) {
            const message = error instanceof Error ? error.message : 'unknown error';
            job.postMessage('error', {
              id,
              error: message
            });
          }

          break;

        default:
          console.warn(`parse-with-worker unknown message ${type}`);
      }
    }

    function getFirstCharacters$1(data, length = 5) {
      if (typeof data === 'string') {
        return data.slice(0, length);
      } else if (ArrayBuffer.isView(data)) {
        return getMagicString$2(data.buffer, data.byteOffset, length);
      } else if (data instanceof ArrayBuffer) {
        const byteOffset = 0;
        return getMagicString$2(data, byteOffset, length);
      }

      return '';
    }
    function getMagicString$2(arrayBuffer, byteOffset, length) {
      if (arrayBuffer.byteLength <= byteOffset + length) {
        return '';
      }

      const dataView = new DataView(arrayBuffer);
      let magic = '';

      for (let i = 0; i < length; i++) {
        magic += String.fromCharCode(dataView.getUint8(byteOffset + i));
      }

      return magic;
    }

    function parseJSON(string) {
      try {
        return JSON.parse(string);
      } catch (_) {
        throw new Error(`Failed to parse JSON from data starting with "${getFirstCharacters$1(string)}"`);
      }
    }

    function toArrayBuffer(data) {
      if (undefined) {
        data = undefined(data);
      }

      if (data instanceof ArrayBuffer) {
        return data;
      }

      if (ArrayBuffer.isView(data)) {
        return data.buffer;
      }

      if (typeof data === 'string') {
        const text = data;
        const uint8Array = new TextEncoder().encode(text);
        return uint8Array.buffer;
      }

      if (data && typeof data === 'object' && data._toArrayBuffer) {
        return data._toArrayBuffer();
      }

      throw new Error('toArrayBuffer');
    }
    function compareArrayBuffers(arrayBuffer1, arrayBuffer2, byteLength) {
      byteLength = byteLength || arrayBuffer1.byteLength;

      if (arrayBuffer1.byteLength < byteLength || arrayBuffer2.byteLength < byteLength) {
        return false;
      }

      const array1 = new Uint8Array(arrayBuffer1);
      const array2 = new Uint8Array(arrayBuffer2);

      for (let i = 0; i < array1.length; ++i) {
        if (array1[i] !== array2[i]) {
          return false;
        }
      }

      return true;
    }
    function concatenateArrayBuffers(...sources) {
      const sourceArrays = sources.map(source2 => source2 instanceof ArrayBuffer ? new Uint8Array(source2) : source2);
      const byteLength = sourceArrays.reduce((length, typedArray) => length + typedArray.byteLength, 0);
      const result = new Uint8Array(byteLength);
      let offset = 0;

      for (const sourceArray of sourceArrays) {
        result.set(sourceArray, offset);
        offset += sourceArray.byteLength;
      }

      return result.buffer;
    }
    function sliceArrayBuffer(arrayBuffer, byteOffset, byteLength) {
      const subArray = byteLength !== undefined ? new Uint8Array(arrayBuffer).subarray(byteOffset, byteOffset + byteLength) : new Uint8Array(arrayBuffer).subarray(byteOffset);
      const arrayCopy = new Uint8Array(subArray);
      return arrayCopy.buffer;
    }

    function padToNBytes(byteLength, padding) {
      assert$7(byteLength >= 0);
      assert$7(padding > 0);
      return byteLength + (padding - 1) & ~(padding - 1);
    }
    function copyToArray(source, target, targetOffset) {
      let sourceArray;

      if (source instanceof ArrayBuffer) {
        sourceArray = new Uint8Array(source);
      } else {
        const srcByteOffset = source.byteOffset;
        const srcByteLength = source.byteLength;
        sourceArray = new Uint8Array(source.buffer || source.arrayBuffer, srcByteOffset, srcByteLength);
      }

      target.set(sourceArray, targetOffset);
      return targetOffset + padToNBytes(sourceArray.byteLength, 4);
    }

    async function concatenateArrayBuffersAsync(asyncIterator) {
      const arrayBuffers = [];

      for await (const chunk of asyncIterator) {
        arrayBuffers.push(chunk);
      }

      return concatenateArrayBuffers(...arrayBuffers);
    }

    let pathPrefix = '';
    const fileAliases = {};
    function resolvePath(filename) {
      for (const alias in fileAliases) {
        if (filename.startsWith(alias)) {
          const replacement = fileAliases[alias];
          filename = filename.replace(alias, replacement);
        }
      }

      if (!filename.startsWith('http://') && !filename.startsWith('https://')) {
        filename = `${pathPrefix}${filename}`;
      }

      return filename;
    }

    const isBoolean = x => typeof x === 'boolean';

    const isFunction = x => typeof x === 'function';

    const isObject = x => x !== null && typeof x === 'object';
    const isPureObject = x => isObject(x) && x.constructor === {}.constructor;
    const isIterable = x => x && typeof x[Symbol.iterator] === 'function';
    const isAsyncIterable = x => x && typeof x[Symbol.asyncIterator] === 'function';
    const isResponse = x => typeof Response !== 'undefined' && x instanceof Response || x && x.arrayBuffer && x.text && x.json;
    const isBlob = x => typeof Blob !== 'undefined' && x instanceof Blob;
    const isReadableDOMStream = x => typeof ReadableStream !== 'undefined' && x instanceof ReadableStream || isObject(x) && isFunction(x.tee) && isFunction(x.cancel) && isFunction(x.getReader);
    const isBuffer = x => x && typeof x === 'object' && x.isBuffer;
    const isReadableNodeStream = x => isObject(x) && isFunction(x.read) && isFunction(x.pipe) && isBoolean(x.readable);
    const isReadableStream = x => isReadableDOMStream(x) || isReadableNodeStream(x);

    const DATA_URL_PATTERN = /^data:([-\w.]+\/[-\w.+]+)(;|,)/;
    const MIME_TYPE_PATTERN = /^([-\w.]+\/[-\w.+]+)/;
    function parseMIMEType(mimeString) {
      const matches = MIME_TYPE_PATTERN.exec(mimeString);

      if (matches) {
        return matches[1];
      }

      return mimeString;
    }
    function parseMIMETypeFromURL(url) {
      const matches = DATA_URL_PATTERN.exec(url);

      if (matches) {
        return matches[1];
      }

      return '';
    }

    const QUERY_STRING_PATTERN = /\?.*/;
    function getResourceUrlAndType(resource) {
      if (isResponse(resource)) {
        const url = stripQueryString(resource.url || '');
        const contentTypeHeader = resource.headers.get('content-type') || '';
        return {
          url,
          type: parseMIMEType(contentTypeHeader) || parseMIMETypeFromURL(url)
        };
      }

      if (isBlob(resource)) {
        return {
          url: stripQueryString(resource.name || ''),
          type: resource.type || ''
        };
      }

      if (typeof resource === 'string') {
        return {
          url: stripQueryString(resource),
          type: parseMIMETypeFromURL(resource)
        };
      }

      return {
        url: '',
        type: ''
      };
    }
    function getResourceContentLength(resource) {
      if (isResponse(resource)) {
        return resource.headers['content-length'] || -1;
      }

      if (isBlob(resource)) {
        return resource.size;
      }

      if (typeof resource === 'string') {
        return resource.length;
      }

      if (resource instanceof ArrayBuffer) {
        return resource.byteLength;
      }

      if (ArrayBuffer.isView(resource)) {
        return resource.byteLength;
      }

      return -1;
    }

    function stripQueryString(url) {
      return url.replace(QUERY_STRING_PATTERN, '');
    }

    async function makeResponse(resource) {
      if (isResponse(resource)) {
        return resource;
      }

      const headers = {};
      const contentLength = getResourceContentLength(resource);

      if (contentLength >= 0) {
        headers['content-length'] = String(contentLength);
      }

      const {
        url,
        type
      } = getResourceUrlAndType(resource);

      if (type) {
        headers['content-type'] = type;
      }

      const initialDataUrl = await getInitialDataUrl(resource);

      if (initialDataUrl) {
        headers['x-first-bytes'] = initialDataUrl;
      }

      if (typeof resource === 'string') {
        resource = new TextEncoder().encode(resource);
      }

      const response = new Response(resource, {
        headers
      });
      Object.defineProperty(response, 'url', {
        value: url
      });
      return response;
    }
    async function checkResponse(response) {
      if (!response.ok) {
        const message = await getResponseError(response);
        throw new Error(message);
      }
    }

    async function getResponseError(response) {
      let message = `Failed to fetch resource ${response.url} (${response.status}): `;

      try {
        const contentType = response.headers.get('Content-Type');
        let text = response.statusText;

        if (contentType.includes('application/json')) {
          text += ` ${await response.text()}`;
        }

        message += text;
        message = message.length > 60 ? `${message.slice(60)}...` : message;
      } catch (error) {}

      return message;
    }

    async function getInitialDataUrl(resource) {
      const INITIAL_DATA_LENGTH = 5;

      if (typeof resource === 'string') {
        return `data:,${resource.slice(0, INITIAL_DATA_LENGTH)}`;
      }

      if (resource instanceof Blob) {
        const blobSlice = resource.slice(0, 5);
        return await new Promise(resolve => {
          const reader = new FileReader();

          reader.onload = event => {
            var _event$target;

            return resolve(event === null || event === void 0 ? void 0 : (_event$target = event.target) === null || _event$target === void 0 ? void 0 : _event$target.result);
          };

          reader.readAsDataURL(blobSlice);
        });
      }

      if (resource instanceof ArrayBuffer) {
        const slice = resource.slice(0, INITIAL_DATA_LENGTH);
        const base64 = arrayBufferToBase64(slice);
        return `data:base64,${base64}`;
      }

      return null;
    }

    function arrayBufferToBase64(buffer) {
      let binary = '';
      const bytes = new Uint8Array(buffer);

      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }

      return btoa(binary);
    }

    async function fetchFile(url, options) {
      if (typeof url === 'string') {
        url = resolvePath(url);
        let fetchOptions = options;

        if (options !== null && options !== void 0 && options.fetch && typeof (options === null || options === void 0 ? void 0 : options.fetch) !== 'function') {
          fetchOptions = options.fetch;
        }

        return await fetch(url, fetchOptions);
      }

      return await makeResponse(url);
    }

    function isElectron$1(mockUserAgent) {
      if (typeof window !== 'undefined' && typeof window.process === 'object' && window.process.type === 'renderer') {
        return true;
      }

      if (typeof process !== 'undefined' && typeof process.versions === 'object' && Boolean(process.versions.electron)) {
        return true;
      }

      const realUserAgent = typeof navigator === 'object' && typeof navigator.userAgent === 'string' && navigator.userAgent;
      const userAgent = mockUserAgent || realUserAgent;

      if (userAgent && userAgent.indexOf('Electron') >= 0) {
        return true;
      }

      return false;
    }

    function isBrowser$4() {
      const isNode = typeof process === 'object' && String(process) === '[object process]' && !process.browser;
      return !isNode || isElectron$1();
    }

    const globals$2 = {
      self: typeof self !== 'undefined' && self,
      window: typeof window !== 'undefined' && window,
      global: typeof global !== 'undefined' && global,
      document: typeof document !== 'undefined' && document,
      process: typeof process === 'object' && process
    };
    const window_$1 = globals$2.window || globals$2.self || globals$2.global;
    const process_$1 = globals$2.process || {};

    const VERSION$4 = typeof __VERSION__ !== 'undefined' ? __VERSION__ : 'untranspiled source';
    const isBrowser$3 = isBrowser$4();

    function getStorage$1(type) {
      try {
        const storage = window[type];
        const x = '__storage_test__';
        storage.setItem(x, x);
        storage.removeItem(x);
        return storage;
      } catch (e) {
        return null;
      }
    }

    class LocalStorage$1 {
      constructor(id, defaultSettings, type = 'sessionStorage') {
        this.storage = getStorage$1(type);
        this.id = id;
        this.config = {};
        Object.assign(this.config, defaultSettings);

        this._loadConfiguration();
      }

      getConfiguration() {
        return this.config;
      }

      setConfiguration(configuration) {
        this.config = {};
        return this.updateConfiguration(configuration);
      }

      updateConfiguration(configuration) {
        Object.assign(this.config, configuration);

        if (this.storage) {
          const serialized = JSON.stringify(this.config);
          this.storage.setItem(this.id, serialized);
        }

        return this;
      }

      _loadConfiguration() {
        let configuration = {};

        if (this.storage) {
          const serializedConfiguration = this.storage.getItem(this.id);
          configuration = serializedConfiguration ? JSON.parse(serializedConfiguration) : {};
        }

        Object.assign(this.config, configuration);
        return this;
      }

    }

    function formatTime$1(ms) {
      let formatted;

      if (ms < 10) {
        formatted = "".concat(ms.toFixed(2), "ms");
      } else if (ms < 100) {
        formatted = "".concat(ms.toFixed(1), "ms");
      } else if (ms < 1000) {
        formatted = "".concat(ms.toFixed(0), "ms");
      } else {
        formatted = "".concat((ms / 1000).toFixed(2), "s");
      }

      return formatted;
    }
    function leftPad$1(string, length = 8) {
      const padLength = Math.max(length - string.length, 0);
      return "".concat(' '.repeat(padLength)).concat(string);
    }

    function formatImage$1(image, message, scale, maxWidth = 600) {
      const imageUrl = image.src.replace(/\(/g, '%28').replace(/\)/g, '%29');

      if (image.width > maxWidth) {
        scale = Math.min(scale, maxWidth / image.width);
      }

      const width = image.width * scale;
      const height = image.height * scale;
      const style = ['font-size:1px;', "padding:".concat(Math.floor(height / 2), "px ").concat(Math.floor(width / 2), "px;"), "line-height:".concat(height, "px;"), "background:url(".concat(imageUrl, ");"), "background-size:".concat(width, "px ").concat(height, "px;"), 'color:transparent;'].join('');
      return ["".concat(message, " %c+"), style];
    }

    const COLOR$1 = {
      BLACK: 30,
      RED: 31,
      GREEN: 32,
      YELLOW: 33,
      BLUE: 34,
      MAGENTA: 35,
      CYAN: 36,
      WHITE: 37,
      BRIGHT_BLACK: 90,
      BRIGHT_RED: 91,
      BRIGHT_GREEN: 92,
      BRIGHT_YELLOW: 93,
      BRIGHT_BLUE: 94,
      BRIGHT_MAGENTA: 95,
      BRIGHT_CYAN: 96,
      BRIGHT_WHITE: 97
    };

    function getColor$1(color) {
      return typeof color === 'string' ? COLOR$1[color.toUpperCase()] || COLOR$1.WHITE : color;
    }

    function addColor$1(string, color, background) {
      if (!isBrowser$3 && typeof string === 'string') {
        if (color) {
          color = getColor$1(color);
          string = "\x1B[".concat(color, "m").concat(string, "\x1B[39m");
        }

        if (background) {
          color = getColor$1(background);
          string = "\x1B[".concat(background + 10, "m").concat(string, "\x1B[49m");
        }
      }

      return string;
    }

    function autobind$1(obj, predefined = ['constructor']) {
      const proto = Object.getPrototypeOf(obj);
      const propNames = Object.getOwnPropertyNames(proto);

      for (const key of propNames) {
        if (typeof obj[key] === 'function') {
          if (!predefined.find(name => key === name)) {
            obj[key] = obj[key].bind(obj);
          }
        }
      }
    }

    function assert$5(condition, message) {
      if (!condition) {
        throw new Error(message || 'Assertion failed');
      }
    }

    function getHiResTimestamp$1() {
      let timestamp;

      if (isBrowser$3 && window_$1.performance) {
        timestamp = window_$1.performance.now();
      } else if (process_$1.hrtime) {
        const timeParts = process_$1.hrtime();
        timestamp = timeParts[0] * 1000 + timeParts[1] / 1e6;
      } else {
        timestamp = Date.now();
      }

      return timestamp;
    }

    const originalConsole$1 = {
      debug: isBrowser$3 ? console.debug || console.log : console.log,
      log: console.log,
      info: console.info,
      warn: console.warn,
      error: console.error
    };
    const DEFAULT_SETTINGS$1 = {
      enabled: true,
      level: 0
    };

    function noop$1() {}

    const cache$1 = {};
    const ONCE$1 = {
      once: true
    };

    function getTableHeader$1(table) {
      for (const key in table) {
        for (const title in table[key]) {
          return title || 'untitled';
        }
      }

      return 'empty';
    }

    class Log$1 {
      constructor({
        id
      } = {
        id: ''
      }) {
        this.id = id;
        this.VERSION = VERSION$4;
        this._startTs = getHiResTimestamp$1();
        this._deltaTs = getHiResTimestamp$1();
        this.LOG_THROTTLE_TIMEOUT = 0;
        this._storage = new LocalStorage$1("__probe-".concat(this.id, "__"), DEFAULT_SETTINGS$1);
        this.userData = {};
        this.timeStamp("".concat(this.id, " started"));
        autobind$1(this);
        Object.seal(this);
      }

      set level(newLevel) {
        this.setLevel(newLevel);
      }

      get level() {
        return this.getLevel();
      }

      isEnabled() {
        return this._storage.config.enabled;
      }

      getLevel() {
        return this._storage.config.level;
      }

      getTotal() {
        return Number((getHiResTimestamp$1() - this._startTs).toPrecision(10));
      }

      getDelta() {
        return Number((getHiResTimestamp$1() - this._deltaTs).toPrecision(10));
      }

      set priority(newPriority) {
        this.level = newPriority;
      }

      get priority() {
        return this.level;
      }

      getPriority() {
        return this.level;
      }

      enable(enabled = true) {
        this._storage.updateConfiguration({
          enabled
        });

        return this;
      }

      setLevel(level) {
        this._storage.updateConfiguration({
          level
        });

        return this;
      }

      assert(condition, message) {
        assert$5(condition, message);
      }

      warn(message) {
        return this._getLogFunction(0, message, originalConsole$1.warn, arguments, ONCE$1);
      }

      error(message) {
        return this._getLogFunction(0, message, originalConsole$1.error, arguments);
      }

      deprecated(oldUsage, newUsage) {
        return this.warn("`".concat(oldUsage, "` is deprecated and will be removed in a later version. Use `").concat(newUsage, "` instead"));
      }

      removed(oldUsage, newUsage) {
        return this.error("`".concat(oldUsage, "` has been removed. Use `").concat(newUsage, "` instead"));
      }

      probe(logLevel, message) {
        return this._getLogFunction(logLevel, message, originalConsole$1.log, arguments, {
          time: true,
          once: true
        });
      }

      log(logLevel, message) {
        return this._getLogFunction(logLevel, message, originalConsole$1.debug, arguments);
      }

      info(logLevel, message) {
        return this._getLogFunction(logLevel, message, console.info, arguments);
      }

      once(logLevel, message) {
        return this._getLogFunction(logLevel, message, originalConsole$1.debug || originalConsole$1.info, arguments, ONCE$1);
      }

      table(logLevel, table, columns) {
        if (table) {
          return this._getLogFunction(logLevel, table, console.table || noop$1, columns && [columns], {
            tag: getTableHeader$1(table)
          });
        }

        return noop$1;
      }

      image({
        logLevel,
        priority,
        image,
        message = '',
        scale = 1
      }) {
        if (!this._shouldLog(logLevel || priority)) {
          return noop$1;
        }

        return isBrowser$3 ? logImageInBrowser$1({
          image,
          message,
          scale
        }) : logImageInNode$1({
          image,
          message,
          scale
        });
      }

      settings() {
        if (console.table) {
          console.table(this._storage.config);
        } else {
          console.log(this._storage.config);
        }
      }

      get(setting) {
        return this._storage.config[setting];
      }

      set(setting, value) {
        this._storage.updateConfiguration({
          [setting]: value
        });
      }

      time(logLevel, message) {
        return this._getLogFunction(logLevel, message, console.time ? console.time : console.info);
      }

      timeEnd(logLevel, message) {
        return this._getLogFunction(logLevel, message, console.timeEnd ? console.timeEnd : console.info);
      }

      timeStamp(logLevel, message) {
        return this._getLogFunction(logLevel, message, console.timeStamp || noop$1);
      }

      group(logLevel, message, opts = {
        collapsed: false
      }) {
        opts = normalizeArguments$1({
          logLevel,
          message,
          opts
        });
        const {
          collapsed
        } = opts;
        opts.method = (collapsed ? console.groupCollapsed : console.group) || console.info;
        return this._getLogFunction(opts);
      }

      groupCollapsed(logLevel, message, opts = {}) {
        return this.group(logLevel, message, Object.assign({}, opts, {
          collapsed: true
        }));
      }

      groupEnd(logLevel) {
        return this._getLogFunction(logLevel, '', console.groupEnd || noop$1);
      }

      withGroup(logLevel, message, func) {
        this.group(logLevel, message)();

        try {
          func();
        } finally {
          this.groupEnd(logLevel)();
        }
      }

      trace() {
        if (console.trace) {
          console.trace();
        }
      }

      _shouldLog(logLevel) {
        return this.isEnabled() && this.getLevel() >= normalizeLogLevel$1(logLevel);
      }

      _getLogFunction(logLevel, message, method, args = [], opts) {
        if (this._shouldLog(logLevel)) {
          opts = normalizeArguments$1({
            logLevel,
            message,
            args,
            opts
          });
          method = method || opts.method;
          assert$5(method);
          opts.total = this.getTotal();
          opts.delta = this.getDelta();
          this._deltaTs = getHiResTimestamp$1();
          const tag = opts.tag || opts.message;

          if (opts.once) {
            if (!cache$1[tag]) {
              cache$1[tag] = getHiResTimestamp$1();
            } else {
              return noop$1;
            }
          }

          message = decorateMessage$1(this.id, opts.message, opts);
          return method.bind(console, message, ...opts.args);
        }

        return noop$1;
      }

    }
    Log$1.VERSION = VERSION$4;

    function normalizeLogLevel$1(logLevel) {
      if (!logLevel) {
        return 0;
      }

      let resolvedLevel;

      switch (typeof logLevel) {
        case 'number':
          resolvedLevel = logLevel;
          break;

        case 'object':
          resolvedLevel = logLevel.logLevel || logLevel.priority || 0;
          break;

        default:
          return 0;
      }

      assert$5(Number.isFinite(resolvedLevel) && resolvedLevel >= 0);
      return resolvedLevel;
    }

    function normalizeArguments$1(opts) {
      const {
        logLevel,
        message
      } = opts;
      opts.logLevel = normalizeLogLevel$1(logLevel);
      const args = opts.args ? Array.from(opts.args) : [];

      while (args.length && args.shift() !== message) {}

      opts.args = args;

      switch (typeof logLevel) {
        case 'string':
        case 'function':
          if (message !== undefined) {
            args.unshift(message);
          }

          opts.message = logLevel;
          break;

        case 'object':
          Object.assign(opts, logLevel);
          break;
      }

      if (typeof opts.message === 'function') {
        opts.message = opts.message();
      }

      const messageType = typeof opts.message;
      assert$5(messageType === 'string' || messageType === 'object');
      return Object.assign(opts, opts.opts);
    }

    function decorateMessage$1(id, message, opts) {
      if (typeof message === 'string') {
        const time = opts.time ? leftPad$1(formatTime$1(opts.total)) : '';
        message = opts.time ? "".concat(id, ": ").concat(time, "  ").concat(message) : "".concat(id, ": ").concat(message);
        message = addColor$1(message, opts.color, opts.background);
      }

      return message;
    }

    function logImageInNode$1({
      image,
      message = '',
      scale = 1
    }) {
      let asciify = null;

      try {
        asciify = module.require('asciify-image');
      } catch (error) {}

      if (asciify) {
        return () => asciify(image, {
          fit: 'box',
          width: "".concat(Math.round(80 * scale), "%")
        }).then(data => console.log(data));
      }

      return noop$1;
    }

    function logImageInBrowser$1({
      image,
      message = '',
      scale = 1
    }) {
      if (typeof image === 'string') {
        const img = new Image();

        img.onload = () => {
          const args = formatImage$1(img, message, scale);
          console.log(...args);
        };

        img.src = image;
        return noop$1;
      }

      const element = image.nodeName || '';

      if (element.toLowerCase() === 'img') {
        console.log(...formatImage$1(image, message, scale));
        return noop$1;
      }

      if (element.toLowerCase() === 'canvas') {
        const img = new Image();

        img.onload = () => console.log(...formatImage$1(img, message, scale));

        img.src = image.toDataURL();
        return noop$1;
      }

      return noop$1;
    }

    const probeLog = new Log$1({
      id: 'loaders.gl'
    });
    class NullLog {
      log() {
        return () => {};
      }

      info() {
        return () => {};
      }

      warn() {
        return () => {};
      }

      error() {
        return () => {};
      }

    }
    class ConsoleLog$1 {
      constructor() {
        _defineProperty$1(this, "console", void 0);

        this.console = console;
      }

      log(...args) {
        return this.console.log.bind(this.console, ...args);
      }

      info(...args) {
        return this.console.info.bind(this.console, ...args);
      }

      warn(...args) {
        return this.console.warn.bind(this.console, ...args);
      }

      error(...args) {
        return this.console.error.bind(this.console, ...args);
      }

    }

    const DEFAULT_LOADER_OPTIONS = {
      fetch: null,
      mimeType: undefined,
      nothrow: false,
      log: new ConsoleLog$1(),
      CDN: 'https://unpkg.com/@loaders.gl',
      worker: true,
      maxConcurrency: 3,
      maxMobileConcurrency: 1,
      reuseWorkers: true,
      _workerType: '',
      limit: 0,
      _limitMB: 0,
      batchSize: 'auto',
      batchDebounceMs: 0,
      metadata: false,
      transforms: []
    };
    const REMOVED_LOADER_OPTIONS = {
      throws: 'nothrow',
      dataType: '(no longer used)',
      uri: 'baseUri',
      method: 'fetch.method',
      headers: 'fetch.headers',
      body: 'fetch.body',
      mode: 'fetch.mode',
      credentials: 'fetch.credentials',
      cache: 'fetch.cache',
      redirect: 'fetch.redirect',
      referrer: 'fetch.referrer',
      referrerPolicy: 'fetch.referrerPolicy',
      integrity: 'fetch.integrity',
      keepalive: 'fetch.keepalive',
      signal: 'fetch.signal'
    };

    function getGlobalLoaderState() {
      global_$2.loaders = global_$2.loaders || {};
      const {
        loaders
      } = global_$2;
      loaders._state = loaders._state || {};
      return loaders._state;
    }

    const getGlobalLoaderOptions = () => {
      const state = getGlobalLoaderState();
      state.globalOptions = state.globalOptions || { ...DEFAULT_LOADER_OPTIONS
      };
      return state.globalOptions;
    };
    function normalizeOptions(options, loader, loaders, url) {
      loaders = loaders || [];
      loaders = Array.isArray(loaders) ? loaders : [loaders];
      validateOptions(options, loaders);
      return normalizeOptionsInternal(loader, options, url);
    }
    function getFetchFunction(options, context) {
      const globalOptions = getGlobalLoaderOptions();
      const fetchOptions = options || globalOptions;

      if (typeof fetchOptions.fetch === 'function') {
        return fetchOptions.fetch;
      }

      if (isObject(fetchOptions.fetch)) {
        return url => fetchFile(url, fetchOptions);
      }

      if (context !== null && context !== void 0 && context.fetch) {
        return context === null || context === void 0 ? void 0 : context.fetch;
      }

      return fetchFile;
    }

    function validateOptions(options, loaders) {
      validateOptionsObject(options, null, DEFAULT_LOADER_OPTIONS, REMOVED_LOADER_OPTIONS, loaders);

      for (const loader of loaders) {
        const idOptions = options && options[loader.id] || {};
        const loaderOptions = loader.options && loader.options[loader.id] || {};
        const deprecatedOptions = loader.deprecatedOptions && loader.deprecatedOptions[loader.id] || {};
        validateOptionsObject(idOptions, loader.id, loaderOptions, deprecatedOptions, loaders);
      }
    }

    function validateOptionsObject(options, id, defaultOptions, deprecatedOptions, loaders) {
      const loaderName = id || 'Top level';
      const prefix = id ? `${id}.` : '';

      for (const key in options) {
        const isSubOptions = !id && isObject(options[key]);
        const isBaseUriOption = key === 'baseUri' && !id;
        const isWorkerUrlOption = key === 'workerUrl' && id;

        if (!(key in defaultOptions) && !isBaseUriOption && !isWorkerUrlOption) {
          if (key in deprecatedOptions) {
            probeLog.warn(`${loaderName} loader option \'${prefix}${key}\' no longer supported, use \'${deprecatedOptions[key]}\'`)();
          } else if (!isSubOptions) {
            const suggestion = findSimilarOption(key, loaders);
            probeLog.warn(`${loaderName} loader option \'${prefix}${key}\' not recognized. ${suggestion}`)();
          }
        }
      }
    }

    function findSimilarOption(optionKey, loaders) {
      const lowerCaseOptionKey = optionKey.toLowerCase();
      let bestSuggestion = '';

      for (const loader of loaders) {
        for (const key in loader.options) {
          if (optionKey === key) {
            return `Did you mean \'${loader.id}.${key}\'?`;
          }

          const lowerCaseKey = key.toLowerCase();
          const isPartialMatch = lowerCaseOptionKey.startsWith(lowerCaseKey) || lowerCaseKey.startsWith(lowerCaseOptionKey);

          if (isPartialMatch) {
            bestSuggestion = bestSuggestion || `Did you mean \'${loader.id}.${key}\'?`;
          }
        }
      }

      return bestSuggestion;
    }

    function normalizeOptionsInternal(loader, options, url) {
      const loaderDefaultOptions = loader.options || {};
      const mergedOptions = { ...loaderDefaultOptions
      };
      addUrlOptions(mergedOptions, url);

      if (mergedOptions.log === null) {
        mergedOptions.log = new NullLog();
      }

      mergeNestedFields(mergedOptions, getGlobalLoaderOptions());
      mergeNestedFields(mergedOptions, options);
      return mergedOptions;
    }

    function mergeNestedFields(mergedOptions, options) {
      for (const key in options) {
        if (key in options) {
          const value = options[key];

          if (isPureObject(value) && isPureObject(mergedOptions[key])) {
            mergedOptions[key] = { ...mergedOptions[key],
              ...options[key]
            };
          } else {
            mergedOptions[key] = options[key];
          }
        }
      }
    }

    function addUrlOptions(options, url) {
      if (url && !('baseUri' in options)) {
        options.baseUri = url;
      }
    }

    function isLoaderObject(loader) {
      var _loader;

      if (!loader) {
        return false;
      }

      if (Array.isArray(loader)) {
        loader = loader[0];
      }

      const hasExtensions = Array.isArray((_loader = loader) === null || _loader === void 0 ? void 0 : _loader.extensions);
      return hasExtensions;
    }
    function normalizeLoader(loader) {
      var _loader2, _loader3;

      assert$7(loader, 'null loader');
      assert$7(isLoaderObject(loader), 'invalid loader');
      let options;

      if (Array.isArray(loader)) {
        options = loader[1];
        loader = loader[0];
        loader = { ...loader,
          options: { ...loader.options,
            ...options
          }
        };
      }

      if ((_loader2 = loader) !== null && _loader2 !== void 0 && _loader2.parseTextSync || (_loader3 = loader) !== null && _loader3 !== void 0 && _loader3.parseText) {
        loader.text = true;
      }

      if (!loader.text) {
        loader.binary = true;
      }

      return loader;
    }

    const getGlobalLoaderRegistry = () => {
      const state = getGlobalLoaderState();
      state.loaderRegistry = state.loaderRegistry || [];
      return state.loaderRegistry;
    };
    function getRegisteredLoaders() {
      return getGlobalLoaderRegistry();
    }

    const EXT_PATTERN = /\.([^.]+)$/;
    async function selectLoader(data, loaders = [], options, context) {
      if (!validHTTPResponse(data)) {
        return null;
      }

      let loader = selectLoaderSync(data, loaders, { ...options,
        nothrow: true
      }, context);

      if (loader) {
        return loader;
      }

      if (isBlob(data)) {
        data = await data.slice(0, 10).arrayBuffer();
        loader = selectLoaderSync(data, loaders, options, context);
      }

      if (!loader && !(options !== null && options !== void 0 && options.nothrow)) {
        throw new Error(getNoValidLoaderMessage(data));
      }

      return loader;
    }
    function selectLoaderSync(data, loaders = [], options, context) {
      if (!validHTTPResponse(data)) {
        return null;
      }

      if (loaders && !Array.isArray(loaders)) {
        return normalizeLoader(loaders);
      }

      let candidateLoaders = [];

      if (loaders) {
        candidateLoaders = candidateLoaders.concat(loaders);
      }

      if (!(options !== null && options !== void 0 && options.ignoreRegisteredLoaders)) {
        candidateLoaders.push(...getRegisteredLoaders());
      }

      normalizeLoaders(candidateLoaders);
      const loader = selectLoaderInternal(data, candidateLoaders, options, context);

      if (!loader && !(options !== null && options !== void 0 && options.nothrow)) {
        throw new Error(getNoValidLoaderMessage(data));
      }

      return loader;
    }

    function selectLoaderInternal(data, loaders, options, context) {
      const {
        url,
        type
      } = getResourceUrlAndType(data);
      const testUrl = url || (context === null || context === void 0 ? void 0 : context.url);
      let loader = null;

      if (options !== null && options !== void 0 && options.mimeType) {
        loader = findLoaderByMIMEType(loaders, options === null || options === void 0 ? void 0 : options.mimeType);
      }

      loader = loader || findLoaderByUrl(loaders, testUrl);
      loader = loader || findLoaderByMIMEType(loaders, type);
      loader = loader || findLoaderByInitialBytes(loaders, data);
      loader = loader || findLoaderByMIMEType(loaders, options === null || options === void 0 ? void 0 : options.fallbackMimeType);
      return loader;
    }

    function validHTTPResponse(data) {
      if (data instanceof Response) {
        if (data.status === 204) {
          return false;
        }
      }

      return true;
    }

    function getNoValidLoaderMessage(data) {
      const {
        url,
        type
      } = getResourceUrlAndType(data);
      let message = 'No valid loader found';

      if (data) {
        message += ` data: "${getFirstCharacters(data)}", contentType: "${type}"`;
      }

      if (url) {
        message += ` url: ${url}`;
      }

      return message;
    }

    function normalizeLoaders(loaders) {
      for (const loader of loaders) {
        normalizeLoader(loader);
      }
    }

    function findLoaderByUrl(loaders, url) {
      const match = url && EXT_PATTERN.exec(url);
      const extension = match && match[1];
      return extension ? findLoaderByExtension(loaders, extension) : null;
    }

    function findLoaderByExtension(loaders, extension) {
      extension = extension.toLowerCase();

      for (const loader of loaders) {
        for (const loaderExtension of loader.extensions) {
          if (loaderExtension.toLowerCase() === extension) {
            return loader;
          }
        }
      }

      return null;
    }

    function findLoaderByMIMEType(loaders, mimeType) {
      for (const loader of loaders) {
        if (loader.mimeTypes && loader.mimeTypes.includes(mimeType)) {
          return loader;
        }

        if (mimeType === `application/x.${loader.id}`) {
          return loader;
        }
      }

      return null;
    }

    function findLoaderByInitialBytes(loaders, data) {
      if (!data) {
        return null;
      }

      for (const loader of loaders) {
        if (typeof data === 'string') {
          if (testDataAgainstText(data, loader)) {
            return loader;
          }
        } else if (ArrayBuffer.isView(data)) {
          if (testDataAgainstBinary(data.buffer, data.byteOffset, loader)) {
            return loader;
          }
        } else if (data instanceof ArrayBuffer) {
          const byteOffset = 0;

          if (testDataAgainstBinary(data, byteOffset, loader)) {
            return loader;
          }
        }
      }

      return null;
    }

    function testDataAgainstText(data, loader) {
      if (loader.testText) {
        return loader.testText(data);
      }

      const tests = Array.isArray(loader.tests) ? loader.tests : [loader.tests];
      return tests.some(test => data.startsWith(test));
    }

    function testDataAgainstBinary(data, byteOffset, loader) {
      const tests = Array.isArray(loader.tests) ? loader.tests : [loader.tests];
      return tests.some(test => testBinary(data, byteOffset, loader, test));
    }

    function testBinary(data, byteOffset, loader, test) {
      if (test instanceof ArrayBuffer) {
        return compareArrayBuffers(test, data, test.byteLength);
      }

      switch (typeof test) {
        case 'function':
          return test(data, loader);

        case 'string':
          const magic = getMagicString$1(data, byteOffset, test.length);
          return test === magic;

        default:
          return false;
      }
    }

    function getFirstCharacters(data, length = 5) {
      if (typeof data === 'string') {
        return data.slice(0, length);
      } else if (ArrayBuffer.isView(data)) {
        return getMagicString$1(data.buffer, data.byteOffset, length);
      } else if (data instanceof ArrayBuffer) {
        const byteOffset = 0;
        return getMagicString$1(data, byteOffset, length);
      }

      return '';
    }

    function getMagicString$1(arrayBuffer, byteOffset, length) {
      if (arrayBuffer.byteLength < byteOffset + length) {
        return '';
      }

      const dataView = new DataView(arrayBuffer);
      let magic = '';

      for (let i = 0; i < length; i++) {
        magic += String.fromCharCode(dataView.getUint8(byteOffset + i));
      }

      return magic;
    }

    const DEFAULT_CHUNK_SIZE$2 = 256 * 1024;
    function* makeStringIterator(string, options) {
      const chunkSize = (options === null || options === void 0 ? void 0 : options.chunkSize) || DEFAULT_CHUNK_SIZE$2;
      let offset = 0;
      const textEncoder = new TextEncoder();

      while (offset < string.length) {
        const chunkLength = Math.min(string.length - offset, chunkSize);
        const chunk = string.slice(offset, offset + chunkLength);
        offset += chunkLength;
        yield textEncoder.encode(chunk);
      }
    }

    const DEFAULT_CHUNK_SIZE$1 = 256 * 1024;
    function* makeArrayBufferIterator(arrayBuffer, options = {}) {
      const {
        chunkSize = DEFAULT_CHUNK_SIZE$1
      } = options;
      let byteOffset = 0;

      while (byteOffset < arrayBuffer.byteLength) {
        const chunkByteLength = Math.min(arrayBuffer.byteLength - byteOffset, chunkSize);
        const chunk = new ArrayBuffer(chunkByteLength);
        const sourceArray = new Uint8Array(arrayBuffer, byteOffset, chunkByteLength);
        const chunkArray = new Uint8Array(chunk);
        chunkArray.set(sourceArray);
        byteOffset += chunkByteLength;
        yield chunk;
      }
    }

    const DEFAULT_CHUNK_SIZE = 1024 * 1024;
    async function* makeBlobIterator(blob, options) {
      const chunkSize = (options === null || options === void 0 ? void 0 : options.chunkSize) || DEFAULT_CHUNK_SIZE;
      let offset = 0;

      while (offset < blob.size) {
        const end = offset + chunkSize;
        const chunk = await blob.slice(offset, end).arrayBuffer();
        offset = end;
        yield chunk;
      }
    }

    function makeStreamIterator(stream, options) {
      return isBrowser$6 ? makeBrowserStreamIterator(stream, options) : makeNodeStreamIterator(stream);
    }

    async function* makeBrowserStreamIterator(stream, options) {
      const reader = stream.getReader();
      let nextBatchPromise;

      try {
        while (true) {
          const currentBatchPromise = nextBatchPromise || reader.read();

          if (options !== null && options !== void 0 && options._streamReadAhead) {
            nextBatchPromise = reader.read();
          }

          const {
            done,
            value
          } = await currentBatchPromise;

          if (done) {
            return;
          }

          yield toArrayBuffer(value);
        }
      } catch (error) {
        reader.releaseLock();
      }
    }

    async function* makeNodeStreamIterator(stream, options) {
      for await (const chunk of stream) {
        yield toArrayBuffer(chunk);
      }
    }

    function makeIterator(data, options) {
      if (typeof data === 'string') {
        return makeStringIterator(data, options);
      }

      if (data instanceof ArrayBuffer) {
        return makeArrayBufferIterator(data, options);
      }

      if (isBlob(data)) {
        return makeBlobIterator(data, options);
      }

      if (isReadableStream(data)) {
        return makeStreamIterator(data, options);
      }

      if (isResponse(data)) {
        const response = data;
        return makeStreamIterator(response.body, options);
      }

      throw new Error('makeIterator');
    }

    const ERR_DATA = 'Cannot convert supplied data type';
    function getArrayBufferOrStringFromDataSync(data, loader, options) {
      if (loader.text && typeof data === 'string') {
        return data;
      }

      if (isBuffer(data)) {
        data = data.buffer;
      }

      if (data instanceof ArrayBuffer) {
        const arrayBuffer = data;

        if (loader.text && !loader.binary) {
          const textDecoder = new TextDecoder('utf8');
          return textDecoder.decode(arrayBuffer);
        }

        return arrayBuffer;
      }

      if (ArrayBuffer.isView(data)) {
        if (loader.text && !loader.binary) {
          const textDecoder = new TextDecoder('utf8');
          return textDecoder.decode(data);
        }

        let arrayBuffer = data.buffer;
        const byteLength = data.byteLength || data.length;

        if (data.byteOffset !== 0 || byteLength !== arrayBuffer.byteLength) {
          arrayBuffer = arrayBuffer.slice(data.byteOffset, data.byteOffset + byteLength);
        }

        return arrayBuffer;
      }

      throw new Error(ERR_DATA);
    }
    async function getArrayBufferOrStringFromData(data, loader, options) {
      const isArrayBuffer = data instanceof ArrayBuffer || ArrayBuffer.isView(data);

      if (typeof data === 'string' || isArrayBuffer) {
        return getArrayBufferOrStringFromDataSync(data, loader);
      }

      if (isBlob(data)) {
        data = await makeResponse(data);
      }

      if (isResponse(data)) {
        const response = data;
        await checkResponse(response);
        return loader.binary ? await response.arrayBuffer() : await response.text();
      }

      if (isReadableStream(data)) {
        data = makeIterator(data, options);
      }

      if (isIterable(data) || isAsyncIterable(data)) {
        return concatenateArrayBuffersAsync(data);
      }

      throw new Error(ERR_DATA);
    }

    function getLoaderContext(context, options, previousContext = null) {
      if (previousContext) {
        return previousContext;
      }

      const resolvedContext = {
        fetch: getFetchFunction(options, context),
        ...context
      };

      if (!Array.isArray(resolvedContext.loaders)) {
        resolvedContext.loaders = null;
      }

      return resolvedContext;
    }
    function getLoadersFromContext(loaders, context) {
      if (!context && loaders && !Array.isArray(loaders)) {
        return loaders;
      }

      let candidateLoaders;

      if (loaders) {
        candidateLoaders = Array.isArray(loaders) ? loaders : [loaders];
      }

      if (context && context.loaders) {
        const contextLoaders = Array.isArray(context.loaders) ? context.loaders : [context.loaders];
        candidateLoaders = candidateLoaders ? [...candidateLoaders, ...contextLoaders] : contextLoaders;
      }

      return candidateLoaders && candidateLoaders.length ? candidateLoaders : null;
    }

    async function parse$2(data, loaders, options, context) {
      assert$6(!context || typeof context === 'object');

      if (loaders && !Array.isArray(loaders) && !isLoaderObject(loaders)) {
        context = undefined;
        options = loaders;
        loaders = undefined;
      }

      data = await data;
      options = options || {};
      const {
        url
      } = getResourceUrlAndType(data);
      const typedLoaders = loaders;
      const candidateLoaders = getLoadersFromContext(typedLoaders, context);
      const loader = await selectLoader(data, candidateLoaders, options);

      if (!loader) {
        return null;
      }

      options = normalizeOptions(options, loader, candidateLoaders, url);
      context = getLoaderContext({
        url,
        parse: parse$2,
        loaders: candidateLoaders
      }, options, context);
      return await parseWithLoader(loader, data, options, context);
    }

    async function parseWithLoader(loader, data, options, context) {
      validateWorkerVersion(loader);
      data = await getArrayBufferOrStringFromData(data, loader, options);

      if (loader.parseTextSync && typeof data === 'string') {
        options.dataType = 'text';
        return loader.parseTextSync(data, options, context, loader);
      }

      if (canParseWithWorker(loader, options)) {
        return await parseWithWorker(loader, data, options, context, parse$2);
      }

      if (loader.parseText && typeof data === 'string') {
        return await loader.parseText(data, options, context, loader);
      }

      if (loader.parse) {
        return await loader.parse(data, options, context, loader);
      }

      assert$6(!loader.parseSync);
      throw new Error(`${loader.id} loader - no parser found and worker is disabled`);
    }

    async function load(url, loaders, options, context) {
      if (!Array.isArray(loaders) && !isLoaderObject(loaders)) {
        options = loaders;
        loaders = undefined;
      }

      const fetch = getFetchFunction(options);
      let data = url;

      if (typeof url === 'string') {
        data = await fetch(url);
      }

      if (isBlob(url)) {
        data = await fetch(url);
      }

      return await parse$2(data, loaders, options);
    }

    const VERSION$2 = "3.0.11" ;

    const VERSION$1 = "3.0.11" ;

    function assert$2(condition, message) {
      if (!condition) {
        throw new Error(message);
      }
    }

    const globals = {
      self: typeof self !== 'undefined' && self,
      window: typeof window !== 'undefined' && window,
      global: typeof global !== 'undefined' && global,
      document: typeof document !== 'undefined' && document
    };
    const global_ = globals.global || globals.self || globals.window;
    const isBrowser = typeof process !== 'object' || String(process) !== '[object process]' || process.browser;
    const matches$3 = typeof process !== 'undefined' && process.version && /v([0-9]*)/.exec(process.version);
    matches$3 && parseFloat(matches$3[1]) || 0;

    const {
      _parseImageNode
    } = global_;
    const IMAGE_SUPPORTED = typeof Image !== 'undefined';
    const IMAGE_BITMAP_SUPPORTED = typeof ImageBitmap !== 'undefined';
    const NODE_IMAGE_SUPPORTED = Boolean(_parseImageNode);
    const DATA_SUPPORTED = isBrowser ? true : NODE_IMAGE_SUPPORTED;
    function isImageTypeSupported(type) {
      switch (type) {
        case 'auto':
          return IMAGE_BITMAP_SUPPORTED || IMAGE_SUPPORTED || DATA_SUPPORTED;

        case 'imagebitmap':
          return IMAGE_BITMAP_SUPPORTED;

        case 'image':
          return IMAGE_SUPPORTED;

        case 'data':
          return DATA_SUPPORTED;

        default:
          throw new Error(`@loaders.gl/images: image ${type} not supported in this environment`);
      }
    }
    function getDefaultImageType() {
      if (IMAGE_BITMAP_SUPPORTED) {
        return 'imagebitmap';
      }

      if (IMAGE_SUPPORTED) {
        return 'image';
      }

      if (DATA_SUPPORTED) {
        return 'data';
      }

      throw new Error('Install \'@loaders.gl/polyfills\' to parse images under Node.js');
    }

    function getImageType(image) {
      const format = getImageTypeOrNull(image);

      if (!format) {
        throw new Error('Not an image');
      }

      return format;
    }
    function getImageData(image) {
      switch (getImageType(image)) {
        case 'data':
          return image;

        case 'image':
        case 'imagebitmap':
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');

          if (!context) {
            throw new Error('getImageData');
          }

          canvas.width = image.width;
          canvas.height = image.height;
          context.drawImage(image, 0, 0);
          return context.getImageData(0, 0, image.width, image.height);

        default:
          throw new Error('getImageData');
      }
    }

    function getImageTypeOrNull(image) {
      if (typeof ImageBitmap !== 'undefined' && image instanceof ImageBitmap) {
        return 'imagebitmap';
      }

      if (typeof Image !== 'undefined' && image instanceof Image) {
        return 'image';
      }

      if (image && typeof image === 'object' && image.data && image.width && image.height) {
        return 'data';
      }

      return null;
    }

    const SVG_DATA_URL_PATTERN = /^data:image\/svg\+xml/;
    const SVG_URL_PATTERN = /\.svg((\?|#).*)?$/;
    function isSVG(url) {
      return url && (SVG_DATA_URL_PATTERN.test(url) || SVG_URL_PATTERN.test(url));
    }
    function getBlobOrSVGDataUrl(arrayBuffer, url) {
      if (isSVG(url)) {
        const textDecoder = new TextDecoder();
        let xmlText = textDecoder.decode(arrayBuffer);

        try {
          if (typeof unescape === 'function' && typeof encodeURIComponent === 'function') {
            xmlText = unescape(encodeURIComponent(xmlText));
          }
        } catch (error) {
          throw new Error(error.message);
        }

        const src = `data:image/svg+xml;base64,${btoa(xmlText)}`;
        return src;
      }

      return getBlob(arrayBuffer, url);
    }
    function getBlob(arrayBuffer, url) {
      if (isSVG(url)) {
        throw new Error('SVG cannot be parsed directly to imagebitmap');
      }

      return new Blob([new Uint8Array(arrayBuffer)]);
    }

    async function parseToImage(arrayBuffer, options, url) {
      const blobOrDataUrl = getBlobOrSVGDataUrl(arrayBuffer, url);
      const URL = self.URL || self.webkitURL;
      const objectUrl = typeof blobOrDataUrl !== 'string' && URL.createObjectURL(blobOrDataUrl);

      try {
        return await loadToImage(objectUrl || blobOrDataUrl, options);
      } finally {
        if (objectUrl) {
          URL.revokeObjectURL(objectUrl);
        }
      }
    }
    async function loadToImage(url, options) {
      const image = new Image();
      image.src = url;

      if (options.image && options.image.decode && image.decode) {
        await image.decode();
        return image;
      }

      return await new Promise((resolve, reject) => {
        try {
          image.onload = () => resolve(image);

          image.onerror = err => reject(new Error(`Could not load image ${url}: ${err}`));
        } catch (error) {
          reject(error);
        }
      });
    }

    const EMPTY_OBJECT = {};
    let imagebitmapOptionsSupported = true;
    async function parseToImageBitmap(arrayBuffer, options, url) {
      let blob;

      if (isSVG(url)) {
        const image = await parseToImage(arrayBuffer, options, url);
        blob = image;
      } else {
        blob = getBlob(arrayBuffer, url);
      }

      const imagebitmapOptions = options && options.imagebitmap;
      return await safeCreateImageBitmap(blob, imagebitmapOptions);
    }

    async function safeCreateImageBitmap(blob, imagebitmapOptions = null) {
      if (isEmptyObject(imagebitmapOptions) || !imagebitmapOptionsSupported) {
        imagebitmapOptions = null;
      }

      if (imagebitmapOptions) {
        try {
          return await createImageBitmap(blob, imagebitmapOptions);
        } catch (error) {
          console.warn(error);
          imagebitmapOptionsSupported = false;
        }
      }

      return await createImageBitmap(blob);
    }

    function isEmptyObject(object) {
      for (const key in object || EMPTY_OBJECT) {
        return false;
      }

      return true;
    }

    const BIG_ENDIAN = false;
    const LITTLE_ENDIAN = true;
    function getBinaryImageMetadata(binaryData) {
      const dataView = toDataView(binaryData);
      return getPngMetadata(dataView) || getJpegMetadata(dataView) || getGifMetadata(dataView) || getBmpMetadata(dataView);
    }

    function getPngMetadata(binaryData) {
      const dataView = toDataView(binaryData);
      const isPng = dataView.byteLength >= 24 && dataView.getUint32(0, BIG_ENDIAN) === 0x89504e47;

      if (!isPng) {
        return null;
      }

      return {
        mimeType: 'image/png',
        width: dataView.getUint32(16, BIG_ENDIAN),
        height: dataView.getUint32(20, BIG_ENDIAN)
      };
    }

    function getGifMetadata(binaryData) {
      const dataView = toDataView(binaryData);
      const isGif = dataView.byteLength >= 10 && dataView.getUint32(0, BIG_ENDIAN) === 0x47494638;

      if (!isGif) {
        return null;
      }

      return {
        mimeType: 'image/gif',
        width: dataView.getUint16(6, LITTLE_ENDIAN),
        height: dataView.getUint16(8, LITTLE_ENDIAN)
      };
    }

    function getBmpMetadata(binaryData) {
      const dataView = toDataView(binaryData);
      const isBmp = dataView.byteLength >= 14 && dataView.getUint16(0, BIG_ENDIAN) === 0x424d && dataView.getUint32(2, LITTLE_ENDIAN) === dataView.byteLength;

      if (!isBmp) {
        return null;
      }

      return {
        mimeType: 'image/bmp',
        width: dataView.getUint32(18, LITTLE_ENDIAN),
        height: dataView.getUint32(22, LITTLE_ENDIAN)
      };
    }

    function getJpegMetadata(binaryData) {
      const dataView = toDataView(binaryData);
      const isJpeg = dataView.byteLength >= 3 && dataView.getUint16(0, BIG_ENDIAN) === 0xffd8 && dataView.getUint8(2) === 0xff;

      if (!isJpeg) {
        return null;
      }

      const {
        tableMarkers,
        sofMarkers
      } = getJpegMarkers();
      let i = 2;

      while (i + 9 < dataView.byteLength) {
        const marker = dataView.getUint16(i, BIG_ENDIAN);

        if (sofMarkers.has(marker)) {
          return {
            mimeType: 'image/jpeg',
            height: dataView.getUint16(i + 5, BIG_ENDIAN),
            width: dataView.getUint16(i + 7, BIG_ENDIAN)
          };
        }

        if (!tableMarkers.has(marker)) {
          return null;
        }

        i += 2;
        i += dataView.getUint16(i, BIG_ENDIAN);
      }

      return null;
    }

    function getJpegMarkers() {
      const tableMarkers = new Set([0xffdb, 0xffc4, 0xffcc, 0xffdd, 0xfffe]);

      for (let i = 0xffe0; i < 0xfff0; ++i) {
        tableMarkers.add(i);
      }

      const sofMarkers = new Set([0xffc0, 0xffc1, 0xffc2, 0xffc3, 0xffc5, 0xffc6, 0xffc7, 0xffc9, 0xffca, 0xffcb, 0xffcd, 0xffce, 0xffcf, 0xffde]);
      return {
        tableMarkers,
        sofMarkers
      };
    }

    function toDataView(data) {
      if (data instanceof DataView) {
        return data;
      }

      if (ArrayBuffer.isView(data)) {
        return new DataView(data.buffer);
      }

      if (data instanceof ArrayBuffer) {
        return new DataView(data);
      }

      throw new Error('toDataView');
    }

    function parseToNodeImage(arrayBuffer, options) {
      const {
        mimeType
      } = getBinaryImageMetadata(arrayBuffer) || {};
      const {
        _parseImageNode
      } = global_;
      assert$2(_parseImageNode);
      return _parseImageNode(arrayBuffer, mimeType, options);
    }

    async function parseImage(arrayBuffer, options, context) {
      options = options || {};
      const imageOptions = options.image || {};
      const imageType = imageOptions.type || 'auto';
      const {
        url
      } = context || {};
      const loadType = getLoadableImageType(imageType);
      let image;

      switch (loadType) {
        case 'imagebitmap':
          image = await parseToImageBitmap(arrayBuffer, options, url);
          break;

        case 'image':
          image = await parseToImage(arrayBuffer, options, url);
          break;

        case 'data':
          image = await parseToNodeImage(arrayBuffer, options);
          break;

        default:
          assert$2(false);
      }

      if (imageType === 'data') {
        image = getImageData(image);
      }

      return image;
    }

    function getLoadableImageType(type) {
      switch (type) {
        case 'auto':
        case 'data':
          return getDefaultImageType();

        default:
          isImageTypeSupported(type);
          return type;
      }
    }

    const EXTENSIONS$1 = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'ico', 'svg'];
    const MIME_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/bmp', 'image/vnd.microsoft.icon', 'image/svg+xml'];
    const ImageLoader = {
      id: 'image',
      module: 'images',
      name: 'Images',
      version: VERSION$1,
      mimeTypes: MIME_TYPES,
      extensions: EXTENSIONS$1,
      parse: parseImage,
      tests: [arrayBuffer => Boolean(getBinaryImageMetadata(new DataView(arrayBuffer)))],
      options: {
        image: {
          type: 'auto',
          decode: true
        }
      }
    };

    function assert$1(condition, message) {
      if (!condition) {
        throw new Error(message || 'assert failed: gltf');
      }
    }

    function resolveUrl(url, options) {
      const absolute = url.startsWith('data:') || url.startsWith('http:') || url.startsWith('https:');

      if (absolute) {
        return url;
      }

      const baseUrl = options.baseUri || options.uri;

      if (!baseUrl) {
        throw new Error(`'baseUri' must be provided to resolve relative url ${url}`);
      }

      return baseUrl.substr(0, baseUrl.lastIndexOf('/') + 1) + url;
    }

    function getTypedArrayForBufferView(json, buffers, bufferViewIndex) {
      const bufferView = json.bufferViews[bufferViewIndex];
      assert$1(bufferView);
      const bufferIndex = bufferView.buffer;
      const binChunk = buffers[bufferIndex];
      assert$1(binChunk);
      const byteOffset = (bufferView.byteOffset || 0) + binChunk.byteOffset;
      return new Uint8Array(binChunk.arrayBuffer, byteOffset, bufferView.byteLength);
    }

    const VERSION = "3.0.11" ;

    const DEFAULT_DRACO_OPTIONS = {
      draco: {
        decoderType: typeof WebAssembly === 'object' ? 'wasm' : 'js',
        libraryPath: 'libs/',
        extraAttributes: {},
        attributeNameEntry: undefined
      }
    };
    const DracoLoader$1 = {
      name: 'Draco',
      id: 'draco',
      module: 'draco',
      version: VERSION,
      worker: true,
      extensions: ['drc'],
      mimeTypes: ['application/octet-stream'],
      binary: true,
      tests: ['DRACO'],
      options: DEFAULT_DRACO_OPTIONS
    };

    function getMeshBoundingBox(attributes) {
      let minX = Infinity;
      let minY = Infinity;
      let minZ = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;
      let maxZ = -Infinity;
      const positions = attributes.POSITION ? attributes.POSITION.value : [];
      const len = positions && positions.length;

      for (let i = 0; i < len; i += 3) {
        const x = positions[i];
        const y = positions[i + 1];
        const z = positions[i + 2];
        minX = x < minX ? x : minX;
        minY = y < minY ? y : minY;
        minZ = z < minZ ? z : minZ;
        maxX = x > maxX ? x : maxX;
        maxY = y > maxY ? y : maxY;
        maxZ = z > maxZ ? z : maxZ;
      }

      return [[minX, minY, minZ], [maxX, maxY, maxZ]];
    }

    function assert(condition, message) {
      if (!condition) {
        throw new Error(message || 'loader assertion failed.');
      }
    }

    class Schema {
      constructor(fields, metadata) {
        _defineProperty$1(this, "fields", void 0);

        _defineProperty$1(this, "metadata", void 0);

        assert(Array.isArray(fields));
        checkNames(fields);
        this.fields = fields;
        this.metadata = metadata || new Map();
      }

      compareTo(other) {
        if (this.metadata !== other.metadata) {
          return false;
        }

        if (this.fields.length !== other.fields.length) {
          return false;
        }

        for (let i = 0; i < this.fields.length; ++i) {
          if (!this.fields[i].compareTo(other.fields[i])) {
            return false;
          }
        }

        return true;
      }

      select(...columnNames) {
        const nameMap = Object.create(null);

        for (const name of columnNames) {
          nameMap[name] = true;
        }

        const selectedFields = this.fields.filter(field => nameMap[field.name]);
        return new Schema(selectedFields, this.metadata);
      }

      selectAt(...columnIndices) {
        const selectedFields = columnIndices.map(index => this.fields[index]).filter(Boolean);
        return new Schema(selectedFields, this.metadata);
      }

      assign(schemaOrFields) {
        let fields;
        let metadata = this.metadata;

        if (schemaOrFields instanceof Schema) {
          const otherSchema = schemaOrFields;
          fields = otherSchema.fields;
          metadata = mergeMaps(mergeMaps(new Map(), this.metadata), otherSchema.metadata);
        } else {
          fields = schemaOrFields;
        }

        const fieldMap = Object.create(null);

        for (const field of this.fields) {
          fieldMap[field.name] = field;
        }

        for (const field of fields) {
          fieldMap[field.name] = field;
        }

        const mergedFields = Object.values(fieldMap);
        return new Schema(mergedFields, metadata);
      }

    }

    function checkNames(fields) {
      const usedNames = {};

      for (const field of fields) {
        if (usedNames[field.name]) {
          console.warn('Schema: duplicated field name', field.name, field);
        }

        usedNames[field.name] = true;
      }
    }

    function mergeMaps(m1, m2) {
      return new Map([...(m1 || new Map()), ...(m2 || new Map())]);
    }

    class Field {
      constructor(name, type, nullable = false, metadata = new Map()) {
        _defineProperty$1(this, "name", void 0);

        _defineProperty$1(this, "type", void 0);

        _defineProperty$1(this, "nullable", void 0);

        _defineProperty$1(this, "metadata", void 0);

        this.name = name;
        this.type = type;
        this.nullable = nullable;
        this.metadata = metadata;
      }

      get typeId() {
        return this.type && this.type.typeId;
      }

      clone() {
        return new Field(this.name, this.type, this.nullable, this.metadata);
      }

      compareTo(other) {
        return this.name === other.name && this.type === other.type && this.nullable === other.nullable && this.metadata === other.metadata;
      }

      toString() {
        return `${this.type}${this.nullable ? ', nullable' : ''}${this.metadata ? `, metadata: ${this.metadata}` : ''}`;
      }

    }

    let Type$1;

    (function (Type) {
      Type[Type["NONE"] = 0] = "NONE";
      Type[Type["Null"] = 1] = "Null";
      Type[Type["Int"] = 2] = "Int";
      Type[Type["Float"] = 3] = "Float";
      Type[Type["Binary"] = 4] = "Binary";
      Type[Type["Utf8"] = 5] = "Utf8";
      Type[Type["Bool"] = 6] = "Bool";
      Type[Type["Decimal"] = 7] = "Decimal";
      Type[Type["Date"] = 8] = "Date";
      Type[Type["Time"] = 9] = "Time";
      Type[Type["Timestamp"] = 10] = "Timestamp";
      Type[Type["Interval"] = 11] = "Interval";
      Type[Type["List"] = 12] = "List";
      Type[Type["Struct"] = 13] = "Struct";
      Type[Type["Union"] = 14] = "Union";
      Type[Type["FixedSizeBinary"] = 15] = "FixedSizeBinary";
      Type[Type["FixedSizeList"] = 16] = "FixedSizeList";
      Type[Type["Map"] = 17] = "Map";
      Type[Type["Dictionary"] = -1] = "Dictionary";
      Type[Type["Int8"] = -2] = "Int8";
      Type[Type["Int16"] = -3] = "Int16";
      Type[Type["Int32"] = -4] = "Int32";
      Type[Type["Int64"] = -5] = "Int64";
      Type[Type["Uint8"] = -6] = "Uint8";
      Type[Type["Uint16"] = -7] = "Uint16";
      Type[Type["Uint32"] = -8] = "Uint32";
      Type[Type["Uint64"] = -9] = "Uint64";
      Type[Type["Float16"] = -10] = "Float16";
      Type[Type["Float32"] = -11] = "Float32";
      Type[Type["Float64"] = -12] = "Float64";
      Type[Type["DateDay"] = -13] = "DateDay";
      Type[Type["DateMillisecond"] = -14] = "DateMillisecond";
      Type[Type["TimestampSecond"] = -15] = "TimestampSecond";
      Type[Type["TimestampMillisecond"] = -16] = "TimestampMillisecond";
      Type[Type["TimestampMicrosecond"] = -17] = "TimestampMicrosecond";
      Type[Type["TimestampNanosecond"] = -18] = "TimestampNanosecond";
      Type[Type["TimeSecond"] = -19] = "TimeSecond";
      Type[Type["TimeMillisecond"] = -20] = "TimeMillisecond";
      Type[Type["TimeMicrosecond"] = -21] = "TimeMicrosecond";
      Type[Type["TimeNanosecond"] = -22] = "TimeNanosecond";
      Type[Type["DenseUnion"] = -23] = "DenseUnion";
      Type[Type["SparseUnion"] = -24] = "SparseUnion";
      Type[Type["IntervalDayTime"] = -25] = "IntervalDayTime";
      Type[Type["IntervalYearMonth"] = -26] = "IntervalYearMonth";
    })(Type$1 || (Type$1 = {}));

    let _Symbol$toStringTag, _Symbol$toStringTag2, _Symbol$toStringTag7;
    class DataType {
      static isNull(x) {
        return x && x.typeId === Type$1.Null;
      }

      static isInt(x) {
        return x && x.typeId === Type$1.Int;
      }

      static isFloat(x) {
        return x && x.typeId === Type$1.Float;
      }

      static isBinary(x) {
        return x && x.typeId === Type$1.Binary;
      }

      static isUtf8(x) {
        return x && x.typeId === Type$1.Utf8;
      }

      static isBool(x) {
        return x && x.typeId === Type$1.Bool;
      }

      static isDecimal(x) {
        return x && x.typeId === Type$1.Decimal;
      }

      static isDate(x) {
        return x && x.typeId === Type$1.Date;
      }

      static isTime(x) {
        return x && x.typeId === Type$1.Time;
      }

      static isTimestamp(x) {
        return x && x.typeId === Type$1.Timestamp;
      }

      static isInterval(x) {
        return x && x.typeId === Type$1.Interval;
      }

      static isList(x) {
        return x && x.typeId === Type$1.List;
      }

      static isStruct(x) {
        return x && x.typeId === Type$1.Struct;
      }

      static isUnion(x) {
        return x && x.typeId === Type$1.Union;
      }

      static isFixedSizeBinary(x) {
        return x && x.typeId === Type$1.FixedSizeBinary;
      }

      static isFixedSizeList(x) {
        return x && x.typeId === Type$1.FixedSizeList;
      }

      static isMap(x) {
        return x && x.typeId === Type$1.Map;
      }

      static isDictionary(x) {
        return x && x.typeId === Type$1.Dictionary;
      }

      get typeId() {
        return Type$1.NONE;
      }

      compareTo(other) {
        return this === other;
      }

    }
    _Symbol$toStringTag = Symbol.toStringTag;
    class Int extends DataType {
      constructor(isSigned, bitWidth) {
        super();

        _defineProperty$1(this, "isSigned", void 0);

        _defineProperty$1(this, "bitWidth", void 0);

        this.isSigned = isSigned;
        this.bitWidth = bitWidth;
      }

      get typeId() {
        return Type$1.Int;
      }

      get [_Symbol$toStringTag]() {
        return 'Int';
      }

      toString() {
        return `${this.isSigned ? 'I' : 'Ui'}nt${this.bitWidth}`;
      }

    }
    class Int8 extends Int {
      constructor() {
        super(true, 8);
      }

    }
    class Int16 extends Int {
      constructor() {
        super(true, 16);
      }

    }
    class Int32 extends Int {
      constructor() {
        super(true, 32);
      }

    }
    class Uint8 extends Int {
      constructor() {
        super(false, 8);
      }

    }
    class Uint16 extends Int {
      constructor() {
        super(false, 16);
      }

    }
    class Uint32 extends Int {
      constructor() {
        super(false, 32);
      }

    }
    const Precision = {
      HALF: 16,
      SINGLE: 32,
      DOUBLE: 64
    };
    _Symbol$toStringTag2 = Symbol.toStringTag;
    class Float extends DataType {
      constructor(precision) {
        super();

        _defineProperty$1(this, "precision", void 0);

        this.precision = precision;
      }

      get typeId() {
        return Type$1.Float;
      }

      get [_Symbol$toStringTag2]() {
        return 'Float';
      }

      toString() {
        return `Float${this.precision}`;
      }

    }
    class Float32 extends Float {
      constructor() {
        super(Precision.SINGLE);
      }

    }
    class Float64 extends Float {
      constructor() {
        super(Precision.DOUBLE);
      }

    }
    _Symbol$toStringTag7 = Symbol.toStringTag;
    class FixedSizeList extends DataType {
      constructor(listSize, child) {
        super();

        _defineProperty$1(this, "listSize", void 0);

        _defineProperty$1(this, "children", void 0);

        this.listSize = listSize;
        this.children = [child];
      }

      get typeId() {
        return Type$1.FixedSizeList;
      }

      get valueType() {
        return this.children[0].type;
      }

      get valueField() {
        return this.children[0];
      }

      get [_Symbol$toStringTag7]() {
        return 'FixedSizeList';
      }

      toString() {
        return `FixedSizeList[${this.listSize}]<${this.valueType}>`;
      }

    }

    function getArrowTypeFromTypedArray(array) {
      switch (array.constructor) {
        case Int8Array:
          return new Int8();

        case Uint8Array:
          return new Uint8();

        case Int16Array:
          return new Int16();

        case Uint16Array:
          return new Uint16();

        case Int32Array:
          return new Int32();

        case Uint32Array:
          return new Uint32();

        case Float32Array:
          return new Float32();

        case Float64Array:
          return new Float64();

        default:
          throw new Error('array type not supported');
      }
    }

    function makeSchemaFromAttributes(attributes, loaderData, indices) {
      const metadataMap = makeMetadata(loaderData.metadata);
      const fields = [];
      const namedLoaderDataAttributes = transformAttributesLoaderData(loaderData.attributes);

      for (const attributeName in attributes) {
        const attribute = attributes[attributeName];
        const field = getArrowFieldFromAttribute(attributeName, attribute, namedLoaderDataAttributes[attributeName]);
        fields.push(field);
      }

      if (indices) {
        const indicesField = getArrowFieldFromAttribute('indices', indices);
        fields.push(indicesField);
      }

      return new Schema(fields, metadataMap);
    }

    function transformAttributesLoaderData(loaderData) {
      const result = {};

      for (const key in loaderData) {
        const dracoAttribute = loaderData[key];
        result[dracoAttribute.name || 'undefined'] = dracoAttribute;
      }

      return result;
    }

    function getArrowFieldFromAttribute(attributeName, attribute, loaderData) {
      const metadataMap = loaderData ? makeMetadata(loaderData.metadata) : undefined;
      const type = getArrowTypeFromTypedArray(attribute.value);
      return new Field(attributeName, new FixedSizeList(attribute.size, new Field('value', type)), false, metadataMap);
    }

    function makeMetadata(metadata) {
      const metadataMap = new Map();

      for (const key in metadata) {
        metadataMap.set(`${key}.string`, JSON.stringify(metadata[key]));
      }

      return metadataMap;
    }

    const DRACO_TO_GLTF_ATTRIBUTE_NAME_MAP = {
      POSITION: 'POSITION',
      NORMAL: 'NORMAL',
      COLOR: 'COLOR_0',
      TEX_COORD: 'TEXCOORD_0'
    };
    const DRACO_DATA_TYPE_TO_TYPED_ARRAY_MAP = {
      1: Int8Array,
      2: Uint8Array,
      3: Int16Array,
      4: Uint16Array,
      5: Int32Array,
      6: Uint32Array,
      9: Float32Array
    };
    const INDEX_ITEM_SIZE = 4;
    class DracoParser {
      constructor(draco) {
        _defineProperty$1(this, "draco", void 0);

        _defineProperty$1(this, "decoder", void 0);

        _defineProperty$1(this, "metadataQuerier", void 0);

        this.draco = draco;
        this.decoder = new this.draco.Decoder();
        this.metadataQuerier = new this.draco.MetadataQuerier();
      }

      destroy() {
        this.draco.destroy(this.decoder);
        this.draco.destroy(this.metadataQuerier);
      }

      parseSync(arrayBuffer, options = {}) {
        const buffer = new this.draco.DecoderBuffer();
        buffer.Init(new Int8Array(arrayBuffer), arrayBuffer.byteLength);

        this._disableAttributeTransforms(options);

        const geometry_type = this.decoder.GetEncodedGeometryType(buffer);
        const dracoGeometry = geometry_type === this.draco.TRIANGULAR_MESH ? new this.draco.Mesh() : new this.draco.PointCloud();

        try {
          let dracoStatus;

          switch (geometry_type) {
            case this.draco.TRIANGULAR_MESH:
              dracoStatus = this.decoder.DecodeBufferToMesh(buffer, dracoGeometry);
              break;

            case this.draco.POINT_CLOUD:
              dracoStatus = this.decoder.DecodeBufferToPointCloud(buffer, dracoGeometry);
              break;

            default:
              throw new Error('DRACO: Unknown geometry type.');
          }

          if (!dracoStatus.ok() || !dracoGeometry.ptr) {
            const message = `DRACO decompression failed: ${dracoStatus.error_msg()}`;
            throw new Error(message);
          }

          const loaderData = this._getDracoLoaderData(dracoGeometry, geometry_type, options);

          const geometry = this._getMeshData(dracoGeometry, loaderData, options);

          const boundingBox = getMeshBoundingBox(geometry.attributes);
          const schema = makeSchemaFromAttributes(geometry.attributes, loaderData, geometry.indices);
          const data = {
            loader: 'draco',
            loaderData,
            header: {
              vertexCount: dracoGeometry.num_points(),
              boundingBox
            },
            ...geometry,
            schema
          };
          return data;
        } finally {
          this.draco.destroy(buffer);

          if (dracoGeometry) {
            this.draco.destroy(dracoGeometry);
          }
        }
      }

      _getDracoLoaderData(dracoGeometry, geometry_type, options) {
        const metadata = this._getTopLevelMetadata(dracoGeometry);

        const attributes = this._getDracoAttributes(dracoGeometry, options);

        return {
          geometry_type,
          num_attributes: dracoGeometry.num_attributes(),
          num_points: dracoGeometry.num_points(),
          num_faces: dracoGeometry instanceof this.draco.Mesh ? dracoGeometry.num_faces() : 0,
          metadata,
          attributes
        };
      }

      _getDracoAttributes(dracoGeometry, options) {
        const dracoAttributes = {};

        for (let attributeId = 0; attributeId < dracoGeometry.num_attributes(); attributeId++) {
          const dracoAttribute = this.decoder.GetAttribute(dracoGeometry, attributeId);

          const metadata = this._getAttributeMetadata(dracoGeometry, attributeId);

          dracoAttributes[dracoAttribute.unique_id()] = {
            unique_id: dracoAttribute.unique_id(),
            attribute_type: dracoAttribute.attribute_type(),
            data_type: dracoAttribute.data_type(),
            num_components: dracoAttribute.num_components(),
            byte_offset: dracoAttribute.byte_offset(),
            byte_stride: dracoAttribute.byte_stride(),
            normalized: dracoAttribute.normalized(),
            attribute_index: attributeId,
            metadata
          };

          const quantization = this._getQuantizationTransform(dracoAttribute, options);

          if (quantization) {
            dracoAttributes[dracoAttribute.unique_id()].quantization_transform = quantization;
          }

          const octahedron = this._getOctahedronTransform(dracoAttribute, options);

          if (octahedron) {
            dracoAttributes[dracoAttribute.unique_id()].octahedron_transform = octahedron;
          }
        }

        return dracoAttributes;
      }

      _getMeshData(dracoGeometry, loaderData, options) {
        const attributes = this._getMeshAttributes(loaderData, dracoGeometry, options);

        const positionAttribute = attributes.POSITION;

        if (!positionAttribute) {
          throw new Error('DRACO: No position attribute found.');
        }

        if (dracoGeometry instanceof this.draco.Mesh) {
          switch (options.topology) {
            case 'triangle-strip':
              return {
                topology: 'triangle-strip',
                mode: 4,
                attributes,
                indices: {
                  value: this._getTriangleStripIndices(dracoGeometry),
                  size: 1
                }
              };

            case 'triangle-list':
            default:
              return {
                topology: 'triangle-list',
                mode: 5,
                attributes,
                indices: {
                  value: this._getTriangleListIndices(dracoGeometry),
                  size: 1
                }
              };
          }
        }

        return {
          topology: 'point-list',
          mode: 0,
          attributes
        };
      }

      _getMeshAttributes(loaderData, dracoGeometry, options) {
        const attributes = {};

        for (const loaderAttribute of Object.values(loaderData.attributes)) {
          const attributeName = this._deduceAttributeName(loaderAttribute, options);

          loaderAttribute.name = attributeName;

          const {
            value,
            size
          } = this._getAttributeValues(dracoGeometry, loaderAttribute);

          attributes[attributeName] = {
            value,
            size,
            byteOffset: loaderAttribute.byte_offset,
            byteStride: loaderAttribute.byte_stride,
            normalized: loaderAttribute.normalized
          };
        }

        return attributes;
      }

      _getTriangleListIndices(dracoGeometry) {
        const numFaces = dracoGeometry.num_faces();
        const numIndices = numFaces * 3;
        const byteLength = numIndices * INDEX_ITEM_SIZE;

        const ptr = this.draco._malloc(byteLength);

        try {
          this.decoder.GetTrianglesUInt32Array(dracoGeometry, byteLength, ptr);
          return new Uint32Array(this.draco.HEAPF32.buffer, ptr, numIndices).slice();
        } finally {
          this.draco._free(ptr);
        }
      }

      _getTriangleStripIndices(dracoGeometry) {
        const dracoArray = new this.draco.DracoInt32Array();

        try {
          this.decoder.GetTriangleStripsFromMesh(dracoGeometry, dracoArray);
          return getUint32Array(dracoArray);
        } finally {
          this.draco.destroy(dracoArray);
        }
      }

      _getAttributeValues(dracoGeometry, attribute) {
        const TypedArrayCtor = DRACO_DATA_TYPE_TO_TYPED_ARRAY_MAP[attribute.data_type];
        const numComponents = attribute.num_components;
        const numPoints = dracoGeometry.num_points();
        const numValues = numPoints * numComponents;
        const byteLength = numValues * TypedArrayCtor.BYTES_PER_ELEMENT;
        const dataType = getDracoDataType(this.draco, TypedArrayCtor);
        let value;

        const ptr = this.draco._malloc(byteLength);

        try {
          const dracoAttribute = this.decoder.GetAttribute(dracoGeometry, attribute.attribute_index);
          this.decoder.GetAttributeDataArrayForAllPoints(dracoGeometry, dracoAttribute, dataType, byteLength, ptr);
          value = new TypedArrayCtor(this.draco.HEAPF32.buffer, ptr, numValues).slice();
        } finally {
          this.draco._free(ptr);
        }

        return {
          value,
          size: numComponents
        };
      }

      _deduceAttributeName(attribute, options) {
        const uniqueId = attribute.unique_id;

        for (const [attributeName, attributeUniqueId] of Object.entries(options.extraAttributes || {})) {
          if (attributeUniqueId === uniqueId) {
            return attributeName;
          }
        }

        const thisAttributeType = attribute.attribute_type;

        for (const dracoAttributeConstant in DRACO_TO_GLTF_ATTRIBUTE_NAME_MAP) {
          const attributeType = this.draco[dracoAttributeConstant];

          if (attributeType === thisAttributeType) {
            return DRACO_TO_GLTF_ATTRIBUTE_NAME_MAP[dracoAttributeConstant];
          }
        }

        const entryName = options.attributeNameEntry || 'name';

        if (attribute.metadata[entryName]) {
          return attribute.metadata[entryName].string;
        }

        return `CUSTOM_ATTRIBUTE_${uniqueId}`;
      }

      _getTopLevelMetadata(dracoGeometry) {
        const dracoMetadata = this.decoder.GetMetadata(dracoGeometry);
        return this._getDracoMetadata(dracoMetadata);
      }

      _getAttributeMetadata(dracoGeometry, attributeId) {
        const dracoMetadata = this.decoder.GetAttributeMetadata(dracoGeometry, attributeId);
        return this._getDracoMetadata(dracoMetadata);
      }

      _getDracoMetadata(dracoMetadata) {
        if (!dracoMetadata || !dracoMetadata.ptr) {
          return {};
        }

        const result = {};
        const numEntries = this.metadataQuerier.NumEntries(dracoMetadata);

        for (let entryIndex = 0; entryIndex < numEntries; entryIndex++) {
          const entryName = this.metadataQuerier.GetEntryName(dracoMetadata, entryIndex);
          result[entryName] = this._getDracoMetadataField(dracoMetadata, entryName);
        }

        return result;
      }

      _getDracoMetadataField(dracoMetadata, entryName) {
        const dracoArray = new this.draco.DracoInt32Array();

        try {
          this.metadataQuerier.GetIntEntryArray(dracoMetadata, entryName, dracoArray);
          const intArray = getInt32Array(dracoArray);
          return {
            int: this.metadataQuerier.GetIntEntry(dracoMetadata, entryName),
            string: this.metadataQuerier.GetStringEntry(dracoMetadata, entryName),
            double: this.metadataQuerier.GetDoubleEntry(dracoMetadata, entryName),
            intArray
          };
        } finally {
          this.draco.destroy(dracoArray);
        }
      }

      _disableAttributeTransforms(options) {
        const {
          quantizedAttributes = [],
          octahedronAttributes = []
        } = options;
        const skipAttributes = [...quantizedAttributes, ...octahedronAttributes];

        for (const dracoAttributeName of skipAttributes) {
          this.decoder.SkipAttributeTransform(this.draco[dracoAttributeName]);
        }
      }

      _getQuantizationTransform(dracoAttribute, options) {
        const {
          quantizedAttributes = []
        } = options;
        const attribute_type = dracoAttribute.attribute_type();
        const skip = quantizedAttributes.map(type => this.decoder[type]).includes(attribute_type);

        if (skip) {
          const transform = new this.draco.AttributeQuantizationTransform();

          try {
            if (transform.InitFromAttribute(dracoAttribute)) {
              return {
                quantization_bits: transform.quantization_bits(),
                range: transform.range(),
                min_values: new Float32Array([1, 2, 3]).map(i => transform.min_value(i))
              };
            }
          } finally {
            this.draco.destroy(transform);
          }
        }

        return null;
      }

      _getOctahedronTransform(dracoAttribute, options) {
        const {
          octahedronAttributes = []
        } = options;
        const attribute_type = dracoAttribute.attribute_type();
        const octahedron = octahedronAttributes.map(type => this.decoder[type]).includes(attribute_type);

        if (octahedron) {
          const transform = new this.draco.AttributeQuantizationTransform();

          try {
            if (transform.InitFromAttribute(dracoAttribute)) {
              return {
                quantization_bits: transform.quantization_bits()
              };
            }
          } finally {
            this.draco.destroy(transform);
          }
        }

        return null;
      }

    }

    function getDracoDataType(draco, attributeType) {
      switch (attributeType) {
        case Float32Array:
          return draco.DT_FLOAT32;

        case Int8Array:
          return draco.DT_INT8;

        case Int16Array:
          return draco.DT_INT16;

        case Int32Array:
          return draco.DT_INT32;

        case Uint8Array:
          return draco.DT_UINT8;

        case Uint16Array:
          return draco.DT_UINT16;

        case Uint32Array:
          return draco.DT_UINT32;

        default:
          return draco.DT_INVALID;
      }
    }

    function getInt32Array(dracoArray) {
      const numValues = dracoArray.size();
      const intArray = new Int32Array(numValues);

      for (let i = 0; i < numValues; i++) {
        intArray[i] = dracoArray.GetValue(i);
      }

      return intArray;
    }

    function getUint32Array(dracoArray) {
      const numValues = dracoArray.size();
      const intArray = new Int32Array(numValues);

      for (let i = 0; i < numValues; i++) {
        intArray[i] = dracoArray.GetValue(i);
      }

      return intArray;
    }

    const DRACO_VERSION = '1.4.1';
    const DRACO_JS_DECODER_URL = `https://www.gstatic.com/draco/versioned/decoders/${DRACO_VERSION}/draco_decoder.js`;
    const DRACO_WASM_WRAPPER_URL = `https://www.gstatic.com/draco/versioned/decoders/${DRACO_VERSION}/draco_wasm_wrapper.js`;
    const DRACO_WASM_DECODER_URL = `https://www.gstatic.com/draco/versioned/decoders/${DRACO_VERSION}/draco_decoder.wasm`;
    let loadDecoderPromise;
    async function loadDracoDecoderModule(options) {
      const modules = options.modules || {};

      if (modules.draco3d) {
        loadDecoderPromise = loadDecoderPromise || modules.draco3d.createDecoderModule({}).then(draco => {
          return {
            draco
          };
        });
      } else {
        loadDecoderPromise = loadDecoderPromise || loadDracoDecoder(options);
      }

      return await loadDecoderPromise;
    }

    async function loadDracoDecoder(options) {
      let DracoDecoderModule;
      let wasmBinary;

      switch (options.draco && options.draco.decoderType) {
        case 'js':
          DracoDecoderModule = await loadLibrary(DRACO_JS_DECODER_URL, 'draco', options);
          break;

        case 'wasm':
        default:
          [DracoDecoderModule, wasmBinary] = await Promise.all([await loadLibrary(DRACO_WASM_WRAPPER_URL, 'draco', options), await loadLibrary(DRACO_WASM_DECODER_URL, 'draco', options)]);
      }

      DracoDecoderModule = DracoDecoderModule || globalThis.DracoDecoderModule;
      return await initializeDracoDecoder(DracoDecoderModule, wasmBinary);
    }

    function initializeDracoDecoder(DracoDecoderModule, wasmBinary) {
      const options = {};

      if (wasmBinary) {
        options.wasmBinary = wasmBinary;
      }

      return new Promise(resolve => {
        DracoDecoderModule({ ...options,
          onModuleLoaded: draco => resolve({
            draco
          })
        });
      });
    }

    const DracoLoader = { ...DracoLoader$1,
      parse: parse$1
    };

    async function parse$1(arrayBuffer, options) {
      const {
        draco
      } = await loadDracoDecoderModule(options);
      const dracoParser = new DracoParser(draco);

      try {
        return dracoParser.parseSync(arrayBuffer, options === null || options === void 0 ? void 0 : options.draco);
      } finally {
        dracoParser.destroy();
      }
    }

    const TYPES = ['SCALAR', 'VEC2', 'VEC3', 'VEC4'];
    const ARRAY_CONSTRUCTOR_TO_WEBGL_CONSTANT = [[Int8Array, 5120], [Uint8Array, 5121], [Int16Array, 5122], [Uint16Array, 5123], [Uint32Array, 5125], [Float32Array, 5126], [Float64Array, 5130]];
    const ARRAY_TO_COMPONENT_TYPE = new Map(ARRAY_CONSTRUCTOR_TO_WEBGL_CONSTANT);
    const ATTRIBUTE_TYPE_TO_COMPONENTS = {
      SCALAR: 1,
      VEC2: 2,
      VEC3: 3,
      VEC4: 4,
      MAT2: 4,
      MAT3: 9,
      MAT4: 16
    };
    const ATTRIBUTE_COMPONENT_TYPE_TO_BYTE_SIZE = {
      5120: 1,
      5121: 1,
      5122: 2,
      5123: 2,
      5125: 4,
      5126: 4
    };
    const ATTRIBUTE_COMPONENT_TYPE_TO_ARRAY = {
      5120: Int8Array,
      5121: Uint8Array,
      5122: Int16Array,
      5123: Uint16Array,
      5125: Uint32Array,
      5126: Float32Array
    };
    function getAccessorTypeFromSize(size) {
      const type = TYPES[size - 1];
      return type || TYPES[0];
    }
    function getComponentTypeFromArray(typedArray) {
      const componentType = ARRAY_TO_COMPONENT_TYPE.get(typedArray.constructor);

      if (!componentType) {
        throw new Error('Illegal typed array');
      }

      return componentType;
    }
    function getAccessorArrayTypeAndLength(accessor, bufferView) {
      const ArrayType = ATTRIBUTE_COMPONENT_TYPE_TO_ARRAY[accessor.componentType];
      const components = ATTRIBUTE_TYPE_TO_COMPONENTS[accessor.type];
      const bytesPerComponent = ATTRIBUTE_COMPONENT_TYPE_TO_BYTE_SIZE[accessor.componentType];
      const length = accessor.count * components;
      const byteLength = accessor.count * components * bytesPerComponent;
      assert$1(byteLength >= 0 && byteLength <= bufferView.byteLength);
      return {
        ArrayType,
        length,
        byteLength
      };
    }

    const DEFAULT_GLTF_JSON = {
      asset: {
        version: '2.0',
        generator: 'loaders.gl'
      },
      buffers: []
    };
    class GLTFScenegraph {
      constructor(gltf) {
        _defineProperty$1(this, "gltf", void 0);

        _defineProperty$1(this, "sourceBuffers", void 0);

        _defineProperty$1(this, "byteLength", void 0);

        this.gltf = gltf || {
          json: { ...DEFAULT_GLTF_JSON
          },
          buffers: []
        };
        this.sourceBuffers = [];
        this.byteLength = 0;

        if (this.gltf.buffers && this.gltf.buffers[0]) {
          this.byteLength = this.gltf.buffers[0].byteLength;
          this.sourceBuffers = [this.gltf.buffers[0]];
        }
      }

      get json() {
        return this.gltf.json;
      }

      getApplicationData(key) {
        const data = this.json[key];
        return data;
      }

      getExtraData(key) {
        const extras = this.json.extras || {};
        return extras[key];
      }

      getExtension(extensionName) {
        const isExtension = this.getUsedExtensions().find(name => name === extensionName);
        const extensions = this.json.extensions || {};
        return isExtension ? extensions[extensionName] || true : null;
      }

      getRequiredExtension(extensionName) {
        const isRequired = this.getRequiredExtensions().find(name => name === extensionName);
        return isRequired ? this.getExtension(extensionName) : null;
      }

      getRequiredExtensions() {
        return this.json.extensionsRequired || [];
      }

      getUsedExtensions() {
        return this.json.extensionsUsed || [];
      }

      getObjectExtension(object, extensionName) {
        const extensions = object.extensions || {};
        return extensions[extensionName];
      }

      getScene(index) {
        return this.getObject('scenes', index);
      }

      getNode(index) {
        return this.getObject('nodes', index);
      }

      getSkin(index) {
        return this.getObject('skins', index);
      }

      getMesh(index) {
        return this.getObject('meshes', index);
      }

      getMaterial(index) {
        return this.getObject('materials', index);
      }

      getAccessor(index) {
        return this.getObject('accessors', index);
      }

      getTexture(index) {
        return this.getObject('textures', index);
      }

      getSampler(index) {
        return this.getObject('samplers', index);
      }

      getImage(index) {
        return this.getObject('images', index);
      }

      getBufferView(index) {
        return this.getObject('bufferViews', index);
      }

      getBuffer(index) {
        return this.getObject('buffers', index);
      }

      getObject(array, index) {
        if (typeof index === 'object') {
          return index;
        }

        const object = this.json[array] && this.json[array][index];

        if (!object) {
          throw new Error(`glTF file error: Could not find ${array}[${index}]`);
        }

        return object;
      }

      getTypedArrayForBufferView(bufferView) {
        bufferView = this.getBufferView(bufferView);
        const bufferIndex = bufferView.buffer;
        const binChunk = this.gltf.buffers[bufferIndex];
        assert$1(binChunk);
        const byteOffset = (bufferView.byteOffset || 0) + binChunk.byteOffset;
        return new Uint8Array(binChunk.arrayBuffer, byteOffset, bufferView.byteLength);
      }

      getTypedArrayForAccessor(accessor) {
        accessor = this.getAccessor(accessor);
        const bufferView = this.getBufferView(accessor.bufferView);
        const buffer = this.getBuffer(bufferView.buffer);
        const arrayBuffer = buffer.data;
        const {
          ArrayType,
          length
        } = getAccessorArrayTypeAndLength(accessor, bufferView);
        const byteOffset = bufferView.byteOffset + accessor.byteOffset;
        return new ArrayType(arrayBuffer, byteOffset, length);
      }

      getTypedArrayForImageData(image) {
        image = this.getAccessor(image);
        const bufferView = this.getBufferView(image.bufferView);
        const buffer = this.getBuffer(bufferView.buffer);
        const arrayBuffer = buffer.data;
        const byteOffset = bufferView.byteOffset || 0;
        return new Uint8Array(arrayBuffer, byteOffset, bufferView.byteLength);
      }

      addApplicationData(key, data) {
        this.json[key] = data;
        return this;
      }

      addExtraData(key, data) {
        this.json.extras = this.json.extras || {};
        this.json.extras[key] = data;
        return this;
      }

      addObjectExtension(object, extensionName, data) {
        object.extensions = object.extensions || {};
        object.extensions[extensionName] = data;
        this.registerUsedExtension(extensionName);
        return this;
      }

      setObjectExtension(object, extensionName, data) {
        const extensions = object.extensions || {};
        extensions[extensionName] = data;
      }

      removeObjectExtension(object, extensionName) {
        const extensions = object.extensions || {};
        const extension = extensions[extensionName];
        delete extensions[extensionName];
        return extension;
      }

      addExtension(extensionName, extensionData = {}) {
        assert$1(extensionData);
        this.json.extensions = this.json.extensions || {};
        this.json.extensions[extensionName] = extensionData;
        this.registerUsedExtension(extensionName);
        return extensionData;
      }

      addRequiredExtension(extensionName, extensionData = {}) {
        assert$1(extensionData);
        this.addExtension(extensionName, extensionData);
        this.registerRequiredExtension(extensionName);
        return extensionData;
      }

      registerUsedExtension(extensionName) {
        this.json.extensionsUsed = this.json.extensionsUsed || [];

        if (!this.json.extensionsUsed.find(ext => ext === extensionName)) {
          this.json.extensionsUsed.push(extensionName);
        }
      }

      registerRequiredExtension(extensionName) {
        this.registerUsedExtension(extensionName);
        this.json.extensionsRequired = this.json.extensionsRequired || [];

        if (!this.json.extensionsRequired.find(ext => ext === extensionName)) {
          this.json.extensionsRequired.push(extensionName);
        }
      }

      removeExtension(extensionName) {
        if (this.json.extensionsRequired) {
          this._removeStringFromArray(this.json.extensionsRequired, extensionName);
        }

        if (this.json.extensionsUsed) {
          this._removeStringFromArray(this.json.extensionsUsed, extensionName);
        }

        if (this.json.extensions) {
          delete this.json.extensions[extensionName];
        }
      }

      setDefaultScene(sceneIndex) {
        this.json.scene = sceneIndex;
      }

      addScene(scene) {
        const {
          nodeIndices
        } = scene;
        this.json.scenes = this.json.scenes || [];
        this.json.scenes.push({
          nodes: nodeIndices
        });
        return this.json.scenes.length - 1;
      }

      addNode(node) {
        const {
          meshIndex,
          matrix
        } = node;
        this.json.nodes = this.json.nodes || [];
        const nodeData = {
          mesh: meshIndex
        };

        if (matrix) {
          nodeData.matrix = matrix;
        }

        this.json.nodes.push(nodeData);
        return this.json.nodes.length - 1;
      }

      addMesh(mesh) {
        const {
          attributes,
          indices,
          material,
          mode = 4
        } = mesh;

        const accessors = this._addAttributes(attributes);

        const glTFMesh = {
          primitives: [{
            attributes: accessors,
            mode
          }]
        };

        if (indices) {
          const indicesAccessor = this._addIndices(indices);

          glTFMesh.primitives[0].indices = indicesAccessor;
        }

        if (Number.isFinite(material)) {
          glTFMesh.primitives[0].material = material;
        }

        this.json.meshes = this.json.meshes || [];
        this.json.meshes.push(glTFMesh);
        return this.json.meshes.length - 1;
      }

      addPointCloud(attributes) {
        const accessorIndices = this._addAttributes(attributes);

        const glTFMesh = {
          primitives: [{
            attributes: accessorIndices,
            mode: 0
          }]
        };
        this.json.meshes = this.json.meshes || [];
        this.json.meshes.push(glTFMesh);
        return this.json.meshes.length - 1;
      }

      addImage(imageData, mimeTypeOpt) {
        const metadata = getBinaryImageMetadata(imageData);
        const mimeType = mimeTypeOpt || (metadata === null || metadata === void 0 ? void 0 : metadata.mimeType);
        const bufferViewIndex = this.addBufferView(imageData);
        const glTFImage = {
          bufferView: bufferViewIndex,
          mimeType
        };
        this.json.images = this.json.images || [];
        this.json.images.push(glTFImage);
        return this.json.images.length - 1;
      }

      addBufferView(buffer) {
        const byteLength = buffer.byteLength;
        assert$1(Number.isFinite(byteLength));
        this.sourceBuffers = this.sourceBuffers || [];
        this.sourceBuffers.push(buffer);
        const glTFBufferView = {
          buffer: 0,
          byteOffset: this.byteLength,
          byteLength
        };
        this.byteLength += padToNBytes(byteLength, 4);
        this.json.bufferViews = this.json.bufferViews || [];
        this.json.bufferViews.push(glTFBufferView);
        return this.json.bufferViews.length - 1;
      }

      addAccessor(bufferViewIndex, accessor) {
        const glTFAccessor = {
          bufferView: bufferViewIndex,
          type: getAccessorTypeFromSize(accessor.size),
          componentType: accessor.componentType,
          count: accessor.count,
          max: accessor.max,
          min: accessor.min
        };
        this.json.accessors = this.json.accessors || [];
        this.json.accessors.push(glTFAccessor);
        return this.json.accessors.length - 1;
      }

      addBinaryBuffer(sourceBuffer, accessor = {
        size: 3
      }) {
        const bufferViewIndex = this.addBufferView(sourceBuffer);
        let minMax = {
          min: accessor.min,
          max: accessor.max
        };

        if (!minMax.min || !minMax.max) {
          minMax = this._getAccessorMinMax(sourceBuffer, accessor.size);
        }

        const accessorDefaults = {
          size: accessor.size,
          componentType: getComponentTypeFromArray(sourceBuffer),
          count: Math.round(sourceBuffer.length / accessor.size),
          min: minMax.min,
          max: minMax.max
        };
        return this.addAccessor(bufferViewIndex, Object.assign(accessorDefaults, accessor));
      }

      addTexture(texture) {
        const {
          imageIndex
        } = texture;
        const glTFTexture = {
          source: imageIndex
        };
        this.json.textures = this.json.textures || [];
        this.json.textures.push(glTFTexture);
        return this.json.textures.length - 1;
      }

      addMaterial(pbrMaterialInfo) {
        this.json.materials = this.json.materials || [];
        this.json.materials.push(pbrMaterialInfo);
        return this.json.materials.length - 1;
      }

      createBinaryChunk() {
        var _this$json, _this$json$buffers;

        this.gltf.buffers = [];
        const totalByteLength = this.byteLength;
        const arrayBuffer = new ArrayBuffer(totalByteLength);
        const targetArray = new Uint8Array(arrayBuffer);
        let dstByteOffset = 0;

        for (const sourceBuffer of this.sourceBuffers || []) {
          dstByteOffset = copyToArray(sourceBuffer, targetArray, dstByteOffset);
        }

        if ((_this$json = this.json) !== null && _this$json !== void 0 && (_this$json$buffers = _this$json.buffers) !== null && _this$json$buffers !== void 0 && _this$json$buffers[0]) {
          this.json.buffers[0].byteLength = totalByteLength;
        } else {
          this.json.buffers = [{
            byteLength: totalByteLength
          }];
        }

        this.gltf.binary = arrayBuffer;
        this.sourceBuffers = [arrayBuffer];
      }

      _removeStringFromArray(array, string) {
        let found = true;

        while (found) {
          const index = array.indexOf(string);

          if (index > -1) {
            array.splice(index, 1);
          } else {
            found = false;
          }
        }
      }

      _addAttributes(attributes = {}) {
        const result = {};

        for (const attributeKey in attributes) {
          const attributeData = attributes[attributeKey];

          const attrName = this._getGltfAttributeName(attributeKey);

          const accessor = this.addBinaryBuffer(attributeData.value, attributeData);
          result[attrName] = accessor;
        }

        return result;
      }

      _addIndices(indices) {
        return this.addBinaryBuffer(indices, {
          size: 1
        });
      }

      _getGltfAttributeName(attributeName) {
        switch (attributeName.toLowerCase()) {
          case 'position':
          case 'positions':
          case 'vertices':
            return 'POSITION';

          case 'normal':
          case 'normals':
            return 'NORMAL';

          case 'color':
          case 'colors':
            return 'COLOR_0';

          case 'texcoord':
          case 'texcoords':
            return 'TEXCOORD_0';

          default:
            return attributeName;
        }
      }

      _getAccessorMinMax(buffer, size) {
        const result = {
          min: null,
          max: null
        };

        if (buffer.length < size) {
          return result;
        }

        result.min = [];
        result.max = [];
        const initValues = buffer.subarray(0, size);

        for (const value of initValues) {
          result.min.push(value);
          result.max.push(value);
        }

        for (let index = size; index < buffer.length; index += size) {
          for (let componentIndex = 0; componentIndex < size; componentIndex++) {
            result.min[0 + componentIndex] = Math.min(result.min[0 + componentIndex], buffer[index + componentIndex]);
            result.max[0 + componentIndex] = Math.max(result.max[0 + componentIndex], buffer[index + componentIndex]);
          }
        }

        return result;
      }

    }

    const KHR_BINARY_GLTF = 'KHR_binary_glTF';
    const KHR_DRACO_MESH_COMPRESSION = 'KHR_draco_mesh_compression';
    const KHR_LIGHTS_PUNCTUAL = 'KHR_lights_punctual';
    const KHR_MATERIALS_UNLIT = 'KHR_materials_unlit';
    const KHR_TECHNIQUES_WEBGL = 'KHR_techniques_webgl';

    function getGLTFAccessors(attributes) {
      const accessors = {};

      for (const name in attributes) {
        const attribute = attributes[name];

        if (name !== 'indices') {
          const glTFAccessor = getGLTFAccessor(attribute);
          accessors[name] = glTFAccessor;
        }
      }

      return accessors;
    }
    function getGLTFAccessor(attribute) {
      const {
        buffer,
        size,
        count
      } = getAccessorData(attribute);
      const glTFAccessor = {
        value: buffer,
        size,
        byteOffset: 0,
        count,
        type: getAccessorTypeFromSize(size),
        componentType: getComponentTypeFromArray(buffer)
      };
      return glTFAccessor;
    }

    function getAccessorData(attribute) {
      let buffer = attribute;
      let size = 1;
      let count = 0;

      if (attribute && attribute.value) {
        buffer = attribute.value;
        size = attribute.size || 1;
      }

      if (buffer) {
        if (!ArrayBuffer.isView(buffer)) {
          buffer = toTypedArray(buffer, Float32Array);
        }

        count = buffer.length / size;
      }

      return {
        buffer,
        size,
        count
      };
    }

    function toTypedArray(array, ArrayType, convertTypedArrays = false) {
      if (!array) {
        return null;
      }

      if (Array.isArray(array)) {
        return new ArrayType(array);
      }

      if (convertTypedArrays && !(array instanceof ArrayType)) {
        return new ArrayType(array);
      }

      return array;
    }

    async function decode$4(gltfData, options, context) {
      var _options$gltf;

      if (!(options !== null && options !== void 0 && (_options$gltf = options.gltf) !== null && _options$gltf !== void 0 && _options$gltf.decompressMeshes)) {
        return;
      }

      const scenegraph = new GLTFScenegraph(gltfData);
      const promises = [];

      for (const primitive of makeMeshPrimitiveIterator(scenegraph)) {
        if (scenegraph.getObjectExtension(primitive, KHR_DRACO_MESH_COMPRESSION)) {
          promises.push(decompressPrimitive(scenegraph, primitive, options, context));
        }
      }

      await Promise.all(promises);
      scenegraph.removeExtension(KHR_DRACO_MESH_COMPRESSION);
    }
    function encode$3(gltfData, options = {}) {
      const scenegraph = new GLTFScenegraph(gltfData);

      for (const mesh of scenegraph.json.meshes || []) {
        compressMesh(mesh);
        scenegraph.addRequiredExtension(KHR_DRACO_MESH_COMPRESSION);
      }
    }

    async function decompressPrimitive(scenegraph, primitive, options, context) {
      const dracoExtension = scenegraph.getObjectExtension(primitive, KHR_DRACO_MESH_COMPRESSION);

      if (!dracoExtension) {
        return;
      }

      const buffer = scenegraph.getTypedArrayForBufferView(dracoExtension.bufferView);
      const bufferCopy = sliceArrayBuffer(buffer.buffer, buffer.byteOffset);
      const {
        parse
      } = context;
      const dracoOptions = { ...options
      };
      delete dracoOptions['3d-tiles'];
      const decodedData = await parse(bufferCopy, DracoLoader, dracoOptions, context);
      const decodedAttributes = getGLTFAccessors(decodedData.attributes);

      for (const [attributeName, decodedAttribute] of Object.entries(decodedAttributes)) {
        if (attributeName in primitive.attributes) {
          const accessorIndex = primitive.attributes[attributeName];
          const accessor = scenegraph.getAccessor(accessorIndex);

          if (accessor !== null && accessor !== void 0 && accessor.min && accessor !== null && accessor !== void 0 && accessor.max) {
            decodedAttribute.min = accessor.min;
            decodedAttribute.max = accessor.max;
          }
        }
      }

      primitive.attributes = decodedAttributes;

      if (decodedData.indices) {
        primitive.indices = getGLTFAccessor(decodedData.indices);
      }

      checkPrimitive(primitive);
    }

    function compressMesh(attributes, indices, mode = 4, options, context) {
      var _context$parseSync;

      if (!options.DracoWriter) {
        throw new Error('options.gltf.DracoWriter not provided');
      }

      const compressedData = options.DracoWriter.encodeSync({
        attributes
      });
      const decodedData = context === null || context === void 0 ? void 0 : (_context$parseSync = context.parseSync) === null || _context$parseSync === void 0 ? void 0 : _context$parseSync.call(context, {
        attributes
      });

      const fauxAccessors = options._addFauxAttributes(decodedData.attributes);

      const bufferViewIndex = options.addBufferView(compressedData);
      const glTFMesh = {
        primitives: [{
          attributes: fauxAccessors,
          mode,
          extensions: {
            [KHR_DRACO_MESH_COMPRESSION]: {
              bufferView: bufferViewIndex,
              attributes: fauxAccessors
            }
          }
        }]
      };
      return glTFMesh;
    }

    function checkPrimitive(primitive) {
      if (!primitive.attributes && Object.keys(primitive.attributes).length > 0) {
        throw new Error('glTF: Empty primitive detected: Draco decompression failure?');
      }
    }

    function* makeMeshPrimitiveIterator(scenegraph) {
      for (const mesh of scenegraph.json.meshes || []) {
        for (const primitive of mesh.primitives) {
          yield primitive;
        }
      }
    }

    var KHR_draco_mesh_compression = /*#__PURE__*/Object.freeze({
        __proto__: null,
        decode: decode$4,
        encode: encode$3
    });

    async function decode$3(gltfData) {
      const gltfScenegraph = new GLTFScenegraph(gltfData);
      const {
        json
      } = gltfScenegraph;
      gltfScenegraph.removeExtension(KHR_MATERIALS_UNLIT);

      for (const material of json.materials || []) {
        const extension = material.extensions && material.extensions.KHR_materials_unlit;

        if (extension) {
          material.unlit = true;
        }

        gltfScenegraph.removeObjectExtension(material, KHR_MATERIALS_UNLIT);
      }
    }
    function encode$2(gltfData) {
      const gltfScenegraph = new GLTFScenegraph(gltfData);
      const {
        json
      } = gltfScenegraph;

      if (gltfScenegraph.materials) {
        for (const material of json.materials || []) {
          if (material.unlit) {
            delete material.unlit;
            gltfScenegraph.addObjectExtension(material, KHR_MATERIALS_UNLIT, {});
            gltfScenegraph.addExtension(KHR_MATERIALS_UNLIT);
          }
        }
      }
    }

    var KHR_materials_unlit = /*#__PURE__*/Object.freeze({
        __proto__: null,
        decode: decode$3,
        encode: encode$2
    });

    async function decode$2(gltfData) {
      const gltfScenegraph = new GLTFScenegraph(gltfData);
      const {
        json
      } = gltfScenegraph;
      const extension = gltfScenegraph.getExtension(KHR_LIGHTS_PUNCTUAL);

      if (extension) {
        gltfScenegraph.json.lights = extension.lights;
        gltfScenegraph.removeExtension(KHR_LIGHTS_PUNCTUAL);
      }

      for (const node of json.nodes || []) {
        const nodeExtension = gltfScenegraph.getObjectExtension(node, KHR_LIGHTS_PUNCTUAL);

        if (nodeExtension) {
          node.light = nodeExtension.light;
        }

        gltfScenegraph.removeObjectExtension(node, KHR_LIGHTS_PUNCTUAL);
      }
    }
    async function encode$1(gltfData) {
      const gltfScenegraph = new GLTFScenegraph(gltfData);
      const {
        json
      } = gltfScenegraph;

      if (json.lights) {
        const extension = gltfScenegraph.addExtension(KHR_LIGHTS_PUNCTUAL);
        assert$1(!extension.lights);
        extension.lights = json.lights;
        delete json.lights;
      }

      if (gltfScenegraph.json.lights) {
        for (const light of gltfScenegraph.json.lights) {
          const node = light.node;
          gltfScenegraph.addObjectExtension(node, KHR_LIGHTS_PUNCTUAL, light);
        }

        delete gltfScenegraph.json.lights;
      }
    }

    var KHR_lights_punctual = /*#__PURE__*/Object.freeze({
        __proto__: null,
        decode: decode$2,
        encode: encode$1
    });

    async function decode$1(gltfData) {
      const gltfScenegraph = new GLTFScenegraph(gltfData);
      const {
        json
      } = gltfScenegraph;
      const extension = gltfScenegraph.getExtension(KHR_TECHNIQUES_WEBGL);

      if (extension) {
        const techniques = resolveTechniques(extension, gltfScenegraph);

        for (const material of json.materials || []) {
          const materialExtension = gltfScenegraph.getObjectExtension(material, KHR_TECHNIQUES_WEBGL);

          if (materialExtension) {
            material.technique = Object.assign({}, materialExtension, techniques[materialExtension.technique]);
            material.technique.values = resolveValues(material.technique, gltfScenegraph);
          }

          gltfScenegraph.removeObjectExtension(material, KHR_TECHNIQUES_WEBGL);
        }

        gltfScenegraph.removeExtension(KHR_TECHNIQUES_WEBGL);
      }
    }
    async function encode(gltfData, options) {}

    function resolveTechniques(techniquesExtension, gltfScenegraph) {
      const {
        programs = [],
        shaders = [],
        techniques = []
      } = techniquesExtension;
      const textDecoder = new TextDecoder();
      shaders.forEach(shader => {
        if (Number.isFinite(shader.bufferView)) {
          shader.code = textDecoder.decode(gltfScenegraph.getTypedArrayForBufferView(shader.bufferView));
        } else {
          throw new Error('KHR_techniques_webgl: no shader code');
        }
      });
      programs.forEach(program => {
        program.fragmentShader = shaders[program.fragmentShader];
        program.vertexShader = shaders[program.vertexShader];
      });
      techniques.forEach(technique => {
        technique.program = programs[technique.program];
      });
      return techniques;
    }

    function resolveValues(technique, gltfScenegraph) {
      const values = Object.assign({}, technique.values);
      Object.keys(technique.uniforms || {}).forEach(uniform => {
        if (technique.uniforms[uniform].value && !(uniform in values)) {
          values[uniform] = technique.uniforms[uniform].value;
        }
      });
      Object.keys(values).forEach(uniform => {
        if (typeof values[uniform] === 'object' && values[uniform].index !== undefined) {
          values[uniform].texture = gltfScenegraph.getTexture(values[uniform].index);
        }
      });
      return values;
    }

    var KHR_techniques_webgl = /*#__PURE__*/Object.freeze({
        __proto__: null,
        decode: decode$1,
        encode: encode
    });

    const EXTENSIONS = {
      KHR_draco_mesh_compression,
      KHR_materials_unlit,
      KHR_lights_punctual,
      KHR_techniques_webgl
    };
    async function decodeExtensions(gltf, options = {}, context) {
      for (const extensionName in EXTENSIONS) {
        var _options$gltf;

        const excludes = (options === null || options === void 0 ? void 0 : (_options$gltf = options.gltf) === null || _options$gltf === void 0 ? void 0 : _options$gltf.excludeExtensions) || {};
        const exclude = extensionName in excludes && !excludes[extensionName];

        if (!exclude) {
          const extension = EXTENSIONS[extensionName];
          await extension.decode(gltf, options, context);
        }
      }
    }

    function decode(gltfData) {
      const gltfScenegraph = new GLTFScenegraph(gltfData);
      const {
        json
      } = gltfScenegraph;

      for (const node of json.images || []) {
        const extension = gltfScenegraph.removeObjectExtension(node, KHR_BINARY_GLTF);

        if (extension) {
          Object.assign(node, extension);
        }
      }

      if (json.buffers && json.buffers[0]) {
        delete json.buffers[0].uri;
      }

      gltfScenegraph.removeExtension(KHR_BINARY_GLTF);
    }

    const GLTF_ARRAYS = {
      accessors: 'accessor',
      animations: 'animation',
      buffers: 'buffer',
      bufferViews: 'bufferView',
      images: 'image',
      materials: 'material',
      meshes: 'mesh',
      nodes: 'node',
      samplers: 'sampler',
      scenes: 'scene',
      skins: 'skin',
      textures: 'texture'
    };
    const GLTF_KEYS = {
      accessor: 'accessors',
      animations: 'animation',
      buffer: 'buffers',
      bufferView: 'bufferViews',
      image: 'images',
      material: 'materials',
      mesh: 'meshes',
      node: 'nodes',
      sampler: 'samplers',
      scene: 'scenes',
      skin: 'skins',
      texture: 'textures'
    };

    class GLTFV1Normalizer {
      constructor(gltf) {
        this.idToIndexMap = {
          animations: {},
          accessors: {},
          buffers: {},
          bufferViews: {},
          images: {},
          materials: {},
          meshes: {},
          nodes: {},
          samplers: {},
          scenes: {},
          skins: {},
          textures: {}
        };
      }

      normalize(gltf, options) {
        this.json = gltf.json;
        const json = gltf.json;

        switch (json.asset && json.asset.version) {
          case '2.0':
            return;

          case undefined:
          case '1.0':
            break;

          default:
            console.warn(`glTF: Unknown version ${json.asset.version}`);
            return;
        }

        if (!options.normalize) {
          throw new Error('glTF v1 is not supported.');
        }

        console.warn('Converting glTF v1 to glTF v2 format. This is experimental and may fail.');

        this._addAsset(json);

        this._convertTopLevelObjectsToArrays(json);

        decode(gltf);

        this._convertObjectIdsToArrayIndices(json);

        this._updateObjects(json);

        this._updateMaterial(json);
      }

      _addAsset(json) {
        json.asset = json.asset || {};
        json.asset.version = '2.0';
        json.asset.generator = json.asset.generator || 'Normalized to glTF 2.0 by loaders.gl';
      }

      _convertTopLevelObjectsToArrays(json) {
        for (const arrayName in GLTF_ARRAYS) {
          this._convertTopLevelObjectToArray(json, arrayName);
        }
      }

      _convertTopLevelObjectToArray(json, mapName) {
        const objectMap = json[mapName];

        if (!objectMap || Array.isArray(objectMap)) {
          return;
        }

        json[mapName] = [];

        for (const id in objectMap) {
          const object = objectMap[id];
          object.id = object.id || id;
          const index = json[mapName].length;
          json[mapName].push(object);
          this.idToIndexMap[mapName][id] = index;
        }
      }

      _convertObjectIdsToArrayIndices(json) {
        for (const arrayName in GLTF_ARRAYS) {
          this._convertIdsToIndices(json, arrayName);
        }

        if ('scene' in json) {
          json.scene = this._convertIdToIndex(json.scene, 'scene');
        }

        for (const texture of json.textures) {
          this._convertTextureIds(texture);
        }

        for (const mesh of json.meshes) {
          this._convertMeshIds(mesh);
        }

        for (const node of json.nodes) {
          this._convertNodeIds(node);
        }

        for (const node of json.scenes) {
          this._convertSceneIds(node);
        }
      }

      _convertTextureIds(texture) {
        if (texture.source) {
          texture.source = this._convertIdToIndex(texture.source, 'image');
        }
      }

      _convertMeshIds(mesh) {
        for (const primitive of mesh.primitives) {
          const {
            attributes,
            indices,
            material
          } = primitive;

          for (const attributeName in attributes) {
            attributes[attributeName] = this._convertIdToIndex(attributes[attributeName], 'accessor');
          }

          if (indices) {
            primitive.indices = this._convertIdToIndex(indices, 'accessor');
          }

          if (material) {
            primitive.material = this._convertIdToIndex(material, 'material');
          }
        }
      }

      _convertNodeIds(node) {
        if (node.children) {
          node.children = node.children.map(child => this._convertIdToIndex(child, 'node'));
        }

        if (node.meshes) {
          node.meshes = node.meshes.map(mesh => this._convertIdToIndex(mesh, 'mesh'));
        }
      }

      _convertSceneIds(scene) {
        if (scene.nodes) {
          scene.nodes = scene.nodes.map(node => this._convertIdToIndex(node, 'node'));
        }
      }

      _convertIdsToIndices(json, topLevelArrayName) {
        if (!json[topLevelArrayName]) {
          console.warn(`gltf v1: json doesn't contain attribute ${topLevelArrayName}`);
          json[topLevelArrayName] = [];
        }

        for (const object of json[topLevelArrayName]) {
          for (const key in object) {
            const id = object[key];

            const index = this._convertIdToIndex(id, key);

            object[key] = index;
          }
        }
      }

      _convertIdToIndex(id, key) {
        const arrayName = GLTF_KEYS[key];

        if (arrayName in this.idToIndexMap) {
          const index = this.idToIndexMap[arrayName][id];

          if (!Number.isFinite(index)) {
            throw new Error(`gltf v1: failed to resolve ${key} with id ${id}`);
          }

          return index;
        }

        return id;
      }

      _updateObjects(json) {
        for (const buffer of this.json.buffers) {
          delete buffer.type;
        }
      }

      _updateMaterial(json) {
        for (const material of json.materials) {
          material.pbrMetallicRoughness = {
            baseColorFactor: [1, 1, 1, 1],
            metallicFactor: 1,
            roughnessFactor: 1
          };
          const textureId = material.values && material.values.tex;
          const textureIndex = json.textures.findIndex(texture => texture.id === textureId);

          if (textureIndex !== -1) {
            material.pbrMetallicRoughness.baseColorTexture = {
              index: textureIndex
            };
          }
        }
      }

    }

    function normalizeGLTFV1(gltf, options = {}) {
      return new GLTFV1Normalizer().normalize(gltf, options);
    }

    const COMPONENTS = {
      SCALAR: 1,
      VEC2: 2,
      VEC3: 3,
      VEC4: 4,
      MAT2: 4,
      MAT3: 9,
      MAT4: 16
    };
    const BYTES = {
      5120: 1,
      5121: 1,
      5122: 2,
      5123: 2,
      5125: 4,
      5126: 4
    };
    const GL_SAMPLER = {
      TEXTURE_MAG_FILTER: 0x2800,
      TEXTURE_MIN_FILTER: 0x2801,
      TEXTURE_WRAP_S: 0x2802,
      TEXTURE_WRAP_T: 0x2803,
      REPEAT: 0x2901,
      LINEAR: 0x2601,
      NEAREST_MIPMAP_LINEAR: 0x2702
    };
    const SAMPLER_PARAMETER_GLTF_TO_GL = {
      magFilter: GL_SAMPLER.TEXTURE_MAG_FILTER,
      minFilter: GL_SAMPLER.TEXTURE_MIN_FILTER,
      wrapS: GL_SAMPLER.TEXTURE_WRAP_S,
      wrapT: GL_SAMPLER.TEXTURE_WRAP_T
    };
    const DEFAULT_SAMPLER = {
      [GL_SAMPLER.TEXTURE_MAG_FILTER]: GL_SAMPLER.LINEAR,
      [GL_SAMPLER.TEXTURE_MIN_FILTER]: GL_SAMPLER.NEAREST_MIPMAP_LINEAR,
      [GL_SAMPLER.TEXTURE_WRAP_S]: GL_SAMPLER.REPEAT,
      [GL_SAMPLER.TEXTURE_WRAP_]: GL_SAMPLER.REPEAT
    };

    function getBytesFromComponentType(componentType) {
      return BYTES[componentType];
    }

    function getSizeFromAccessorType(type) {
      return COMPONENTS[type];
    }

    class GLTFPostProcessor {
      postProcess(gltf, options = {}) {
        const {
          json,
          buffers = [],
          images = [],
          baseUri = ''
        } = gltf;
        assert$1(json);
        this.baseUri = baseUri;
        this.json = json;
        this.buffers = buffers;
        this.images = images;

        this._resolveTree(this.json, options);

        return this.json;
      }

      _resolveTree(json, options = {}) {
        if (json.bufferViews) {
          json.bufferViews = json.bufferViews.map((bufView, i) => this._resolveBufferView(bufView, i));
        }

        if (json.images) {
          json.images = json.images.map((image, i) => this._resolveImage(image, i));
        }

        if (json.samplers) {
          json.samplers = json.samplers.map((sampler, i) => this._resolveSampler(sampler, i));
        }

        if (json.textures) {
          json.textures = json.textures.map((texture, i) => this._resolveTexture(texture, i));
        }

        if (json.accessors) {
          json.accessors = json.accessors.map((accessor, i) => this._resolveAccessor(accessor, i));
        }

        if (json.materials) {
          json.materials = json.materials.map((material, i) => this._resolveMaterial(material, i));
        }

        if (json.meshes) {
          json.meshes = json.meshes.map((mesh, i) => this._resolveMesh(mesh, i));
        }

        if (json.nodes) {
          json.nodes = json.nodes.map((node, i) => this._resolveNode(node, i));
        }

        if (json.skins) {
          json.skins = json.skins.map((skin, i) => this._resolveSkin(skin, i));
        }

        if (json.scenes) {
          json.scenes = json.scenes.map((scene, i) => this._resolveScene(scene, i));
        }

        if (json.scene !== undefined) {
          json.scene = json.scenes[this.json.scene];
        }
      }

      getScene(index) {
        return this._get('scenes', index);
      }

      getNode(index) {
        return this._get('nodes', index);
      }

      getSkin(index) {
        return this._get('skins', index);
      }

      getMesh(index) {
        return this._get('meshes', index);
      }

      getMaterial(index) {
        return this._get('materials', index);
      }

      getAccessor(index) {
        return this._get('accessors', index);
      }

      getCamera(index) {
        return null;
      }

      getTexture(index) {
        return this._get('textures', index);
      }

      getSampler(index) {
        return this._get('samplers', index);
      }

      getImage(index) {
        return this._get('images', index);
      }

      getBufferView(index) {
        return this._get('bufferViews', index);
      }

      getBuffer(index) {
        return this._get('buffers', index);
      }

      _get(array, index) {
        if (typeof index === 'object') {
          return index;
        }

        const object = this.json[array] && this.json[array][index];

        if (!object) {
          console.warn(`glTF file error: Could not find ${array}[${index}]`);
        }

        return object;
      }

      _resolveScene(scene, index) {
        scene.id = scene.id || `scene-${index}`;
        scene.nodes = (scene.nodes || []).map(node => this.getNode(node));
        return scene;
      }

      _resolveNode(node, index) {
        node.id = node.id || `node-${index}`;

        if (node.children) {
          node.children = node.children.map(child => this.getNode(child));
        }

        if (node.mesh !== undefined) {
          node.mesh = this.getMesh(node.mesh);
        } else if (node.meshes !== undefined && node.meshes.length) {
          node.mesh = node.meshes.reduce((accum, meshIndex) => {
            const mesh = this.getMesh(meshIndex);
            accum.id = mesh.id;
            accum.primitives = accum.primitives.concat(mesh.primitives);
            return accum;
          }, {
            primitives: []
          });
        }

        if (node.camera !== undefined) {
          node.camera = this.getCamera(node.camera);
        }

        if (node.skin !== undefined) {
          node.skin = this.getSkin(node.skin);
        }

        return node;
      }

      _resolveSkin(skin, index) {
        skin.id = skin.id || `skin-${index}`;
        skin.inverseBindMatrices = this.getAccessor(skin.inverseBindMatrices);
        return skin;
      }

      _resolveMesh(mesh, index) {
        mesh.id = mesh.id || `mesh-${index}`;

        if (mesh.primitives) {
          mesh.primitives = mesh.primitives.map(primitive => {
            primitive = { ...primitive
            };
            const attributes = primitive.attributes;
            primitive.attributes = {};

            for (const attribute in attributes) {
              primitive.attributes[attribute] = this.getAccessor(attributes[attribute]);
            }

            if (primitive.indices !== undefined) {
              primitive.indices = this.getAccessor(primitive.indices);
            }

            if (primitive.material !== undefined) {
              primitive.material = this.getMaterial(primitive.material);
            }

            return primitive;
          });
        }

        return mesh;
      }

      _resolveMaterial(material, index) {
        material.id = material.id || `material-${index}`;

        if (material.normalTexture) {
          material.normalTexture = { ...material.normalTexture
          };
          material.normalTexture.texture = this.getTexture(material.normalTexture.index);
        }

        if (material.occlusionTexture) {
          material.occlustionTexture = { ...material.occlustionTexture
          };
          material.occlusionTexture.texture = this.getTexture(material.occlusionTexture.index);
        }

        if (material.emissiveTexture) {
          material.emmisiveTexture = { ...material.emmisiveTexture
          };
          material.emissiveTexture.texture = this.getTexture(material.emissiveTexture.index);
        }

        if (!material.emissiveFactor) {
          material.emissiveFactor = material.emmisiveTexture ? [1, 1, 1] : [0, 0, 0];
        }

        if (material.pbrMetallicRoughness) {
          material.pbrMetallicRoughness = { ...material.pbrMetallicRoughness
          };
          const mr = material.pbrMetallicRoughness;

          if (mr.baseColorTexture) {
            mr.baseColorTexture = { ...mr.baseColorTexture
            };
            mr.baseColorTexture.texture = this.getTexture(mr.baseColorTexture.index);
          }

          if (mr.metallicRoughnessTexture) {
            mr.metallicRoughnessTexture = { ...mr.metallicRoughnessTexture
            };
            mr.metallicRoughnessTexture.texture = this.getTexture(mr.metallicRoughnessTexture.index);
          }
        }

        return material;
      }

      _resolveAccessor(accessor, index) {
        accessor.id = accessor.id || `accessor-${index}`;

        if (accessor.bufferView !== undefined) {
          accessor.bufferView = this.getBufferView(accessor.bufferView);
        }

        accessor.bytesPerComponent = getBytesFromComponentType(accessor.componentType);
        accessor.components = getSizeFromAccessorType(accessor.type);
        accessor.bytesPerElement = accessor.bytesPerComponent * accessor.components;

        if (accessor.bufferView) {
          const buffer = accessor.bufferView.buffer;
          const {
            ArrayType,
            byteLength
          } = getAccessorArrayTypeAndLength(accessor, accessor.bufferView);
          const byteOffset = (accessor.bufferView.byteOffset || 0) + (accessor.byteOffset || 0) + buffer.byteOffset;
          const cutBufffer = buffer.arrayBuffer.slice(byteOffset, byteOffset + byteLength);
          accessor.value = new ArrayType(cutBufffer);
        }

        return accessor;
      }

      _resolveTexture(texture, index) {
        texture.id = texture.id || `texture-${index}`;
        texture.sampler = 'sampler' in texture ? this.getSampler(texture.sampler) : DEFAULT_SAMPLER;
        texture.source = this.getImage(texture.source);
        return texture;
      }

      _resolveSampler(sampler, index) {
        sampler.id = sampler.id || `sampler-${index}`;
        sampler.parameters = {};

        for (const key in sampler) {
          const glEnum = this._enumSamplerParameter(key);

          if (glEnum !== undefined) {
            sampler.parameters[glEnum] = sampler[key];
          }
        }

        return sampler;
      }

      _enumSamplerParameter(key) {
        return SAMPLER_PARAMETER_GLTF_TO_GL[key];
      }

      _resolveImage(image, index) {
        image.id = image.id || `image-${index}`;

        if (image.bufferView !== undefined) {
          image.bufferView = this.getBufferView(image.bufferView);
        }

        const preloadedImage = this.images[index];

        if (preloadedImage) {
          image.image = preloadedImage;
        }

        return image;
      }

      _resolveBufferView(bufferView, index) {
        bufferView.id = bufferView.id || `bufferView-${index}`;
        const bufferIndex = bufferView.buffer;
        bufferView.buffer = this.buffers[bufferIndex];
        const arrayBuffer = this.buffers[bufferIndex].arrayBuffer;
        let byteOffset = this.buffers[bufferIndex].byteOffset || 0;

        if ('byteOffset' in bufferView) {
          byteOffset += bufferView.byteOffset;
        }

        bufferView.data = new Uint8Array(arrayBuffer, byteOffset, bufferView.byteLength);
        return bufferView;
      }

      _resolveCamera(camera, index) {
        camera.id = camera.id || `camera-${index}`;

        if (camera.perspective) ;

        if (camera.orthographic) ;

        return camera;
      }

    }

    function postProcessGLTF(gltf, options) {
      return new GLTFPostProcessor().postProcess(gltf, options);
    }

    const MAGIC_glTF = 0x676c5446;
    const GLB_FILE_HEADER_SIZE = 12;
    const GLB_CHUNK_HEADER_SIZE = 8;
    const GLB_CHUNK_TYPE_JSON = 0x4e4f534a;
    const GLB_CHUNK_TYPE_BIN = 0x004e4942;
    const GLB_CHUNK_TYPE_JSON_XVIZ_DEPRECATED = 0;
    const GLB_CHUNK_TYPE_BIX_XVIZ_DEPRECATED = 1;
    const GLB_V1_CONTENT_FORMAT_JSON = 0x0;
    const LE = true;

    function getMagicString(dataView, byteOffset = 0) {
      return `\
${String.fromCharCode(dataView.getUint8(byteOffset + 0))}\
${String.fromCharCode(dataView.getUint8(byteOffset + 1))}\
${String.fromCharCode(dataView.getUint8(byteOffset + 2))}\
${String.fromCharCode(dataView.getUint8(byteOffset + 3))}`;
    }

    function isGLB(arrayBuffer, byteOffset = 0, options = {}) {
      const dataView = new DataView(arrayBuffer);
      const {
        magic = MAGIC_glTF
      } = options;
      const magic1 = dataView.getUint32(byteOffset, false);
      return magic1 === magic || magic1 === MAGIC_glTF;
    }
    function parseGLBSync(glb, arrayBuffer, byteOffset = 0, options = {}) {
      const dataView = new DataView(arrayBuffer);
      const type = getMagicString(dataView, byteOffset + 0);
      const version = dataView.getUint32(byteOffset + 4, LE);
      const byteLength = dataView.getUint32(byteOffset + 8, LE);
      Object.assign(glb, {
        header: {
          byteOffset,
          byteLength,
          hasBinChunk: false
        },
        type,
        version,
        json: {},
        binChunks: []
      });
      byteOffset += GLB_FILE_HEADER_SIZE;

      switch (glb.version) {
        case 1:
          return parseGLBV1(glb, dataView, byteOffset);

        case 2:
          return parseGLBV2(glb, dataView, byteOffset, options = {});

        default:
          throw new Error(`Invalid GLB version ${glb.version}. Only supports v1 and v2.`);
      }
    }

    function parseGLBV1(glb, dataView, byteOffset) {
      assert$7(glb.header.byteLength > GLB_FILE_HEADER_SIZE + GLB_CHUNK_HEADER_SIZE);
      const contentLength = dataView.getUint32(byteOffset + 0, LE);
      const contentFormat = dataView.getUint32(byteOffset + 4, LE);
      byteOffset += GLB_CHUNK_HEADER_SIZE;
      assert$7(contentFormat === GLB_V1_CONTENT_FORMAT_JSON);
      parseJSONChunk(glb, dataView, byteOffset, contentLength);
      byteOffset += contentLength;
      byteOffset += parseBINChunk(glb, dataView, byteOffset, glb.header.byteLength);
      return byteOffset;
    }

    function parseGLBV2(glb, dataView, byteOffset, options) {
      assert$7(glb.header.byteLength > GLB_FILE_HEADER_SIZE + GLB_CHUNK_HEADER_SIZE);
      parseGLBChunksSync(glb, dataView, byteOffset, options);
      return byteOffset + glb.header.byteLength;
    }

    function parseGLBChunksSync(glb, dataView, byteOffset, options) {
      while (byteOffset + 8 <= glb.header.byteLength) {
        const chunkLength = dataView.getUint32(byteOffset + 0, LE);
        const chunkFormat = dataView.getUint32(byteOffset + 4, LE);
        byteOffset += GLB_CHUNK_HEADER_SIZE;

        switch (chunkFormat) {
          case GLB_CHUNK_TYPE_JSON:
            parseJSONChunk(glb, dataView, byteOffset, chunkLength);
            break;

          case GLB_CHUNK_TYPE_BIN:
            parseBINChunk(glb, dataView, byteOffset, chunkLength);
            break;

          case GLB_CHUNK_TYPE_JSON_XVIZ_DEPRECATED:
            if (!options.strict) {
              parseJSONChunk(glb, dataView, byteOffset, chunkLength);
            }

            break;

          case GLB_CHUNK_TYPE_BIX_XVIZ_DEPRECATED:
            if (!options.strict) {
              parseBINChunk(glb, dataView, byteOffset, chunkLength);
            }

            break;
        }

        byteOffset += padToNBytes(chunkLength, 4);
      }

      return byteOffset;
    }

    function parseJSONChunk(glb, dataView, byteOffset, chunkLength) {
      const jsonChunk = new Uint8Array(dataView.buffer, byteOffset, chunkLength);
      const textDecoder = new TextDecoder('utf8');
      const jsonText = textDecoder.decode(jsonChunk);
      glb.json = JSON.parse(jsonText);
      return padToNBytes(chunkLength, 4);
    }

    function parseBINChunk(glb, dataView, byteOffset, chunkLength) {
      glb.header.hasBinChunk = true;
      glb.binChunks.push({
        byteOffset,
        byteLength: chunkLength,
        arrayBuffer: dataView.buffer
      });
      return padToNBytes(chunkLength, 4);
    }

    async function parseGLTF(gltf, arrayBufferOrString, byteOffset = 0, options, context) {
      var _options$gltf, _options$gltf2, _options$gltf3, _options$gltf4;

      parseGLTFContainerSync(gltf, arrayBufferOrString, byteOffset, options);
      normalizeGLTFV1(gltf, {
        normalize: options === null || options === void 0 ? void 0 : (_options$gltf = options.gltf) === null || _options$gltf === void 0 ? void 0 : _options$gltf.normalize
      });
      const promises = [];

      if (options !== null && options !== void 0 && (_options$gltf2 = options.gltf) !== null && _options$gltf2 !== void 0 && _options$gltf2.loadBuffers && gltf.json.buffers) {
        await loadBuffers(gltf, options, context);
      }

      if (options !== null && options !== void 0 && (_options$gltf3 = options.gltf) !== null && _options$gltf3 !== void 0 && _options$gltf3.loadImages) {
        const promise = loadImages(gltf, options, context);
        promises.push(promise);
      }

      const promise = decodeExtensions(gltf, options, context);
      promises.push(promise);
      await Promise.all(promises);
      return options !== null && options !== void 0 && (_options$gltf4 = options.gltf) !== null && _options$gltf4 !== void 0 && _options$gltf4.postProcess ? postProcessGLTF(gltf, options) : gltf;
    }

    function parseGLTFContainerSync(gltf, data, byteOffset, options) {
      if (options.uri) {
        gltf.baseUri = options.uri;
      }

      if (data instanceof ArrayBuffer && !isGLB(data, byteOffset, options)) {
        const textDecoder = new TextDecoder();
        data = textDecoder.decode(data);
      }

      if (typeof data === 'string') {
        gltf.json = parseJSON(data);
      } else if (data instanceof ArrayBuffer) {
        const glb = {};
        byteOffset = parseGLBSync(glb, data, byteOffset, options.glb);
        assert$1(glb.type === 'glTF', `Invalid GLB magic string ${glb.type}`);
        gltf._glb = glb;
        gltf.json = glb.json;
      } else {
        assert$1(false, 'GLTF: must be ArrayBuffer or string');
      }

      const buffers = gltf.json.buffers || [];
      gltf.buffers = new Array(buffers.length).fill(null);

      if (gltf._glb && gltf._glb.header.hasBinChunk) {
        const {
          binChunks
        } = gltf._glb;
        gltf.buffers[0] = {
          arrayBuffer: binChunks[0].arrayBuffer,
          byteOffset: binChunks[0].byteOffset,
          byteLength: binChunks[0].byteLength
        };
      }

      const images = gltf.json.images || [];
      gltf.images = new Array(images.length).fill({});
    }

    async function loadBuffers(gltf, options, context) {
      for (let i = 0; i < gltf.json.buffers.length; ++i) {
        const buffer = gltf.json.buffers[i];

        if (buffer.uri) {
          var _context$fetch, _response$arrayBuffer;

          const {
            fetch
          } = context;
          assert$1(fetch);
          const uri = resolveUrl(buffer.uri, options);
          const response = await (context === null || context === void 0 ? void 0 : (_context$fetch = context.fetch) === null || _context$fetch === void 0 ? void 0 : _context$fetch.call(context, uri));
          const arrayBuffer = await (response === null || response === void 0 ? void 0 : (_response$arrayBuffer = response.arrayBuffer) === null || _response$arrayBuffer === void 0 ? void 0 : _response$arrayBuffer.call(response));
          gltf.buffers[i] = {
            arrayBuffer,
            byteOffset: 0,
            byteLength: arrayBuffer.byteLength
          };
          delete buffer.uri;
        }
      }
    }

    async function loadImages(gltf, options, context) {
      const images = gltf.json.images || [];
      const promises = [];

      for (let i = 0; i < images.length; ++i) {
        promises.push(loadImage(gltf, images[i], i, options, context));
      }

      return await Promise.all(promises);
    }

    async function loadImage(gltf, image, index, options, context) {
      const {
        fetch,
        parse
      } = context;
      let arrayBuffer;

      if (image.uri) {
        const uri = resolveUrl(image.uri, options);
        const response = await fetch(uri);
        arrayBuffer = await response.arrayBuffer();
      }

      if (Number.isFinite(image.bufferView)) {
        const array = getTypedArrayForBufferView(gltf.json, gltf.buffers, image.bufferView);
        arrayBuffer = sliceArrayBuffer(array.buffer, array.byteOffset, array.byteLength);
      }

      assert$1(arrayBuffer, 'glTF image has no data');
      const parsedImage = await parse(arrayBuffer, ImageLoader, {}, context);
      gltf.images[index] = parsedImage;
    }

    const GLTFLoader = {
      name: 'glTF',
      id: 'gltf',
      module: 'gltf',
      version: VERSION$2,
      extensions: ['gltf', 'glb'],
      mimeTypes: ['model/gltf+json', 'model/gltf-binary'],
      text: true,
      binary: true,
      tests: ['glTF'],
      parse,
      options: {
        gltf: {
          normalize: true,
          loadBuffers: true,
          loadImages: true,
          decompressMeshes: true,
          postProcess: true
        },
        log: console
      },
      deprecatedOptions: {
        fetchImages: 'gltf.loadImages',
        createImages: 'gltf.loadImages',
        decompress: 'gltf.decompressMeshes',
        postProcess: 'gltf.postProcess',
        gltf: {
          decompress: 'gltf.decompressMeshes'
        }
      }
    };
    async function parse(arrayBuffer, options = {}, context) {
      options = { ...GLTFLoader.options,
        ...options
      };
      options.gltf = { ...GLTFLoader.options.gltf,
        ...options.gltf
      };
      const {
        byteOffset = 0
      } = options;
      const gltf = {};
      return await parseGLTF(gltf, arrayBuffer, byteOffset, options, context);
    }

    /**
     * Common utilities
     * @module glMatrix
     */
    // Configuration Constants
    var EPSILON$1 = 0.000001;
    var ARRAY_TYPE$1 = typeof Float32Array !== 'undefined' ? Float32Array : Array;
    if (!Math.hypot) Math.hypot = function () {
      var y = 0,
          i = arguments.length;

      while (i--) {
        y += arguments[i] * arguments[i];
      }

      return Math.sqrt(y);
    };

    /**
     * 3x3 Matrix
     * @module mat3
     */

    /**
     * Creates a new identity mat3
     *
     * @returns {mat3} a new 3x3 matrix
     */

    function create$7() {
      var out = new ARRAY_TYPE$1(9);

      if (ARRAY_TYPE$1 != Float32Array) {
        out[1] = 0;
        out[2] = 0;
        out[3] = 0;
        out[5] = 0;
        out[6] = 0;
        out[7] = 0;
      }

      out[0] = 1;
      out[4] = 1;
      out[8] = 1;
      return out;
    }

    /**
     * 4x4 Matrix<br>Format: column-major, when typed out it looks like row-major<br>The matrices are being post multiplied.
     * @module mat4
     */

    /**
     * Creates a new identity mat4
     *
     * @returns {mat4} a new 4x4 matrix
     */

    function create$6() {
      var out = new ARRAY_TYPE$1(16);

      if (ARRAY_TYPE$1 != Float32Array) {
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
     * Multiplies two mat4s
     *
     * @param {mat4} out the receiving matrix
     * @param {ReadonlyMat4} a the first operand
     * @param {ReadonlyMat4} b the second operand
     * @returns {mat4} out
     */

    function multiply$1(out, a, b) {
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

    function translate$1(out, a, v) {
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

    function scale$2(out, a, v) {
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
     * Calculates a 4x4 matrix from the given quaternion
     *
     * @param {mat4} out mat4 receiving operation result
     * @param {ReadonlyQuat} q Quaternion to create matrix from
     *
     * @returns {mat4} out
     */

    function fromQuat(out, q) {
      var x = q[0],
          y = q[1],
          z = q[2],
          w = q[3];
      var x2 = x + x;
      var y2 = y + y;
      var z2 = z + z;
      var xx = x * x2;
      var yx = y * x2;
      var yy = y * y2;
      var zx = z * x2;
      var zy = z * y2;
      var zz = z * z2;
      var wx = w * x2;
      var wy = w * y2;
      var wz = w * z2;
      out[0] = 1 - yy - zz;
      out[1] = yx + wz;
      out[2] = zx - wy;
      out[3] = 0;
      out[4] = yx - wz;
      out[5] = 1 - xx - zz;
      out[6] = zy + wx;
      out[7] = 0;
      out[8] = zx + wy;
      out[9] = zy - wx;
      out[10] = 1 - xx - yy;
      out[11] = 0;
      out[12] = 0;
      out[13] = 0;
      out[14] = 0;
      out[15] = 1;
      return out;
    }
    /**
     * Alias for {@link mat4.multiply}
     * @function
     */

    var mul$1 = multiply$1;

    /**
     * 3 Dimensional Vector
     * @module vec3
     */

    /**
     * Creates a new, empty vec3
     *
     * @returns {vec3} a new 3D vector
     */

    function create$5() {
      var out = new ARRAY_TYPE$1(3);

      if (ARRAY_TYPE$1 != Float32Array) {
        out[0] = 0;
        out[1] = 0;
        out[2] = 0;
      }

      return out;
    }
    /**
     * Calculates the length of a vec3
     *
     * @param {ReadonlyVec3} a vector to calculate length of
     * @returns {Number} length of a
     */

    function length(a) {
      var x = a[0];
      var y = a[1];
      var z = a[2];
      return Math.hypot(x, y, z);
    }
    /**
     * Creates a new vec3 initialized with the given values
     *
     * @param {Number} x X component
     * @param {Number} y Y component
     * @param {Number} z Z component
     * @returns {vec3} a new 3D vector
     */

    function fromValues$3(x, y, z) {
      var out = new ARRAY_TYPE$1(3);
      out[0] = x;
      out[1] = y;
      out[2] = z;
      return out;
    }
    /**
     * Normalize a vec3
     *
     * @param {vec3} out the receiving vector
     * @param {ReadonlyVec3} a vector to normalize
     * @returns {vec3} out
     */

    function normalize$3(out, a) {
      var x = a[0];
      var y = a[1];
      var z = a[2];
      var len = x * x + y * y + z * z;

      if (len > 0) {
        //TODO: evaluate use of glm_invsqrt here?
        len = 1 / Math.sqrt(len);
      }

      out[0] = a[0] * len;
      out[1] = a[1] * len;
      out[2] = a[2] * len;
      return out;
    }
    /**
     * Calculates the dot product of two vec3's
     *
     * @param {ReadonlyVec3} a the first operand
     * @param {ReadonlyVec3} b the second operand
     * @returns {Number} dot product of a and b
     */

    function dot(a, b) {
      return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    }
    /**
     * Computes the cross product of two vec3's
     *
     * @param {vec3} out the receiving vector
     * @param {ReadonlyVec3} a the first operand
     * @param {ReadonlyVec3} b the second operand
     * @returns {vec3} out
     */

    function cross$1(out, a, b) {
      var ax = a[0],
          ay = a[1],
          az = a[2];
      var bx = b[0],
          by = b[1],
          bz = b[2];
      out[0] = ay * bz - az * by;
      out[1] = az * bx - ax * bz;
      out[2] = ax * by - ay * bx;
      return out;
    }
    /**
     * Alias for {@link vec3.length}
     * @function
     */

    var len = length;
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
      var vec = create$5();
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
     * 4 Dimensional Vector
     * @module vec4
     */

    /**
     * Creates a new, empty vec4
     *
     * @returns {vec4} a new 4D vector
     */

    function create$4() {
      var out = new ARRAY_TYPE$1(4);

      if (ARRAY_TYPE$1 != Float32Array) {
        out[0] = 0;
        out[1] = 0;
        out[2] = 0;
        out[3] = 0;
      }

      return out;
    }
    /**
     * Creates a new vec4 initialized with the given values
     *
     * @param {Number} x X component
     * @param {Number} y Y component
     * @param {Number} z Z component
     * @param {Number} w W component
     * @returns {vec4} a new 4D vector
     */

    function fromValues$2(x, y, z, w) {
      var out = new ARRAY_TYPE$1(4);
      out[0] = x;
      out[1] = y;
      out[2] = z;
      out[3] = w;
      return out;
    }
    /**
     * Normalize a vec4
     *
     * @param {vec4} out the receiving vector
     * @param {ReadonlyVec4} a vector to normalize
     * @returns {vec4} out
     */

    function normalize$2(out, a) {
      var x = a[0];
      var y = a[1];
      var z = a[2];
      var w = a[3];
      var len = x * x + y * y + z * z + w * w;

      if (len > 0) {
        len = 1 / Math.sqrt(len);
      }

      out[0] = x * len;
      out[1] = y * len;
      out[2] = z * len;
      out[3] = w * len;
      return out;
    }
    /**
     * Perform some operation over an array of vec4s.
     *
     * @param {Array} a the array of vectors to iterate over
     * @param {Number} stride Number of elements between the start of each vec4. If 0 assumes tightly packed
     * @param {Number} offset Number of elements to skip at the beginning of the array
     * @param {Number} count Number of vec4s to iterate over. If 0 iterates over entire array
     * @param {Function} fn Function to call for each vector in the array
     * @param {Object} [arg] additional argument to pass to fn
     * @returns {Array} a
     * @function
     */

    (function () {
      var vec = create$4();
      return function (a, stride, offset, count, fn, arg) {
        var i, l;

        if (!stride) {
          stride = 4;
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
          vec[3] = a[i + 3];
          fn(vec, vec, arg);
          a[i] = vec[0];
          a[i + 1] = vec[1];
          a[i + 2] = vec[2];
          a[i + 3] = vec[3];
        }

        return a;
      };
    })();

    /**
     * Quaternion
     * @module quat
     */

    /**
     * Creates a new identity quat
     *
     * @returns {quat} a new quaternion
     */

    function create$3() {
      var out = new ARRAY_TYPE$1(4);

      if (ARRAY_TYPE$1 != Float32Array) {
        out[0] = 0;
        out[1] = 0;
        out[2] = 0;
      }

      out[3] = 1;
      return out;
    }
    /**
     * Sets a quat from the given angle and rotation axis,
     * then returns it.
     *
     * @param {quat} out the receiving quaternion
     * @param {ReadonlyVec3} axis the axis around which to rotate
     * @param {Number} rad the angle in radians
     * @returns {quat} out
     **/

    function setAxisAngle(out, axis, rad) {
      rad = rad * 0.5;
      var s = Math.sin(rad);
      out[0] = s * axis[0];
      out[1] = s * axis[1];
      out[2] = s * axis[2];
      out[3] = Math.cos(rad);
      return out;
    }
    /**
     * Performs a spherical linear interpolation between two quat
     *
     * @param {quat} out the receiving quaternion
     * @param {ReadonlyQuat} a the first operand
     * @param {ReadonlyQuat} b the second operand
     * @param {Number} t interpolation amount, in the range [0-1], between the two inputs
     * @returns {quat} out
     */

    function slerp(out, a, b, t) {
      // benchmarks:
      //    http://jsperf.com/quaternion-slerp-implementations
      var ax = a[0],
          ay = a[1],
          az = a[2],
          aw = a[3];
      var bx = b[0],
          by = b[1],
          bz = b[2],
          bw = b[3];
      var omega, cosom, sinom, scale0, scale1; // calc cosine

      cosom = ax * bx + ay * by + az * bz + aw * bw; // adjust signs (if necessary)

      if (cosom < 0.0) {
        cosom = -cosom;
        bx = -bx;
        by = -by;
        bz = -bz;
        bw = -bw;
      } // calculate coefficients


      if (1.0 - cosom > EPSILON$1) {
        // standard case (slerp)
        omega = Math.acos(cosom);
        sinom = Math.sin(omega);
        scale0 = Math.sin((1.0 - t) * omega) / sinom;
        scale1 = Math.sin(t * omega) / sinom;
      } else {
        // "from" and "to" quaternions are very close
        //  ... so we can do a linear interpolation
        scale0 = 1.0 - t;
        scale1 = t;
      } // calculate final values


      out[0] = scale0 * ax + scale1 * bx;
      out[1] = scale0 * ay + scale1 * by;
      out[2] = scale0 * az + scale1 * bz;
      out[3] = scale0 * aw + scale1 * bw;
      return out;
    }
    /**
     * Creates a quaternion from the given 3x3 rotation matrix.
     *
     * NOTE: The resultant quaternion is not normalized, so you should be sure
     * to renormalize the quaternion yourself where necessary.
     *
     * @param {quat} out the receiving quaternion
     * @param {ReadonlyMat3} m rotation matrix
     * @returns {quat} out
     * @function
     */

    function fromMat3(out, m) {
      // Algorithm in Ken Shoemake's article in 1987 SIGGRAPH course notes
      // article "Quaternion Calculus and Fast Animation".
      var fTrace = m[0] + m[4] + m[8];
      var fRoot;

      if (fTrace > 0.0) {
        // |w| > 1/2, may as well choose w > 1/2
        fRoot = Math.sqrt(fTrace + 1.0); // 2w

        out[3] = 0.5 * fRoot;
        fRoot = 0.5 / fRoot; // 1/(4w)

        out[0] = (m[5] - m[7]) * fRoot;
        out[1] = (m[6] - m[2]) * fRoot;
        out[2] = (m[1] - m[3]) * fRoot;
      } else {
        // |w| <= 1/2
        var i = 0;
        if (m[4] > m[0]) i = 1;
        if (m[8] > m[i * 3 + i]) i = 2;
        var j = (i + 1) % 3;
        var k = (i + 2) % 3;
        fRoot = Math.sqrt(m[i * 3 + i] - m[j * 3 + j] - m[k * 3 + k] + 1.0);
        out[i] = 0.5 * fRoot;
        fRoot = 0.5 / fRoot;
        out[3] = (m[j * 3 + k] - m[k * 3 + j]) * fRoot;
        out[j] = (m[j * 3 + i] + m[i * 3 + j]) * fRoot;
        out[k] = (m[k * 3 + i] + m[i * 3 + k]) * fRoot;
      }

      return out;
    }
    /**
     * Creates a new quat initialized with the given values
     *
     * @param {Number} x X component
     * @param {Number} y Y component
     * @param {Number} z Z component
     * @param {Number} w W component
     * @returns {quat} a new quaternion
     * @function
     */

    var fromValues$1 = fromValues$2;
    /**
     * Normalize a quat
     *
     * @param {quat} out the receiving quaternion
     * @param {ReadonlyQuat} a quaternion to normalize
     * @returns {quat} out
     * @function
     */

    var normalize$1 = normalize$2;
    /**
     * Sets a quaternion to represent the shortest rotation from one
     * vector to another.
     *
     * Both vectors are assumed to be unit length.
     *
     * @param {quat} out the receiving quaternion.
     * @param {ReadonlyVec3} a the initial vector
     * @param {ReadonlyVec3} b the destination vector
     * @returns {quat} out
     */

    (function () {
      var tmpvec3 = create$5();
      var xUnitVec3 = fromValues$3(1, 0, 0);
      var yUnitVec3 = fromValues$3(0, 1, 0);
      return function (out, a, b) {
        var dot$1 = dot(a, b);

        if (dot$1 < -0.999999) {
          cross$1(tmpvec3, xUnitVec3, a);
          if (len(tmpvec3) < 0.000001) cross$1(tmpvec3, yUnitVec3, a);
          normalize$3(tmpvec3, tmpvec3);
          setAxisAngle(out, tmpvec3, Math.PI);
          return out;
        } else if (dot$1 > 0.999999) {
          out[0] = 0;
          out[1] = 0;
          out[2] = 0;
          out[3] = 1;
          return out;
        } else {
          cross$1(tmpvec3, a, b);
          out[0] = tmpvec3[0];
          out[1] = tmpvec3[1];
          out[2] = tmpvec3[2];
          out[3] = 1 + dot$1;
          return normalize$1(out, out);
        }
      };
    })();
    /**
     * Performs a spherical linear interpolation with two control points
     *
     * @param {quat} out the receiving quaternion
     * @param {ReadonlyQuat} a the first operand
     * @param {ReadonlyQuat} b the second operand
     * @param {ReadonlyQuat} c the third operand
     * @param {ReadonlyQuat} d the fourth operand
     * @param {Number} t interpolation amount, in the range [0-1], between the two inputs
     * @returns {quat} out
     */

    (function () {
      var temp1 = create$3();
      var temp2 = create$3();
      return function (out, a, b, c, d, t) {
        slerp(temp1, a, d, t);
        slerp(temp2, b, c, t);
        slerp(out, temp1, temp2, 2 * t * (1 - t));
        return out;
      };
    })();
    /**
     * Sets the specified quaternion with values corresponding to the given
     * axes. Each axis is a vec3 and is expected to be unit length and
     * perpendicular to all other specified axes.
     *
     * @param {ReadonlyVec3} view  the vector representing the viewing direction
     * @param {ReadonlyVec3} right the vector representing the local "right" direction
     * @param {ReadonlyVec3} up    the vector representing the local "up" direction
     * @returns {quat} out
     */

    (function () {
      var matr = create$7();
      return function (out, view, right, up) {
        matr[0] = right[0];
        matr[3] = right[1];
        matr[6] = right[2];
        matr[1] = up[0];
        matr[4] = up[1];
        matr[7] = up[2];
        matr[2] = -view[0];
        matr[5] = -view[1];
        matr[8] = -view[2];
        return normalize$1(out, fromMat3(out, matr));
      };
    })();

    /**
     * dat-gui JavaScript Controller Library
     * http://code.google.com/p/dat-gui
     *
     * Copyright 2011 Data Arts Team, Google Creative Lab
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     * http://www.apache.org/licenses/LICENSE-2.0
     */

    function ___$insertStyle(css) {
      if (!css) {
        return;
      }
      if (typeof window === 'undefined') {
        return;
      }

      var style = document.createElement('style');

      style.setAttribute('type', 'text/css');
      style.innerHTML = css;
      document.head.appendChild(style);

      return css;
    }

    function colorToString (color, forceCSSHex) {
      var colorFormat = color.__state.conversionName.toString();
      var r = Math.round(color.r);
      var g = Math.round(color.g);
      var b = Math.round(color.b);
      var a = color.a;
      var h = Math.round(color.h);
      var s = color.s.toFixed(1);
      var v = color.v.toFixed(1);
      if (forceCSSHex || colorFormat === 'THREE_CHAR_HEX' || colorFormat === 'SIX_CHAR_HEX') {
        var str = color.hex.toString(16);
        while (str.length < 6) {
          str = '0' + str;
        }
        return '#' + str;
      } else if (colorFormat === 'CSS_RGB') {
        return 'rgb(' + r + ',' + g + ',' + b + ')';
      } else if (colorFormat === 'CSS_RGBA') {
        return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
      } else if (colorFormat === 'HEX') {
        return '0x' + color.hex.toString(16);
      } else if (colorFormat === 'RGB_ARRAY') {
        return '[' + r + ',' + g + ',' + b + ']';
      } else if (colorFormat === 'RGBA_ARRAY') {
        return '[' + r + ',' + g + ',' + b + ',' + a + ']';
      } else if (colorFormat === 'RGB_OBJ') {
        return '{r:' + r + ',g:' + g + ',b:' + b + '}';
      } else if (colorFormat === 'RGBA_OBJ') {
        return '{r:' + r + ',g:' + g + ',b:' + b + ',a:' + a + '}';
      } else if (colorFormat === 'HSV_OBJ') {
        return '{h:' + h + ',s:' + s + ',v:' + v + '}';
      } else if (colorFormat === 'HSVA_OBJ') {
        return '{h:' + h + ',s:' + s + ',v:' + v + ',a:' + a + '}';
      }
      return 'unknown format';
    }

    var ARR_EACH = Array.prototype.forEach;
    var ARR_SLICE = Array.prototype.slice;
    var Common = {
      BREAK: {},
      extend: function extend(target) {
        this.each(ARR_SLICE.call(arguments, 1), function (obj) {
          var keys = this.isObject(obj) ? Object.keys(obj) : [];
          keys.forEach(function (key) {
            if (!this.isUndefined(obj[key])) {
              target[key] = obj[key];
            }
          }.bind(this));
        }, this);
        return target;
      },
      defaults: function defaults(target) {
        this.each(ARR_SLICE.call(arguments, 1), function (obj) {
          var keys = this.isObject(obj) ? Object.keys(obj) : [];
          keys.forEach(function (key) {
            if (this.isUndefined(target[key])) {
              target[key] = obj[key];
            }
          }.bind(this));
        }, this);
        return target;
      },
      compose: function compose() {
        var toCall = ARR_SLICE.call(arguments);
        return function () {
          var args = ARR_SLICE.call(arguments);
          for (var i = toCall.length - 1; i >= 0; i--) {
            args = [toCall[i].apply(this, args)];
          }
          return args[0];
        };
      },
      each: function each(obj, itr, scope) {
        if (!obj) {
          return;
        }
        if (ARR_EACH && obj.forEach && obj.forEach === ARR_EACH) {
          obj.forEach(itr, scope);
        } else if (obj.length === obj.length + 0) {
          var key = void 0;
          var l = void 0;
          for (key = 0, l = obj.length; key < l; key++) {
            if (key in obj && itr.call(scope, obj[key], key) === this.BREAK) {
              return;
            }
          }
        } else {
          for (var _key in obj) {
            if (itr.call(scope, obj[_key], _key) === this.BREAK) {
              return;
            }
          }
        }
      },
      defer: function defer(fnc) {
        setTimeout(fnc, 0);
      },
      debounce: function debounce(func, threshold, callImmediately) {
        var timeout = void 0;
        return function () {
          var obj = this;
          var args = arguments;
          function delayed() {
            timeout = null;
            if (!callImmediately) func.apply(obj, args);
          }
          var callNow = callImmediately || !timeout;
          clearTimeout(timeout);
          timeout = setTimeout(delayed, threshold);
          if (callNow) {
            func.apply(obj, args);
          }
        };
      },
      toArray: function toArray(obj) {
        if (obj.toArray) return obj.toArray();
        return ARR_SLICE.call(obj);
      },
      isUndefined: function isUndefined(obj) {
        return obj === undefined;
      },
      isNull: function isNull(obj) {
        return obj === null;
      },
      isNaN: function (_isNaN) {
        function isNaN(_x) {
          return _isNaN.apply(this, arguments);
        }
        isNaN.toString = function () {
          return _isNaN.toString();
        };
        return isNaN;
      }(function (obj) {
        return isNaN(obj);
      }),
      isArray: Array.isArray || function (obj) {
        return obj.constructor === Array;
      },
      isObject: function isObject(obj) {
        return obj === Object(obj);
      },
      isNumber: function isNumber(obj) {
        return obj === obj + 0;
      },
      isString: function isString(obj) {
        return obj === obj + '';
      },
      isBoolean: function isBoolean(obj) {
        return obj === false || obj === true;
      },
      isFunction: function isFunction(obj) {
        return obj instanceof Function;
      }
    };

    var INTERPRETATIONS = [
    {
      litmus: Common.isString,
      conversions: {
        THREE_CHAR_HEX: {
          read: function read(original) {
            var test = original.match(/^#([A-F0-9])([A-F0-9])([A-F0-9])$/i);
            if (test === null) {
              return false;
            }
            return {
              space: 'HEX',
              hex: parseInt('0x' + test[1].toString() + test[1].toString() + test[2].toString() + test[2].toString() + test[3].toString() + test[3].toString(), 0)
            };
          },
          write: colorToString
        },
        SIX_CHAR_HEX: {
          read: function read(original) {
            var test = original.match(/^#([A-F0-9]{6})$/i);
            if (test === null) {
              return false;
            }
            return {
              space: 'HEX',
              hex: parseInt('0x' + test[1].toString(), 0)
            };
          },
          write: colorToString
        },
        CSS_RGB: {
          read: function read(original) {
            var test = original.match(/^rgb\(\s*(.+)\s*,\s*(.+)\s*,\s*(.+)\s*\)/);
            if (test === null) {
              return false;
            }
            return {
              space: 'RGB',
              r: parseFloat(test[1]),
              g: parseFloat(test[2]),
              b: parseFloat(test[3])
            };
          },
          write: colorToString
        },
        CSS_RGBA: {
          read: function read(original) {
            var test = original.match(/^rgba\(\s*(.+)\s*,\s*(.+)\s*,\s*(.+)\s*,\s*(.+)\s*\)/);
            if (test === null) {
              return false;
            }
            return {
              space: 'RGB',
              r: parseFloat(test[1]),
              g: parseFloat(test[2]),
              b: parseFloat(test[3]),
              a: parseFloat(test[4])
            };
          },
          write: colorToString
        }
      }
    },
    {
      litmus: Common.isNumber,
      conversions: {
        HEX: {
          read: function read(original) {
            return {
              space: 'HEX',
              hex: original,
              conversionName: 'HEX'
            };
          },
          write: function write(color) {
            return color.hex;
          }
        }
      }
    },
    {
      litmus: Common.isArray,
      conversions: {
        RGB_ARRAY: {
          read: function read(original) {
            if (original.length !== 3) {
              return false;
            }
            return {
              space: 'RGB',
              r: original[0],
              g: original[1],
              b: original[2]
            };
          },
          write: function write(color) {
            return [color.r, color.g, color.b];
          }
        },
        RGBA_ARRAY: {
          read: function read(original) {
            if (original.length !== 4) return false;
            return {
              space: 'RGB',
              r: original[0],
              g: original[1],
              b: original[2],
              a: original[3]
            };
          },
          write: function write(color) {
            return [color.r, color.g, color.b, color.a];
          }
        }
      }
    },
    {
      litmus: Common.isObject,
      conversions: {
        RGBA_OBJ: {
          read: function read(original) {
            if (Common.isNumber(original.r) && Common.isNumber(original.g) && Common.isNumber(original.b) && Common.isNumber(original.a)) {
              return {
                space: 'RGB',
                r: original.r,
                g: original.g,
                b: original.b,
                a: original.a
              };
            }
            return false;
          },
          write: function write(color) {
            return {
              r: color.r,
              g: color.g,
              b: color.b,
              a: color.a
            };
          }
        },
        RGB_OBJ: {
          read: function read(original) {
            if (Common.isNumber(original.r) && Common.isNumber(original.g) && Common.isNumber(original.b)) {
              return {
                space: 'RGB',
                r: original.r,
                g: original.g,
                b: original.b
              };
            }
            return false;
          },
          write: function write(color) {
            return {
              r: color.r,
              g: color.g,
              b: color.b
            };
          }
        },
        HSVA_OBJ: {
          read: function read(original) {
            if (Common.isNumber(original.h) && Common.isNumber(original.s) && Common.isNumber(original.v) && Common.isNumber(original.a)) {
              return {
                space: 'HSV',
                h: original.h,
                s: original.s,
                v: original.v,
                a: original.a
              };
            }
            return false;
          },
          write: function write(color) {
            return {
              h: color.h,
              s: color.s,
              v: color.v,
              a: color.a
            };
          }
        },
        HSV_OBJ: {
          read: function read(original) {
            if (Common.isNumber(original.h) && Common.isNumber(original.s) && Common.isNumber(original.v)) {
              return {
                space: 'HSV',
                h: original.h,
                s: original.s,
                v: original.v
              };
            }
            return false;
          },
          write: function write(color) {
            return {
              h: color.h,
              s: color.s,
              v: color.v
            };
          }
        }
      }
    }];
    var result = void 0;
    var toReturn = void 0;
    var interpret = function interpret() {
      toReturn = false;
      var original = arguments.length > 1 ? Common.toArray(arguments) : arguments[0];
      Common.each(INTERPRETATIONS, function (family) {
        if (family.litmus(original)) {
          Common.each(family.conversions, function (conversion, conversionName) {
            result = conversion.read(original);
            if (toReturn === false && result !== false) {
              toReturn = result;
              result.conversionName = conversionName;
              result.conversion = conversion;
              return Common.BREAK;
            }
          });
          return Common.BREAK;
        }
      });
      return toReturn;
    };

    var tmpComponent = void 0;
    var ColorMath = {
      hsv_to_rgb: function hsv_to_rgb(h, s, v) {
        var hi = Math.floor(h / 60) % 6;
        var f = h / 60 - Math.floor(h / 60);
        var p = v * (1.0 - s);
        var q = v * (1.0 - f * s);
        var t = v * (1.0 - (1.0 - f) * s);
        var c = [[v, t, p], [q, v, p], [p, v, t], [p, q, v], [t, p, v], [v, p, q]][hi];
        return {
          r: c[0] * 255,
          g: c[1] * 255,
          b: c[2] * 255
        };
      },
      rgb_to_hsv: function rgb_to_hsv(r, g, b) {
        var min = Math.min(r, g, b);
        var max = Math.max(r, g, b);
        var delta = max - min;
        var h = void 0;
        var s = void 0;
        if (max !== 0) {
          s = delta / max;
        } else {
          return {
            h: NaN,
            s: 0,
            v: 0
          };
        }
        if (r === max) {
          h = (g - b) / delta;
        } else if (g === max) {
          h = 2 + (b - r) / delta;
        } else {
          h = 4 + (r - g) / delta;
        }
        h /= 6;
        if (h < 0) {
          h += 1;
        }
        return {
          h: h * 360,
          s: s,
          v: max / 255
        };
      },
      rgb_to_hex: function rgb_to_hex(r, g, b) {
        var hex = this.hex_with_component(0, 2, r);
        hex = this.hex_with_component(hex, 1, g);
        hex = this.hex_with_component(hex, 0, b);
        return hex;
      },
      component_from_hex: function component_from_hex(hex, componentIndex) {
        return hex >> componentIndex * 8 & 0xFF;
      },
      hex_with_component: function hex_with_component(hex, componentIndex, value) {
        return value << (tmpComponent = componentIndex * 8) | hex & ~(0xFF << tmpComponent);
      }
    };

    var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
      return typeof obj;
    } : function (obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };











    var classCallCheck = function (instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    };

    var createClass = function () {
      function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
          var descriptor = props[i];
          descriptor.enumerable = descriptor.enumerable || false;
          descriptor.configurable = true;
          if ("value" in descriptor) descriptor.writable = true;
          Object.defineProperty(target, descriptor.key, descriptor);
        }
      }

      return function (Constructor, protoProps, staticProps) {
        if (protoProps) defineProperties(Constructor.prototype, protoProps);
        if (staticProps) defineProperties(Constructor, staticProps);
        return Constructor;
      };
    }();







    var get = function get(object, property, receiver) {
      if (object === null) object = Function.prototype;
      var desc = Object.getOwnPropertyDescriptor(object, property);

      if (desc === undefined) {
        var parent = Object.getPrototypeOf(object);

        if (parent === null) {
          return undefined;
        } else {
          return get(parent, property, receiver);
        }
      } else if ("value" in desc) {
        return desc.value;
      } else {
        var getter = desc.get;

        if (getter === undefined) {
          return undefined;
        }

        return getter.call(receiver);
      }
    };

    var inherits = function (subClass, superClass) {
      if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
      }

      subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
          value: subClass,
          enumerable: false,
          writable: true,
          configurable: true
        }
      });
      if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
    };











    var possibleConstructorReturn = function (self, call) {
      if (!self) {
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
      }

      return call && (typeof call === "object" || typeof call === "function") ? call : self;
    };

    var Color = function () {
      function Color() {
        classCallCheck(this, Color);
        this.__state = interpret.apply(this, arguments);
        if (this.__state === false) {
          throw new Error('Failed to interpret color arguments');
        }
        this.__state.a = this.__state.a || 1;
      }
      createClass(Color, [{
        key: 'toString',
        value: function toString() {
          return colorToString(this);
        }
      }, {
        key: 'toHexString',
        value: function toHexString() {
          return colorToString(this, true);
        }
      }, {
        key: 'toOriginal',
        value: function toOriginal() {
          return this.__state.conversion.write(this);
        }
      }]);
      return Color;
    }();
    function defineRGBComponent(target, component, componentHexIndex) {
      Object.defineProperty(target, component, {
        get: function get$$1() {
          if (this.__state.space === 'RGB') {
            return this.__state[component];
          }
          Color.recalculateRGB(this, component, componentHexIndex);
          return this.__state[component];
        },
        set: function set$$1(v) {
          if (this.__state.space !== 'RGB') {
            Color.recalculateRGB(this, component, componentHexIndex);
            this.__state.space = 'RGB';
          }
          this.__state[component] = v;
        }
      });
    }
    function defineHSVComponent(target, component) {
      Object.defineProperty(target, component, {
        get: function get$$1() {
          if (this.__state.space === 'HSV') {
            return this.__state[component];
          }
          Color.recalculateHSV(this);
          return this.__state[component];
        },
        set: function set$$1(v) {
          if (this.__state.space !== 'HSV') {
            Color.recalculateHSV(this);
            this.__state.space = 'HSV';
          }
          this.__state[component] = v;
        }
      });
    }
    Color.recalculateRGB = function (color, component, componentHexIndex) {
      if (color.__state.space === 'HEX') {
        color.__state[component] = ColorMath.component_from_hex(color.__state.hex, componentHexIndex);
      } else if (color.__state.space === 'HSV') {
        Common.extend(color.__state, ColorMath.hsv_to_rgb(color.__state.h, color.__state.s, color.__state.v));
      } else {
        throw new Error('Corrupted color state');
      }
    };
    Color.recalculateHSV = function (color) {
      var result = ColorMath.rgb_to_hsv(color.r, color.g, color.b);
      Common.extend(color.__state, {
        s: result.s,
        v: result.v
      });
      if (!Common.isNaN(result.h)) {
        color.__state.h = result.h;
      } else if (Common.isUndefined(color.__state.h)) {
        color.__state.h = 0;
      }
    };
    Color.COMPONENTS = ['r', 'g', 'b', 'h', 's', 'v', 'hex', 'a'];
    defineRGBComponent(Color.prototype, 'r', 2);
    defineRGBComponent(Color.prototype, 'g', 1);
    defineRGBComponent(Color.prototype, 'b', 0);
    defineHSVComponent(Color.prototype, 'h');
    defineHSVComponent(Color.prototype, 's');
    defineHSVComponent(Color.prototype, 'v');
    Object.defineProperty(Color.prototype, 'a', {
      get: function get$$1() {
        return this.__state.a;
      },
      set: function set$$1(v) {
        this.__state.a = v;
      }
    });
    Object.defineProperty(Color.prototype, 'hex', {
      get: function get$$1() {
        if (this.__state.space !== 'HEX') {
          this.__state.hex = ColorMath.rgb_to_hex(this.r, this.g, this.b);
          this.__state.space = 'HEX';
        }
        return this.__state.hex;
      },
      set: function set$$1(v) {
        this.__state.space = 'HEX';
        this.__state.hex = v;
      }
    });

    var Controller = function () {
      function Controller(object, property) {
        classCallCheck(this, Controller);
        this.initialValue = object[property];
        this.domElement = document.createElement('div');
        this.object = object;
        this.property = property;
        this.__onChange = undefined;
        this.__onFinishChange = undefined;
      }
      createClass(Controller, [{
        key: 'onChange',
        value: function onChange(fnc) {
          this.__onChange = fnc;
          return this;
        }
      }, {
        key: 'onFinishChange',
        value: function onFinishChange(fnc) {
          this.__onFinishChange = fnc;
          return this;
        }
      }, {
        key: 'setValue',
        value: function setValue(newValue) {
          this.object[this.property] = newValue;
          if (this.__onChange) {
            this.__onChange.call(this, newValue);
          }
          this.updateDisplay();
          return this;
        }
      }, {
        key: 'getValue',
        value: function getValue() {
          return this.object[this.property];
        }
      }, {
        key: 'updateDisplay',
        value: function updateDisplay() {
          return this;
        }
      }, {
        key: 'isModified',
        value: function isModified() {
          return this.initialValue !== this.getValue();
        }
      }]);
      return Controller;
    }();

    var EVENT_MAP = {
      HTMLEvents: ['change'],
      MouseEvents: ['click', 'mousemove', 'mousedown', 'mouseup', 'mouseover'],
      KeyboardEvents: ['keydown']
    };
    var EVENT_MAP_INV = {};
    Common.each(EVENT_MAP, function (v, k) {
      Common.each(v, function (e) {
        EVENT_MAP_INV[e] = k;
      });
    });
    var CSS_VALUE_PIXELS = /(\d+(\.\d+)?)px/;
    function cssValueToPixels(val) {
      if (val === '0' || Common.isUndefined(val)) {
        return 0;
      }
      var match = val.match(CSS_VALUE_PIXELS);
      if (!Common.isNull(match)) {
        return parseFloat(match[1]);
      }
      return 0;
    }
    var dom = {
      makeSelectable: function makeSelectable(elem, selectable) {
        if (elem === undefined || elem.style === undefined) return;
        elem.onselectstart = selectable ? function () {
          return false;
        } : function () {};
        elem.style.MozUserSelect = selectable ? 'auto' : 'none';
        elem.style.KhtmlUserSelect = selectable ? 'auto' : 'none';
        elem.unselectable = selectable ? 'on' : 'off';
      },
      makeFullscreen: function makeFullscreen(elem, hor, vert) {
        var vertical = vert;
        var horizontal = hor;
        if (Common.isUndefined(horizontal)) {
          horizontal = true;
        }
        if (Common.isUndefined(vertical)) {
          vertical = true;
        }
        elem.style.position = 'absolute';
        if (horizontal) {
          elem.style.left = 0;
          elem.style.right = 0;
        }
        if (vertical) {
          elem.style.top = 0;
          elem.style.bottom = 0;
        }
      },
      fakeEvent: function fakeEvent(elem, eventType, pars, aux) {
        var params = pars || {};
        var className = EVENT_MAP_INV[eventType];
        if (!className) {
          throw new Error('Event type ' + eventType + ' not supported.');
        }
        var evt = document.createEvent(className);
        switch (className) {
          case 'MouseEvents':
            {
              var clientX = params.x || params.clientX || 0;
              var clientY = params.y || params.clientY || 0;
              evt.initMouseEvent(eventType, params.bubbles || false, params.cancelable || true, window, params.clickCount || 1, 0,
              0,
              clientX,
              clientY,
              false, false, false, false, 0, null);
              break;
            }
          case 'KeyboardEvents':
            {
              var init = evt.initKeyboardEvent || evt.initKeyEvent;
              Common.defaults(params, {
                cancelable: true,
                ctrlKey: false,
                altKey: false,
                shiftKey: false,
                metaKey: false,
                keyCode: undefined,
                charCode: undefined
              });
              init(eventType, params.bubbles || false, params.cancelable, window, params.ctrlKey, params.altKey, params.shiftKey, params.metaKey, params.keyCode, params.charCode);
              break;
            }
          default:
            {
              evt.initEvent(eventType, params.bubbles || false, params.cancelable || true);
              break;
            }
        }
        Common.defaults(evt, aux);
        elem.dispatchEvent(evt);
      },
      bind: function bind(elem, event, func, newBool) {
        var bool = newBool || false;
        if (elem.addEventListener) {
          elem.addEventListener(event, func, bool);
        } else if (elem.attachEvent) {
          elem.attachEvent('on' + event, func);
        }
        return dom;
      },
      unbind: function unbind(elem, event, func, newBool) {
        var bool = newBool || false;
        if (elem.removeEventListener) {
          elem.removeEventListener(event, func, bool);
        } else if (elem.detachEvent) {
          elem.detachEvent('on' + event, func);
        }
        return dom;
      },
      addClass: function addClass(elem, className) {
        if (elem.className === undefined) {
          elem.className = className;
        } else if (elem.className !== className) {
          var classes = elem.className.split(/ +/);
          if (classes.indexOf(className) === -1) {
            classes.push(className);
            elem.className = classes.join(' ').replace(/^\s+/, '').replace(/\s+$/, '');
          }
        }
        return dom;
      },
      removeClass: function removeClass(elem, className) {
        if (className) {
          if (elem.className === className) {
            elem.removeAttribute('class');
          } else {
            var classes = elem.className.split(/ +/);
            var index = classes.indexOf(className);
            if (index !== -1) {
              classes.splice(index, 1);
              elem.className = classes.join(' ');
            }
          }
        } else {
          elem.className = undefined;
        }
        return dom;
      },
      hasClass: function hasClass(elem, className) {
        return new RegExp('(?:^|\\s+)' + className + '(?:\\s+|$)').test(elem.className) || false;
      },
      getWidth: function getWidth(elem) {
        var style = getComputedStyle(elem);
        return cssValueToPixels(style['border-left-width']) + cssValueToPixels(style['border-right-width']) + cssValueToPixels(style['padding-left']) + cssValueToPixels(style['padding-right']) + cssValueToPixels(style.width);
      },
      getHeight: function getHeight(elem) {
        var style = getComputedStyle(elem);
        return cssValueToPixels(style['border-top-width']) + cssValueToPixels(style['border-bottom-width']) + cssValueToPixels(style['padding-top']) + cssValueToPixels(style['padding-bottom']) + cssValueToPixels(style.height);
      },
      getOffset: function getOffset(el) {
        var elem = el;
        var offset = { left: 0, top: 0 };
        if (elem.offsetParent) {
          do {
            offset.left += elem.offsetLeft;
            offset.top += elem.offsetTop;
            elem = elem.offsetParent;
          } while (elem);
        }
        return offset;
      },
      isActive: function isActive(elem) {
        return elem === document.activeElement && (elem.type || elem.href);
      }
    };

    var BooleanController = function (_Controller) {
      inherits(BooleanController, _Controller);
      function BooleanController(object, property) {
        classCallCheck(this, BooleanController);
        var _this2 = possibleConstructorReturn(this, (BooleanController.__proto__ || Object.getPrototypeOf(BooleanController)).call(this, object, property));
        var _this = _this2;
        _this2.__prev = _this2.getValue();
        _this2.__checkbox = document.createElement('input');
        _this2.__checkbox.setAttribute('type', 'checkbox');
        function onChange() {
          _this.setValue(!_this.__prev);
        }
        dom.bind(_this2.__checkbox, 'change', onChange, false);
        _this2.domElement.appendChild(_this2.__checkbox);
        _this2.updateDisplay();
        return _this2;
      }
      createClass(BooleanController, [{
        key: 'setValue',
        value: function setValue(v) {
          var toReturn = get(BooleanController.prototype.__proto__ || Object.getPrototypeOf(BooleanController.prototype), 'setValue', this).call(this, v);
          if (this.__onFinishChange) {
            this.__onFinishChange.call(this, this.getValue());
          }
          this.__prev = this.getValue();
          return toReturn;
        }
      }, {
        key: 'updateDisplay',
        value: function updateDisplay() {
          if (this.getValue() === true) {
            this.__checkbox.setAttribute('checked', 'checked');
            this.__checkbox.checked = true;
            this.__prev = true;
          } else {
            this.__checkbox.checked = false;
            this.__prev = false;
          }
          return get(BooleanController.prototype.__proto__ || Object.getPrototypeOf(BooleanController.prototype), 'updateDisplay', this).call(this);
        }
      }]);
      return BooleanController;
    }(Controller);

    var OptionController = function (_Controller) {
      inherits(OptionController, _Controller);
      function OptionController(object, property, opts) {
        classCallCheck(this, OptionController);
        var _this2 = possibleConstructorReturn(this, (OptionController.__proto__ || Object.getPrototypeOf(OptionController)).call(this, object, property));
        var options = opts;
        var _this = _this2;
        _this2.__select = document.createElement('select');
        if (Common.isArray(options)) {
          var map = {};
          Common.each(options, function (element) {
            map[element] = element;
          });
          options = map;
        }
        Common.each(options, function (value, key) {
          var opt = document.createElement('option');
          opt.innerHTML = key;
          opt.setAttribute('value', value);
          _this.__select.appendChild(opt);
        });
        _this2.updateDisplay();
        dom.bind(_this2.__select, 'change', function () {
          var desiredValue = this.options[this.selectedIndex].value;
          _this.setValue(desiredValue);
        });
        _this2.domElement.appendChild(_this2.__select);
        return _this2;
      }
      createClass(OptionController, [{
        key: 'setValue',
        value: function setValue(v) {
          var toReturn = get(OptionController.prototype.__proto__ || Object.getPrototypeOf(OptionController.prototype), 'setValue', this).call(this, v);
          if (this.__onFinishChange) {
            this.__onFinishChange.call(this, this.getValue());
          }
          return toReturn;
        }
      }, {
        key: 'updateDisplay',
        value: function updateDisplay() {
          if (dom.isActive(this.__select)) return this;
          this.__select.value = this.getValue();
          return get(OptionController.prototype.__proto__ || Object.getPrototypeOf(OptionController.prototype), 'updateDisplay', this).call(this);
        }
      }]);
      return OptionController;
    }(Controller);

    var StringController = function (_Controller) {
      inherits(StringController, _Controller);
      function StringController(object, property) {
        classCallCheck(this, StringController);
        var _this2 = possibleConstructorReturn(this, (StringController.__proto__ || Object.getPrototypeOf(StringController)).call(this, object, property));
        var _this = _this2;
        function onChange() {
          _this.setValue(_this.__input.value);
        }
        function onBlur() {
          if (_this.__onFinishChange) {
            _this.__onFinishChange.call(_this, _this.getValue());
          }
        }
        _this2.__input = document.createElement('input');
        _this2.__input.setAttribute('type', 'text');
        dom.bind(_this2.__input, 'keyup', onChange);
        dom.bind(_this2.__input, 'change', onChange);
        dom.bind(_this2.__input, 'blur', onBlur);
        dom.bind(_this2.__input, 'keydown', function (e) {
          if (e.keyCode === 13) {
            this.blur();
          }
        });
        _this2.updateDisplay();
        _this2.domElement.appendChild(_this2.__input);
        return _this2;
      }
      createClass(StringController, [{
        key: 'updateDisplay',
        value: function updateDisplay() {
          if (!dom.isActive(this.__input)) {
            this.__input.value = this.getValue();
          }
          return get(StringController.prototype.__proto__ || Object.getPrototypeOf(StringController.prototype), 'updateDisplay', this).call(this);
        }
      }]);
      return StringController;
    }(Controller);

    function numDecimals(x) {
      var _x = x.toString();
      if (_x.indexOf('.') > -1) {
        return _x.length - _x.indexOf('.') - 1;
      }
      return 0;
    }
    var NumberController = function (_Controller) {
      inherits(NumberController, _Controller);
      function NumberController(object, property, params) {
        classCallCheck(this, NumberController);
        var _this = possibleConstructorReturn(this, (NumberController.__proto__ || Object.getPrototypeOf(NumberController)).call(this, object, property));
        var _params = params || {};
        _this.__min = _params.min;
        _this.__max = _params.max;
        _this.__step = _params.step;
        if (Common.isUndefined(_this.__step)) {
          if (_this.initialValue === 0) {
            _this.__impliedStep = 1;
          } else {
            _this.__impliedStep = Math.pow(10, Math.floor(Math.log(Math.abs(_this.initialValue)) / Math.LN10)) / 10;
          }
        } else {
          _this.__impliedStep = _this.__step;
        }
        _this.__precision = numDecimals(_this.__impliedStep);
        return _this;
      }
      createClass(NumberController, [{
        key: 'setValue',
        value: function setValue(v) {
          var _v = v;
          if (this.__min !== undefined && _v < this.__min) {
            _v = this.__min;
          } else if (this.__max !== undefined && _v > this.__max) {
            _v = this.__max;
          }
          if (this.__step !== undefined && _v % this.__step !== 0) {
            _v = Math.round(_v / this.__step) * this.__step;
          }
          return get(NumberController.prototype.__proto__ || Object.getPrototypeOf(NumberController.prototype), 'setValue', this).call(this, _v);
        }
      }, {
        key: 'min',
        value: function min(minValue) {
          this.__min = minValue;
          return this;
        }
      }, {
        key: 'max',
        value: function max(maxValue) {
          this.__max = maxValue;
          return this;
        }
      }, {
        key: 'step',
        value: function step(stepValue) {
          this.__step = stepValue;
          this.__impliedStep = stepValue;
          this.__precision = numDecimals(stepValue);
          return this;
        }
      }]);
      return NumberController;
    }(Controller);

    function roundToDecimal(value, decimals) {
      var tenTo = Math.pow(10, decimals);
      return Math.round(value * tenTo) / tenTo;
    }
    var NumberControllerBox = function (_NumberController) {
      inherits(NumberControllerBox, _NumberController);
      function NumberControllerBox(object, property, params) {
        classCallCheck(this, NumberControllerBox);
        var _this2 = possibleConstructorReturn(this, (NumberControllerBox.__proto__ || Object.getPrototypeOf(NumberControllerBox)).call(this, object, property, params));
        _this2.__truncationSuspended = false;
        var _this = _this2;
        var prevY = void 0;
        function onChange() {
          var attempted = parseFloat(_this.__input.value);
          if (!Common.isNaN(attempted)) {
            _this.setValue(attempted);
          }
        }
        function onFinish() {
          if (_this.__onFinishChange) {
            _this.__onFinishChange.call(_this, _this.getValue());
          }
        }
        function onBlur() {
          onFinish();
        }
        function onMouseDrag(e) {
          var diff = prevY - e.clientY;
          _this.setValue(_this.getValue() + diff * _this.__impliedStep);
          prevY = e.clientY;
        }
        function onMouseUp() {
          dom.unbind(window, 'mousemove', onMouseDrag);
          dom.unbind(window, 'mouseup', onMouseUp);
          onFinish();
        }
        function onMouseDown(e) {
          dom.bind(window, 'mousemove', onMouseDrag);
          dom.bind(window, 'mouseup', onMouseUp);
          prevY = e.clientY;
        }
        _this2.__input = document.createElement('input');
        _this2.__input.setAttribute('type', 'text');
        dom.bind(_this2.__input, 'change', onChange);
        dom.bind(_this2.__input, 'blur', onBlur);
        dom.bind(_this2.__input, 'mousedown', onMouseDown);
        dom.bind(_this2.__input, 'keydown', function (e) {
          if (e.keyCode === 13) {
            _this.__truncationSuspended = true;
            this.blur();
            _this.__truncationSuspended = false;
            onFinish();
          }
        });
        _this2.updateDisplay();
        _this2.domElement.appendChild(_this2.__input);
        return _this2;
      }
      createClass(NumberControllerBox, [{
        key: 'updateDisplay',
        value: function updateDisplay() {
          this.__input.value = this.__truncationSuspended ? this.getValue() : roundToDecimal(this.getValue(), this.__precision);
          return get(NumberControllerBox.prototype.__proto__ || Object.getPrototypeOf(NumberControllerBox.prototype), 'updateDisplay', this).call(this);
        }
      }]);
      return NumberControllerBox;
    }(NumberController);

    function map(v, i1, i2, o1, o2) {
      return o1 + (o2 - o1) * ((v - i1) / (i2 - i1));
    }
    var NumberControllerSlider = function (_NumberController) {
      inherits(NumberControllerSlider, _NumberController);
      function NumberControllerSlider(object, property, min, max, step) {
        classCallCheck(this, NumberControllerSlider);
        var _this2 = possibleConstructorReturn(this, (NumberControllerSlider.__proto__ || Object.getPrototypeOf(NumberControllerSlider)).call(this, object, property, { min: min, max: max, step: step }));
        var _this = _this2;
        _this2.__background = document.createElement('div');
        _this2.__foreground = document.createElement('div');
        dom.bind(_this2.__background, 'mousedown', onMouseDown);
        dom.bind(_this2.__background, 'touchstart', onTouchStart);
        dom.addClass(_this2.__background, 'slider');
        dom.addClass(_this2.__foreground, 'slider-fg');
        function onMouseDown(e) {
          document.activeElement.blur();
          dom.bind(window, 'mousemove', onMouseDrag);
          dom.bind(window, 'mouseup', onMouseUp);
          onMouseDrag(e);
        }
        function onMouseDrag(e) {
          e.preventDefault();
          var bgRect = _this.__background.getBoundingClientRect();
          _this.setValue(map(e.clientX, bgRect.left, bgRect.right, _this.__min, _this.__max));
          return false;
        }
        function onMouseUp() {
          dom.unbind(window, 'mousemove', onMouseDrag);
          dom.unbind(window, 'mouseup', onMouseUp);
          if (_this.__onFinishChange) {
            _this.__onFinishChange.call(_this, _this.getValue());
          }
        }
        function onTouchStart(e) {
          if (e.touches.length !== 1) {
            return;
          }
          dom.bind(window, 'touchmove', onTouchMove);
          dom.bind(window, 'touchend', onTouchEnd);
          onTouchMove(e);
        }
        function onTouchMove(e) {
          var clientX = e.touches[0].clientX;
          var bgRect = _this.__background.getBoundingClientRect();
          _this.setValue(map(clientX, bgRect.left, bgRect.right, _this.__min, _this.__max));
        }
        function onTouchEnd() {
          dom.unbind(window, 'touchmove', onTouchMove);
          dom.unbind(window, 'touchend', onTouchEnd);
          if (_this.__onFinishChange) {
            _this.__onFinishChange.call(_this, _this.getValue());
          }
        }
        _this2.updateDisplay();
        _this2.__background.appendChild(_this2.__foreground);
        _this2.domElement.appendChild(_this2.__background);
        return _this2;
      }
      createClass(NumberControllerSlider, [{
        key: 'updateDisplay',
        value: function updateDisplay() {
          var pct = (this.getValue() - this.__min) / (this.__max - this.__min);
          this.__foreground.style.width = pct * 100 + '%';
          return get(NumberControllerSlider.prototype.__proto__ || Object.getPrototypeOf(NumberControllerSlider.prototype), 'updateDisplay', this).call(this);
        }
      }]);
      return NumberControllerSlider;
    }(NumberController);

    var FunctionController = function (_Controller) {
      inherits(FunctionController, _Controller);
      function FunctionController(object, property, text) {
        classCallCheck(this, FunctionController);
        var _this2 = possibleConstructorReturn(this, (FunctionController.__proto__ || Object.getPrototypeOf(FunctionController)).call(this, object, property));
        var _this = _this2;
        _this2.__button = document.createElement('div');
        _this2.__button.innerHTML = text === undefined ? 'Fire' : text;
        dom.bind(_this2.__button, 'click', function (e) {
          e.preventDefault();
          _this.fire();
          return false;
        });
        dom.addClass(_this2.__button, 'button');
        _this2.domElement.appendChild(_this2.__button);
        return _this2;
      }
      createClass(FunctionController, [{
        key: 'fire',
        value: function fire() {
          if (this.__onChange) {
            this.__onChange.call(this);
          }
          this.getValue().call(this.object);
          if (this.__onFinishChange) {
            this.__onFinishChange.call(this, this.getValue());
          }
        }
      }]);
      return FunctionController;
    }(Controller);

    var ColorController = function (_Controller) {
      inherits(ColorController, _Controller);
      function ColorController(object, property) {
        classCallCheck(this, ColorController);
        var _this2 = possibleConstructorReturn(this, (ColorController.__proto__ || Object.getPrototypeOf(ColorController)).call(this, object, property));
        _this2.__color = new Color(_this2.getValue());
        _this2.__temp = new Color(0);
        var _this = _this2;
        _this2.domElement = document.createElement('div');
        dom.makeSelectable(_this2.domElement, false);
        _this2.__selector = document.createElement('div');
        _this2.__selector.className = 'selector';
        _this2.__saturation_field = document.createElement('div');
        _this2.__saturation_field.className = 'saturation-field';
        _this2.__field_knob = document.createElement('div');
        _this2.__field_knob.className = 'field-knob';
        _this2.__field_knob_border = '2px solid ';
        _this2.__hue_knob = document.createElement('div');
        _this2.__hue_knob.className = 'hue-knob';
        _this2.__hue_field = document.createElement('div');
        _this2.__hue_field.className = 'hue-field';
        _this2.__input = document.createElement('input');
        _this2.__input.type = 'text';
        _this2.__input_textShadow = '0 1px 1px ';
        dom.bind(_this2.__input, 'keydown', function (e) {
          if (e.keyCode === 13) {
            onBlur.call(this);
          }
        });
        dom.bind(_this2.__input, 'blur', onBlur);
        dom.bind(_this2.__selector, 'mousedown', function ()        {
          dom.addClass(this, 'drag').bind(window, 'mouseup', function ()        {
            dom.removeClass(_this.__selector, 'drag');
          });
        });
        dom.bind(_this2.__selector, 'touchstart', function ()        {
          dom.addClass(this, 'drag').bind(window, 'touchend', function ()        {
            dom.removeClass(_this.__selector, 'drag');
          });
        });
        var valueField = document.createElement('div');
        Common.extend(_this2.__selector.style, {
          width: '122px',
          height: '102px',
          padding: '3px',
          backgroundColor: '#222',
          boxShadow: '0px 1px 3px rgba(0,0,0,0.3)'
        });
        Common.extend(_this2.__field_knob.style, {
          position: 'absolute',
          width: '12px',
          height: '12px',
          border: _this2.__field_knob_border + (_this2.__color.v < 0.5 ? '#fff' : '#000'),
          boxShadow: '0px 1px 3px rgba(0,0,0,0.5)',
          borderRadius: '12px',
          zIndex: 1
        });
        Common.extend(_this2.__hue_knob.style, {
          position: 'absolute',
          width: '15px',
          height: '2px',
          borderRight: '4px solid #fff',
          zIndex: 1
        });
        Common.extend(_this2.__saturation_field.style, {
          width: '100px',
          height: '100px',
          border: '1px solid #555',
          marginRight: '3px',
          display: 'inline-block',
          cursor: 'pointer'
        });
        Common.extend(valueField.style, {
          width: '100%',
          height: '100%',
          background: 'none'
        });
        linearGradient(valueField, 'top', 'rgba(0,0,0,0)', '#000');
        Common.extend(_this2.__hue_field.style, {
          width: '15px',
          height: '100px',
          border: '1px solid #555',
          cursor: 'ns-resize',
          position: 'absolute',
          top: '3px',
          right: '3px'
        });
        hueGradient(_this2.__hue_field);
        Common.extend(_this2.__input.style, {
          outline: 'none',
          textAlign: 'center',
          color: '#fff',
          border: 0,
          fontWeight: 'bold',
          textShadow: _this2.__input_textShadow + 'rgba(0,0,0,0.7)'
        });
        dom.bind(_this2.__saturation_field, 'mousedown', fieldDown);
        dom.bind(_this2.__saturation_field, 'touchstart', fieldDown);
        dom.bind(_this2.__field_knob, 'mousedown', fieldDown);
        dom.bind(_this2.__field_knob, 'touchstart', fieldDown);
        dom.bind(_this2.__hue_field, 'mousedown', fieldDownH);
        dom.bind(_this2.__hue_field, 'touchstart', fieldDownH);
        function fieldDown(e) {
          setSV(e);
          dom.bind(window, 'mousemove', setSV);
          dom.bind(window, 'touchmove', setSV);
          dom.bind(window, 'mouseup', fieldUpSV);
          dom.bind(window, 'touchend', fieldUpSV);
        }
        function fieldDownH(e) {
          setH(e);
          dom.bind(window, 'mousemove', setH);
          dom.bind(window, 'touchmove', setH);
          dom.bind(window, 'mouseup', fieldUpH);
          dom.bind(window, 'touchend', fieldUpH);
        }
        function fieldUpSV() {
          dom.unbind(window, 'mousemove', setSV);
          dom.unbind(window, 'touchmove', setSV);
          dom.unbind(window, 'mouseup', fieldUpSV);
          dom.unbind(window, 'touchend', fieldUpSV);
          onFinish();
        }
        function fieldUpH() {
          dom.unbind(window, 'mousemove', setH);
          dom.unbind(window, 'touchmove', setH);
          dom.unbind(window, 'mouseup', fieldUpH);
          dom.unbind(window, 'touchend', fieldUpH);
          onFinish();
        }
        function onBlur() {
          var i = interpret(this.value);
          if (i !== false) {
            _this.__color.__state = i;
            _this.setValue(_this.__color.toOriginal());
          } else {
            this.value = _this.__color.toString();
          }
        }
        function onFinish() {
          if (_this.__onFinishChange) {
            _this.__onFinishChange.call(_this, _this.__color.toOriginal());
          }
        }
        _this2.__saturation_field.appendChild(valueField);
        _this2.__selector.appendChild(_this2.__field_knob);
        _this2.__selector.appendChild(_this2.__saturation_field);
        _this2.__selector.appendChild(_this2.__hue_field);
        _this2.__hue_field.appendChild(_this2.__hue_knob);
        _this2.domElement.appendChild(_this2.__input);
        _this2.domElement.appendChild(_this2.__selector);
        _this2.updateDisplay();
        function setSV(e) {
          if (e.type.indexOf('touch') === -1) {
            e.preventDefault();
          }
          var fieldRect = _this.__saturation_field.getBoundingClientRect();
          var _ref = e.touches && e.touches[0] || e,
              clientX = _ref.clientX,
              clientY = _ref.clientY;
          var s = (clientX - fieldRect.left) / (fieldRect.right - fieldRect.left);
          var v = 1 - (clientY - fieldRect.top) / (fieldRect.bottom - fieldRect.top);
          if (v > 1) {
            v = 1;
          } else if (v < 0) {
            v = 0;
          }
          if (s > 1) {
            s = 1;
          } else if (s < 0) {
            s = 0;
          }
          _this.__color.v = v;
          _this.__color.s = s;
          _this.setValue(_this.__color.toOriginal());
          return false;
        }
        function setH(e) {
          if (e.type.indexOf('touch') === -1) {
            e.preventDefault();
          }
          var fieldRect = _this.__hue_field.getBoundingClientRect();
          var _ref2 = e.touches && e.touches[0] || e,
              clientY = _ref2.clientY;
          var h = 1 - (clientY - fieldRect.top) / (fieldRect.bottom - fieldRect.top);
          if (h > 1) {
            h = 1;
          } else if (h < 0) {
            h = 0;
          }
          _this.__color.h = h * 360;
          _this.setValue(_this.__color.toOriginal());
          return false;
        }
        return _this2;
      }
      createClass(ColorController, [{
        key: 'updateDisplay',
        value: function updateDisplay() {
          var i = interpret(this.getValue());
          if (i !== false) {
            var mismatch = false;
            Common.each(Color.COMPONENTS, function (component) {
              if (!Common.isUndefined(i[component]) && !Common.isUndefined(this.__color.__state[component]) && i[component] !== this.__color.__state[component]) {
                mismatch = true;
                return {};
              }
            }, this);
            if (mismatch) {
              Common.extend(this.__color.__state, i);
            }
          }
          Common.extend(this.__temp.__state, this.__color.__state);
          this.__temp.a = 1;
          var flip = this.__color.v < 0.5 || this.__color.s > 0.5 ? 255 : 0;
          var _flip = 255 - flip;
          Common.extend(this.__field_knob.style, {
            marginLeft: 100 * this.__color.s - 7 + 'px',
            marginTop: 100 * (1 - this.__color.v) - 7 + 'px',
            backgroundColor: this.__temp.toHexString(),
            border: this.__field_knob_border + 'rgb(' + flip + ',' + flip + ',' + flip + ')'
          });
          this.__hue_knob.style.marginTop = (1 - this.__color.h / 360) * 100 + 'px';
          this.__temp.s = 1;
          this.__temp.v = 1;
          linearGradient(this.__saturation_field, 'left', '#fff', this.__temp.toHexString());
          this.__input.value = this.__color.toString();
          Common.extend(this.__input.style, {
            backgroundColor: this.__color.toHexString(),
            color: 'rgb(' + flip + ',' + flip + ',' + flip + ')',
            textShadow: this.__input_textShadow + 'rgba(' + _flip + ',' + _flip + ',' + _flip + ',.7)'
          });
        }
      }]);
      return ColorController;
    }(Controller);
    var vendors = ['-moz-', '-o-', '-webkit-', '-ms-', ''];
    function linearGradient(elem, x, a, b) {
      elem.style.background = '';
      Common.each(vendors, function (vendor) {
        elem.style.cssText += 'background: ' + vendor + 'linear-gradient(' + x + ', ' + a + ' 0%, ' + b + ' 100%); ';
      });
    }
    function hueGradient(elem) {
      elem.style.background = '';
      elem.style.cssText += 'background: -moz-linear-gradient(top,  #ff0000 0%, #ff00ff 17%, #0000ff 34%, #00ffff 50%, #00ff00 67%, #ffff00 84%, #ff0000 100%);';
      elem.style.cssText += 'background: -webkit-linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);';
      elem.style.cssText += 'background: -o-linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);';
      elem.style.cssText += 'background: -ms-linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);';
      elem.style.cssText += 'background: linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);';
    }

    var css = {
      load: function load(url, indoc) {
        var doc = indoc || document;
        var link = doc.createElement('link');
        link.type = 'text/css';
        link.rel = 'stylesheet';
        link.href = url;
        doc.getElementsByTagName('head')[0].appendChild(link);
      },
      inject: function inject(cssContent, indoc) {
        var doc = indoc || document;
        var injected = document.createElement('style');
        injected.type = 'text/css';
        injected.innerHTML = cssContent;
        var head = doc.getElementsByTagName('head')[0];
        try {
          head.appendChild(injected);
        } catch (e) {
        }
      }
    };

    var saveDialogContents = "<div id=\"dg-save\" class=\"dg dialogue\">\n\n  Here's the new load parameter for your <code>GUI</code>'s constructor:\n\n  <textarea id=\"dg-new-constructor\"></textarea>\n\n  <div id=\"dg-save-locally\">\n\n    <input id=\"dg-local-storage\" type=\"checkbox\"/> Automatically save\n    values to <code>localStorage</code> on exit.\n\n    <div id=\"dg-local-explain\">The values saved to <code>localStorage</code> will\n      override those passed to <code>dat.GUI</code>'s constructor. This makes it\n      easier to work incrementally, but <code>localStorage</code> is fragile,\n      and your friends may not see the same values you do.\n\n    </div>\n\n  </div>\n\n</div>";

    var ControllerFactory = function ControllerFactory(object, property) {
      var initialValue = object[property];
      if (Common.isArray(arguments[2]) || Common.isObject(arguments[2])) {
        return new OptionController(object, property, arguments[2]);
      }
      if (Common.isNumber(initialValue)) {
        if (Common.isNumber(arguments[2]) && Common.isNumber(arguments[3])) {
          if (Common.isNumber(arguments[4])) {
            return new NumberControllerSlider(object, property, arguments[2], arguments[3], arguments[4]);
          }
          return new NumberControllerSlider(object, property, arguments[2], arguments[3]);
        }
        if (Common.isNumber(arguments[4])) {
          return new NumberControllerBox(object, property, { min: arguments[2], max: arguments[3], step: arguments[4] });
        }
        return new NumberControllerBox(object, property, { min: arguments[2], max: arguments[3] });
      }
      if (Common.isString(initialValue)) {
        return new StringController(object, property);
      }
      if (Common.isFunction(initialValue)) {
        return new FunctionController(object, property, '');
      }
      if (Common.isBoolean(initialValue)) {
        return new BooleanController(object, property);
      }
      return null;
    };

    function requestAnimationFrame$1(callback) {
      setTimeout(callback, 1000 / 60);
    }
    var requestAnimationFrame$1$1 = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || requestAnimationFrame$1;

    var CenteredDiv = function () {
      function CenteredDiv() {
        classCallCheck(this, CenteredDiv);
        this.backgroundElement = document.createElement('div');
        Common.extend(this.backgroundElement.style, {
          backgroundColor: 'rgba(0,0,0,0.8)',
          top: 0,
          left: 0,
          display: 'none',
          zIndex: '1000',
          opacity: 0,
          WebkitTransition: 'opacity 0.2s linear',
          transition: 'opacity 0.2s linear'
        });
        dom.makeFullscreen(this.backgroundElement);
        this.backgroundElement.style.position = 'fixed';
        this.domElement = document.createElement('div');
        Common.extend(this.domElement.style, {
          position: 'fixed',
          display: 'none',
          zIndex: '1001',
          opacity: 0,
          WebkitTransition: '-webkit-transform 0.2s ease-out, opacity 0.2s linear',
          transition: 'transform 0.2s ease-out, opacity 0.2s linear'
        });
        document.body.appendChild(this.backgroundElement);
        document.body.appendChild(this.domElement);
        var _this = this;
        dom.bind(this.backgroundElement, 'click', function () {
          _this.hide();
        });
      }
      createClass(CenteredDiv, [{
        key: 'show',
        value: function show() {
          var _this = this;
          this.backgroundElement.style.display = 'block';
          this.domElement.style.display = 'block';
          this.domElement.style.opacity = 0;
          this.domElement.style.webkitTransform = 'scale(1.1)';
          this.layout();
          Common.defer(function () {
            _this.backgroundElement.style.opacity = 1;
            _this.domElement.style.opacity = 1;
            _this.domElement.style.webkitTransform = 'scale(1)';
          });
        }
      }, {
        key: 'hide',
        value: function hide() {
          var _this = this;
          var hide = function hide() {
            _this.domElement.style.display = 'none';
            _this.backgroundElement.style.display = 'none';
            dom.unbind(_this.domElement, 'webkitTransitionEnd', hide);
            dom.unbind(_this.domElement, 'transitionend', hide);
            dom.unbind(_this.domElement, 'oTransitionEnd', hide);
          };
          dom.bind(this.domElement, 'webkitTransitionEnd', hide);
          dom.bind(this.domElement, 'transitionend', hide);
          dom.bind(this.domElement, 'oTransitionEnd', hide);
          this.backgroundElement.style.opacity = 0;
          this.domElement.style.opacity = 0;
          this.domElement.style.webkitTransform = 'scale(1.1)';
        }
      }, {
        key: 'layout',
        value: function layout() {
          this.domElement.style.left = window.innerWidth / 2 - dom.getWidth(this.domElement) / 2 + 'px';
          this.domElement.style.top = window.innerHeight / 2 - dom.getHeight(this.domElement) / 2 + 'px';
        }
      }]);
      return CenteredDiv;
    }();

    var styleSheet = ___$insertStyle(".dg ul{list-style:none;margin:0;padding:0;width:100%;clear:both}.dg.ac{position:fixed;top:0;left:0;right:0;height:0;z-index:0}.dg:not(.ac) .main{overflow:hidden}.dg.main{-webkit-transition:opacity .1s linear;-o-transition:opacity .1s linear;-moz-transition:opacity .1s linear;transition:opacity .1s linear}.dg.main.taller-than-window{overflow-y:auto}.dg.main.taller-than-window .close-button{opacity:1;margin-top:-1px;border-top:1px solid #2c2c2c}.dg.main ul.closed .close-button{opacity:1 !important}.dg.main:hover .close-button,.dg.main .close-button.drag{opacity:1}.dg.main .close-button{-webkit-transition:opacity .1s linear;-o-transition:opacity .1s linear;-moz-transition:opacity .1s linear;transition:opacity .1s linear;border:0;line-height:19px;height:20px;cursor:pointer;text-align:center;background-color:#000}.dg.main .close-button.close-top{position:relative}.dg.main .close-button.close-bottom{position:absolute}.dg.main .close-button:hover{background-color:#111}.dg.a{float:right;margin-right:15px;overflow-y:visible}.dg.a.has-save>ul.close-top{margin-top:0}.dg.a.has-save>ul.close-bottom{margin-top:27px}.dg.a.has-save>ul.closed{margin-top:0}.dg.a .save-row{top:0;z-index:1002}.dg.a .save-row.close-top{position:relative}.dg.a .save-row.close-bottom{position:fixed}.dg li{-webkit-transition:height .1s ease-out;-o-transition:height .1s ease-out;-moz-transition:height .1s ease-out;transition:height .1s ease-out;-webkit-transition:overflow .1s linear;-o-transition:overflow .1s linear;-moz-transition:overflow .1s linear;transition:overflow .1s linear}.dg li:not(.folder){cursor:auto;height:27px;line-height:27px;padding:0 4px 0 5px}.dg li.folder{padding:0;border-left:4px solid rgba(0,0,0,0)}.dg li.title{cursor:pointer;margin-left:-4px}.dg .closed li:not(.title),.dg .closed ul li,.dg .closed ul li>*{height:0;overflow:hidden;border:0}.dg .cr{clear:both;padding-left:3px;height:27px;overflow:hidden}.dg .property-name{cursor:default;float:left;clear:left;width:40%;overflow:hidden;text-overflow:ellipsis}.dg .c{float:left;width:60%;position:relative}.dg .c input[type=text]{border:0;margin-top:4px;padding:3px;width:100%;float:right}.dg .has-slider input[type=text]{width:30%;margin-left:0}.dg .slider{float:left;width:66%;margin-left:-5px;margin-right:0;height:19px;margin-top:4px}.dg .slider-fg{height:100%}.dg .c input[type=checkbox]{margin-top:7px}.dg .c select{margin-top:5px}.dg .cr.function,.dg .cr.function .property-name,.dg .cr.function *,.dg .cr.boolean,.dg .cr.boolean *{cursor:pointer}.dg .cr.color{overflow:visible}.dg .selector{display:none;position:absolute;margin-left:-9px;margin-top:23px;z-index:10}.dg .c:hover .selector,.dg .selector.drag{display:block}.dg li.save-row{padding:0}.dg li.save-row .button{display:inline-block;padding:0px 6px}.dg.dialogue{background-color:#222;width:460px;padding:15px;font-size:13px;line-height:15px}#dg-new-constructor{padding:10px;color:#222;font-family:Monaco, monospace;font-size:10px;border:0;resize:none;box-shadow:inset 1px 1px 1px #888;word-wrap:break-word;margin:12px 0;display:block;width:440px;overflow-y:scroll;height:100px;position:relative}#dg-local-explain{display:none;font-size:11px;line-height:17px;border-radius:3px;background-color:#333;padding:8px;margin-top:10px}#dg-local-explain code{font-size:10px}#dat-gui-save-locally{display:none}.dg{color:#eee;font:11px 'Lucida Grande', sans-serif;text-shadow:0 -1px 0 #111}.dg.main::-webkit-scrollbar{width:5px;background:#1a1a1a}.dg.main::-webkit-scrollbar-corner{height:0;display:none}.dg.main::-webkit-scrollbar-thumb{border-radius:5px;background:#676767}.dg li:not(.folder){background:#1a1a1a;border-bottom:1px solid #2c2c2c}.dg li.save-row{line-height:25px;background:#dad5cb;border:0}.dg li.save-row select{margin-left:5px;width:108px}.dg li.save-row .button{margin-left:5px;margin-top:1px;border-radius:2px;font-size:9px;line-height:7px;padding:4px 4px 5px 4px;background:#c5bdad;color:#fff;text-shadow:0 1px 0 #b0a58f;box-shadow:0 -1px 0 #b0a58f;cursor:pointer}.dg li.save-row .button.gears{background:#c5bdad url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAsAAAANCAYAAAB/9ZQ7AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAQJJREFUeNpiYKAU/P//PwGIC/ApCABiBSAW+I8AClAcgKxQ4T9hoMAEUrxx2QSGN6+egDX+/vWT4e7N82AMYoPAx/evwWoYoSYbACX2s7KxCxzcsezDh3evFoDEBYTEEqycggWAzA9AuUSQQgeYPa9fPv6/YWm/Acx5IPb7ty/fw+QZblw67vDs8R0YHyQhgObx+yAJkBqmG5dPPDh1aPOGR/eugW0G4vlIoTIfyFcA+QekhhHJhPdQxbiAIguMBTQZrPD7108M6roWYDFQiIAAv6Aow/1bFwXgis+f2LUAynwoIaNcz8XNx3Dl7MEJUDGQpx9gtQ8YCueB+D26OECAAQDadt7e46D42QAAAABJRU5ErkJggg==) 2px 1px no-repeat;height:7px;width:8px}.dg li.save-row .button:hover{background-color:#bab19e;box-shadow:0 -1px 0 #b0a58f}.dg li.folder{border-bottom:0}.dg li.title{padding-left:16px;background:#000 url(data:image/gif;base64,R0lGODlhBQAFAJEAAP////Pz8////////yH5BAEAAAIALAAAAAAFAAUAAAIIlI+hKgFxoCgAOw==) 6px 10px no-repeat;cursor:pointer;border-bottom:1px solid rgba(255,255,255,0.2)}.dg .closed li.title{background-image:url(data:image/gif;base64,R0lGODlhBQAFAJEAAP////Pz8////////yH5BAEAAAIALAAAAAAFAAUAAAIIlGIWqMCbWAEAOw==)}.dg .cr.boolean{border-left:3px solid #806787}.dg .cr.color{border-left:3px solid}.dg .cr.function{border-left:3px solid #e61d5f}.dg .cr.number{border-left:3px solid #2FA1D6}.dg .cr.number input[type=text]{color:#2FA1D6}.dg .cr.string{border-left:3px solid #1ed36f}.dg .cr.string input[type=text]{color:#1ed36f}.dg .cr.function:hover,.dg .cr.boolean:hover{background:#111}.dg .c input[type=text]{background:#303030;outline:none}.dg .c input[type=text]:hover{background:#3c3c3c}.dg .c input[type=text]:focus{background:#494949;color:#fff}.dg .c .slider{background:#303030;cursor:ew-resize}.dg .c .slider-fg{background:#2FA1D6;max-width:100%}.dg .c .slider:hover{background:#3c3c3c}.dg .c .slider:hover .slider-fg{background:#44abda}\n");

    css.inject(styleSheet);
    var CSS_NAMESPACE = 'dg';
    var HIDE_KEY_CODE = 72;
    var CLOSE_BUTTON_HEIGHT = 20;
    var DEFAULT_DEFAULT_PRESET_NAME = 'Default';
    var SUPPORTS_LOCAL_STORAGE = function () {
      try {
        return !!window.localStorage;
      } catch (e) {
        return false;
      }
    }();
    var SAVE_DIALOGUE = void 0;
    var autoPlaceVirgin = true;
    var autoPlaceContainer = void 0;
    var hide = false;
    var hideableGuis = [];
    var GUI = function GUI(pars) {
      var _this = this;
      var params = pars || {};
      this.domElement = document.createElement('div');
      this.__ul = document.createElement('ul');
      this.domElement.appendChild(this.__ul);
      dom.addClass(this.domElement, CSS_NAMESPACE);
      this.__folders = {};
      this.__controllers = [];
      this.__rememberedObjects = [];
      this.__rememberedObjectIndecesToControllers = [];
      this.__listening = [];
      params = Common.defaults(params, {
        closeOnTop: false,
        autoPlace: true,
        width: GUI.DEFAULT_WIDTH
      });
      params = Common.defaults(params, {
        resizable: params.autoPlace,
        hideable: params.autoPlace
      });
      if (!Common.isUndefined(params.load)) {
        if (params.preset) {
          params.load.preset = params.preset;
        }
      } else {
        params.load = { preset: DEFAULT_DEFAULT_PRESET_NAME };
      }
      if (Common.isUndefined(params.parent) && params.hideable) {
        hideableGuis.push(this);
      }
      params.resizable = Common.isUndefined(params.parent) && params.resizable;
      if (params.autoPlace && Common.isUndefined(params.scrollable)) {
        params.scrollable = true;
      }
      var useLocalStorage = SUPPORTS_LOCAL_STORAGE && localStorage.getItem(getLocalStorageHash(this, 'isLocal')) === 'true';
      var saveToLocalStorage = void 0;
      var titleRow = void 0;
      Object.defineProperties(this,
      {
        parent: {
          get: function get$$1() {
            return params.parent;
          }
        },
        scrollable: {
          get: function get$$1() {
            return params.scrollable;
          }
        },
        autoPlace: {
          get: function get$$1() {
            return params.autoPlace;
          }
        },
        closeOnTop: {
          get: function get$$1() {
            return params.closeOnTop;
          }
        },
        preset: {
          get: function get$$1() {
            if (_this.parent) {
              return _this.getRoot().preset;
            }
            return params.load.preset;
          },
          set: function set$$1(v) {
            if (_this.parent) {
              _this.getRoot().preset = v;
            } else {
              params.load.preset = v;
            }
            setPresetSelectIndex(this);
            _this.revert();
          }
        },
        width: {
          get: function get$$1() {
            return params.width;
          },
          set: function set$$1(v) {
            params.width = v;
            setWidth(_this, v);
          }
        },
        name: {
          get: function get$$1() {
            return params.name;
          },
          set: function set$$1(v) {
            params.name = v;
            if (titleRow) {
              titleRow.innerHTML = params.name;
            }
          }
        },
        closed: {
          get: function get$$1() {
            return params.closed;
          },
          set: function set$$1(v) {
            params.closed = v;
            if (params.closed) {
              dom.addClass(_this.__ul, GUI.CLASS_CLOSED);
            } else {
              dom.removeClass(_this.__ul, GUI.CLASS_CLOSED);
            }
            this.onResize();
            if (_this.__closeButton) {
              _this.__closeButton.innerHTML = v ? GUI.TEXT_OPEN : GUI.TEXT_CLOSED;
            }
          }
        },
        load: {
          get: function get$$1() {
            return params.load;
          }
        },
        useLocalStorage: {
          get: function get$$1() {
            return useLocalStorage;
          },
          set: function set$$1(bool) {
            if (SUPPORTS_LOCAL_STORAGE) {
              useLocalStorage = bool;
              if (bool) {
                dom.bind(window, 'unload', saveToLocalStorage);
              } else {
                dom.unbind(window, 'unload', saveToLocalStorage);
              }
              localStorage.setItem(getLocalStorageHash(_this, 'isLocal'), bool);
            }
          }
        }
      });
      if (Common.isUndefined(params.parent)) {
        this.closed = params.closed || false;
        dom.addClass(this.domElement, GUI.CLASS_MAIN);
        dom.makeSelectable(this.domElement, false);
        if (SUPPORTS_LOCAL_STORAGE) {
          if (useLocalStorage) {
            _this.useLocalStorage = true;
            var savedGui = localStorage.getItem(getLocalStorageHash(this, 'gui'));
            if (savedGui) {
              params.load = JSON.parse(savedGui);
            }
          }
        }
        this.__closeButton = document.createElement('div');
        this.__closeButton.innerHTML = GUI.TEXT_CLOSED;
        dom.addClass(this.__closeButton, GUI.CLASS_CLOSE_BUTTON);
        if (params.closeOnTop) {
          dom.addClass(this.__closeButton, GUI.CLASS_CLOSE_TOP);
          this.domElement.insertBefore(this.__closeButton, this.domElement.childNodes[0]);
        } else {
          dom.addClass(this.__closeButton, GUI.CLASS_CLOSE_BOTTOM);
          this.domElement.appendChild(this.__closeButton);
        }
        dom.bind(this.__closeButton, 'click', function () {
          _this.closed = !_this.closed;
        });
      } else {
        if (params.closed === undefined) {
          params.closed = true;
        }
        var titleRowName = document.createTextNode(params.name);
        dom.addClass(titleRowName, 'controller-name');
        titleRow = addRow(_this, titleRowName);
        var onClickTitle = function onClickTitle(e) {
          e.preventDefault();
          _this.closed = !_this.closed;
          return false;
        };
        dom.addClass(this.__ul, GUI.CLASS_CLOSED);
        dom.addClass(titleRow, 'title');
        dom.bind(titleRow, 'click', onClickTitle);
        if (!params.closed) {
          this.closed = false;
        }
      }
      if (params.autoPlace) {
        if (Common.isUndefined(params.parent)) {
          if (autoPlaceVirgin) {
            autoPlaceContainer = document.createElement('div');
            dom.addClass(autoPlaceContainer, CSS_NAMESPACE);
            dom.addClass(autoPlaceContainer, GUI.CLASS_AUTO_PLACE_CONTAINER);
            document.body.appendChild(autoPlaceContainer);
            autoPlaceVirgin = false;
          }
          autoPlaceContainer.appendChild(this.domElement);
          dom.addClass(this.domElement, GUI.CLASS_AUTO_PLACE);
        }
        if (!this.parent) {
          setWidth(_this, params.width);
        }
      }
      this.__resizeHandler = function () {
        _this.onResizeDebounced();
      };
      dom.bind(window, 'resize', this.__resizeHandler);
      dom.bind(this.__ul, 'webkitTransitionEnd', this.__resizeHandler);
      dom.bind(this.__ul, 'transitionend', this.__resizeHandler);
      dom.bind(this.__ul, 'oTransitionEnd', this.__resizeHandler);
      this.onResize();
      if (params.resizable) {
        addResizeHandle(this);
      }
      saveToLocalStorage = function saveToLocalStorage() {
        if (SUPPORTS_LOCAL_STORAGE && localStorage.getItem(getLocalStorageHash(_this, 'isLocal')) === 'true') {
          localStorage.setItem(getLocalStorageHash(_this, 'gui'), JSON.stringify(_this.getSaveObject()));
        }
      };
      this.saveToLocalStorageIfPossible = saveToLocalStorage;
      function resetWidth() {
        var root = _this.getRoot();
        root.width += 1;
        Common.defer(function () {
          root.width -= 1;
        });
      }
      if (!params.parent) {
        resetWidth();
      }
    };
    GUI.toggleHide = function () {
      hide = !hide;
      Common.each(hideableGuis, function (gui) {
        gui.domElement.style.display = hide ? 'none' : '';
      });
    };
    GUI.CLASS_AUTO_PLACE = 'a';
    GUI.CLASS_AUTO_PLACE_CONTAINER = 'ac';
    GUI.CLASS_MAIN = 'main';
    GUI.CLASS_CONTROLLER_ROW = 'cr';
    GUI.CLASS_TOO_TALL = 'taller-than-window';
    GUI.CLASS_CLOSED = 'closed';
    GUI.CLASS_CLOSE_BUTTON = 'close-button';
    GUI.CLASS_CLOSE_TOP = 'close-top';
    GUI.CLASS_CLOSE_BOTTOM = 'close-bottom';
    GUI.CLASS_DRAG = 'drag';
    GUI.DEFAULT_WIDTH = 245;
    GUI.TEXT_CLOSED = 'Close Controls';
    GUI.TEXT_OPEN = 'Open Controls';
    GUI._keydownHandler = function (e) {
      if (document.activeElement.type !== 'text' && (e.which === HIDE_KEY_CODE || e.keyCode === HIDE_KEY_CODE)) {
        GUI.toggleHide();
      }
    };
    dom.bind(window, 'keydown', GUI._keydownHandler, false);
    Common.extend(GUI.prototype,
    {
      add: function add(object, property) {
        return _add(this, object, property, {
          factoryArgs: Array.prototype.slice.call(arguments, 2)
        });
      },
      addColor: function addColor(object, property) {
        return _add(this, object, property, {
          color: true
        });
      },
      remove: function remove(controller) {
        this.__ul.removeChild(controller.__li);
        this.__controllers.splice(this.__controllers.indexOf(controller), 1);
        var _this = this;
        Common.defer(function () {
          _this.onResize();
        });
      },
      destroy: function destroy() {
        if (this.parent) {
          throw new Error('Only the root GUI should be removed with .destroy(). ' + 'For subfolders, use gui.removeFolder(folder) instead.');
        }
        if (this.autoPlace) {
          autoPlaceContainer.removeChild(this.domElement);
        }
        var _this = this;
        Common.each(this.__folders, function (subfolder) {
          _this.removeFolder(subfolder);
        });
        dom.unbind(window, 'keydown', GUI._keydownHandler, false);
        removeListeners(this);
      },
      addFolder: function addFolder(name) {
        if (this.__folders[name] !== undefined) {
          throw new Error('You already have a folder in this GUI by the' + ' name "' + name + '"');
        }
        var newGuiParams = { name: name, parent: this };
        newGuiParams.autoPlace = this.autoPlace;
        if (this.load &&
        this.load.folders &&
        this.load.folders[name]) {
          newGuiParams.closed = this.load.folders[name].closed;
          newGuiParams.load = this.load.folders[name];
        }
        var gui = new GUI(newGuiParams);
        this.__folders[name] = gui;
        var li = addRow(this, gui.domElement);
        dom.addClass(li, 'folder');
        return gui;
      },
      removeFolder: function removeFolder(folder) {
        this.__ul.removeChild(folder.domElement.parentElement);
        delete this.__folders[folder.name];
        if (this.load &&
        this.load.folders &&
        this.load.folders[folder.name]) {
          delete this.load.folders[folder.name];
        }
        removeListeners(folder);
        var _this = this;
        Common.each(folder.__folders, function (subfolder) {
          folder.removeFolder(subfolder);
        });
        Common.defer(function () {
          _this.onResize();
        });
      },
      open: function open() {
        this.closed = false;
      },
      close: function close() {
        this.closed = true;
      },
      hide: function hide() {
        this.domElement.style.display = 'none';
      },
      show: function show() {
        this.domElement.style.display = '';
      },
      onResize: function onResize() {
        var root = this.getRoot();
        if (root.scrollable) {
          var top = dom.getOffset(root.__ul).top;
          var h = 0;
          Common.each(root.__ul.childNodes, function (node) {
            if (!(root.autoPlace && node === root.__save_row)) {
              h += dom.getHeight(node);
            }
          });
          if (window.innerHeight - top - CLOSE_BUTTON_HEIGHT < h) {
            dom.addClass(root.domElement, GUI.CLASS_TOO_TALL);
            root.__ul.style.height = window.innerHeight - top - CLOSE_BUTTON_HEIGHT + 'px';
          } else {
            dom.removeClass(root.domElement, GUI.CLASS_TOO_TALL);
            root.__ul.style.height = 'auto';
          }
        }
        if (root.__resize_handle) {
          Common.defer(function () {
            root.__resize_handle.style.height = root.__ul.offsetHeight + 'px';
          });
        }
        if (root.__closeButton) {
          root.__closeButton.style.width = root.width + 'px';
        }
      },
      onResizeDebounced: Common.debounce(function () {
        this.onResize();
      }, 50),
      remember: function remember() {
        if (Common.isUndefined(SAVE_DIALOGUE)) {
          SAVE_DIALOGUE = new CenteredDiv();
          SAVE_DIALOGUE.domElement.innerHTML = saveDialogContents;
        }
        if (this.parent) {
          throw new Error('You can only call remember on a top level GUI.');
        }
        var _this = this;
        Common.each(Array.prototype.slice.call(arguments), function (object) {
          if (_this.__rememberedObjects.length === 0) {
            addSaveMenu(_this);
          }
          if (_this.__rememberedObjects.indexOf(object) === -1) {
            _this.__rememberedObjects.push(object);
          }
        });
        if (this.autoPlace) {
          setWidth(this, this.width);
        }
      },
      getRoot: function getRoot() {
        var gui = this;
        while (gui.parent) {
          gui = gui.parent;
        }
        return gui;
      },
      getSaveObject: function getSaveObject() {
        var toReturn = this.load;
        toReturn.closed = this.closed;
        if (this.__rememberedObjects.length > 0) {
          toReturn.preset = this.preset;
          if (!toReturn.remembered) {
            toReturn.remembered = {};
          }
          toReturn.remembered[this.preset] = getCurrentPreset(this);
        }
        toReturn.folders = {};
        Common.each(this.__folders, function (element, key) {
          toReturn.folders[key] = element.getSaveObject();
        });
        return toReturn;
      },
      save: function save() {
        if (!this.load.remembered) {
          this.load.remembered = {};
        }
        this.load.remembered[this.preset] = getCurrentPreset(this);
        markPresetModified(this, false);
        this.saveToLocalStorageIfPossible();
      },
      saveAs: function saveAs(presetName) {
        if (!this.load.remembered) {
          this.load.remembered = {};
          this.load.remembered[DEFAULT_DEFAULT_PRESET_NAME] = getCurrentPreset(this, true);
        }
        this.load.remembered[presetName] = getCurrentPreset(this);
        this.preset = presetName;
        addPresetOption(this, presetName, true);
        this.saveToLocalStorageIfPossible();
      },
      revert: function revert(gui) {
        Common.each(this.__controllers, function (controller) {
          if (!this.getRoot().load.remembered) {
            controller.setValue(controller.initialValue);
          } else {
            recallSavedValue(gui || this.getRoot(), controller);
          }
          if (controller.__onFinishChange) {
            controller.__onFinishChange.call(controller, controller.getValue());
          }
        }, this);
        Common.each(this.__folders, function (folder) {
          folder.revert(folder);
        });
        if (!gui) {
          markPresetModified(this.getRoot(), false);
        }
      },
      listen: function listen(controller) {
        var init = this.__listening.length === 0;
        this.__listening.push(controller);
        if (init) {
          updateDisplays(this.__listening);
        }
      },
      updateDisplay: function updateDisplay() {
        Common.each(this.__controllers, function (controller) {
          controller.updateDisplay();
        });
        Common.each(this.__folders, function (folder) {
          folder.updateDisplay();
        });
      }
    });
    function addRow(gui, newDom, liBefore) {
      var li = document.createElement('li');
      if (newDom) {
        li.appendChild(newDom);
      }
      if (liBefore) {
        gui.__ul.insertBefore(li, liBefore);
      } else {
        gui.__ul.appendChild(li);
      }
      gui.onResize();
      return li;
    }
    function removeListeners(gui) {
      dom.unbind(window, 'resize', gui.__resizeHandler);
      if (gui.saveToLocalStorageIfPossible) {
        dom.unbind(window, 'unload', gui.saveToLocalStorageIfPossible);
      }
    }
    function markPresetModified(gui, modified) {
      var opt = gui.__preset_select[gui.__preset_select.selectedIndex];
      if (modified) {
        opt.innerHTML = opt.value + '*';
      } else {
        opt.innerHTML = opt.value;
      }
    }
    function augmentController(gui, li, controller) {
      controller.__li = li;
      controller.__gui = gui;
      Common.extend(controller,                                   {
        options: function options(_options) {
          if (arguments.length > 1) {
            var nextSibling = controller.__li.nextElementSibling;
            controller.remove();
            return _add(gui, controller.object, controller.property, {
              before: nextSibling,
              factoryArgs: [Common.toArray(arguments)]
            });
          }
          if (Common.isArray(_options) || Common.isObject(_options)) {
            var _nextSibling = controller.__li.nextElementSibling;
            controller.remove();
            return _add(gui, controller.object, controller.property, {
              before: _nextSibling,
              factoryArgs: [_options]
            });
          }
        },
        name: function name(_name) {
          controller.__li.firstElementChild.firstElementChild.innerHTML = _name;
          return controller;
        },
        listen: function listen() {
          controller.__gui.listen(controller);
          return controller;
        },
        remove: function remove() {
          controller.__gui.remove(controller);
          return controller;
        }
      });
      if (controller instanceof NumberControllerSlider) {
        var box = new NumberControllerBox(controller.object, controller.property, { min: controller.__min, max: controller.__max, step: controller.__step });
        Common.each(['updateDisplay', 'onChange', 'onFinishChange', 'step', 'min', 'max'], function (method) {
          var pc = controller[method];
          var pb = box[method];
          controller[method] = box[method] = function () {
            var args = Array.prototype.slice.call(arguments);
            pb.apply(box, args);
            return pc.apply(controller, args);
          };
        });
        dom.addClass(li, 'has-slider');
        controller.domElement.insertBefore(box.domElement, controller.domElement.firstElementChild);
      } else if (controller instanceof NumberControllerBox) {
        var r = function r(returned) {
          if (Common.isNumber(controller.__min) && Common.isNumber(controller.__max)) {
            var oldName = controller.__li.firstElementChild.firstElementChild.innerHTML;
            var wasListening = controller.__gui.__listening.indexOf(controller) > -1;
            controller.remove();
            var newController = _add(gui, controller.object, controller.property, {
              before: controller.__li.nextElementSibling,
              factoryArgs: [controller.__min, controller.__max, controller.__step]
            });
            newController.name(oldName);
            if (wasListening) newController.listen();
            return newController;
          }
          return returned;
        };
        controller.min = Common.compose(r, controller.min);
        controller.max = Common.compose(r, controller.max);
      } else if (controller instanceof BooleanController) {
        dom.bind(li, 'click', function () {
          dom.fakeEvent(controller.__checkbox, 'click');
        });
        dom.bind(controller.__checkbox, 'click', function (e) {
          e.stopPropagation();
        });
      } else if (controller instanceof FunctionController) {
        dom.bind(li, 'click', function () {
          dom.fakeEvent(controller.__button, 'click');
        });
        dom.bind(li, 'mouseover', function () {
          dom.addClass(controller.__button, 'hover');
        });
        dom.bind(li, 'mouseout', function () {
          dom.removeClass(controller.__button, 'hover');
        });
      } else if (controller instanceof ColorController) {
        dom.addClass(li, 'color');
        controller.updateDisplay = Common.compose(function (val) {
          li.style.borderLeftColor = controller.__color.toString();
          return val;
        }, controller.updateDisplay);
        controller.updateDisplay();
      }
      controller.setValue = Common.compose(function (val) {
        if (gui.getRoot().__preset_select && controller.isModified()) {
          markPresetModified(gui.getRoot(), true);
        }
        return val;
      }, controller.setValue);
    }
    function recallSavedValue(gui, controller) {
      var root = gui.getRoot();
      var matchedIndex = root.__rememberedObjects.indexOf(controller.object);
      if (matchedIndex !== -1) {
        var controllerMap = root.__rememberedObjectIndecesToControllers[matchedIndex];
        if (controllerMap === undefined) {
          controllerMap = {};
          root.__rememberedObjectIndecesToControllers[matchedIndex] = controllerMap;
        }
        controllerMap[controller.property] = controller;
        if (root.load && root.load.remembered) {
          var presetMap = root.load.remembered;
          var preset = void 0;
          if (presetMap[gui.preset]) {
            preset = presetMap[gui.preset];
          } else if (presetMap[DEFAULT_DEFAULT_PRESET_NAME]) {
            preset = presetMap[DEFAULT_DEFAULT_PRESET_NAME];
          } else {
            return;
          }
          if (preset[matchedIndex] && preset[matchedIndex][controller.property] !== undefined) {
            var value = preset[matchedIndex][controller.property];
            controller.initialValue = value;
            controller.setValue(value);
          }
        }
      }
    }
    function _add(gui, object, property, params) {
      if (object[property] === undefined) {
        throw new Error('Object "' + object + '" has no property "' + property + '"');
      }
      var controller = void 0;
      if (params.color) {
        controller = new ColorController(object, property);
      } else {
        var factoryArgs = [object, property].concat(params.factoryArgs);
        controller = ControllerFactory.apply(gui, factoryArgs);
      }
      if (params.before instanceof Controller) {
        params.before = params.before.__li;
      }
      recallSavedValue(gui, controller);
      dom.addClass(controller.domElement, 'c');
      var name = document.createElement('span');
      dom.addClass(name, 'property-name');
      name.innerHTML = controller.property;
      var container = document.createElement('div');
      container.appendChild(name);
      container.appendChild(controller.domElement);
      var li = addRow(gui, container, params.before);
      dom.addClass(li, GUI.CLASS_CONTROLLER_ROW);
      if (controller instanceof ColorController) {
        dom.addClass(li, 'color');
      } else {
        dom.addClass(li, _typeof(controller.getValue()));
      }
      augmentController(gui, li, controller);
      gui.__controllers.push(controller);
      return controller;
    }
    function getLocalStorageHash(gui, key) {
      return document.location.href + '.' + key;
    }
    function addPresetOption(gui, name, setSelected) {
      var opt = document.createElement('option');
      opt.innerHTML = name;
      opt.value = name;
      gui.__preset_select.appendChild(opt);
      if (setSelected) {
        gui.__preset_select.selectedIndex = gui.__preset_select.length - 1;
      }
    }
    function showHideExplain(gui, explain) {
      explain.style.display = gui.useLocalStorage ? 'block' : 'none';
    }
    function addSaveMenu(gui) {
      var div = gui.__save_row = document.createElement('li');
      dom.addClass(gui.domElement, 'has-save');
      gui.__ul.insertBefore(div, gui.__ul.firstChild);
      dom.addClass(div, 'save-row');
      var gears = document.createElement('span');
      gears.innerHTML = '&nbsp;';
      dom.addClass(gears, 'button gears');
      var button = document.createElement('span');
      button.innerHTML = 'Save';
      dom.addClass(button, 'button');
      dom.addClass(button, 'save');
      var button2 = document.createElement('span');
      button2.innerHTML = 'New';
      dom.addClass(button2, 'button');
      dom.addClass(button2, 'save-as');
      var button3 = document.createElement('span');
      button3.innerHTML = 'Revert';
      dom.addClass(button3, 'button');
      dom.addClass(button3, 'revert');
      var select = gui.__preset_select = document.createElement('select');
      if (gui.load && gui.load.remembered) {
        Common.each(gui.load.remembered, function (value, key) {
          addPresetOption(gui, key, key === gui.preset);
        });
      } else {
        addPresetOption(gui, DEFAULT_DEFAULT_PRESET_NAME, false);
      }
      dom.bind(select, 'change', function () {
        for (var index = 0; index < gui.__preset_select.length; index++) {
          gui.__preset_select[index].innerHTML = gui.__preset_select[index].value;
        }
        gui.preset = this.value;
      });
      div.appendChild(select);
      div.appendChild(gears);
      div.appendChild(button);
      div.appendChild(button2);
      div.appendChild(button3);
      if (SUPPORTS_LOCAL_STORAGE) {
        var explain = document.getElementById('dg-local-explain');
        var localStorageCheckBox = document.getElementById('dg-local-storage');
        var saveLocally = document.getElementById('dg-save-locally');
        saveLocally.style.display = 'block';
        if (localStorage.getItem(getLocalStorageHash(gui, 'isLocal')) === 'true') {
          localStorageCheckBox.setAttribute('checked', 'checked');
        }
        showHideExplain(gui, explain);
        dom.bind(localStorageCheckBox, 'change', function () {
          gui.useLocalStorage = !gui.useLocalStorage;
          showHideExplain(gui, explain);
        });
      }
      var newConstructorTextArea = document.getElementById('dg-new-constructor');
      dom.bind(newConstructorTextArea, 'keydown', function (e) {
        if (e.metaKey && (e.which === 67 || e.keyCode === 67)) {
          SAVE_DIALOGUE.hide();
        }
      });
      dom.bind(gears, 'click', function () {
        newConstructorTextArea.innerHTML = JSON.stringify(gui.getSaveObject(), undefined, 2);
        SAVE_DIALOGUE.show();
        newConstructorTextArea.focus();
        newConstructorTextArea.select();
      });
      dom.bind(button, 'click', function () {
        gui.save();
      });
      dom.bind(button2, 'click', function () {
        var presetName = prompt('Enter a new preset name.');
        if (presetName) {
          gui.saveAs(presetName);
        }
      });
      dom.bind(button3, 'click', function () {
        gui.revert();
      });
    }
    function addResizeHandle(gui) {
      var pmouseX = void 0;
      gui.__resize_handle = document.createElement('div');
      Common.extend(gui.__resize_handle.style, {
        width: '6px',
        marginLeft: '-3px',
        height: '200px',
        cursor: 'ew-resize',
        position: 'absolute'
      });
      function drag(e) {
        e.preventDefault();
        gui.width += pmouseX - e.clientX;
        gui.onResize();
        pmouseX = e.clientX;
        return false;
      }
      function dragStop() {
        dom.removeClass(gui.__closeButton, GUI.CLASS_DRAG);
        dom.unbind(window, 'mousemove', drag);
        dom.unbind(window, 'mouseup', dragStop);
      }
      function dragStart(e) {
        e.preventDefault();
        pmouseX = e.clientX;
        dom.addClass(gui.__closeButton, GUI.CLASS_DRAG);
        dom.bind(window, 'mousemove', drag);
        dom.bind(window, 'mouseup', dragStop);
        return false;
      }
      dom.bind(gui.__resize_handle, 'mousedown', dragStart);
      dom.bind(gui.__closeButton, 'mousedown', dragStart);
      gui.domElement.insertBefore(gui.__resize_handle, gui.domElement.firstElementChild);
    }
    function setWidth(gui, w) {
      gui.domElement.style.width = w + 'px';
      if (gui.__save_row && gui.autoPlace) {
        gui.__save_row.style.width = w + 'px';
      }
      if (gui.__closeButton) {
        gui.__closeButton.style.width = w + 'px';
      }
    }
    function getCurrentPreset(gui, useInitialValues) {
      var toReturn = {};
      Common.each(gui.__rememberedObjects, function (val, index) {
        var savedValues = {};
        var controllerMap = gui.__rememberedObjectIndecesToControllers[index];
        Common.each(controllerMap, function (controller, property) {
          savedValues[property] = useInitialValues ? controller.initialValue : controller.getValue();
        });
        toReturn[index] = savedValues;
      });
      return toReturn;
    }
    function setPresetSelectIndex(gui) {
      for (var index = 0; index < gui.__preset_select.length; index++) {
        if (gui.__preset_select[index].value === gui.preset) {
          gui.__preset_select.selectedIndex = index;
        }
      }
    }
    function updateDisplays(controllerArray) {
      if (controllerArray.length !== 0) {
        requestAnimationFrame$1$1.call(window, function () {
          updateDisplays(controllerArray);
        });
      }
      Common.each(controllerArray, function (c) {
        c.updateDisplay();
      });
    }
    var GUI$1 = GUI;

    class Buffer {
        get() {
            return this.buffer;
        }
        destroy() {
            this.buffer.destroy();
        }
    }

    class IndexBuffer extends Buffer {
        constructor(device, typedArray) {
            super();
            this.device = device;
            this.itemsCount = typedArray.length;
            this.typedArray = typedArray;
            this.buffer = device.createBuffer({
                size: Math.ceil(typedArray.byteLength / 8) * 8,
                usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
                mappedAtCreation: true,
            });
            if (this.isInt16) {
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

    class VertexBuffer extends Buffer {
        constructor(device, bindPointIdx, typedArray, arrayStride = 4 * Float32Array.BYTES_PER_ELEMENT, usage = GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST, stepMode = 'vertex') {
            super();
            this.attributes = new Map();
            this.stepMode = 'vertex';
            this.device = device;
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
                attributes: Array.from(this.attributes).map(([key, vertexBuffer], i) => ({
                    offset: vertexBuffer.offset,
                    format: vertexBuffer.format,
                    shaderLocation: vertexIdx + i,
                })),
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

    class UniformBuffer extends Buffer {
        constructor(device, byteLength, usage = GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST) {
            super();
            this.device = device;
            this.byteLength = byteLength;
            this.buffer = device.createBuffer({
                size: byteLength,
                usage,
            });
        }
        write(byteOffset, data) {
            this.device.queue.writeBuffer(this.buffer, byteOffset, data);
        }
    }

    class BindGroup {
        constructor(device, bindingIndex = 0) {
            this.samplers = [];
            this.textures = [];
            this.uniformBlocks = [];
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
                    visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
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
            console.log('pipeline', { entries });
            this.bindGroup = this.device.createBindGroup({
                layout: pipeline.getBindGroupLayout(this.bindingIndex),
                entries,
            });
            return this;
        }
        destroy() {
            this.uniformBlocks.forEach((ubo) => ubo.destroy());
        }
    }

    class Sampler {
        constructor(device, name, bindingType = 'filtering', wglslSamplerType = 'sampler', samplerOptions = null) {
            this.device = device;
            this.name = name;
            this.bindingType = bindingType;
            this.wglslSamplerType = wglslSamplerType;
            this.sampler = device.createSampler(samplerOptions);
        }
        static parseGLFilterMode(filterMode) {
            // TODO
            return 'repeat';
        }
        static parseGLWrapMode(wrapMode) {
            // TODO
            return 'repeat';
        }
        get() {
            return this.sampler;
        }
    }

    class Texture {
        constructor(device, name, sampleType = 'float', viewDimension = '2d', wglslTextureType = 'texture_2d<f32>') {
            this.device = device;
            this.name = name;
            this.sampleType = sampleType;
            this.viewDimension = viewDimension;
            this.wglslTextureType = wglslTextureType;
        }
        get() {
            return this.texture;
        }
        fromImageBitmap(imageBitmap, format = 'rgba8unorm', usage = GPUTextureUsage.TEXTURE_BINDING |
            GPUTextureUsage.COPY_DST |
            GPUTextureUsage.RENDER_ATTACHMENT) {
            this.texture = this.device.createTexture({
                size: [imageBitmap.width, imageBitmap.height, 1],
                format,
                usage,
            });
            this.device.queue.copyExternalImageToTexture({ source: imageBitmap }, { texture: this.texture }, [imageBitmap.width, imageBitmap.height]);
            return this;
        }
        fromDefinition(descriptor) {
            this.texture = this.device.createTexture(descriptor);
            return this;
        }
        copyFromTexture(commandEncoder, source, copySize) {
            commandEncoder.copyTextureToTexture(source, {
                texture: this.texture,
            }, copySize);
            return this;
        }
        destroy() {
            this.texture.destroy();
        }
    }

    class Shader {
        constructor(device, stage) {
            this.source = ``;
            this.device = device;
            this.stage = stage;
            if (stage === GPUShaderStage.VERTEX) {
                this.source += `${Shader.TRANSFORM_UBO_SNIPPET}`;
            }
        }
        // TODO add all cases in a Map
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
        addUniformInputs(uniforms) {
            this.source += `
      [[block]] struct UniformsInput {
        ${Object.entries(uniforms).reduce((acc, [key, { type }]) => {
            acc += `${key}: ${type};`;
            return acc;
        }, '')}
      };

      [[group(0), binding(1)]] var<uniform> inputUBO: UniformsInput;
    `;
            return this;
        }
        addInputs(inputs) {
            let bindIdx = 0;
            let inputDefinitions = '';
            for (const [key, { builtIn = false, shaderName, format }] of Object.entries(inputs)) {
                const inputFormat = Shader.getVertexInputFormat(format);
                if (builtIn) {
                    if (!shaderName) {
                        console.error('built in inputs require explicit shaderName!');
                    }
                    inputDefinitions += `[[builtin(${key})]] ${shaderName}: ${inputFormat};\n`;
                }
                else {
                    inputDefinitions += `[[location(${bindIdx})]] ${key}: ${inputFormat};\n`;
                    bindIdx++;
                }
            }
            this.source += `
      struct Input {
        ${inputDefinitions}
      };
    `;
            return this;
        }
        addOutputs(outputs = {}) {
            // for fragment shaders bind point 0 is reserved for output color
            let bindIdx = this.stage === GPUShaderStage.FRAGMENT ? 1 : 0;
            let outputDefinitions = '';
            for (const [key, { format }] of Object.entries(outputs)) {
                const inputFormat = Shader.getVertexInputFormat(format);
                outputDefinitions += `[[location(${bindIdx})]] ${key}: ${inputFormat};\n`;
                bindIdx++;
            }
            this.source += `
      struct Output {
        ${this.stage === GPUShaderStage.VERTEX
            ? '[[builtin(position)]] Position: vec4<f32>;'
            : '[[location(0)]] Color: vec4<f32>;'}
        ${outputDefinitions}
      };
    `;
            return this;
        }
        addTextureInputs(textureBindPoints) {
            this.source += textureBindPoints.reduce((acc, { bindIdx, name, type }) => acc +
                `
          [[group(0), binding(${bindIdx})]] var ${name}: ${type};
        `, '');
        }
        addSamplerInputs(samplerBindPoints) {
            this.source += samplerBindPoints.reduce((acc, { bindIdx, name, type }) => acc +
                `
          [[group(0), binding(${bindIdx})]] var ${name}: ${type};
          `, '');
            return this;
        }
        addHeadSnippet(shaderSnippet) {
            if (shaderSnippet) {
                this.source += shaderSnippet;
            }
            return this;
        }
        addMainFnSnippet(shaderSnippet) {
            if (!shaderSnippet) {
                throw new Error('Shader must have a main fn block');
            }
            if (this.stage === GPUShaderStage.VERTEX) {
                this.source += `
        [[stage(vertex)]] fn main (input: Input) -> Output {
          var output: Output;
          ${shaderSnippet}
          return output;
        }
      `;
            }
            else if (this.stage === GPUShaderStage.FRAGMENT) {
                this.source += `
          [[stage(fragment)]] fn main (input: Input) -> Output {
            var output: Output;
            ${shaderSnippet}
            return output;
          }
        `;
            }
            return this;
        }
    }
    Shader.ENTRY_FUNCTION = 'main';
    Shader.TRANSFORM_UBO_SNIPPET = `
    [[block]] struct Transform {
      projectionMatrix: mat4x4<f32>;
      viewMatrix: mat4x4<f32>;
      modelMatrix: mat4x4<f32>;
      normalMatrix: mat4x4<f32>;
    };

    [[group(0), binding(0)]] var<uniform> transform: Transform;
  `;

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
        ['f32', [4, Float32Array.BYTES_PER_ELEMENT]],
        ['i32', [4, Int32Array.BYTES_PER_ELEMENT]],
        ['u32', [4, Uint32Array.BYTES_PER_ELEMENT]],
        ['i16', [2, Int16Array.BYTES_PER_ELEMENT]],
        ['u16', [2, Uint16Array.BYTES_PER_ELEMENT]],
    ]);

    class Geometry {
        constructor(device) {
            this.vertexCount = 0;
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
                renderPass.drawIndexed(this.vertexCount);
            }
            else {
                renderPass.draw(this.vertexCount);
            }
        }
        destroy() {
            var _a;
            (_a = this.indexBuffer) === null || _a === void 0 ? void 0 : _a.destroy();
            this.vertexBuffers.forEach((buffer) => buffer.destroy());
        }
    }

    const CUBE_SIDE_FRONT = 'front';
    const CUBE_SIDE_BACK = 'back';
    const CUBE_SIDE_TOP = 'top';
    const CUBE_SIDE_BOTTOM = 'bottom';
    const CUBE_SIDE_LEFT = 'left';
    const CUBE_SIDE_RIGHT = 'right';

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
     * Generates a perspective projection matrix with the given bounds.
     * Passing null/undefined/no value for far will generate infinite projection matrix.
     *
     * @param {mat4} out mat4 frustum matrix will be written into
     * @param {number} fovy Vertical field of view in radians
     * @param {number} aspect Aspect ratio. typically viewport width/height
     * @param {number} near Near bound of the frustum
     * @param {number} far Far bound of the frustum, can be null or Infinity
     * @returns {mat4} out
     */

    function perspective(out, fovy, aspect, near, far) {
      var f = 1.0 / Math.tan(fovy / 2),
          nf;
      out[0] = f / aspect;
      out[1] = 0;
      out[2] = 0;
      out[3] = 0;
      out[4] = 0;
      out[5] = f;
      out[6] = 0;
      out[7] = 0;
      out[8] = 0;
      out[9] = 0;
      out[11] = -1;
      out[12] = 0;
      out[13] = 0;
      out[15] = 0;

      if (far != null && far !== Infinity) {
        nf = 1 / (near - far);
        out[10] = (far + near) * nf;
        out[14] = 2 * far * near * nf;
      } else {
        out[10] = -1;
        out[14] = -2 * near;
      }

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
     * Adds two vec3's
     *
     * @param {vec3} out the receiving vector
     * @param {ReadonlyVec3} a the first operand
     * @param {ReadonlyVec3} b the second operand
     * @returns {vec3} out
     */

    function add(out, a, b) {
      out[0] = a[0] + b[0];
      out[1] = a[1] + b[1];
      out[2] = a[2] + b[2];
      return out;
    }
    /**
     * Subtracts vector b from vector a
     *
     * @param {vec3} out the receiving vector
     * @param {ReadonlyVec3} a the first operand
     * @param {ReadonlyVec3} b the second operand
     * @returns {vec3} out
     */

    function subtract(out, a, b) {
      out[0] = a[0] - b[0];
      out[1] = a[1] - b[1];
      out[2] = a[2] - b[2];
      return out;
    }
    /**
     * Scales a vec3 by a scalar number
     *
     * @param {vec3} out the receiving vector
     * @param {ReadonlyVec3} a the vector to scale
     * @param {Number} b amount to scale the vector by
     * @returns {vec3} out
     */

    function scale(out, a, b) {
      out[0] = a[0] * b;
      out[1] = a[1] * b;
      out[2] = a[2] * b;
      return out;
    }
    /**
     * Normalize a vec3
     *
     * @param {vec3} out the receiving vector
     * @param {ReadonlyVec3} a vector to normalize
     * @returns {vec3} out
     */

    function normalize(out, a) {
      var x = a[0];
      var y = a[1];
      var z = a[2];
      var len = x * x + y * y + z * z;

      if (len > 0) {
        //TODO: evaluate use of glm_invsqrt here?
        len = 1 / Math.sqrt(len);
      }

      out[0] = a[0] * len;
      out[1] = a[1] * len;
      out[2] = a[2] * len;
      return out;
    }
    /**
     * Computes the cross product of two vec3's
     *
     * @param {vec3} out the receiving vector
     * @param {ReadonlyVec3} a the first operand
     * @param {ReadonlyVec3} b the second operand
     * @returns {vec3} out
     */

    function cross(out, a, b) {
      var ax = a[0],
          ay = a[1],
          az = a[2];
      var bx = b[0],
          by = b[1],
          bz = b[2];
      out[0] = ay * bz - az * by;
      out[1] = az * bx - ax * bz;
      out[2] = ax * by - ay * bx;
      return out;
    }
    /**
     * Alias for {@link vec3.subtract}
     * @function
     */

    var sub = subtract;
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

    /**
     * Clamp number to a given range
     * @param {number} num
     * @param {number} min
     * @param {number} max
     * @returns {number}
     */
    const clamp = (num, min, max) => Math.min(Math.max(num, min), max);
    /**
     * Normalizes a number
     * @param {number} min
     * @param {number} max
     * @param {number} val
     * @returns {number}
     */
    const normalizeNumber = (min, max, val) => (val - min) / (max - min);
    /**
     *
     * @param {number} t
     * @returns {number}
     */
    const triangleWave = (t) => {
        t -= Math.floor(t * 0.5) * 2;
        t = Math.min(Math.max(t, 0), 2);
        return 1 - Math.abs(t - 1);
    };

    class DampedAction {
        constructor() {
            this.value = 0.0;
            this.damping = 0.5;
        }
        addForce(force) {
            this.value += force;
        }
        /** updates the damping and calls {@link damped-callback}. */
        update() {
            const isActive = this.value * this.value > 0.000001;
            if (isActive) {
                this.value *= this.damping;
            }
            else {
                this.stop();
            }
            return this.value;
        }
        /** stops the damping. */
        stop() {
            this.value = 0.0;
        }
    }
    class CameraController {
        constructor(camera, domElement = document.body, isDebug = false, mouseWheelForce = 1) {
            this.target = create$1();
            this.minDistance = 0;
            this.maxDistance = Infinity;
            this.isEnabled = true;
            this.targetXDampedAction = new DampedAction();
            this.targetYDampedAction = new DampedAction();
            this.targetZDampedAction = new DampedAction();
            this.targetThetaDampedAction = new DampedAction();
            this.targetPhiDampedAction = new DampedAction();
            this.targetRadiusDampedAction = new DampedAction();
            this._isShiftDown = false;
            this._rotateStart = {
                x: 9999,
                y: 9999,
            };
            this._rotateEnd = {
                x: 9999,
                y: 9999,
            };
            this._roatteDelta = {
                x: 9999,
                y: 9999,
            };
            this._zoomDistanceEnd = 0;
            this._zoomDistance = 0;
            this.state = '';
            this.loopId = 0;
            this._panStart = { x: 0, y: 0 };
            this._panDelta = { x: 0, y: 0 };
            this._panEnd = { x: 0, y: 0 };
            this._paused = false;
            this._isDebug = false;
            this.mouseWheelForce = 1;
            this.mouseWheelForce = mouseWheelForce;
            if (!camera) {
                console.error('camera is undefined');
            }
            this.camera = camera;
            this.domElement = domElement;
            // Set to true to enable damping (inertia)
            // If damping is enabled, you must call controls.update() in your animation loop
            this.isDamping = false;
            this.dampingFactor = 0.25;
            // This option actually enables dollying in and out; left as "zoom" for backwards compatibility.
            // Set to false to disable zooming
            this.isZoom = true;
            this.zoomSpeed = 1.0;
            // Set to false to disable rotating
            this.isRotate = true;
            this.rotateSpeed = 1.0;
            // Set to false to disable panning
            this.isPan = true;
            this.keyPanSpeed = 7.0; // pixels moved per arrow key push
            // Set to false to disable use of the keys
            this.enableKeys = true;
            // The four arrow keys
            this.keys = {
                LEFT: '37',
                UP: '38',
                RIGHT: '39',
                BOTTOM: '40',
                SHIFT: '16',
            };
            // for reset
            this.originTarget = create$1();
            this.originPosition = create$1();
            this.originPosition[0] = camera.position[0];
            this.originPosition[1] = camera.position[0];
            this.originPosition[2] = camera.position[0];
            const dX = this.camera.position[0];
            const dY = this.camera.position[1];
            const dZ = this.camera.position[2];
            const radius = Math.sqrt(dX * dX + dY * dY + dZ * dZ);
            const theta = Math.atan2(this.camera.position[0], this.camera.position[2]); // equator angle around y-up axis
            const phi = Math.acos(clamp(this.camera.position[1] / radius, -1, 1)); // polar angle
            this._spherical = {
                radius: radius,
                theta: theta,
                phi: phi,
            };
            this._bindEvens();
            this.setEventHandler();
            this.startTick();
            this._isDebug = isDebug;
            if (isDebug) {
                this._outputEl = document.createElement('div');
                this._outputEl.setAttribute('style', `
      position: fixed;
      bottom: 24px;
      left: 24px;
      z-index: 999;
      font-family: monospace;
      font-size: 14px;
      user-select: none;
      background: rgba(255, 255, 255, 0.7);
      border-radius: 4px;
      padding: 3px 6px;
    `);
                document.body.appendChild(this._outputEl);
            }
        }
        lookAt([x, y, z]) {
            set(this.target, x, y, z);
            return this;
        }
        setEventHandler() {
            this.domElement.addEventListener('contextmenu', this._contextMenuHandler, false);
            this.domElement.addEventListener('mousedown', this._mouseDownHandler, false);
            this.domElement.addEventListener('wheel', this._mouseWheelHandler, false);
            this.domElement.addEventListener('touchstart', this._touchStartHandler, false);
            this.domElement.addEventListener('touchmove', this._touchMoveHandler, false);
            window.addEventListener('keydown', this._onKeyDownHandler, false);
            window.addEventListener('keyup', this._onKeyUpHandler, false);
        }
        removeEventHandler() {
            this.domElement.removeEventListener('contextmenu', this._contextMenuHandler, false);
            this.domElement.removeEventListener('mousedown', this._mouseDownHandler, false);
            this.domElement.removeEventListener('wheel', this._mouseWheelHandler, false);
            this.domElement.removeEventListener('mousemove', this._mouseMoveHandler, false);
            window.removeEventListener('mouseup', this._mouseUpHandler, false);
            this.domElement.removeEventListener('touchstart', this._touchStartHandler, false);
            this.domElement.removeEventListener('touchmove', this._touchMoveHandler, false);
            window.removeEventListener('keydown', this._onKeyDownHandler, false);
            window.removeEventListener('keydown', this._onKeyUpHandler, false);
        }
        startTick() {
            this.loopId = requestAnimationFrame(this.tick);
        }
        pause() {
            this._paused = true;
        }
        start() {
            this._paused = false;
        }
        tick() {
            if (!this._paused) {
                this.updateDampedAction();
                this.updateCamera();
                if (this._isDebug) {
                    const cameraX = Math.round(this.camera.position[0] * 100) / 100;
                    const cameraY = Math.round(this.camera.position[1] * 100) / 100;
                    const cameraZ = Math.round(this.camera.position[2] * 100) / 100;
                    this._outputEl.textContent = `x: ${cameraX} y: ${cameraY} z: ${cameraZ}`;
                }
            }
            this.loopId = requestAnimationFrame(this.tick);
        }
        updateDampedAction() {
            this.target[0] += this.targetXDampedAction.update();
            this.target[1] += this.targetYDampedAction.update();
            this.target[2] += this.targetZDampedAction.update();
            this._spherical.theta += this.targetThetaDampedAction.update();
            this._spherical.phi += this.targetPhiDampedAction.update();
            this._spherical.radius += this.targetRadiusDampedAction.update();
        }
        updateCamera() {
            const s = this._spherical;
            const sinPhiRadius = Math.sin(s.phi) * s.radius;
            this.camera.position[0] = sinPhiRadius * Math.sin(s.theta) + this.target[0];
            this.camera.position[1] = Math.cos(s.phi) * s.radius + this.target[1];
            this.camera.position[2] = sinPhiRadius * Math.cos(s.theta) + this.target[2];
            // console.log(this.camera.position);
            // console.log(this.target);
            this.camera.lookAtPosition[0] = this.target[0];
            this.camera.lookAtPosition[1] = this.target[1];
            this.camera.lookAtPosition[2] = this.target[2];
            this.camera.updateViewMatrix();
        }
        _bindEvens() {
            this.tick = this.tick.bind(this);
            this._contextMenuHandler = this._contextMenuHandler.bind(this);
            this._mouseDownHandler = this._mouseDownHandler.bind(this);
            this._mouseWheelHandler = this._mouseWheelHandler.bind(this);
            this._mouseMoveHandler = this._mouseMoveHandler.bind(this);
            this._mouseUpHandler = this._mouseUpHandler.bind(this);
            this._touchStartHandler = this._touchStartHandler.bind(this);
            this._touchMoveHandler = this._touchMoveHandler.bind(this);
            this._onKeyDownHandler = this._onKeyDownHandler.bind(this);
            this._onKeyUpHandler = this._onKeyUpHandler.bind(this);
        }
        _contextMenuHandler(event) {
            if (!this.isEnabled)
                return;
            event.preventDefault();
        }
        _mouseDownHandler(event) {
            if (!this.isEnabled)
                return;
            if (event.button === 0) {
                this.state = 'rotate';
                this._rotateStart = {
                    x: event.clientX,
                    y: event.clientY,
                };
            }
            else {
                this.state = 'pan';
                this._panStart = {
                    x: event.clientX,
                    y: event.clientY,
                };
            }
            this.domElement.addEventListener('mousemove', this._mouseMoveHandler, false);
            window.addEventListener('mouseup', this._mouseUpHandler, false);
        }
        _mouseUpHandler() {
            this.domElement.removeEventListener('mousemove', this._mouseMoveHandler, false);
            window.removeEventListener('mouseup', this._mouseUpHandler, false);
        }
        _mouseMoveHandler(event) {
            if (!this.isEnabled)
                return;
            if (this.state === 'rotate') {
                this._rotateEnd = {
                    x: event.clientX,
                    y: event.clientY,
                };
                this._roatteDelta = {
                    x: this._rotateEnd.x - this._rotateStart.x,
                    y: this._rotateEnd.y - this._rotateStart.y,
                };
                this._updateRotateHandler();
                this._rotateStart = {
                    x: this._rotateEnd.x,
                    y: this._rotateEnd.y,
                };
            }
            else if (this.state === 'pan') {
                this._panEnd = {
                    x: event.clientX,
                    y: event.clientY,
                };
                this._panDelta = {
                    x: -0.5 * (this._panEnd.x - this._panStart.x),
                    y: 0.5 * (this._panEnd.y - this._panStart.y),
                };
                this._updatePanHandler();
                this._panStart = {
                    x: this._panEnd.x,
                    y: this._panEnd.y,
                };
            }
            // this.update();
        }
        _mouseWheelHandler(event) {
            const force = this.mouseWheelForce;
            if (event.deltaY > 0) {
                this.targetRadiusDampedAction.addForce(force);
            }
            else {
                this.targetRadiusDampedAction.addForce(-force);
            }
        }
        _touchStartHandler(event) {
            let dX;
            let dY;
            switch (event.touches.length) {
                case 1:
                    this.state = 'rotate';
                    this._rotateStart = {
                        x: event.touches[0].clientX,
                        y: event.touches[0].clientY,
                    };
                    break;
                case 2:
                    this.state = 'zoom';
                    dX = event.touches[1].clientX - event.touches[0].clientX;
                    dY = event.touches[1].clientY - event.touches[0].clientY;
                    this._zoomDistance = Math.sqrt(dX * dX + dY * dY);
                    break;
                case 3:
                    this.state = 'pan';
                    this._panStart = {
                        x: (event.touches[0].clientX +
                            event.touches[1].clientX +
                            event.touches[2].clientX) /
                            3,
                        y: (event.touches[0].clientY +
                            event.touches[1].clientY +
                            event.touches[2].clientY) /
                            3,
                    };
                    break;
            }
        }
        _touchMoveHandler(event) {
            let dX;
            let dY;
            let dDis;
            event.preventDefault();
            switch (event.touches.length) {
                case 1:
                    if (this.state !== 'rotate')
                        return;
                    this._rotateEnd = {
                        x: event.touches[0].clientX,
                        y: event.touches[0].clientY,
                    };
                    this._roatteDelta = {
                        x: (this._rotateEnd.x - this._rotateStart.x) * 0.5,
                        y: (this._rotateEnd.y - this._rotateStart.y) * 0.5,
                    };
                    this._updateRotateHandler();
                    this._rotateStart = {
                        x: this._rotateEnd.x,
                        y: this._rotateEnd.y,
                    };
                    break;
                case 2:
                    if (this.state !== 'zoom')
                        return;
                    dX = event.touches[1].clientX - event.touches[0].clientX;
                    dY = event.touches[1].clientY - event.touches[0].clientY;
                    this._zoomDistanceEnd = Math.sqrt(dX * dX + dY * dY);
                    dDis = this._zoomDistanceEnd - this._zoomDistance;
                    dDis *= 1.5;
                    // eslint-disable-next-line no-case-declarations
                    let targetRadius = this._spherical.radius - dDis;
                    targetRadius = clamp(targetRadius, this.minDistance, this.maxDistance);
                    this._zoomDistance = this._zoomDistanceEnd;
                    this._spherical.radius = targetRadius;
                    break;
                case 3:
                    this._panEnd = {
                        x: (event.touches[0].clientX +
                            event.touches[1].clientX +
                            event.touches[2].clientX) /
                            3,
                        y: (event.touches[0].clientY +
                            event.touches[1].clientY +
                            event.touches[2].clientY) /
                            3,
                    };
                    this._panDelta = {
                        x: this._panEnd.x - this._panStart.x,
                        y: this._panEnd.y - this._panStart.y,
                    };
                    this._panDelta.x *= -1;
                    this._updatePanHandler();
                    this._panStart = {
                        x: this._panEnd.x,
                        y: this._panEnd.y,
                    };
                    break;
            }
            // this.update();
        }
        _onKeyDownHandler(event) {
            let dX = 0;
            let dY = 0;
            switch (event.key) {
                case this.keys.SHIFT:
                    this._isShiftDown = true;
                    break;
                case this.keys.LEFT:
                    dX = -10;
                    break;
                case this.keys.RIGHT:
                    dX = 10;
                    break;
                case this.keys.UP:
                    dY = 10;
                    break;
                case this.keys.BOTTOM:
                    dY = -10;
                    break;
            }
            if (!this._isShiftDown) {
                this._panDelta = {
                    x: dX,
                    y: dY,
                };
                this._updatePanHandler();
            }
            else {
                this._roatteDelta = {
                    x: -dX,
                    y: dY,
                };
                this._updateRotateHandler();
            }
        }
        _onKeyUpHandler(event) {
            switch (event.key) {
                case this.keys.SHIFT:
                    this._isShiftDown = false;
                    break;
            }
        }
        _updatePanHandler() {
            const xDir = create$1();
            const yDir = create$1();
            const zDir = create$1();
            zDir[0] = this.target[0] - this.camera.position[0];
            zDir[1] = this.target[1] - this.camera.position[1];
            zDir[2] = this.target[2] - this.camera.position[2];
            normalize(zDir, zDir);
            cross(xDir, zDir, [0, 1, 0]);
            cross(yDir, xDir, zDir);
            const scale = Math.max(this._spherical.radius / 2000, 0.001);
            this.targetXDampedAction.addForce((xDir[0] * this._panDelta.x + yDir[0] * this._panDelta.y) * scale);
            this.targetYDampedAction.addForce((xDir[1] * this._panDelta.x + yDir[1] * this._panDelta.y) * scale);
            this.targetZDampedAction.addForce((xDir[2] * this._panDelta.x + yDir[2] * this._panDelta.y) * scale);
        }
        _updateRotateHandler() {
            this.targetThetaDampedAction.addForce(-this._roatteDelta.x / this.domElement.clientWidth);
            this.targetPhiDampedAction.addForce(-this._roatteDelta.y / this.domElement.clientHeight);
        }
    }

    class PerspectiveCamera {
        constructor(fieldOfView, aspect, near, far) {
            this.position = [0, 0, 0];
            this.lookAtPosition = [0, 0, 0];
            this.projectionMatrix = create$2();
            this.viewMatrix = create$2();
            this.zoom = 1;
            this.fieldOfView = fieldOfView;
            this.aspect = aspect;
            this.near = near;
            this.far = far;
            this.updateProjectionMatrix();
        }
        setPosition({ x = this.position[0], y = this.position[1], z = this.position[2], }) {
            this.position = [x, y, z];
            return this;
        }
        updateViewMatrix() {
            lookAt(this.viewMatrix, this.position, this.lookAtPosition, PerspectiveCamera.UP_VECTOR);
            return this;
        }
        updateProjectionMatrix() {
            perspective(this.projectionMatrix, this.fieldOfView, this.aspect, this.near, this.far);
            return this;
        }
        lookAt(target) {
            this.lookAtPosition = target;
            this.updateViewMatrix();
            return this;
        }
    }
    PerspectiveCamera.UP_VECTOR = [0, 1, 0];

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
     * @private
     */
    function buildPlane(vertices, normal, uv, indices, width, height, depth, wSegs, hSegs, u = 0, v = 1, w = 2, uDir = 1, vDir = -1, i = 0, ii = 0) {
        const io = i;
        const segW = width / wSegs;
        const segH = height / hSegs;
        for (let iy = 0; iy <= hSegs; iy++) {
            const y = iy * segH - height / 2;
            for (let ix = 0; ix <= wSegs; ix++, i++) {
                const x = ix * segW - width / 2;
                vertices[i * 3 + u] = x * uDir;
                vertices[i * 3 + v] = y * vDir;
                vertices[i * 3 + w] = depth / 2;
                normal[i * 3 + u] = 0;
                normal[i * 3 + v] = 0;
                normal[i * 3 + w] = depth >= 0 ? 1 : -1;
                uv[i * 2] = ix / wSegs;
                uv[i * 2 + 1] = 1 - iy / hSegs;
                if (iy === hSegs || ix === wSegs)
                    continue;
                const a = io + ix + iy * (wSegs + 1);
                const b = io + ix + (iy + 1) * (wSegs + 1);
                const c = io + ix + (iy + 1) * (wSegs + 1) + 1;
                const d = io + ix + iy * (wSegs + 1) + 1;
                indices[ii * 6] = a;
                indices[ii * 6 + 1] = b;
                indices[ii * 6 + 2] = d;
                indices[ii * 6 + 3] = b;
                indices[ii * 6 + 4] = c;
                indices[ii * 6 + 5] = d;
                ii++;
            }
        }
    }

    /**
     * Generates geometry data for a box
     * @param {Box} params
     * @returns {{ vertices, normal, uv, indices }}
     */
    function createBox(params = {}) {
        const { width = 1, height = 1, depth = 1, widthSegments = 1, heightSegments = 1, depthSegments = 1, } = params;
        const wSegs = widthSegments;
        const hSegs = heightSegments;
        const dSegs = depthSegments;
        const num = (wSegs + 1) * (hSegs + 1) * 2 +
            (wSegs + 1) * (dSegs + 1) * 2 +
            (hSegs + 1) * (dSegs + 1) * 2;
        const numIndices = (wSegs * hSegs * 2 + wSegs * dSegs * 2 + hSegs * dSegs * 2) * 6;
        const vertices = new Float32Array(num * 3);
        const normal = new Float32Array(num * 3);
        const uv = new Float32Array(num * 2);
        const indices = num > 65536 ? new Uint32Array(numIndices) : new Uint16Array(numIndices);
        let i = 0;
        let ii = 0;
        {
            // RIGHT
            buildPlane(vertices, normal, uv, indices, depth, height, width, dSegs, hSegs, 2, 1, 0, -1, -1, i, ii);
        }
        {
            // LEFT
            buildPlane(vertices, normal, uv, indices, depth, height, -width, dSegs, hSegs, 2, 1, 0, 1, -1, (i += (dSegs + 1) * (hSegs + 1)), (ii += dSegs * hSegs));
        }
        {
            // TOP
            buildPlane(vertices, normal, uv, indices, width, depth, height, dSegs, hSegs, 0, 2, 1, 1, 1, (i += (dSegs + 1) * (hSegs + 1)), (ii += dSegs * hSegs));
        }
        {
            // BOTTOM
            buildPlane(vertices, normal, uv, indices, width, depth, -height, dSegs, hSegs, 0, 2, 1, 1, -1, (i += (wSegs + 1) * (dSegs + 1)), (ii += wSegs * dSegs));
        }
        {
            // BACK
            buildPlane(vertices, normal, uv, indices, width, height, -depth, wSegs, hSegs, 0, 1, 2, -1, -1, (i += (wSegs + 1) * (dSegs + 1)), (ii += wSegs * dSegs));
        }
        {
            // FRONT
            buildPlane(vertices, normal, uv, indices, width, height, depth, wSegs, hSegs, 0, 1, 2, 1, -1, (i += (wSegs + 1) * (hSegs + 1)), (ii += wSegs * hSegs));
        }
        return {
            vertices,
            normal,
            uv,
            indices,
        };
    }

    /**
     * Generates geometry data for a box
     * @param {Box} params
     * @returns {[{ vertices, normal, uv, indices, orientation }]}
     */
    function createBoxSeparateFace(params = {}) {
        const { width = 1, height = 1, depth = 1, widthSegments = 1, heightSegments = 1, depthSegments = 1, } = params;
        const wSegs = widthSegments;
        const hSegs = heightSegments;
        const dSegs = depthSegments;
        const sidesData = [];
        const i = 0;
        const ii = 0;
        {
            // RIGHT
            const num = (dSegs + 1) * (hSegs + 1);
            const numIndices = dSegs * hSegs * 6;
            const vertices = new Float32Array(num * 3);
            const normal = new Float32Array(num * 3);
            const uv = new Float32Array(num * 2);
            const indices = num > 65536 ? new Uint32Array(numIndices) : new Uint16Array(numIndices);
            buildPlane(vertices, normal, uv, indices, depth, height, width, dSegs, hSegs, 2, 1, 0, -1, -1, i, ii);
            sidesData.push({
                orientation: CUBE_SIDE_RIGHT,
                vertices,
                normal,
                uv,
                indices,
            });
        }
        {
            // LEFT
            const num = (dSegs + 1) * (hSegs + 1);
            const numIndices = dSegs * hSegs * 6;
            const vertices = new Float32Array(num * 3);
            const normal = new Float32Array(num * 3);
            const uv = new Float32Array(num * 2);
            const indices = num > 65536 ? new Uint32Array(numIndices) : new Uint16Array(numIndices);
            buildPlane(vertices, normal, uv, indices, depth, height, -width, dSegs, hSegs, 2, 1, 0, 1, -1, i, ii);
            sidesData.push({
                orientation: CUBE_SIDE_LEFT,
                vertices,
                normal,
                uv,
                indices,
            });
        }
        {
            // TOP
            const num = (dSegs + 1) * (hSegs + 1);
            const numIndices = dSegs * hSegs * 6;
            const vertices = new Float32Array(num * 3);
            const normal = new Float32Array(num * 3);
            const uv = new Float32Array(num * 2);
            const indices = num > 65536 ? new Uint32Array(numIndices) : new Uint16Array(numIndices);
            buildPlane(vertices, normal, uv, indices, width, depth, height, dSegs, hSegs, 0, 2, 1, 1, 1, i, ii);
            sidesData.push({
                orientation: CUBE_SIDE_TOP,
                vertices,
                normal,
                uv,
                indices,
            });
        }
        {
            // BOTTOM
            const num = (dSegs + 1) * (hSegs + 1);
            const numIndices = dSegs * hSegs * 6;
            const vertices = new Float32Array(num * 3);
            const normal = new Float32Array(num * 3);
            const uv = new Float32Array(num * 2);
            const indices = num > 65536 ? new Uint32Array(numIndices) : new Uint16Array(numIndices);
            buildPlane(vertices, normal, uv, indices, width, depth, -height, dSegs, hSegs, 0, 2, 1, 1, -1, i, ii);
            sidesData.push({
                orientation: CUBE_SIDE_BOTTOM,
                vertices,
                normal,
                uv,
                indices,
            });
        }
        {
            // BACK
            const num = (wSegs + 1) * (dSegs + 1);
            const numIndices = wSegs * dSegs * 6;
            const vertices = new Float32Array(num * 3);
            const normal = new Float32Array(num * 3);
            const uv = new Float32Array(num * 2);
            const indices = num > 65536 ? new Uint32Array(numIndices) : new Uint16Array(numIndices);
            buildPlane(vertices, normal, uv, indices, width, height, -depth, wSegs, hSegs, 0, 1, 2, -1, -1, i, ii);
            sidesData.push({
                orientation: CUBE_SIDE_BACK,
                vertices,
                normal,
                uv,
                indices,
            });
        }
        {
            // FRONT
            const num = (wSegs + 1) * (hSegs + 1);
            const numIndices = wSegs * hSegs * 6;
            const vertices = new Float32Array(num * 3);
            const normal = new Float32Array(num * 3);
            const uv = new Float32Array(num * 2);
            const indices = num > 65536 ? new Uint32Array(numIndices) : new Uint16Array(numIndices);
            buildPlane(vertices, normal, uv, indices, width, height, depth, wSegs, hSegs, 0, 1, 2, 1, -1, i, ii);
            sidesData.push({
                orientation: CUBE_SIDE_FRONT,
                vertices,
                normal,
                uv,
                indices,
            });
        }
        return sidesData;
    }

    // @ts-nocheck
    // Handle Simple 90 Degree Rotations without the use of Quat,Trig,Matrices
    class VRot90 {
        // #region SINGLE AXIS ROTATION
        static xp(v, o) {
            const x = v[0], y = v[1], z = v[2];
            o[0] = x;
            o[1] = -z;
            o[2] = y;
            return o;
        } // x-zy rot x+90
        static xn(v, o) {
            const x = v[0], y = v[1], z = v[2];
            o[0] = x;
            o[1] = z;
            o[2] = -y;
            return o;
        } // xz-y rot x-90
        static yp(v, o) {
            const x = v[0], y = v[1], z = v[2];
            o[0] = -z;
            o[1] = y;
            o[2] = x;
            return o;
        } // -zyx rot y+90
        static yn(v, o) {
            const x = v[0], y = v[1], z = v[2];
            o[0] = z;
            o[1] = y;
            o[2] = -x;
            return o;
        } // zy-x rot y-90
        static zp(v, o) {
            const x = v[0], y = v[1], z = v[2];
            o[0] = y;
            o[1] = -x;
            o[2] = z;
            return o;
        } // y-xz rot z+90
        static zn(v, o) {
            const x = v[0], y = v[1], z = v[2];
            o[0] = -y;
            o[1] = x;
            o[2] = z;
            return o;
        } // -yxz rot z-90
        // #endregion
        // #region COMBINATIONS
        static xp_yn(v, o) {
            const x = v[0], y = v[1], z = v[2];
            o[0] = -y;
            o[1] = -z;
            o[2] = x;
            return o;
        } // -y-zx rot x+90, y-90
        static xp_yp(v, o) {
            const x = v[0], y = v[1], z = v[2];
            o[0] = y;
            o[1] = -z;
            o[2] = -x;
            return o;
        } // y-z-x rot x+90, y+90
        static xp_yp_yp(v, o) {
            const x = v[0], y = v[1], z = v[2];
            o[0] = -x;
            o[1] = -z;
            o[2] = -y;
            return o;
        } // -x-z-y rot x+90, y+90, y+90
        static xp_xp(v, o) {
            const x = v[0], y = v[1], z = v[2];
            o[0] = x;
            o[1] = -y;
            o[2] = -z;
            return o;
        } // x-y-z rot x+90, x+90
    }
    const createRoundedBox = ({ width = 1, height = 1, depth = 1, radius = 0.5, div = 4, }) => {
        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        const panel = edge_grid$1(width, height, depth, radius, div); // Creates the Geo of just the Top Plane of the
        const geo = {
            verts: [],
            indices: [],
            uv: [],
            norm: [],
        };
        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // TODO, Knowing the Plane's Vert Count, It would be better to pre-allocate all the space
        // in TypedArrays then fill in all the data. Using Javascript arrays makes things simple
        // for programming but isn't as efficent.
        // Rotate and Merge the Panel Data into one Geo to form a Rounded Quad
        geo_rot_merge$1(geo, panel, (v, o) => {
            o[0] = v[0];
            o[1] = v[1];
            o[2] = v[2];
            return o;
        }); // Top - No Rotation, Kind of a Waste
        geo_rot_merge$1(geo, panel, VRot90.xp); // Front
        geo_rot_merge$1(geo, panel, VRot90.xp_yp); // Left
        geo_rot_merge$1(geo, panel, VRot90.xp_yp_yp); // Back
        geo_rot_merge$1(geo, panel, VRot90.xp_yn); // Right
        geo_rot_merge$1(geo, panel, VRot90.xp_xp); // Bottom
        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        return {
            vertices: new Float32Array(geo.verts),
            normal: new Float32Array(geo.norm),
            uv: new Float32Array(geo.uv),
            indices: new Uint16Array(geo.indices),
        };
    };
    // Generate a Plane where all its vertices are focus onto the corners
    // Then those corners are sphere-ified to create rounded corners on the plane
    function edge_grid$1(width = 2, height = 2, depth = 2, radius = 0.5, div = 4) {
        const mx = width / 2, my = height / 2, mz = depth / 2, len = div * 2;
        const verts = [];
        const uv = [];
        const norm = [];
        const v = create$1();
        let bit, j, i, t, s, x, y, z;
        y = my;
        // Use corners kinda like Marching Squares
        const corners = [
            fromValues(radius - mx, my - radius, radius - mz),
            fromValues(mx - radius, my - radius, radius - mz),
            fromValues(radius - mx, my - radius, mz - radius),
            fromValues(mx - radius, my - radius, mz - radius),
        ];
        const row = (z, zbit) => {
            let t, bit;
            const uv_z = normalizeNumber(-mz, mz, z); // Map Z and Normalize the Value
            for (i = 0; i <= len; i++) {
                bit = i <= div ? 0 : 1;
                t = triangleWave(i / div); // 0 > 1 > 0
                s = i <= div ? -1 : 1; // Sign
                x = mx * s + radius * t * -s; // Flip Signs based if i <= div
                set(v, x, y, z);
                sub(v, v, corners[bit | zbit]);
                normalize(v, v);
                norm.push(v[0], v[1], v[2]); // Save it
                scale(v, v, radius);
                add(v, v, corners[bit | zbit]);
                verts.push(v[0], v[1], v[2]); // Save Vert
                uv.push(normalizeNumber(-mx, mx, x), uv_z);
                //App.Debug.pnt( v );
                // Start the mirror side when done with the first side
                if (t == 1) {
                    set(v, mx - radius, y, z);
                    sub(v, v, corners[1 | zbit]);
                    normalize(v, v);
                    norm.push(v[0], v[1], v[2]);
                    scale(v, v, radius);
                    add(v, v, corners[1 | zbit]);
                    verts.push(v[0], v[1], v[2]);
                    uv.push(normalizeNumber(-mx, mx, mx - radius), uv_z);
                    // App.Debug.pnt( v );
                }
            }
        };
        for (j = 0; j <= len; j++) {
            // Compute Z Position
            bit = j <= div ? 0 : 2;
            t = triangleWave(j / div); // 0 > 1 > 0
            s = j <= div ? -1 : 1; // Sign
            z = mz * s + radius * t * -s; // Flip Signs based if i <= div
            row(z, bit); // Draw Row
            if (t == 1)
                row(mz - radius, 2); // Start Mirror Side
        }
        return { verts, uv, norm, indices: grid_tri_idx$1(len + 1, len + 1) };
    }
    // Rotate Vertices/Normals, then Merge All the Vertex Attributes into One Geo
    function geo_rot_merge$1(geo, obj, fn_rot) {
        const offset = geo.verts.length / 3;
        const len = obj.verts.length;
        const v = create$1(), o = create$1();
        for (let i = 0; i < len; i += 3) {
            // Rotate Vertices
            set(v, obj.verts[i], obj.verts[i + 1], obj.verts[i + 2]);
            fn_rot(v, o);
            geo.verts.push(o[0], o[1], o[2]);
            // Rotate Normal
            set(v, obj.norm[i], obj.norm[i + 1], obj.norm[i + 2]);
            fn_rot(v, o);
            geo.norm.push(o[0], o[1], o[2]);
        }
        for (const v of obj.uv) {
            geo.uv.push(v);
        }
        for (const v of obj.indices) {
            geo.indices.push(offset + v);
        }
    }
    // Generate Indices for a Grid Mesh
    function grid_tri_idx$1(x_cells, y_cells) {
        let ary = [], col_cnt = x_cells + 1, x, y, a, b, c, d;
        for (y = 0; y < y_cells; y++) {
            for (x = 0; x < x_cells; x++) {
                a = y * col_cnt + x;
                b = a + col_cnt;
                c = b + 1;
                d = a + 1;
                ary.push(a, b, c, c, d, a);
            }
        }
        return ary;
    }

    // @ts-nocheck
    const createRoundedBoxSeparateFace = ({ width = 1, height = 1, depth = 1, radius = 0.5, div = 4, }) => {
        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        const panel = edge_grid(width, height, depth, radius, div); // Create
        const sidesData = [];
        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // TODO, Knowing the Plane's Vert Count, It would be better to pre-allocate all the space
        // in TypedArrays then fill in all the data. Using Javascript arrays makes things simple
        // for programming but isn't as efficent.
        // Rotate and Merge the Panel Data into one Geo to form a Rounded Quad
        let geo = {
            verts: [],
            indices: [],
            uv: [],
            norm: [],
        };
        geo_rot_merge(geo, panel, (v, o) => {
            o[0] = v[0];
            o[1] = v[1];
            o[2] = v[2];
            return o;
        }); // Top - No Rotation, Kind of a Waste
        sidesData.push({
            orientation: 'top',
            vertices: new Float32Array(geo.verts),
            normal: new Float32Array(geo.norm),
            uv: new Float32Array(geo.uv),
            indices: new Uint16Array(geo.indices),
        });
        geo = {
            verts: [],
            indices: [],
            uv: [],
            norm: [],
        };
        geo_rot_merge(geo, panel, VRot90.xp); // Front
        sidesData.push({
            orientation: CUBE_SIDE_FRONT,
            vertices: new Float32Array(geo.verts),
            normal: new Float32Array(geo.norm),
            uv: new Float32Array(geo.uv),
            indices: new Uint16Array(geo.indices),
        });
        geo = {
            verts: [],
            indices: [],
            uv: [],
            norm: [],
        };
        geo_rot_merge(geo, panel, VRot90.xp_yp); // Left
        sidesData.push({
            orientation: CUBE_SIDE_LEFT,
            vertices: new Float32Array(geo.verts),
            normal: new Float32Array(geo.norm),
            uv: new Float32Array(geo.uv),
            indices: new Uint16Array(geo.indices),
        });
        geo = {
            verts: [],
            indices: [],
            uv: [],
            norm: [],
        };
        geo_rot_merge(geo, panel, VRot90.xp_yp_yp); // Back
        sidesData.push({
            orientation: CUBE_SIDE_BACK,
            vertices: new Float32Array(geo.verts),
            normal: new Float32Array(geo.norm),
            uv: new Float32Array(geo.uv),
            indices: new Uint16Array(geo.indices),
        });
        geo = {
            verts: [],
            indices: [],
            uv: [],
            norm: [],
        };
        geo_rot_merge(geo, panel, VRot90.xp_yn); // Right
        sidesData.push({
            orientation: CUBE_SIDE_RIGHT,
            vertices: new Float32Array(geo.verts),
            normal: new Float32Array(geo.norm),
            uv: new Float32Array(geo.uv),
            indices: new Uint16Array(geo.indices),
        });
        geo = {
            verts: [],
            indices: [],
            uv: [],
            norm: [],
        };
        geo_rot_merge(geo, panel, VRot90.xp_xp); // Bottom
        sidesData.push({
            orientation: CUBE_SIDE_BOTTOM,
            vertices: new Float32Array(geo.verts),
            normal: new Float32Array(geo.norm),
            uv: new Float32Array(geo.uv),
            indices: new Uint16Array(geo.indices),
        });
        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        return sidesData;
    };
    // Generate a Plane where all its vertices are focus onto the corners
    // Then those corners are sphere-ified to create rounded corners on the plane
    function edge_grid(width = 2, height = 2, depth = 2, radius = 0.5, div = 4) {
        const mx = width / 2, my = height / 2, mz = depth / 2, len = div * 2;
        const verts = [];
        const uv = [];
        const norm = [];
        const v = create$1();
        let bit, j, i, t, s, x, y, z;
        y = my;
        // Use corners kinda like Marching Squares
        const corners = [
            fromValues(radius - mx, my - radius, radius - mz),
            fromValues(mx - radius, my - radius, radius - mz),
            fromValues(radius - mx, my - radius, mz - radius),
            fromValues(mx - radius, my - radius, mz - radius),
        ];
        const row = (z, zbit) => {
            let t, bit;
            const uv_z = normalizeNumber(-mz, mz, z); // Map Z and Normalize the Value
            for (i = 0; i <= len; i++) {
                bit = i <= div ? 0 : 1;
                t = triangleWave(i / div); // 0 > 1 > 0
                s = i <= div ? -1 : 1; // Sign
                x = mx * s + radius * t * -s; // Flip Signs based if i <= div
                set(v, x, y, z);
                sub(v, v, corners[bit | zbit]);
                normalize(v, v);
                norm.push(v[0], v[1], v[2]); // Save it
                scale(v, v, radius);
                add(v, v, corners[bit | zbit]);
                verts.push(v[0], v[1], v[2]); // Save Vert
                uv.push(normalizeNumber(-mx, mx, x), uv_z);
                //App.Debug.pnt( v );
                // Start the mirror side when done with the first side
                if (t == 1) {
                    set(v, mx - radius, y, z);
                    sub(v, v, corners[1 | zbit]);
                    normalize(v, v);
                    norm.push(v[0], v[1], v[2]);
                    scale(v, v, radius);
                    add(v, v, corners[1 | zbit]);
                    verts.push(v[0], v[1], v[2]);
                    uv.push(normalizeNumber(-mx, mx, mx - radius), uv_z);
                    // App.Debug.pnt( v );
                }
            }
        };
        for (j = 0; j <= len; j++) {
            // Compute Z Position
            bit = j <= div ? 0 : 2;
            t = triangleWave(j / div); // 0 > 1 > 0
            s = j <= div ? -1 : 1; // Sign
            z = mz * s + radius * t * -s; // Flip Signs based if i <= div
            row(z, bit); // Draw Row
            if (t == 1)
                row(mz - radius, 2); // Start Mirror Side
        }
        return { verts, uv, norm, indices: grid_tri_idx(len + 1, len + 1) };
    }
    // Rotate Vertices/Normals, then Merge All the Vertex Attributes into One Geo
    function geo_rot_merge(geo, obj, fn_rot) {
        const offset = geo.verts.length / 3;
        const len = obj.verts.length;
        const v = create$1(), o = create$1();
        for (let i = 0; i < len; i += 3) {
            // Rotate Vertices
            set(v, obj.verts[i], obj.verts[i + 1], obj.verts[i + 2]);
            fn_rot(v, o);
            geo.verts.push(o[0], o[1], o[2]);
            // Rotate Normal
            set(v, obj.norm[i], obj.norm[i + 1], obj.norm[i + 2]);
            fn_rot(v, o);
            geo.norm.push(o[0], o[1], o[2]);
        }
        for (const v of obj.uv) {
            geo.uv.push(v);
        }
        for (const v of obj.indices) {
            geo.indices.push(offset + v);
        }
    }
    // Generate Indices for a Grid Mesh
    function grid_tri_idx(x_cells, y_cells) {
        let ary = [], col_cnt = x_cells + 1, x, y, a, b, c, d;
        for (y = 0; y < y_cells; y++) {
            for (x = 0; x < x_cells; x++) {
                a = y * col_cnt + x;
                b = a + col_cnt;
                c = b + 1;
                d = a + 1;
                ary.push(a, b, c, c, d, a);
            }
        }
        return ary;
    }

    /**
     * @description Generate circle geometry
     * @param {Circle} params
     * @returns {{ vertices, normal, uv, indices }}
     */
    function createCircle(params = {}) {
        const { radius = 1, segments = 8, thetaStart = 0, thetaLength = Math.PI * 2, } = params;
        const indices = [];
        const vertices = [];
        const normals = [];
        const uvs = [];
        // helper variables
        const vertex = create$1();
        const uv = create();
        // center point
        vertices.push(0, 0, 0);
        normals.push(0, 0, 1);
        uvs.push(0.5, 0.5);
        for (let s = 0, i = 3; s <= segments; s++, i += 3) {
            const segment = thetaStart + s / segments * thetaLength;
            // vertex
            vertex[0] = radius * Math.cos(segment);
            vertex[1] = radius * Math.sin(segment);
            vertices.push(...vertex);
            // normal
            normals.push(0, 0, 1);
            // uvs
            uv[0] = (vertices[i] / radius + 1) / 2;
            uv[1] = (vertices[i + 1] / radius + 1) / 2;
            uvs.push(uv[0], uv[1]);
        }
        // indices
        for (let i = 1; i <= segments; i++) {
            indices.push(i, i + 1, 0);
        }
        return {
            indices: segments > 65536 ? new Uint32Array(indices) : new Uint16Array(indices),
            vertices: new Float32Array(vertices),
            normal: new Float32Array(normals),
            uv: new Float32Array(uvs),
        };
    }

    /**
     * Generates geometry data for a quad
     * @param {PlaneInterface} params
     * @returns {{ vertices, normal, uv, indices }}
     */
    function createPlane(params = {}) {
        const { width = 1, height = 1, widthSegments = 1, heightSegments = 1, } = params;
        const wSegs = widthSegments;
        const hSegs = heightSegments;
        // Determine length of arrays
        const num = (wSegs + 1) * (hSegs + 1);
        const numIndices = wSegs * hSegs * 6;
        // Generate empty arrays once
        const position = new Float32Array(num * 3);
        const normal = new Float32Array(num * 3);
        const uv = new Float32Array(num * 2);
        const index = num > 65536 ? new Uint32Array(numIndices) : new Uint16Array(numIndices);
        buildPlane(position, normal, uv, index, width, height, 0, wSegs, hSegs);
        return {
            vertices: position,
            normal,
            uv,
            indices: index,
        };
    }

    /**
     * Generates geometry data for a sphere
     * @param {Sphere} params
     * @returns {{ vertices, normal, uv, indices }}
     */
    function createSphere(params = {}) {
        const { radius = 0.5, widthSegments = 16, heightSegments = Math.ceil(widthSegments * 0.5), phiStart = 0, phiLength = Math.PI * 2, thetaStart = 0, thetaLength = Math.PI, } = params;
        const wSegs = widthSegments;
        const hSegs = heightSegments;
        const pStart = phiStart;
        const pLength = phiLength;
        const tStart = thetaStart;
        const tLength = thetaLength;
        const num = (wSegs + 1) * (hSegs + 1);
        const numIndices = wSegs * hSegs * 6;
        const position = new Float32Array(num * 3);
        const normal = new Float32Array(num * 3);
        const uv = new Float32Array(num * 2);
        const index = num > 65536 ? new Uint32Array(numIndices) : new Uint16Array(numIndices);
        let i = 0;
        let iv = 0;
        let ii = 0;
        const te = tStart + tLength;
        const grid = [];
        const n = create$1();
        for (let iy = 0; iy <= hSegs; iy++) {
            const vRow = [];
            const v = iy / hSegs;
            for (let ix = 0; ix <= wSegs; ix++, i++) {
                const u = ix / wSegs;
                const x = -radius *
                    Math.cos(pStart + u * pLength) *
                    Math.sin(tStart + v * tLength);
                const y = radius * Math.cos(tStart + v * tLength);
                const z = radius * Math.sin(pStart + u * pLength) * Math.sin(tStart + v * tLength);
                position[i * 3] = x;
                position[i * 3 + 1] = y;
                position[i * 3 + 2] = z;
                set(n, x, y, z);
                normalize(n, n);
                normal[i * 3] = n[0];
                normal[i * 3 + 1] = n[1];
                normal[i * 3 + 2] = n[2];
                uv[i * 2] = u;
                uv[i * 2 + 1] = 1 - v;
                vRow.push(iv++);
            }
            grid.push(vRow);
        }
        for (let iy = 0; iy < hSegs; iy++) {
            for (let ix = 0; ix < wSegs; ix++) {
                const a = grid[iy][ix + 1];
                const b = grid[iy][ix];
                const c = grid[iy + 1][ix];
                const d = grid[iy + 1][ix + 1];
                if (iy !== 0 || tStart > 0) {
                    index[ii * 3] = a;
                    index[ii * 3 + 1] = b;
                    index[ii * 3 + 2] = d;
                    ii++;
                }
                if (iy !== hSegs - 1 || te < Math.PI) {
                    index[ii * 3] = b;
                    index[ii * 3 + 1] = c;
                    index[ii * 3 + 2] = d;
                    ii++;
                }
            }
        }
        return {
            vertices: position,
            normal,
            uv,
            indices: index,
        };
    }

    /**
     * @description Generate torus geometry
     * @param {Torus} params
     * @returns {{ vertices, normal, uv, indices }}
     */
    function createTorus(params = {}) {
        const { radius = 0.5, tube = 0.35, arc = Math.PI * 2, radialSegments: inputRadialSegments = 8, tubularSegments: inputTubularSegments = 6, } = params;
        const radialSegments = Math.floor(inputRadialSegments);
        const tubularSegments = Math.floor(inputTubularSegments);
        const indices = [];
        const vertices = [];
        const normals = [];
        const uvs = [];
        const center = create$1();
        const vertex = create$1();
        const normal = create$1();
        for (let j = 0; j <= radialSegments; j++) {
            for (let i = 0; i <= tubularSegments; i++) {
                const u = (i / tubularSegments) * arc;
                const v = (j / radialSegments) * Math.PI * 2;
                // vertex
                vertex[0] = (radius + tube * Math.cos(v)) * Math.cos(u);
                vertex[1] = (radius + tube * Math.cos(v)) * Math.sin(u);
                vertex[2] = tube * Math.sin(v);
                vertices.push(vertex[0], vertex[1], vertex[2]);
                // normal
                center[0] = radius * Math.cos(u);
                center[1] = radius * Math.sin(u);
                sub(normal, vertex, center);
                normalize(normal, normal);
                normals.push(normal[0], normal[1], normal[0]);
                // uv
                uvs.push(i / tubularSegments, j / radialSegments);
            }
        }
        // generate indices
        for (let j = 1; j <= radialSegments; j++) {
            for (let i = 1; i <= tubularSegments; i++) {
                // indices
                const a = (tubularSegments + 1) * j + i - 1;
                const b = (tubularSegments + 1) * (j - 1) + i - 1;
                const c = (tubularSegments + 1) * (j - 1) + i;
                const d = (tubularSegments + 1) * j + i;
                // faces
                indices.push(a, b, d);
                indices.push(b, c, d);
            }
        }
        const num = (radialSegments + 1) * (tubularSegments + 1);
        return {
            indices: num > 65536 ? new Uint32Array(indices) : new Uint16Array(indices),
            vertices: new Float32Array(vertices),
            normal: new Float32Array(normals),
            uv: new Float32Array(uvs),
        };
    }

    /**
     * @namespace GeometryUtils
     */
    const GeometryUtils = {
        createBox,
        createBoxSeparateFace,
        createRoundedBoxSeparateFace,
        createRoundedBox,
        createCircle,
        createPlane,
        createSphere,
        createTorus,
    };

    var index = /*#__PURE__*/Object.freeze({
      __proto__: null,
      createBox: createBox,
      createBoxSeparateFace: createBoxSeparateFace,
      createRoundedBoxSeparateFace: createRoundedBoxSeparateFace,
      createRoundedBox: createRoundedBox,
      createCircle: createCircle,
      createPlane: createPlane,
      createSphere: createSphere,
      createTorus: createTorus,
      GeometryUtils: GeometryUtils
    });

    const gpuPipelineFactory = (device, pipelineDefinition, uniforms, textures) => {
        // const pipelineDefString = simpleHash(
        //   JSON.stringify({
        //     ...pipelineDefinition,
        //     uniforms,
        //     textures,
        //   }),
        // )
        JSON.stringify(Object.assign(Object.assign({}, pipelineDefinition), { uniforms,
            textures }));
        // let pipeline = pipelinesMap.get(pipelineDefString)
        // if (!pipeline) {
        let pipeline = device.createRenderPipeline(pipelineDefinition);
        // console.log('pipeline', pipelineDefString)
        // pipelinesMap.set(pipelineDefString, pipeline)
        // }
        return pipeline;
    };

    class Mesh extends SceneObject {
        constructor(device, { geometry, uniforms = {}, textures = [], samplers = [], vertexShaderSource, fragmentShaderSource, multisample = {}, depthStencil = {
            format: 'depth24plus',
            depthWriteEnabled: true,
            depthCompare: 'less',
        }, targets = [{ format: 'bgra8unorm' }], primitiveType = PRIMITIVE_TOPOLOGY_TRIANGLE_LIST, }) {
            super();
            this.renderable = true;
            this.device = device;
            this.geometry = geometry;
            this.uniforms = {};
            // Each Mesh comes with predetermined UBO called Transforms
            // There is a second optional UBO called UniformsDefinitions that holds every other uniform
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
            geometry.primitiveType = primitiveType;
            const numBindOffset = uniformsInputUBOByteLength ? 2 : 1;
            // Generate vertex & fragment shaders based on
            // - vertex inputs
            // - uniform inputs
            // - sampler inputs
            // - texture inputs
            // - custom user string snippets
            const vertexShader = new Shader(device, GPUShaderStage.VERTEX);
            const fragmentShader = new Shader(device, GPUShaderStage.FRAGMENT);
            const vertexShaderIOVars = {};
            geometry.vertexBuffers.forEach(({ attributes }) => {
                for (const [key, { format }] of attributes) {
                    vertexShaderIOVars[key] = { format };
                }
            });
            {
                // Generate vertex shader
                if (uniformsInputUBOByteLength) {
                    vertexShader.addUniformInputs(uniforms);
                }
                if (vertexShaderSource.inputs) {
                    vertexShader.addInputs(Object.assign(Object.assign({}, vertexShaderSource.inputs), vertexShaderIOVars));
                }
                else {
                    vertexShader.addInputs(vertexShaderIOVars);
                }
                if (vertexShaderSource.outputs) {
                    vertexShader.addOutputs(Object.assign(Object.assign({}, vertexShaderSource.outputs), vertexShaderIOVars));
                }
                else {
                    vertexShader.addOutputs(vertexShaderIOVars);
                }
                vertexShader.addHeadSnippet(vertexShaderSource.head);
                vertexShader.addMainFnSnippet(vertexShaderSource.main);
            }
            {
                // Generate fragment shader
                if (uniformsInputUBOByteLength) {
                    fragmentShader.addUniformInputs(uniforms);
                }
                if (fragmentShaderSource.inputs) {
                    fragmentShader.addInputs(Object.assign(Object.assign({}, vertexShaderIOVars), fragmentShaderSource.inputs));
                }
                else {
                    fragmentShader.addInputs(vertexShaderIOVars);
                }
                fragmentShader.addOutputs(fragmentShaderSource.outputs);
                fragmentShader.addSamplerInputs(samplers.map((sampler, i) => {
                    const bindIdx = numBindOffset + i;
                    return {
                        bindIdx,
                        name: sampler.name,
                        type: sampler.wglslSamplerType,
                    };
                }));
                fragmentShader.addTextureInputs(textures.map(({ name, wglslTextureType }, i) => ({
                    bindIdx: numBindOffset + samplers.length + i,
                    name: name,
                    type: `${wglslTextureType}`,
                })));
                fragmentShader.addHeadSnippet(fragmentShaderSource.head);
                fragmentShader.addMainFnSnippet(fragmentShaderSource.main);
            }
            console.log(vertexShader.source);
            console.log(fragmentShader.source);
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
            samplers.forEach((sampler) => {
                this.uboBindGroup.addSampler(sampler);
            });
            textures.map((texture) => {
                console.log(texture);
                this.uboBindGroup.addTexture(texture);
            });
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
            this.pipeline = gpuPipelineFactory(device, pipelineDesc, uniforms, textures);
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
    }
    typeof process !== 'object' || String(process) !== '[object process]' || process.browser;
    const matches$2 = typeof process !== 'undefined' && process.version && /v([0-9]*)/.exec(process.version);
    matches$2 && parseFloat(matches$2[1]) || 0;

    function assert$4(condition, message) {
      if (!condition) {
        throw new Error(message || 'loaders.gl assertion failed.');
      }
    }
    typeof process !== 'object' || String(process) !== '[object process]' || process.browser;
    const isMobile = typeof window !== 'undefined' && typeof window.orientation !== 'undefined';
    const matches$1 = typeof process !== 'undefined' && process.version && /v([0-9]*)/.exec(process.version);
    matches$1 && parseFloat(matches$1[1]) || 0;

    function _defineProperty(obj, key, value) {
      if (key in obj) {
        Object.defineProperty(obj, key, {
          value: value,
          enumerable: true,
          configurable: true,
          writable: true
        });
      } else {
        obj[key] = value;
      }

      return obj;
    }

    class WorkerJob {
      constructor(jobName, workerThread) {
        _defineProperty(this, "name", void 0);

        _defineProperty(this, "workerThread", void 0);

        _defineProperty(this, "isRunning", void 0);

        _defineProperty(this, "result", void 0);

        _defineProperty(this, "_resolve", void 0);

        _defineProperty(this, "_reject", void 0);

        this.name = jobName;
        this.workerThread = workerThread;
        this.isRunning = true;

        this._resolve = () => {};

        this._reject = () => {};

        this.result = new Promise((resolve, reject) => {
          this._resolve = resolve;
          this._reject = reject;
        });
      }

      postMessage(type, payload) {
        this.workerThread.postMessage({
          source: 'loaders.gl',
          type,
          payload
        });
      }

      done(value) {
        assert$4(this.isRunning);
        this.isRunning = false;

        this._resolve(value);
      }

      error(error) {
        assert$4(this.isRunning);
        this.isRunning = false;

        this._reject(error);
      }

    }

    const workerURLCache = new Map();
    function getLoadableWorkerURL(props) {
      assert$4(props.source && !props.url || !props.source && props.url);
      let workerURL = workerURLCache.get(props.source || props.url);

      if (!workerURL) {
        if (props.url) {
          workerURL = getLoadableWorkerURLFromURL(props.url);
          workerURLCache.set(props.url, workerURL);
        }

        if (props.source) {
          workerURL = getLoadableWorkerURLFromSource(props.source);
          workerURLCache.set(props.source, workerURL);
        }
      }

      assert$4(workerURL);
      return workerURL;
    }

    function getLoadableWorkerURLFromURL(url) {
      if (!url.startsWith('http')) {
        return url;
      }

      const workerSource = buildScriptSource(url);
      return getLoadableWorkerURLFromSource(workerSource);
    }

    function getLoadableWorkerURLFromSource(workerSource) {
      const blob = new Blob([workerSource], {
        type: 'application/javascript'
      });
      return URL.createObjectURL(blob);
    }

    function buildScriptSource(workerUrl) {
      return `\
try {
  importScripts('${workerUrl}');
} catch (error) {
  console.error(error);
  throw error;
}`;
    }

    function getTransferList(object, recursive = true, transfers) {
      const transfersSet = transfers || new Set();

      if (!object) ; else if (isTransferable(object)) {
        transfersSet.add(object);
      } else if (isTransferable(object.buffer)) {
        transfersSet.add(object.buffer);
      } else if (ArrayBuffer.isView(object)) ; else if (recursive && typeof object === 'object') {
        for (const key in object) {
          getTransferList(object[key], recursive, transfersSet);
        }
      }

      return transfers === undefined ? Array.from(transfersSet) : [];
    }

    function isTransferable(object) {
      if (!object) {
        return false;
      }

      if (object instanceof ArrayBuffer) {
        return true;
      }

      if (typeof MessagePort !== 'undefined' && object instanceof MessagePort) {
        return true;
      }

      if (typeof ImageBitmap !== 'undefined' && object instanceof ImageBitmap) {
        return true;
      }

      if (typeof OffscreenCanvas !== 'undefined' && object instanceof OffscreenCanvas) {
        return true;
      }

      return false;
    }

    const NOOP = () => {};

    class WorkerThread {
      static isSupported() {
        return typeof Worker !== 'undefined';
      }

      constructor(props) {
        _defineProperty(this, "name", void 0);

        _defineProperty(this, "source", void 0);

        _defineProperty(this, "url", void 0);

        _defineProperty(this, "terminated", false);

        _defineProperty(this, "worker", void 0);

        _defineProperty(this, "onMessage", void 0);

        _defineProperty(this, "onError", void 0);

        _defineProperty(this, "_loadableURL", '');

        const {
          name,
          source,
          url
        } = props;
        assert$4(source || url);
        this.name = name;
        this.source = source;
        this.url = url;
        this.onMessage = NOOP;

        this.onError = error => console.log(error);

        this.worker = this._createBrowserWorker();
      }

      destroy() {
        this.onMessage = NOOP;
        this.onError = NOOP;
        this.worker.terminate();
        this.terminated = true;
      }

      get isRunning() {
        return Boolean(this.onMessage);
      }

      postMessage(data, transferList) {
        transferList = transferList || getTransferList(data);
        this.worker.postMessage(data, transferList);
      }

      _getErrorFromErrorEvent(event) {
        let message = 'Failed to load ';
        message += `worker ${this.name}. `;

        if (event.message) {
          message += `${event.message} in `;
        }

        if (event.lineno) {
          message += `:${event.lineno}:${event.colno}`;
        }

        return new Error(message);
      }

      _createBrowserWorker() {
        this._loadableURL = getLoadableWorkerURL({
          source: this.source,
          url: this.url
        });
        const worker = new Worker(this._loadableURL, {
          name: this.name
        });

        worker.onmessage = event => {
          if (!event.data) {
            this.onError(new Error('No data received'));
          } else {
            this.onMessage(event.data);
          }
        };

        worker.onerror = error => {
          this.onError(this._getErrorFromErrorEvent(error));
          this.terminated = true;
        };

        worker.onmessageerror = event => console.error(event);

        return worker;
      }

    }

    class WorkerPool {
      constructor(props) {
        _defineProperty(this, "name", 'unnamed');

        _defineProperty(this, "source", void 0);

        _defineProperty(this, "url", void 0);

        _defineProperty(this, "maxConcurrency", 1);

        _defineProperty(this, "maxMobileConcurrency", 1);

        _defineProperty(this, "onDebug", () => {});

        _defineProperty(this, "reuseWorkers", true);

        _defineProperty(this, "props", {});

        _defineProperty(this, "jobQueue", []);

        _defineProperty(this, "idleQueue", []);

        _defineProperty(this, "count", 0);

        _defineProperty(this, "isDestroyed", false);

        this.source = props.source;
        this.url = props.url;
        this.setProps(props);
      }

      destroy() {
        this.idleQueue.forEach(worker => worker.destroy());
        this.isDestroyed = true;
      }

      setProps(props) {
        this.props = { ...this.props,
          ...props
        };

        if (props.name !== undefined) {
          this.name = props.name;
        }

        if (props.maxConcurrency !== undefined) {
          this.maxConcurrency = props.maxConcurrency;
        }

        if (props.maxMobileConcurrency !== undefined) {
          this.maxMobileConcurrency = props.maxMobileConcurrency;
        }

        if (props.reuseWorkers !== undefined) {
          this.reuseWorkers = props.reuseWorkers;
        }

        if (props.onDebug !== undefined) {
          this.onDebug = props.onDebug;
        }
      }

      async startJob(name, onMessage = (job, type, data) => job.done(data), onError = (job, error) => job.error(error)) {
        const startPromise = new Promise(onStart => {
          this.jobQueue.push({
            name,
            onMessage,
            onError,
            onStart
          });
          return this;
        });

        this._startQueuedJob();

        return await startPromise;
      }

      async _startQueuedJob() {
        if (!this.jobQueue.length) {
          return;
        }

        const workerThread = this._getAvailableWorker();

        if (!workerThread) {
          return;
        }

        const queuedJob = this.jobQueue.shift();

        if (queuedJob) {
          this.onDebug({
            message: 'Starting job',
            name: queuedJob.name,
            workerThread,
            backlog: this.jobQueue.length
          });
          const job = new WorkerJob(queuedJob.name, workerThread);

          workerThread.onMessage = data => queuedJob.onMessage(job, data.type, data.payload);

          workerThread.onError = error => queuedJob.onError(job, error);

          queuedJob.onStart(job);

          try {
            await job.result;
          } finally {
            this.returnWorkerToQueue(workerThread);
          }
        }
      }

      returnWorkerToQueue(worker) {
        const shouldDestroyWorker = this.isDestroyed || !this.reuseWorkers || this.count > this._getMaxConcurrency();

        if (shouldDestroyWorker) {
          worker.destroy();
          this.count--;
        } else {
          this.idleQueue.push(worker);
        }

        if (!this.isDestroyed) {
          this._startQueuedJob();
        }
      }

      _getAvailableWorker() {
        if (this.idleQueue.length > 0) {
          return this.idleQueue.shift() || null;
        }

        if (this.count < this._getMaxConcurrency()) {
          this.count++;
          const name = `${this.name.toLowerCase()} (#${this.count} of ${this.maxConcurrency})`;
          return new WorkerThread({
            name,
            source: this.source,
            url: this.url
          });
        }

        return null;
      }

      _getMaxConcurrency() {
        return isMobile ? this.maxMobileConcurrency : this.maxConcurrency;
      }

    }

    const DEFAULT_PROPS = {
      maxConcurrency: 3,
      maxMobileConcurrency: 1,
      onDebug: () => {},
      reuseWorkers: true
    };
    class WorkerFarm {
      static isSupported() {
        return WorkerThread.isSupported();
      }

      static getWorkerFarm(props = {}) {
        WorkerFarm._workerFarm = WorkerFarm._workerFarm || new WorkerFarm({});

        WorkerFarm._workerFarm.setProps(props);

        return WorkerFarm._workerFarm;
      }

      constructor(props) {
        _defineProperty(this, "props", void 0);

        _defineProperty(this, "workerPools", new Map());

        this.props = { ...DEFAULT_PROPS
        };
        this.setProps(props);
        this.workerPools = new Map();
      }

      destroy() {
        for (const workerPool of this.workerPools.values()) {
          workerPool.destroy();
        }
      }

      setProps(props) {
        this.props = { ...this.props,
          ...props
        };

        for (const workerPool of this.workerPools.values()) {
          workerPool.setProps(this._getWorkerPoolProps());
        }
      }

      getWorkerPool(options) {
        const {
          name,
          source,
          url
        } = options;
        let workerPool = this.workerPools.get(name);

        if (!workerPool) {
          workerPool = new WorkerPool({
            name,
            source,
            url
          });
          workerPool.setProps(this._getWorkerPoolProps());
          this.workerPools.set(name, workerPool);
        }

        return workerPool;
      }

      _getWorkerPoolProps() {
        return {
          maxConcurrency: this.props.maxConcurrency,
          maxMobileConcurrency: this.props.maxMobileConcurrency,
          reuseWorkers: this.props.reuseWorkers,
          onDebug: this.props.onDebug
        };
      }

    }

    _defineProperty(WorkerFarm, "_workerFarm", void 0);

    function isElectron(mockUserAgent) {
      if (typeof window !== 'undefined' && typeof window.process === 'object' && window.process.type === 'renderer') {
        return true;
      }

      if (typeof process !== 'undefined' && typeof process.versions === 'object' && Boolean(process.versions.electron)) {
        return true;
      }

      const realUserAgent = typeof navigator === 'object' && typeof navigator.userAgent === 'string' && navigator.userAgent;
      const userAgent = mockUserAgent || realUserAgent;

      if (userAgent && userAgent.indexOf('Electron') >= 0) {
        return true;
      }

      return false;
    }

    function isBrowser$2() {
      const isNode = typeof process === 'object' && String(process) === '[object process]' && !process.browser;
      return !isNode || isElectron();
    }

    const globals$1 = {
      self: typeof self !== 'undefined' && self,
      window: typeof window !== 'undefined' && window,
      global: typeof global !== 'undefined' && global,
      document: typeof document !== 'undefined' && document,
      process: typeof process === 'object' && process
    };
    const window_ = globals$1.window || globals$1.self || globals$1.global;
    const process_ = globals$1.process || {};

    const VERSION$3 = typeof __VERSION__ !== 'undefined' ? __VERSION__ : 'untranspiled source';
    const isBrowser$1 = isBrowser$2();

    function getStorage(type) {
      try {
        const storage = window[type];
        const x = '__storage_test__';
        storage.setItem(x, x);
        storage.removeItem(x);
        return storage;
      } catch (e) {
        return null;
      }
    }

    class LocalStorage {
      constructor(id, defaultSettings, type = 'sessionStorage') {
        this.storage = getStorage(type);
        this.id = id;
        this.config = {};
        Object.assign(this.config, defaultSettings);

        this._loadConfiguration();
      }

      getConfiguration() {
        return this.config;
      }

      setConfiguration(configuration) {
        this.config = {};
        return this.updateConfiguration(configuration);
      }

      updateConfiguration(configuration) {
        Object.assign(this.config, configuration);

        if (this.storage) {
          const serialized = JSON.stringify(this.config);
          this.storage.setItem(this.id, serialized);
        }

        return this;
      }

      _loadConfiguration() {
        let configuration = {};

        if (this.storage) {
          const serializedConfiguration = this.storage.getItem(this.id);
          configuration = serializedConfiguration ? JSON.parse(serializedConfiguration) : {};
        }

        Object.assign(this.config, configuration);
        return this;
      }

    }

    function formatTime(ms) {
      let formatted;

      if (ms < 10) {
        formatted = "".concat(ms.toFixed(2), "ms");
      } else if (ms < 100) {
        formatted = "".concat(ms.toFixed(1), "ms");
      } else if (ms < 1000) {
        formatted = "".concat(ms.toFixed(0), "ms");
      } else {
        formatted = "".concat((ms / 1000).toFixed(2), "s");
      }

      return formatted;
    }
    function leftPad(string, length = 8) {
      const padLength = Math.max(length - string.length, 0);
      return "".concat(' '.repeat(padLength)).concat(string);
    }

    function formatImage(image, message, scale, maxWidth = 600) {
      const imageUrl = image.src.replace(/\(/g, '%28').replace(/\)/g, '%29');

      if (image.width > maxWidth) {
        scale = Math.min(scale, maxWidth / image.width);
      }

      const width = image.width * scale;
      const height = image.height * scale;
      const style = ['font-size:1px;', "padding:".concat(Math.floor(height / 2), "px ").concat(Math.floor(width / 2), "px;"), "line-height:".concat(height, "px;"), "background:url(".concat(imageUrl, ");"), "background-size:".concat(width, "px ").concat(height, "px;"), 'color:transparent;'].join('');
      return ["".concat(message, " %c+"), style];
    }

    const COLOR = {
      BLACK: 30,
      RED: 31,
      GREEN: 32,
      YELLOW: 33,
      BLUE: 34,
      MAGENTA: 35,
      CYAN: 36,
      WHITE: 37,
      BRIGHT_BLACK: 90,
      BRIGHT_RED: 91,
      BRIGHT_GREEN: 92,
      BRIGHT_YELLOW: 93,
      BRIGHT_BLUE: 94,
      BRIGHT_MAGENTA: 95,
      BRIGHT_CYAN: 96,
      BRIGHT_WHITE: 97
    };

    function getColor(color) {
      return typeof color === 'string' ? COLOR[color.toUpperCase()] || COLOR.WHITE : color;
    }

    function addColor(string, color, background) {
      if (!isBrowser$1 && typeof string === 'string') {
        if (color) {
          color = getColor(color);
          string = "\x1B[".concat(color, "m").concat(string, "\x1B[39m");
        }

        if (background) {
          color = getColor(background);
          string = "\x1B[".concat(background + 10, "m").concat(string, "\x1B[49m");
        }
      }

      return string;
    }

    function autobind(obj, predefined = ['constructor']) {
      const proto = Object.getPrototypeOf(obj);
      const propNames = Object.getOwnPropertyNames(proto);

      for (const key of propNames) {
        if (typeof obj[key] === 'function') {
          if (!predefined.find(name => key === name)) {
            obj[key] = obj[key].bind(obj);
          }
        }
      }
    }

    function assert$3(condition, message) {
      if (!condition) {
        throw new Error(message || 'Assertion failed');
      }
    }

    function getHiResTimestamp() {
      let timestamp;

      if (isBrowser$1 && window_.performance) {
        timestamp = window_.performance.now();
      } else if (process_.hrtime) {
        const timeParts = process_.hrtime();
        timestamp = timeParts[0] * 1000 + timeParts[1] / 1e6;
      } else {
        timestamp = Date.now();
      }

      return timestamp;
    }

    const originalConsole = {
      debug: isBrowser$1 ? console.debug || console.log : console.log,
      log: console.log,
      info: console.info,
      warn: console.warn,
      error: console.error
    };
    const DEFAULT_SETTINGS = {
      enabled: true,
      level: 0
    };

    function noop() {}

    const cache = {};
    const ONCE = {
      once: true
    };

    function getTableHeader(table) {
      for (const key in table) {
        for (const title in table[key]) {
          return title || 'untitled';
        }
      }

      return 'empty';
    }

    class Log {
      constructor({
        id
      } = {
        id: ''
      }) {
        this.id = id;
        this.VERSION = VERSION$3;
        this._startTs = getHiResTimestamp();
        this._deltaTs = getHiResTimestamp();
        this.LOG_THROTTLE_TIMEOUT = 0;
        this._storage = new LocalStorage("__probe-".concat(this.id, "__"), DEFAULT_SETTINGS);
        this.userData = {};
        this.timeStamp("".concat(this.id, " started"));
        autobind(this);
        Object.seal(this);
      }

      set level(newLevel) {
        this.setLevel(newLevel);
      }

      get level() {
        return this.getLevel();
      }

      isEnabled() {
        return this._storage.config.enabled;
      }

      getLevel() {
        return this._storage.config.level;
      }

      getTotal() {
        return Number((getHiResTimestamp() - this._startTs).toPrecision(10));
      }

      getDelta() {
        return Number((getHiResTimestamp() - this._deltaTs).toPrecision(10));
      }

      set priority(newPriority) {
        this.level = newPriority;
      }

      get priority() {
        return this.level;
      }

      getPriority() {
        return this.level;
      }

      enable(enabled = true) {
        this._storage.updateConfiguration({
          enabled
        });

        return this;
      }

      setLevel(level) {
        this._storage.updateConfiguration({
          level
        });

        return this;
      }

      assert(condition, message) {
        assert$3(condition, message);
      }

      warn(message) {
        return this._getLogFunction(0, message, originalConsole.warn, arguments, ONCE);
      }

      error(message) {
        return this._getLogFunction(0, message, originalConsole.error, arguments);
      }

      deprecated(oldUsage, newUsage) {
        return this.warn("`".concat(oldUsage, "` is deprecated and will be removed in a later version. Use `").concat(newUsage, "` instead"));
      }

      removed(oldUsage, newUsage) {
        return this.error("`".concat(oldUsage, "` has been removed. Use `").concat(newUsage, "` instead"));
      }

      probe(logLevel, message) {
        return this._getLogFunction(logLevel, message, originalConsole.log, arguments, {
          time: true,
          once: true
        });
      }

      log(logLevel, message) {
        return this._getLogFunction(logLevel, message, originalConsole.debug, arguments);
      }

      info(logLevel, message) {
        return this._getLogFunction(logLevel, message, console.info, arguments);
      }

      once(logLevel, message) {
        return this._getLogFunction(logLevel, message, originalConsole.debug || originalConsole.info, arguments, ONCE);
      }

      table(logLevel, table, columns) {
        if (table) {
          return this._getLogFunction(logLevel, table, console.table || noop, columns && [columns], {
            tag: getTableHeader(table)
          });
        }

        return noop;
      }

      image({
        logLevel,
        priority,
        image,
        message = '',
        scale = 1
      }) {
        if (!this._shouldLog(logLevel || priority)) {
          return noop;
        }

        return isBrowser$1 ? logImageInBrowser({
          image,
          message,
          scale
        }) : logImageInNode({
          image,
          message,
          scale
        });
      }

      settings() {
        if (console.table) {
          console.table(this._storage.config);
        } else {
          console.log(this._storage.config);
        }
      }

      get(setting) {
        return this._storage.config[setting];
      }

      set(setting, value) {
        this._storage.updateConfiguration({
          [setting]: value
        });
      }

      time(logLevel, message) {
        return this._getLogFunction(logLevel, message, console.time ? console.time : console.info);
      }

      timeEnd(logLevel, message) {
        return this._getLogFunction(logLevel, message, console.timeEnd ? console.timeEnd : console.info);
      }

      timeStamp(logLevel, message) {
        return this._getLogFunction(logLevel, message, console.timeStamp || noop);
      }

      group(logLevel, message, opts = {
        collapsed: false
      }) {
        opts = normalizeArguments({
          logLevel,
          message,
          opts
        });
        const {
          collapsed
        } = opts;
        opts.method = (collapsed ? console.groupCollapsed : console.group) || console.info;
        return this._getLogFunction(opts);
      }

      groupCollapsed(logLevel, message, opts = {}) {
        return this.group(logLevel, message, Object.assign({}, opts, {
          collapsed: true
        }));
      }

      groupEnd(logLevel) {
        return this._getLogFunction(logLevel, '', console.groupEnd || noop);
      }

      withGroup(logLevel, message, func) {
        this.group(logLevel, message)();

        try {
          func();
        } finally {
          this.groupEnd(logLevel)();
        }
      }

      trace() {
        if (console.trace) {
          console.trace();
        }
      }

      _shouldLog(logLevel) {
        return this.isEnabled() && this.getLevel() >= normalizeLogLevel(logLevel);
      }

      _getLogFunction(logLevel, message, method, args = [], opts) {
        if (this._shouldLog(logLevel)) {
          opts = normalizeArguments({
            logLevel,
            message,
            args,
            opts
          });
          method = method || opts.method;
          assert$3(method);
          opts.total = this.getTotal();
          opts.delta = this.getDelta();
          this._deltaTs = getHiResTimestamp();
          const tag = opts.tag || opts.message;

          if (opts.once) {
            if (!cache[tag]) {
              cache[tag] = getHiResTimestamp();
            } else {
              return noop;
            }
          }

          message = decorateMessage(this.id, opts.message, opts);
          return method.bind(console, message, ...opts.args);
        }

        return noop;
      }

    }
    Log.VERSION = VERSION$3;

    function normalizeLogLevel(logLevel) {
      if (!logLevel) {
        return 0;
      }

      let resolvedLevel;

      switch (typeof logLevel) {
        case 'number':
          resolvedLevel = logLevel;
          break;

        case 'object':
          resolvedLevel = logLevel.logLevel || logLevel.priority || 0;
          break;

        default:
          return 0;
      }

      assert$3(Number.isFinite(resolvedLevel) && resolvedLevel >= 0);
      return resolvedLevel;
    }

    function normalizeArguments(opts) {
      const {
        logLevel,
        message
      } = opts;
      opts.logLevel = normalizeLogLevel(logLevel);
      const args = opts.args ? Array.from(opts.args) : [];

      while (args.length && args.shift() !== message) {}

      opts.args = args;

      switch (typeof logLevel) {
        case 'string':
        case 'function':
          if (message !== undefined) {
            args.unshift(message);
          }

          opts.message = logLevel;
          break;

        case 'object':
          Object.assign(opts, logLevel);
          break;
      }

      if (typeof opts.message === 'function') {
        opts.message = opts.message();
      }

      const messageType = typeof opts.message;
      assert$3(messageType === 'string' || messageType === 'object');
      return Object.assign(opts, opts.opts);
    }

    function decorateMessage(id, message, opts) {
      if (typeof message === 'string') {
        const time = opts.time ? leftPad(formatTime(opts.total)) : '';
        message = opts.time ? "".concat(id, ": ").concat(time, "  ").concat(message) : "".concat(id, ": ").concat(message);
        message = addColor(message, opts.color, opts.background);
      }

      return message;
    }

    function logImageInNode({
      image,
      message = '',
      scale = 1
    }) {
      let asciify = null;

      try {
        asciify = module.require('asciify-image');
      } catch (error) {}

      if (asciify) {
        return () => asciify(image, {
          fit: 'box',
          width: "".concat(Math.round(80 * scale), "%")
        }).then(data => console.log(data));
      }

      return noop;
    }

    function logImageInBrowser({
      image,
      message = '',
      scale = 1
    }) {
      if (typeof image === 'string') {
        const img = new Image();

        img.onload = () => {
          const args = formatImage(img, message, scale);
          console.log(...args);
        };

        img.src = image;
        return noop;
      }

      const element = image.nodeName || '';

      if (element.toLowerCase() === 'img') {
        console.log(...formatImage(image, message, scale));
        return noop;
      }

      if (element.toLowerCase() === 'canvas') {
        const img = new Image();

        img.onload = () => console.log(...formatImage(img, message, scale));

        img.src = image.toDataURL();
        return noop;
      }

      return noop;
    }

    new Log({
      id: 'loaders.gl'
    });
    class ConsoleLog {
      constructor() {
        _defineProperty(this, "console", void 0);

        this.console = console;
      }

      log(...args) {
        return this.console.log.bind(this.console, ...args);
      }

      info(...args) {
        return this.console.info.bind(this.console, ...args);
      }

      warn(...args) {
        return this.console.warn.bind(this.console, ...args);
      }

      error(...args) {
        return this.console.error.bind(this.console, ...args);
      }

    }

    ({
      fetch: null,
      mimeType: undefined,
      nothrow: false,
      log: new ConsoleLog(),
      CDN: 'https://unpkg.com/@loaders.gl',
      worker: true,
      maxConcurrency: 3,
      maxMobileConcurrency: 1,
      reuseWorkers: true,
      _workerType: '',
      limit: 0,
      _limitMB: 0,
      batchSize: 'auto',
      batchDebounceMs: 0,
      metadata: false,
      transforms: []
    });
    typeof process !== 'object' || String(process) !== '[object process]' || process.browser;
    const matches = typeof process !== 'undefined' && process.version && /v([0-9]*)/.exec(process.version);
    matches && parseFloat(matches[1]) || 0;

    let Type;

    (function (Type) {
      Type[Type["NONE"] = 0] = "NONE";
      Type[Type["Null"] = 1] = "Null";
      Type[Type["Int"] = 2] = "Int";
      Type[Type["Float"] = 3] = "Float";
      Type[Type["Binary"] = 4] = "Binary";
      Type[Type["Utf8"] = 5] = "Utf8";
      Type[Type["Bool"] = 6] = "Bool";
      Type[Type["Decimal"] = 7] = "Decimal";
      Type[Type["Date"] = 8] = "Date";
      Type[Type["Time"] = 9] = "Time";
      Type[Type["Timestamp"] = 10] = "Timestamp";
      Type[Type["Interval"] = 11] = "Interval";
      Type[Type["List"] = 12] = "List";
      Type[Type["Struct"] = 13] = "Struct";
      Type[Type["Union"] = 14] = "Union";
      Type[Type["FixedSizeBinary"] = 15] = "FixedSizeBinary";
      Type[Type["FixedSizeList"] = 16] = "FixedSizeList";
      Type[Type["Map"] = 17] = "Map";
      Type[Type["Dictionary"] = -1] = "Dictionary";
      Type[Type["Int8"] = -2] = "Int8";
      Type[Type["Int16"] = -3] = "Int16";
      Type[Type["Int32"] = -4] = "Int32";
      Type[Type["Int64"] = -5] = "Int64";
      Type[Type["Uint8"] = -6] = "Uint8";
      Type[Type["Uint16"] = -7] = "Uint16";
      Type[Type["Uint32"] = -8] = "Uint32";
      Type[Type["Uint64"] = -9] = "Uint64";
      Type[Type["Float16"] = -10] = "Float16";
      Type[Type["Float32"] = -11] = "Float32";
      Type[Type["Float64"] = -12] = "Float64";
      Type[Type["DateDay"] = -13] = "DateDay";
      Type[Type["DateMillisecond"] = -14] = "DateMillisecond";
      Type[Type["TimestampSecond"] = -15] = "TimestampSecond";
      Type[Type["TimestampMillisecond"] = -16] = "TimestampMillisecond";
      Type[Type["TimestampMicrosecond"] = -17] = "TimestampMicrosecond";
      Type[Type["TimestampNanosecond"] = -18] = "TimestampNanosecond";
      Type[Type["TimeSecond"] = -19] = "TimeSecond";
      Type[Type["TimeMillisecond"] = -20] = "TimeMillisecond";
      Type[Type["TimeMicrosecond"] = -21] = "TimeMicrosecond";
      Type[Type["TimeNanosecond"] = -22] = "TimeNanosecond";
      Type[Type["DenseUnion"] = -23] = "DenseUnion";
      Type[Type["SparseUnion"] = -24] = "SparseUnion";
      Type[Type["IntervalDayTime"] = -25] = "IntervalDayTime";
      Type[Type["IntervalYearMonth"] = -26] = "IntervalYearMonth";
    })(Type || (Type = {}));

    const getVertexShaderSnippet = ({ useUV = false }) => `
  let worldPosition: vec4<f32> = transform.modelMatrix * input.pos;
  output.Position = transform.projectionMatrix *
                    transform.viewMatrix *
                    worldPosition;
  
  output.normal = transform.normalMatrix *
                  input.normal;

  ${useUV ? 'output.uv = input.uv;' : ''}

  output.pos = worldPosition;
`;
    const getFragmentShaderSnippet = ({ useTexture = false }) => `
  let normal: vec3<f32> = normalize(input.normal.rgb);
  // TODO: this is hacky, since its hijacking the Color fragment output to output the position
  // for the purposed of the deferred demo. The output variable "Color" is always at location(0)
  // Must think of a better way mark that shader is using MRT and will output to different varyings
  output.Color = vec4<f32>(input.pos.rgb, 1.0);
  output.normal = vec4<f32>(normal, 1.0);
  // output.albedo = vec4<f32>(1.0, 0.0, 0.0, 1.0);
  ${useTexture
    ? 'output.albedo = textureSample(sampler_texture, my_sampler, vec2<f32>(input.uv.x, 1.0 - input.uv.y));'
    : 'output.albedo = vec4<f32>(inputUBO.baseColor.rgb, 1.0);'}
`;
    const DEFERRED_RENDER_VERTEX_SNIPPET = `
  output.Position = transform.projectionMatrix *
                    transform.viewMatrix *
                    transform.modelMatrix *
                    input.pos;
  output.uv = input.uv;
`;
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
`;
    const OPTIONS = {
        debugMode: false,
    };
    (() => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const gltf = yield load(`${window['ASSETS_BASE_URL']}/DragonAttenuation.gltf`, GLTFLoader);
        console.log(gltf);
        const gui = new GUI$1();
        gui.add(OPTIONS, 'debugMode').onChange((v) => {
            quadMesh.setUniform('debugMode', new Uint32Array([v]));
        });
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
        // Parse glTF to scene graph
        const rootNode = new SceneObject();
        const gBufferRootNode = new SceneObject();
        traverseSceneGraph(gltf.scene, rootNode, gBufferRootNode);
        const duckScale = 0.5;
        rootNode
            .setScale({ x: duckScale, y: duckScale, z: duckScale })
            .updateWorldMatrix();
        gBufferRootNode
            .setScale({ x: duckScale, y: duckScale, z: duckScale })
            .updateWorldMatrix();
        //
        const perspCamera = new PerspectiveCamera((45 * Math.PI) / 180, canvas.width / canvas.height, 0.1, 20)
            .setPosition({ x: 0.81, y: 0.31, z: 3.91 })
            .lookAt([0, 0, 0])
            .updateProjectionMatrix()
            .updateViewMatrix();
        new CameraController(perspCamera, canvas, false, 0.1).lookAt([0, 0, 0]);
        //
        const orthoCamera = new OrthographicCamera(-canvas.width / 2, canvas.width / 2, canvas.height / 2, -canvas.height / 2, 0.1, 3)
            .setPosition({ z: 2 })
            .lookAt([0, 0, 0])
            .updateProjectionMatrix()
            .updateViewMatrix();
        //
        const textureDepth = new Texture(device, 'texture_depth').fromDefinition({
            size: [canvas.width, canvas.height, 1],
            format: 'depth24plus',
            usage: GPUTextureUsage.RENDER_ATTACHMENT,
        });
        // g-buffer pipeline descriptor
        const gBufferTexturePosition = new Texture(device, 'position_texture', 'unfilterable-float').fromDefinition({
            size: [canvas.width, canvas.height, 3],
            usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
            format: 'rgba32float',
        });
        const gBufferTextureNormal = new Texture(device, 'normal_texture', 'unfilterable-float').fromDefinition({
            size: [canvas.width, canvas.height, 3],
            usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
            format: 'rgba32float',
        });
        const gBufferTextureDiffuse = new Texture(device, 'diffuse_texture', 'unfilterable-float').fromDefinition({
            size: [canvas.width, canvas.height],
            usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
            format: 'bgra8unorm',
        });
        const gBufferPassDescriptor = {
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
        };
        //
        const quadGeometry = new Geometry(device);
        {
            const { vertices, uv, indices } = index.createPlane({
                width: innerWidth,
                height: innerHeight,
            });
            const vertexBuffer = new VertexBuffer(device, 0, vertices, 3 * Float32Array.BYTES_PER_ELEMENT).addAttribute('pos', 0, 3 * Float32Array.BYTES_PER_ELEMENT, 'float32x3');
            const uvBuffer = new VertexBuffer(device, 1, uv, 2 * Float32Array.BYTES_PER_ELEMENT).addAttribute('uv', 0, 2 * Float32Array.BYTES_PER_ELEMENT, 'float32x2');
            const indexBuffer = new IndexBuffer(device, indices);
            quadGeometry
                .addVertexBuffer(vertexBuffer)
                .addVertexBuffer(uvBuffer)
                .addIndexBuffer(indexBuffer);
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
            .updateModelMatrix();
        requestAnimationFrame(drawFrame);
        function drawFrame(ts) {
            requestAnimationFrame(drawFrame);
            const commandEncoder = device.createCommandEncoder();
            // gbuffers pass
            const gBufferPass = commandEncoder.beginRenderPass(gBufferPassDescriptor);
            gBufferRootNode.traverseGraph((node) => {
                if (node.renderable) {
                    node.render(gBufferPass, perspCamera);
                }
            });
            gBufferPass.endPass();
            const swapChainTexture = context.getCurrentTexture();
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
            });
            // fullscreen quad postprocessing pass
            quadMesh.render(renderPass, orthoCamera);
            renderPass.endPass();
            device.queue.submit([commandEncoder.finish()]);
        }
        function traverseSceneGraph(currentNode, parentNode = null, gBufferParentNode = null) {
            // handle mesh node
            const sceneNode = new SceneObject();
            const gBufferSceneNode = new SceneObject();
            if (currentNode.mesh) {
                currentNode.mesh.primitives.map((primitive) => {
                    const geometry = new Geometry(device);
                    if (primitive.attributes.POSITION) {
                        const vertexBuffer = new VertexBuffer(device, 0, primitive.attributes.POSITION.value, primitive.attributes.POSITION.bytesPerElement).addAttribute('pos', 0, primitive.attributes.POSITION.bytesPerElement, 'float32x3');
                        geometry.addVertexBuffer(vertexBuffer);
                    }
                    if (primitive.attributes.NORMAL) {
                        const vertexBuffer = new VertexBuffer(device, 1, primitive.attributes.NORMAL.value, primitive.attributes.NORMAL.bytesPerElement).addAttribute('normal', 0, primitive.attributes.NORMAL.bytesPerElement, 'float32x3');
                        geometry.addVertexBuffer(vertexBuffer);
                    }
                    if (primitive.attributes.TEXCOORD_0) {
                        const vertexBuffer = new VertexBuffer(device, 2, primitive.attributes.TEXCOORD_0.value, primitive.attributes.TEXCOORD_0.bytesPerElement).addAttribute('uv', 0, primitive.attributes.TEXCOORD_0.bytesPerElement, 'float32x2');
                        geometry.addVertexBuffer(vertexBuffer);
                    }
                    const indexBuffer = new IndexBuffer(device, primitive.indices.value);
                    geometry.addIndexBuffer(indexBuffer);
                    const { material: { pbrMetallicRoughness: { baseColorFactor, baseColorTexture }, }, } = currentNode.mesh.primitives[0];
                    const uniforms = {};
                    const textures = [];
                    const samplers = [];
                    if (baseColorTexture) {
                        const { texture: { source: { image }, }, } = baseColorTexture;
                        const texture = new Texture(device, 'sampler_texture').fromImageBitmap(image);
                        const sampler = new Sampler(device, 'my_sampler');
                        samplers.push(sampler);
                        textures.push(texture);
                    }
                    if (baseColorFactor) {
                        uniforms['baseColor'] = {
                            type: 'vec4<f32>',
                            value: new Float32Array(baseColorFactor),
                        };
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
                    });
                    if (!baseColorTexture) {
                        gBufferMesh.setPosition({ y: 5 }).updateModelMatrix();
                    }
                    gBufferMesh.setParent(gBufferSceneNode);
                });
            }
            if (currentNode.matrix) {
                sceneNode.copyFromMatrix(currentNode.matrix);
                gBufferSceneNode.copyFromMatrix(currentNode.matrix);
            }
            else {
                const matrix = create$6();
                if (currentNode.translation) {
                    translate$1(matrix, matrix, currentNode.translation);
                }
                if (currentNode.rotation) {
                    const rot = fromValues$1(currentNode.rotation[0], currentNode.rotation[1], currentNode.rotation[2], 1);
                    const rotMat = create$6();
                    fromQuat(rotMat, rot);
                    mul$1(matrix, matrix, rotMat);
                }
                if (currentNode.scale) {
                    scale$2(matrix, matrix, currentNode.scale);
                }
                sceneNode.copyFromMatrix(matrix);
                gBufferSceneNode.copyFromMatrix(matrix);
            }
            if (parentNode) {
                sceneNode.setParent(parentNode);
            }
            if (gBufferParentNode) {
                gBufferSceneNode.setParent(gBufferParentNode);
            }
            const children = currentNode.nodes || currentNode.children;
            if (children && children.length) {
                children.forEach((childNode) => {
                    traverseSceneGraph(childNode, sceneNode, gBufferSceneNode);
                });
            }
        }
    }))();

}());
