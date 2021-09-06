import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import sourcemaps from 'rollup-plugin-sourcemaps'
import copy from 'rollup-plugin-copy'
import css from 'rollup-plugin-import-css'
import typescript from 'rollup-plugin-typescript2'
import json from '@rollup/plugin-json'
import glslify from 'rollup-plugin-glslify'
import replace from '@rollup/plugin-replace'
import { uglify } from 'rollup-plugin-uglify'
import strip from '@rollup/plugin-strip'

import EXAMPLES_DEFINITIONS from './EXAMPLES_DEFINITIONS.json'

const plugins = [
  css({
    minify: process.env.NODE_ENV === 'production',
  }),
  json(),
  replace({
    'process.env.NODE_ENV': JSON.stringify('production'),
  }),
  commonjs(),
  nodeResolve(),
  typescript({
    useTsconfigDeclarationDir: true,
    // declarationDir: 'dist/src',
  }),
  sourcemaps(),
  copy({
    targets: [{ src: `index.html`, dest: `dist` }],
  }),
  glslify({
    include: [
      // '**/*.vs',
      // '**/*.fs',
      // '**/*.vert',
      // '**/*.frag',
      '**/*.glsl',
      '**/*.wglsl',
    ],
    compress: false,
    transform: [
      [
        (shaderPath, shaderSource, shaderOpts) => {
          return shaderSource.replace('#define GLSLIFY 1', '')
        },
        {
          post: true,
        },
      ],
    ],
  }),
  process.env.NODE_ENV === 'production' && uglify(),
  process.env.NODE_ENV === 'production' &&
    strip({
      include: ['**/*.js', '**/*.ts'],
    }),
]

export default EXAMPLES_DEFINITIONS.map(({ id }) => ({
  input: `src/examples/${id}/index.ts`,
  output: [{ file: `docs/dist/${id}/bundle.js`, format: 'iife' }],
  plugins,
}))
