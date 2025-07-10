import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['react-share'],
    exclude: ['lucide-react'],
  },
  server: {
    watch: {
      ignored: ['**/.git/**'], // Ignore .git folder
    },
  },
});
