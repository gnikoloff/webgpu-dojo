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

console.log({ EXAMPLES_DEFINITIONS })

const plugins = [
  css({
    minify: process.env.NODE_ENV === 'production',
  }),
  json(),
  replace({
    'process.env.NODE_ENV': JSON.stringify('production'),
  }),
  commonjs(),
  nodeResolve({
    browser: true,
    main: true,
  }),
  typescript({
    useTsconfigDeclarationDir: true,
    // declarationDir: 'dist/src',
  }),
  sourcemaps(),
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

export default [
  {
    input: 'src/index.js',
    output: {
      file: '_site/assets/index.js',
      format: 'iife',
    },
    plugins: [
      copy({
        targets: [{ src: `src/assets/**/*`, dest: `_site/assets/` }],
      }),
    ],
  },
  ...EXAMPLES_DEFINITIONS.map(({ entries }) => entries)
    .flat()
    .map(({ id }) => ({
      input: `src/examples/${id}/index.ts`,
      output: [{ file: `_site/${id}/bundle.js`, format: 'iife' }],
      plugins,
    })),
]
