import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import react from "@vitejs/plugin-react-swc";

// https://vitejs.dev/config/
export default defineConfig({
   plugins: [
      react(),
      VitePWA({
         registerType: "autoUpdate",
         injectRegister: "auto",
         manifest: false,
         workbox: {
            globPatterns: [
               "**/*.{js,css,html,json,ico,png,svg}",
               "fa/**/*.{woff,woff2,ttf}",
            ],
            runtimeCaching: [
               {
                  urlPattern: /.*\.(?:woff|woff2|ttf)/,
                  handler: "StaleWhileRevalidate",
                  options: {
                     cacheName: "font-cache",
                     expiration: {
                        maxEntries: 50,
                        maxAgeSeconds: 30 * 24 * 60 * 60,
                     },
                  },
               },
               {
                  urlPattern: /.*\.svg$/,
                  handler: "CacheFirst",
                  options: {
                     cacheName: "svg-cache",
                     expiration: {
                        maxEntries: 50,
                        maxAgeSeconds: 60 * 24 * 60 * 60, // Cache for 60 days
                     },
                  },
               },
            ],
            navigateFallback: "/index.html",
            cleanupOutdatedCaches: true,
         },
         devOptions: {
            enabled: true,
            type: "module",
            navigateFallback: "/index.html",
         },
      }),
   ],
   server: {
      host: "0.0.0.0",
      port: 5173,
   },
});
