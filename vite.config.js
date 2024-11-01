import { resolve } from "path";
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const root = resolve(__dirname, 'src');
const publicDir = resolve(__dirname, "public");
const outDir = resolve(__dirname, "dist");

// https://vitejs.dev/config/
export default defineConfig({
  root,
  plugins: [react()],
  publicDir,
  build: {
    emptyOutDir: true,
    outDir,
    rollupOptions: {
      input: {
        popup: resolve(root, 'popup', 'index.html'),
        recorder: resolve(root, 'recorder', 'index.html'),
        toolbar: resolve(root, 'toolbar', 'index.html'),
      }
    }
  }
})
