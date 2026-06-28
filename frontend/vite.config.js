import { defineConfig } from 'vite';

export default defineConfig({
    server: {
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
