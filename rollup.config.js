import nodeResolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';


const output = {
  file: 'dist/index.js',
  format: 'cjs',
  outro: `
module.exports = exports['default'];
for (var m in exports) {
  module.exports[m] = exports[m];
}
`,
  sourcemap: true,
};

export default {
  input: './index.js',
  output,
  plugins: [
    nodeResolve({
      module: true,
      jsnext: true
    }),
    babel({
      exclude: 'node_modules/**',
      runtimeHelpers: true
    })
  ],
};
