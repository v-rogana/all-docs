import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
  // html-to-docx depende de módulos nativos do Node (Buffer, crypto, stream…);
  // o polyfill permite gerar o .docx no navegador.
  plugins: [react(), nodePolyfills()],
  base: '/all-docs/',
})
