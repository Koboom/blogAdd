import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    host: '0.0.0.0', // BU SATIRI EKLEYİN
    port: 5173,      // Bu satır opsiyoneldir, genellikle varsayılan 5173'tür ama açıkça belirtmek iyi olur
  },
})