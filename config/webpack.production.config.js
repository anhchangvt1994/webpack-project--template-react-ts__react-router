const { DefinePlugin } = require('webpack')
const TerserPlugin = require('terser-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')

module.exports = (async () => {
	const { ENV_OBJ_WITH_JSON_STRINGIFY_VALUE } = await import('./env/env.mjs')

	return {
		mode: 'production',
		output: {
			publicPath: '/',
			...(process.env.ESM
				? {
						module: true,
						// library: { type: 'module' },
						environment: {
							// module: true,
							dynamicImport: true,
						},
				  }
				: {}),
		},
		...(process.env.ESM
			? {
					// externalsType: 'module',
					externals: {
						react: 'module https://esm.sh/react@18.2.0',
						'react-dom': 'module https://esm.sh/react-dom@18.2.0',
					},
			  }
			: {}),
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
								['@babel/plugin-proposal-class-properties', { loose: false }],
							],
						},
					},
				},
			],
			noParse: /react|react-dom/,
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
				scriptLoading: process.env.ESM ? 'module' : 'defer',
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
			compression: 'gzip',
		},
		performance: {
			maxEntrypointSize: 512000,
			maxAssetSize: 512000,
		},
		optimization: {
			moduleIds: 'deterministic',
			runtimeChunk: 'single',
			splitChunks: {
				chunks: 'all',
				minSize: 5000,
				maxSize: 100000,

				cacheGroups: {
					vendor: {
						name: 'vendors',
						reuseExistingChunk: true,
						test: /[\\/]node_modules[\\/]/,
						minSizeReduction: 100000,
					},
					styles: {
						type: 'css/mini-extract',
						filename: '[contenthash:8].css',
						priority: 100,
						minSize: 1000,
						maxSize: 50000,
						minSizeReduction: 50000,
						enforce: true,
					},
					react: {
						test: /react/,
						filename: '[chunkhash:8].js',
						chunks: 'all',
						enforce: true,
					}, // react
				},
			},

			minimize: true,
			minimizer: [
				new TerserPlugin({
					parallel: 4,
					terserOptions: {
						format: {
							comments: false, // It will drop all the console.log statements from the final production build
						},
						compress: {
							drop_console: true, // It will stop showing any console.log statement in dev tools. Make it false if you want to see consoles in production mode.
						},
					},
					extractComments: false,
				}),
				// new ESBuildMinifyPlugin({
				// 	target: 'es2015',
				// }),
				new CssMinimizerPlugin({
					exclude: /node_modules/,
					parallel: 4,

					minify: [
						CssMinimizerPlugin.esbuildMinify,
						CssMinimizerPlugin.cssnanoMinify,
						CssMinimizerPlugin.cssoMinify,
						CssMinimizerPlugin.cleanCssMinify,
					],
				}),
			],
		}, // optimization
		...(process.env.ESM
			? {
					experiments: {
						outputModule: true,
					},
			  }
			: {}),
	}
})()
