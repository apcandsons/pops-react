import { defineConfig } from 'vite'

export default defineConfig({
    test: {
        globals: true,
        include: ['src/**/*.spec.ts', '!src/tests'],
        pool: 'threads',
        poolOptions: {
            threads: {
                singleThread: true,
                useAtomics: true,
            },
        },
        watch: false,
    },
    resolve: {
        alias: {
            '@': '/src',
        },
    },
})
