const { DefinePlugin } = require('webpack')
const TerserPlugin = require('terser-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')

module.exports = (async () => {
	const { ENV_OBJ_WITH_JSON_STRINGIFY_VALUE } = await import('./env/env.mjs')

	return {
		mode: 'production',
		module: {
			rules: [
				{
					test: /\.(js|jsx|ts|tsx)$/,
					exclude: /node_modules|dist/,
					use: {
						loader: 'babel-loader',
						options: {
							presets: [
								[
									'@babel/preset-env',
									{
										bugfixes: true,
										useBuiltIns: 'entry',
										corejs: '3.26.1',
									},
								],
								'@babel/preset-react',
								'@babel/preset-typescript',
							],
							plugins: [
								'@loadable/babel-plugin',
								['@babel/plugin-proposal-class-properties', { loose: false }],
							],
						},
					},
				},
			],
		},
		plugins: [
			new HtmlWebpackPlugin({
				title: 'webpack project for react',
				template: 'index.html',
				inject: 'body',
				templateParameters: {
					env: process.env.ENV,
					ioHost: JSON.stringify(process.env.IO_HOST),
				},
				minify: {
					collapseWhitespace: true,
					removeComments: true,
					removeRedundantAttributes: true,
					removeScriptTypeAttributes: true,
					removeStyleLinkTypeAttributes: true,
					useShortDoctype: true,
				},
			}),
			new DefinePlugin({
				'import.meta.env': ENV_OBJ_WITH_JSON_STRINGIFY_VALUE,
			}),
		],
		cache: {
			type: 'filesystem',
		},
		performance: {
			maxEntrypointSize: 512000,
			maxAssetSize: 512000,
		},
		optimization: {
			moduleIds: 'deterministic',
			runtimeChunk: {
				name: (entrypoint) => `runtimechunk~${entrypoint.name}`,
			},
			splitChunks: {
				chunks: 'all',
				minSize: 100000,
				maxSize: 250000,

				cacheGroups: {
					vendor: {
						name: '[hash]',
						reuseExistingChunk: true,
						test: /[\\/]node_modules[\\/]/,
						chunks: 'all',
					},
				},
			},

			minimize: true,
			minimizer: [
				new TerserPlugin({
					parallel: true,
				}),
			],
		},
	}
})()
