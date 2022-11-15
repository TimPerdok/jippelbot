module.exports = {
    moduleFileExtensions: ['js', 'json', 'jsx', 'ts', 'tsx'],
    roots: ['.'],
    transform: {
        '^.+\\.(ts|tsx)$': [
            'ts-jest',
            {
                tsconfig: './tsconfig.json',
            }
        ],
    },
    testMatch: ['**/*.test.(ts|js)'],
    testEnvironment: 'node',
    preset: 'ts-jest',
    collectCoverageFrom: ['./**/*.ts', '!./migration/**', '!./tests/**'],
};
