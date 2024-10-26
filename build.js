// build.js

const esbuild = require('esbuild');

esbuild.build({
  entryPoints: ['src/main.js'],
  bundle: true,
  outfile: 'dist/main.js',
  platform: 'node',
  target: 'node16',
  format: 'cjs',
  external: ['pkg'],
}).catch(() => process.exit(1));
