import { defineConfig } from 'vite';
import basicSsl from '@vitejs/plugin-basic-ssl';

// HTTPS by default: iOS DeviceMotion only works in a secure context, and
// the phone is the primary device. `npm run dev:http` opts out for local
// preview tooling that can't handle the self-signed cert.
export default defineConfig({
  // Relative asset paths: the built bundle works served from ANY path
  // (site root or /aquarium/ subpath) — no per-deploy configuration.
  base: './',
  plugins: process.env.NO_HTTPS ? [] : [basicSsl()],
  server: {
    // Honor PORT when preview tooling assigns one; default stays 5173.
    port: Number(process.env.PORT) || 5173,
  },
});
