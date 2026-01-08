import codspeedPlugin from '@codspeed/vitest-plugin'
import { configDefaults, defineConfig } from 'vitest/config'

const defaultCoverageExclude = configDefaults.coverage.exclude ?? []

export default defineConfig({
  plugins: [codspeedPlugin()],
  test: {
    environment: 'jsdom',
    globals: true,
    reporters: ['default'],
    coverage: {
      provider: 'v8',
      exclude: [...defaultCoverageExclude, '**/*.config.*'],
    },
  },
})
