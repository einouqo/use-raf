import codspeedPlugin from '@codspeed/vitest-plugin'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [ codspeedPlugin() ],
  test: {
    environment: 'jsdom',
    globals: true,
    reporters: ['default', 'junit'],
    outputFile: './test-report.junit.xml',
    coverage: { provider: 'v8' },
  },
})
