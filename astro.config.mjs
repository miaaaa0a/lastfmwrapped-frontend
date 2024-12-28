import { defineConfig } from 'astro/config';

export default defineConfig({
    server: {
        port: 3000,
        headers: {
            "Access-Control-Allow-Origin": "*",
        },
    },
    vite: {
        server: {
            cors: {
                origin: "*"
            }
        }
    }
});
