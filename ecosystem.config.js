module.exports = {
  apps: [
    { name: 'linfini-web',     cwd: '/var/www/linfini/apps/web',     script: 'node_modules/.bin/next', args: 'start -p 3000', env: { NODE_ENV: 'production' } },
    { name: 'linfini-order',   cwd: '/var/www/linfini/apps/order',   script: 'node_modules/.bin/next', args: 'start -p 3001', env: { NODE_ENV: 'production' } },
    { name: 'linfini-kitchen', cwd: '/var/www/linfini/apps/kitchen', script: 'node_modules/.bin/next', args: 'start -p 3002', env: { NODE_ENV: 'production' } },
    { name: 'linfini-caisse',  cwd: '/var/www/linfini/apps/caisse',  script: 'node_modules/.bin/next', args: 'start -p 3003', env: { NODE_ENV: 'production' } },
    { name: 'linfini-admin',   cwd: '/var/www/linfini/apps/admin',   script: 'node_modules/.bin/next', args: 'start -p 3004', env: { NODE_ENV: 'production' } },
  ]
}
