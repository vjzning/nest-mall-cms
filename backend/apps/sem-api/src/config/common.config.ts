import { registerAs } from '@nestjs/config';
import * as path from 'path';
const dev = process.env.NODE_ENV !== 'production';
export default registerAs('common', async () => {
  console.log('common config ', __dirname);
  return Promise.resolve({
    rootDir: path.resolve(__dirname, '..', '..', '..'),
    serverlessPath: path.resolve(
      __dirname,
      '..',
      '..',
      '..',
      'node_modules/serverless/scripts/serverless.js'
    ),
    logsDir: path.resolve(__dirname, '..', '..', '..', 'logs'),
  });
});
