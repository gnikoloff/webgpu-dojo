export const testForWebGPUSupport = async () => {
  const adapter = await navigator.gpu?.requestAdapter()

  const errorHTMLFragment = `
    <div id="no-webgpu-wrapper">
      <div id="no-webgpu">
        WebGPU is not supported on this browser. Please try modern Google Chrome (Canary) or Firefox Nightly.
      </div>
    </div>
  `

  window.addEventListener('unhandledrejection', (e) => {
    document.body.innerHTML += errorHTMLFragment
  })
  window.addEventListener('error', (e) => {
    document.body.innerHTML += errorHTMLFragment
  })

  if (!adapter) {
    document.body.innerHTML += errorHTMLFragment
  }
}
