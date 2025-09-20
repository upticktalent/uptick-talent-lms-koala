import nextJest from 'next/jest'

const createJestConfig = nextJest({
    dir: './', // path to your Next.js app
})

const customJestConfig = {
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    testEnvironment: 'jest-environment-jsdom',
    moduleNameMapper: {
        // Handle CSS imports (CSS Modules and global)
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    },
}

export default createJestConfig(customJestConfig)
