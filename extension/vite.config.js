import { defineConfig } from 'vite';
import path from 'path';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: 'manifest.json',
          dest: '.', // Copy to dist root
        },
        {
          src: 'popup',
          dest: '.', // Copy to dist root
        },
        {
          src: 'assets',
          dest: '.', // Copy to dist root
        },
        // Add other static assets if needed
      ],
    }),
  ],
  build: {
    outDir: path.resolve(__dirname, 'dist'),
    emptyOutDir: true, // Clean dist folder before build
    rollupOptions: {
      input: {
        content: path.resolve(__dirname, 'content.js'),
        background: path.resolve(__dirname, 'background.js'),
      },
      output: {
        entryFileNames: '[name].bundle.js',
        format: 'esm',
      },
    },
    minify: false, // Keep false for easier debugging
  },
}); 