module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ 'site/assets': 'assets' })
  return {
    dir: {
      input: 'site',
      output: 'docs',
      layouts: '_layouts',
    },
    pathPrefix: '/webgpu-dojo/',
  }
}
