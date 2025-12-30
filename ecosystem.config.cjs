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
        {
            name: 'web-admin-serve',
            script: 'serve',
            env: {
                NODE_ENV: 'production',
                PM2_SERVE_PATH: 'apps/web-admin/dist', // 静态文件目录
                PM2_SERVE_PORT: 8080, // 监听端口
                PM2_SERVE_SPA: 'true', // 启用 SPA 模式（所有路由 fallback 到 index.html）
            },
        },
    ],
};
