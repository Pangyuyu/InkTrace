import { resolve } from 'path'
import { defineConfig } from 'electron-vite'
import vue from '@vitejs/plugin-vue'
import copy from 'rollup-plugin-copy'

export default defineConfig({
  main: {
    resolve: {
      alias: {
        '@main': resolve('src/main')
      }
    },
    build: {
      rollupOptions: {
        external: ['electron', '@electron-toolkit/utils', 'sql.js']
      }
    },
    plugins: [
      copy({
        targets: [
          {
            src: 'node_modules/sql.js/dist/*.wasm',
            dest: 'out/main'
          }
        ],
        hook: 'writeBundle'
      })
    ]
  },
  preload: {
    build: {
      rollupOptions: {
        external: ['electron']
      }
    }
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src')
      }
    },
    plugins: [vue()]
  }
})
