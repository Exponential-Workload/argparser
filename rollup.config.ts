import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser'

export default [
  {
    input: 'src/main.ts',
    output: [
      {
        file: 'dist/lib.cjs',
        format: 'cjs',
        sourcemap: true,
      },
      {
        file: 'dist/lib.esm.mjs',
        format: 'esm',
        sourcemap: true,
      }
    ],
    plugins: [
      typescript({
        tsconfig: './tsconfig.json',
        sourceMap: true,
        declaration: true,
      }),
      terser(),
    ],
    external: [],
  },
];
