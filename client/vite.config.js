import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    allowedHosts:[
      'localhost',
      'c385-2409-4090-a006-d007-1c1d-11bd-4afb-8d84.ngrok-free.app', // New ngrok host
      '8f1f-2409-4090-a006-d007-1c1d-11bd-4afb-8d84.ngrok-free.app', // Old ngrok host (optional)
    ],
  },
})

