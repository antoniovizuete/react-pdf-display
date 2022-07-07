import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    dts()
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'react-pdf-display',
      formats: ['umd', 'cjs', 'es'],
      fileName: format => `react-pdf-display.${format}.js`,
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'pdfjs-dist'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'pdfjs-dist': 'pdfjsLib',
        }
      }
    }
  }
})
