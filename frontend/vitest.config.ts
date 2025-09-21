/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()], // enables React JSX/TSX
    test: {
        globals: true, // allows using describe/it/expect without importing
        environment: 'jsdom', // simulates browser environment
        setupFiles: './vitest.setup.ts', // runs before every test
        include: ['**/*.test.{ts,tsx}'], // test file pattern
        coverage: {
            reporter: ['text', 'json', 'html'], // optional coverage reports
        },
        alias: {
            '@': '/src', // 👈 mirrors your tsconfig absolute paths
        },
    },
})
