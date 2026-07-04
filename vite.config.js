import { defineConfig } from 'vite';
import basicSsl from '@vitejs/plugin-basic-ssl';

// --host is passed in the npm script so the phone can reach the dev server
// over LAN; basicSsl provides the self-signed cert DeviceMotion requires.
export default defineConfig({
  plugins: [basicSsl()],
});
