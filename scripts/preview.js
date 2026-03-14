import { preview, mergeConfig } from 'vite';
import baseConfig from '../vite.config.js';

async function run() {
  const server = await preview(
    mergeConfig(baseConfig, {
      configFile: false,
      preview: { host: '0.0.0.0', port: 4173 },
    })
  );
  server.printUrls();
}

run();
