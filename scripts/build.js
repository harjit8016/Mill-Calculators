import { build, mergeConfig } from 'vite';
import baseConfig from '../vite.config.js';

async function run() {
  const config = mergeConfig(baseConfig, { configFile: false, logLevel: 'info' });
  await build(config);
}

run();
