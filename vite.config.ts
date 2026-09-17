import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [react(), VitePWA({
    registerType: 'autoUpdate',
    includeAssets: ['icons/pwa-192x192.png','icons/pwa-512x512.png'],
    manifest: { name:'Sistem Informasi & Auto Answer UPTD Puskesmas Bawolato', short_name:'Puskesmas Bawolato', description:'Layanan informasi UPTD Puskesmas Bawolato', theme_color:'#064e3b', background_color:'#f8fafc', display:'standalone', start_url:'/', icons:[{src:'/icons/pwa-192x192.png',sizes:'192x192',type:'image/png'},{src:'/icons/pwa-512x512.png',sizes:'512x512',type:'image/png'}] },
    workbox: { runtimeCaching: [{ urlPattern: /^https:\/\/raw\.githubusercontent\.com\/.*/i, handler:'StaleWhileRevalidate', options:{ cacheName:'github-questions', expiration:{maxEntries:3,maxAgeSeconds:86400*30} } }] }
  })]
});
