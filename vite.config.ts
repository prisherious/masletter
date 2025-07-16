import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  assetsInclude: ['**/*.node'],
  build: {
    rollupOptions: {
      external: ['fsevents', '../pkg'],
    },
    commonjsOptions: {
      ignoreTryCatch: () => true,
    },
  },
})

