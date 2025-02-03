import jsx from './jsx-plugin.js';
import commonjs from '@rollup/plugin-commonjs'; // enables transpilation into CommonJS (CJS) format
import del from 'rollup-plugin-delete'; // delete files and folders using Rollup
import peerDepsExternal from 'rollup-plugin-peer-deps-external'; // prevents Rollup from bundling the peer dependencies
import resolve from '@rollup/plugin-node-resolve'; // bundles third party dependencies
import { terser } from 'rollup-plugin-terser'; // minify Rollup bundle
import json from '@rollup/plugin-json';
import { babel } from '@rollup/plugin-babel';

export default {
  input: 'src/index.js',
  output: {
    file: 'dist/app.js',
    format: 'esm',
    inlineDynamicImports: true,
  },
  build: {
    chunkSizeWarningLimit: 100,
    rollupOptions: {
      onwarn(warning, warn) {
        if (warning.code === "MODULE_LEVEL_DIRECTIVE") {
          return;
        }
        warn(warning);
      },
    },
  },
  plugins: [
    del({
      targets: ['dist/*'] // clear dist/ folder contents on new bundle creation
    }),
    peerDepsExternal(),
    babel({
      presets: ["@babel/preset-env", "@babel/preset-react"],
      plugins: [
        'transform-es2015-spread',
        "transform-object-rest-spread"
      ]
    }),
    resolve(),
    commonjs(),
    terser(),
    json({
      compact: true,
    })
  ]
};
