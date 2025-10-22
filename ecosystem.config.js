module.exports = {
  apps: [
    {
      name: 'cmms-backend',
      script: 'node_modules/tsx/dist/cli.mjs',
      args: 'watch src/index.ts',
      cwd: './apps/api',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 4000
      },
      error_file: 'C:/COSTAATT-CMMS/logs/cmms-backend-error.log',
      out_file: 'C:/COSTAATT-CMMS/logs/cmms-backend-out.log',
      log_file: 'C:/COSTAATT-CMMS/logs/cmms-backend-combined.log',
      time: true
    },
    {
      name: 'cmms-frontend',
      script: '../../node_modules/vite/bin/vite.js',
      args: '--host 0.0.0.0 --port 5174',
      cwd: './apps/web',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'development',
        PORT: 5174,
        VITE_PORT: 5174
      },
      error_file: 'C:/COSTAATT-CMMS/logs/cmms-frontend-error.log',
      out_file: 'C:/COSTAATT-CMMS/logs/cmms-frontend-out.log',
      log_file: 'C:/COSTAATT-CMMS/logs/cmms-frontend-combined.log',
      time: true,
      interpreter: 'node'
    }
  ]
};
