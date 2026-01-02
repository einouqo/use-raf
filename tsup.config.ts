import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  minify: true,
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: true,
})
