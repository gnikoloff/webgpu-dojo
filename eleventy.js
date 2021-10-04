module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ 'site/_styles': 'assets' })
  return {
    dir: {
      input: 'site',
      output: 'docs',
      layouts: '_layouts',
    },
    pathPrefix: '/webgpu-dojo/',
  }
}
