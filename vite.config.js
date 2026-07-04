import { defineConfig } from 'vite';
import basicSsl from '@vitejs/plugin-basic-ssl';

// HTTPS by default: iOS DeviceMotion only works in a secure context, and
// the phone is the primary device. `npm run dev:http` opts out for local
// preview tooling that can't handle the self-signed cert.
export default defineConfig({
  plugins: process.env.NO_HTTPS ? [] : [basicSsl()],
});
