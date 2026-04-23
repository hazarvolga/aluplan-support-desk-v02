module.exports = {
    apps: [
        {
            name: 'aluplan-backend',
            script: './apps/backend/dist/main.js',
            instances: 'max',
            exec_mode: 'cluster',
            max_memory_restart: '1G',
            env_production: {
                NODE_ENV: 'production',
                PORT: 3001
            }
        },
        {
            name: 'aluplan-frontend',
            script: 'pnpm',
            args: 'start --filter @aluplan/frontend',
            instances: 1, // Next.js standalone handles its own concurrent connections, cluster mode less ideal for Next.js start
            env_production: {
                NODE_ENV: 'production',
                PORT: 4000
            }
        },
        {
            name: 'aluplan-bullmq-worker',
            script: './apps/backend/dist/main.js',
            args: '--run-workers-only', // Hypothetical flag indicating this node just processes queues
            instances: 2,
            exec_mode: 'cluster',
            env_production: {
                NODE_ENV: 'production'
            }
        }
    ]
};
