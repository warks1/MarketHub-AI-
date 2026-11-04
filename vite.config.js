import { defineConfig } from 'vite';

// Rutas relativas para ejecutarse desde subdirectorios, vistas web nativas
// de Capacitor y hosting estático; evita referencias absolutas a /assets/.
export default defineConfig({
  base:'./',
  build:{
    outDir:'dist',
    assetsDir:'assets',
    sourcemap:false
  }
});
