export const testForWebGPUSupport = async () => {
  const adapter = await navigator.gpu?.requestAdapter()
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
    `
  }
}
