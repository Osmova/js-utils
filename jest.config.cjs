/** @type {import('jest').Config} */
module.exports = {
    testEnvironment: 'node',
    testMatch: ['<rootDir>/tests/unit/**/*.test.ts'],
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1'
    },
    transform: {
        '^.+\\.ts$': ['ts-jest', {
            isolatedModules: true,
            tsconfig: {
                module: 'commonjs',
                moduleResolution: 'node',
                target: 'es2020',
                esModuleInterop: true,
                strict: true
            }
        }]
    }
};
