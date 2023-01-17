module.exports = {
	root: true,
	ignorePatterns: ['webpack.config.js', 'env/**/*', 'config/**/*'],
	extends: [
		'.eslintrc-auto-import.json',
		'airbnb-typescript',
		'airbnb/hooks',
		'plugin:styled-components-a11y/recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:jest/recommended',
		'plugin:prettier/recommended',
		'eslint:recommended',
		'plugin:import/recommended',
		'plugin:import/typescript',
		'plugin:import/errors',
		'plugin:import/warnings',
		'prettier',
	],
	plugins: ['react', '@typescript-eslint', 'styled-components-a11y'],
	env: {
		browser: true,
		es6: true,
		jest: true,
	},
	globals: {
		Atomics: 'readonly',
		SharedArrayBuffer: 'readonly',
	},
	parser: '@typescript-eslint/parser',
	parserOptions: {
		ecmaFeatures: {
			jsx: true,
			tsx: true,
		},
		ecmaVersion: 'latest',
		sourceType: 'module',
		project: './tsconfig.json',
	},
	rules: {
		'linebreak-style': 'off',
		'prettier/prettier': [
			'error',
			{
				endOfLine: 'auto',
			},
		],
	},
	settings: {
		'import/resolver': {
			'eslint-import-resolver-custom-alias': {
				alias: {
					'@': './',
					js: './src',
					assets: './src/assets',
					pages: './src/pages',
					components: './src/components',
					config: './src/config',
					utils: './src/utils',
				},
				extensions: ['.js', '.jsx', '.ts', '.tsx'],
			},
		},
	},
}
