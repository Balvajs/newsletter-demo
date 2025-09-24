#!/usr/bin/env node

// Job worker script
// In production, this would run as a separate process or container

import { setupEmailProcessing } from './src/lib/email-queue';
import { setupPublishPostProcessing } from './src/lib/publish-post-queue';

setupEmailProcessing();
setupPublishPostProcessing();

console.log('Newsletter job worker started...');
console.log('Processing jobs for:');
console.log('- Post scheduling and publishing');
console.log('- Email sending');
console.log('\nPress Ctrl+C to stop');

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down worker...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\nShutting down worker...');
  process.exit(0);
});
