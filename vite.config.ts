import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  root: './',
  plugins: [react()],
  build: {
    rollupOptions: {
      external: ['fsevents'],
    },
  },
})