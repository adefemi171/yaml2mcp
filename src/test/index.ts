import { run } from './runTest';

run().catch(err => {
  console.error('Tests failed:', err);
  process.exit(1);
});

