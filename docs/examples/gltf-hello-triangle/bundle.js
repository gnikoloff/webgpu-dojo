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

    function assert$5(condition, message) {
      if (!condition) {
        throw new Error(message || 'loader assertion failed.');
      }
    }

    const globals$3 = {
      self: typeof self !== 'undefined' && self,
      window: typeof window !== 'undefined' && window,
      global: typeof global !== 'undefined' && global,
      document: typeof document !== 'undefined' && document
    };
    const global_$2 = globals$3.global || globals$3.self || globals$3.window || {};
    const isBrowser$4 = typeof process !== 'object' || String(process) !== '[object process]' || process.browser;
    const matches$2 = typeof process !== 'undefined' && process.version && /v([0-9]*)/.exec(process.version);
    matches$2 && parseFloat(matches$2[1]) || 0;

    const VERSION$5 = "3.0.11" ;

    function assert$4(condition, message) {
      if (!condition) {
        throw new Error(message || 'loaders.gl assertion failed.');
      }
    }

    const globals$2 = {
      self: typeof self !== 'undefined' && self,
      window: typeof window !== 'undefined' && window,
      global: typeof global !== 'undefined' && global,
      document: typeof document !== 'undefined' && document
    };
    const global_$1 = globals$2.global || globals$2.self || globals$2.window || {};
    const isBrowser$3 = typeof process !== 'object' || String(process) !== '[object process]' || process.browser;
    const isWorker = typeof importScripts === 'function';
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

      assert$4(url);
      return url;
    }

    function validateWorkerVersion(worker, coreVersion = VERSION$5) {
      assert$4(worker, 'no worker provided');
      const workerVersion = worker.version;

      if (!coreVersion || !workerVersion) {
        return false;
      }

      return true;
    }

    const VERSION$4 = "3.0.11" ;
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

      if (!isBrowser$3) {
        return `modules/${moduleName}/dist/libs/${library}`;
      }

      if (options.CDN) {
        assert$4(options.CDN.startsWith('http'));
        return `${options.CDN}/${moduleName}@${VERSION$4}/dist/libs/${library}`;
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

      if (!isBrowser$3) {
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
      if (!isBrowser$3) {
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
      if (!WorkerFarm.isSupported()) {
        return false;
      }

      return loader.worker && (options === null || options === void 0 ? void 0 : options.worker);
    }
    async function parseWithWorker(loader, data, options, context, parseOnMainThread) {
      const name = loader.id;
      const url = getWorkerURL(loader, options);
      const workerFarm = WorkerFarm.getWorkerFarm(options);
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
      assert$5(byteLength >= 0);
      assert$5(padding > 0);
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

    const probeLog = new Log({
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

    const DEFAULT_LOADER_OPTIONS = {
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

      assert$5(loader, 'null loader');
      assert$5(isLoaderObject(loader), 'invalid loader');
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
      return isBrowser$4 ? makeBrowserStreamIterator(stream, options) : makeNodeStreamIterator(stream);
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
      assert$4(!context || typeof context === 'object');

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

      assert$4(!loader.parseSync);
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
    const matches = typeof process !== 'undefined' && process.version && /v([0-9]*)/.exec(process.version);
    matches && parseFloat(matches[1]) || 0;

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
        _defineProperty(this, "fields", void 0);

        _defineProperty(this, "metadata", void 0);

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
        _defineProperty(this, "name", void 0);

        _defineProperty(this, "type", void 0);

        _defineProperty(this, "nullable", void 0);

        _defineProperty(this, "metadata", void 0);

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

    let _Symbol$toStringTag, _Symbol$toStringTag2, _Symbol$toStringTag7;
    class DataType {
      static isNull(x) {
        return x && x.typeId === Type.Null;
      }

      static isInt(x) {
        return x && x.typeId === Type.Int;
      }

      static isFloat(x) {
        return x && x.typeId === Type.Float;
      }

      static isBinary(x) {
        return x && x.typeId === Type.Binary;
      }

      static isUtf8(x) {
        return x && x.typeId === Type.Utf8;
      }

      static isBool(x) {
        return x && x.typeId === Type.Bool;
      }

      static isDecimal(x) {
        return x && x.typeId === Type.Decimal;
      }

      static isDate(x) {
        return x && x.typeId === Type.Date;
      }

      static isTime(x) {
        return x && x.typeId === Type.Time;
      }

      static isTimestamp(x) {
        return x && x.typeId === Type.Timestamp;
      }

      static isInterval(x) {
        return x && x.typeId === Type.Interval;
      }

      static isList(x) {
        return x && x.typeId === Type.List;
      }

      static isStruct(x) {
        return x && x.typeId === Type.Struct;
      }

      static isUnion(x) {
        return x && x.typeId === Type.Union;
      }

      static isFixedSizeBinary(x) {
        return x && x.typeId === Type.FixedSizeBinary;
      }

      static isFixedSizeList(x) {
        return x && x.typeId === Type.FixedSizeList;
      }

      static isMap(x) {
        return x && x.typeId === Type.Map;
      }

      static isDictionary(x) {
        return x && x.typeId === Type.Dictionary;
      }

      get typeId() {
        return Type.NONE;
      }

      compareTo(other) {
        return this === other;
      }

    }
    _Symbol$toStringTag = Symbol.toStringTag;
    class Int extends DataType {
      constructor(isSigned, bitWidth) {
        super();

        _defineProperty(this, "isSigned", void 0);

        _defineProperty(this, "bitWidth", void 0);

        this.isSigned = isSigned;
        this.bitWidth = bitWidth;
      }

      get typeId() {
        return Type.Int;
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

        _defineProperty(this, "precision", void 0);

        this.precision = precision;
      }

      get typeId() {
        return Type.Float;
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

        _defineProperty(this, "listSize", void 0);

        _defineProperty(this, "children", void 0);

        this.listSize = listSize;
        this.children = [child];
      }

      get typeId() {
        return Type.FixedSizeList;
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
        _defineProperty(this, "draco", void 0);

        _defineProperty(this, "decoder", void 0);

        _defineProperty(this, "metadataQuerier", void 0);

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
        _defineProperty(this, "gltf", void 0);

        _defineProperty(this, "sourceBuffers", void 0);

        _defineProperty(this, "byteLength", void 0);

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
      assert$5(glb.header.byteLength > GLB_FILE_HEADER_SIZE + GLB_CHUNK_HEADER_SIZE);
      const contentLength = dataView.getUint32(byteOffset + 0, LE);
      const contentFormat = dataView.getUint32(byteOffset + 4, LE);
      byteOffset += GLB_CHUNK_HEADER_SIZE;
      assert$5(contentFormat === GLB_V1_CONTENT_FORMAT_JSON);
      parseJSONChunk(glb, dataView, byteOffset, contentLength);
      byteOffset += contentLength;
      byteOffset += parseBINChunk(glb, dataView, byteOffset, glb.header.byteLength);
      return byteOffset;
    }

    function parseGLBV2(glb, dataView, byteOffset, options) {
      assert$5(glb.header.byteLength > GLB_FILE_HEADER_SIZE + GLB_CHUNK_HEADER_SIZE);
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
     * Clamp number to a given range
     * @param {number} num
     * @param {number} min
     * @param {number} max
     * @returns {number}
     */
    const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

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

    var VERTEX_SHADER = "\n[[block]]\nstruct Transform {\n  projectionMatrix: mat4x4<f32>;\n  viewMatrix: mat4x4<f32>;\n  modelMatrix: mat4x4<f32>;\n};\n\n[[group(0), binding(0)]]\nvar<uniform> transforms: Transform;\n\nstruct Input {\n  [[location(0)]] position: vec4<f32>;\n};\n\nstruct Output {\n  [[builtin(position)]] Position: vec4<f32>;\n};\n\n[[stage(vertex)]]\nfn main (input: Input) -> Output {\n  var output: Output;\n\n  output.Position = transforms.projectionMatrix *\n                    transforms.viewMatrix *\n                    transforms.modelMatrix *\n                    input.position;\n\n  return output;\n}\n"; // eslint-disable-line

    var FRAGMENT_SHADER = "\n[[stage(fragment)]]\n\nfn main () -> [[location(0)]] vec4<f32> {\n  return vec4<f32>(1.0);\n}\n"; // eslint-disable-line

    const SAMPLE_COUNT = 4;
    testForWebGPUSupport();
    (() => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const gltf = yield load(`${window['ASSETS_BASE_URL']}Triangle.gltf`, GLTFLoader);
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
        // const { vertices, indices } = GeometryUtils.createBox()
        const vertices = gltf.accessors[1].value;
        const vertexBuffer = device.createBuffer({
            size: vertices.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
            mappedAtCreation: true,
        });
        new Float32Array(vertexBuffer.getMappedRange()).set(vertices);
        vertexBuffer.unmap();
        const indices = gltf.accessors[0].value;
        const indexBuffer = device.createBuffer({
            // indices.bytLength takes up 6 bytes, but we need it to be 8 bytes aligned
            // thats why we need to add 2 bytes extra padding - Uint16Array.BYTES_PER_ELEMENT
            // round it up to the nearest higher value of 8
            size: Math.ceil(indices.byteLength / 8) * 8,
            usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
            mappedAtCreation: true,
        });
        if (indices instanceof Uint16Array) {
            new Uint16Array(indexBuffer.getMappedRange()).set(indices);
        }
        else {
            new Uint32Array(indexBuffer.getMappedRange()).set(indices);
        }
        indexBuffer.unmap();
        const pipeline = device.createRenderPipeline({
            vertex: {
                module: device.createShaderModule({
                    code: VERTEX_SHADER,
                }),
                entryPoint: 'main',
                buffers: [
                    {
                        arrayStride: 3 * Float32Array.BYTES_PER_ELEMENT,
                        attributes: [
                            {
                                shaderLocation: 0,
                                format: 'float32x3',
                                offset: 0,
                            },
                        ],
                    },
                ],
            },
            fragment: {
                module: device.createShaderModule({
                    code: FRAGMENT_SHADER,
                }),
                entryPoint: 'main',
                targets: [
                    {
                        format: presentationFormat,
                    },
                ],
            },
            primitive: {
                topology: primitiveType,
                stripIndexFormat: undefined,
                // cullMode: 'back',
            },
            multisample: {
                count: SAMPLE_COUNT,
            },
            depthStencil: {
                format: 'depth24plus',
                depthWriteEnabled: true,
                depthCompare: 'less',
            },
        });
        const vertexUniformBuffer = device.createBuffer({
            size: 16 * 3 * Float32Array.BYTES_PER_ELEMENT,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });
        const uniformBindGroup = device.createBindGroup({
            layout: pipeline.getBindGroupLayout(0),
            entries: [
                {
                    binding: 0,
                    resource: {
                        buffer: vertexUniformBuffer,
                        offset: 0,
                        size: 16 * 3 * Float32Array.BYTES_PER_ELEMENT,
                    },
                },
            ],
        });
        const perspCamera = new PerspectiveCamera((45 * Math.PI) / 180, canvas.width / canvas.height, 0.1, 100);
        perspCamera.setPosition({ x: 0, y: 0, z: 3 });
        perspCamera.lookAt([0, 0, 0]);
        perspCamera.updateProjectionMatrix();
        perspCamera.updateViewMatrix();
        new CameraController(perspCamera);
        const cubeTransform = new Transform();
        const textureDepth = device.createTexture({
            size: [canvas.width, canvas.height, 1],
            format: 'depth24plus',
            sampleCount: SAMPLE_COUNT,
            usage: GPUTextureUsage.RENDER_ATTACHMENT,
        });
        const renderTexture = device.createTexture({
            size: [canvas.width, canvas.height],
            sampleCount: SAMPLE_COUNT,
            format: presentationFormat,
            usage: GPUTextureUsage.RENDER_ATTACHMENT,
        });
        let textureView = renderTexture.createView();
        // let textureView
        // debugger
        cubeTransform
            .setPosition({
            x: -gltf.accessors[0].max[0] / 4,
            y: -gltf.accessors[0].max[0] / 4,
        })
            .updateModelMatrix();
        device.queue.writeBuffer(vertexUniformBuffer, 16 * 2 * Float32Array.BYTES_PER_ELEMENT, cubeTransform.modelMatrix);
        requestAnimationFrame(drawFrame);
        function drawFrame(ts) {
            requestAnimationFrame(drawFrame);
            const commandEncoder = device.createCommandEncoder();
            const renderPass = commandEncoder.beginRenderPass({
                colorAttachments: [
                    {
                        view: textureView,
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
            });
            device.queue.writeBuffer(vertexUniformBuffer, 0, perspCamera.projectionMatrix);
            device.queue.writeBuffer(vertexUniformBuffer, 16 * Float32Array.BYTES_PER_ELEMENT, perspCamera.viewMatrix);
            renderPass.setPipeline(pipeline);
            renderPass.setVertexBuffer(0, vertexBuffer);
            renderPass.setIndexBuffer(indexBuffer, indices instanceof Uint16Array ? 'uint16' : 'uint32');
            renderPass.setBindGroup(0, uniformBindGroup);
            renderPass.drawIndexed(indices.length);
            renderPass.endPass();
            device.queue.submit([commandEncoder.finish()]);
        }
    }))();

}());
