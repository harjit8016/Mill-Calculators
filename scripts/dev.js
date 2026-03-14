import { createServer, mergeConfig } from 'vite';
import baseConfig from '../vite.config.js';

async function run() {
  const server = await createServer(
    mergeConfig(baseConfig, {
      configFile: false,
      server: { host: '0.0.0.0', port: 5173 },
    })
  );
  await server.listen();
  server.printUrls();
}

run();
