module.exports = {
    apps: [
        {
            name: 'api-admin',
            script: 'dist/apps/api-admin/main.js',
            env: {
                NODE_ENV: 'production',
                ADMIN_API_PORT: 3000,
            },
        },
        {
            name: 'api-store',
            script: 'dist/apps/api-store/main.js',
            env: {
                NODE_ENV: 'production',
                CONTENT_API_PORT: 3001,
            },
        },
        {
            name: 'web-store',
            script: 'apps/web-store/dist/server/entry.mjs',
            env: {
                NODE_ENV: 'production',
                PORT: 4321,
                HOST: '0.0.0.0',
            },
        },
    ],
};
