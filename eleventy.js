module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ 'docs/_styles': 'assets' })
  return {
    dir: {
      input: 'docs',
      output: 'docs',
      layouts: '_layouts',
    },
    pathPrefix: '/webgpu-dojo/',
  }
}
