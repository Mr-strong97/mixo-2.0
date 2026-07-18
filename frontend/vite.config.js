import { defineConfig } from 'vite';

export default defineConfig({
    server: {
        host: '0.0.0.0',
        port: 5173,
        proxy: {
            '/api': {
                target: 'http://127.0.0.1:8000',
                changeOrigin: true,
                secure: false,
            },
            '/admin': {
                target: 'http://127.0.0.1:8000',
                changeOrigin: true,
                secure: false,
            },
        },
        hmr: {
            host: 'localhost',
        },
        watch: {
            // Sur certaines machines Linux, le quota inotify est trop bas
            // pour le nombre de fichiers du projet. Le polling évite ENOSPC.
            usePolling: true,
            interval: 1000,
            ignored: [
                '**/node_modules/**',
                '**/.git/**',
                '**/dist/**',
                '**/coverage/**',
            ],
        },
    },
});
