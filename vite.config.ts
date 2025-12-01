import {reactRouter} from '@react-router/dev/vite';
import {hydrogen} from '@shopify/hydrogen/vite';
import {oxygen} from '@shopify/mini-oxygen/vite';
import tailwindcss from '@tailwindcss/vite';
import {defineConfig} from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [
    hydrogen(),
    oxygen(),
    reactRouter(),
    tsconfigPaths() as any,
    tailwindcss(),
  ],
  build: {
    // Allow a strict Content-Security-Policy
    // without inlining assets as base64:
    assetsInlineLimit: 0,
  },
  server: {
    fs: {
      strict: false,
      allow: ['~/', '..'],
    },
    warmup: {
      clientFiles: [
        './app/routes/**/*',
        './app/sections/**/*',
        './app/components/**/*',
      ],
    },
    allowedHosts: true,
    cors: true,
  },
  ssr: {
    noExternal: ['remix-i18next'],
    optimizeDeps: {
      include: [
        "react-i18next",
        "react-share",
        "@fontsource-variable/inter",
      ],
    },
  },
});
