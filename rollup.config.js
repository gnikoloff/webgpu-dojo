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

export default {
  input: 'src/index.ts',
  output: [{ file: 'dist/bundle.js', format: 'iife' }],
  external: [],
  watch: {
    include: 'src/**',
  },
  plugins: [
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
      // useTsconfigDeclarationDir: true,
      // declarationDir: 'dist/src',
    }),
    sourcemaps(),
    copy({
      targets: [{ src: `index.html`, dest: `dist` }],
    }),
    glslify(),
    process.env.NODE_ENV === 'production' && uglify(),
    process.env.NODE_ENV === 'production' &&
      strip({
        include: ['**/*.js', '**/*.ts'],
      }),
  ],
}
