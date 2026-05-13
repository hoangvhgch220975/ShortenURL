import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig(async () => {
  const plugins = [vue()];

  if (process.env.NODE_ENV === 'development') {
    const mkcert = (await import('vite-plugin-mkcert')).default;
    plugins.push(mkcert());
  }

  return {
    plugins,
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    },
    server: {
      https: process.env.NODE_ENV === 'development'
    }
  }
});
