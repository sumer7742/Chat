// PM2 process definition — cluster mode for multi-core horizontal scaling.
// Sticky sessions are handled at the Nginx layer (ip_hash) so Socket.IO clients
// stay pinned to one worker; the Redis adapter fans events across workers.
module.exports = {
  apps: [
    {
      name: 'chat-api',
      script: 'dist/server.js',
      instances: process.env.PM2_INSTANCES || 'max',
      exec_mode: 'cluster',
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
      },
      out_file: '/dev/stdout',
      error_file: '/dev/stderr',
      merge_logs: true,
    },
  ],
};
