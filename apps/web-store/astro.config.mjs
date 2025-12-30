// @ts-check
import { defineConfig, envField } from 'astro/config';
import node from '@astrojs/node';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
    output: 'server',
    adapter: node({
        mode: 'standalone',
    }),

    env: {
        schema: {
            REDIS_URI: envField.string({
                context: 'server',
                access: 'secret',
            }),
        },
    },
    // Session 配置 - 使用 Redis 存储
    session: {
        driver: 'lru-cache',
    },

    vite: {
        plugins: [tailwindcss()],
    },

    integrations: [react()],
});
