const { DefinePlugin } = require('webpack')
const glob = require('glob')
const TerserPlugin = require('terser-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const { PurgeCSSPlugin } = require('purgecss-webpack-plugin')

module.exports = (async () => {
	const { ENV_OBJ_WITH_JSON_STRINGIFY_VALUE } = await import('./env/env.mjs')

	return {
		mode: 'production',
		output: {
			publicPath: '/',
			...(process.env.ESM
				? {
						module: true,
						environment: {
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
						'react-router-dom': 'module https://esm.sh/react-router-dom@6.6.2',
						'styled-components':
							'module https://esm.sh/styled-components@5.3.6',
						polished: 'module https://esm.sh/polished@4.2.2',
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
										corejs: 3,
									},
								],
								'@babel/preset-react',
								'@babel/preset-typescript',
							],
							plugins: [
								['@babel/plugin-transform-class-properties', { loose: false }],
							],
						},
					},
				},
			],
		},
		plugins: [
			new PurgeCSSPlugin({
				paths: ['./index.production.html'].concat(
					glob.sync(`./src/**/*`, { nodir: true })
				),
			}),
			new HtmlWebpackPlugin({
				title: 'webpack project for react',
				template: 'index.production.html',
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
		stats: {
			assetsSort: '!size',
			children: false,
			usedExports: false,
			modules: false,
			entrypoints: false,
			excludeAssets: [/\.*\.map/],
		},
		cache: {
			type: 'filesystem',
			allowCollectingMemory: true,
			memoryCacheUnaffected: true,
			compression: 'gzip',
		},
		performance: {
			maxEntrypointSize: 512000,
			maxAssetSize: 512000,
			hints: false,
		},
		optimization: {
			moduleIds: 'deterministic',
			runtimeChunk: 'single',
			splitChunks: {
				chunks: 'all',
				minSize: 5000,
				maxSize: 100000,

				cacheGroups: {
					styles: {
						type: 'css/mini-extract',
						filename: '[contenthash:8].css',
						priority: 100,
						minSize: 1000,
						maxSize: 50000,
						minSizeReduction: 50000,
						enforce: true,
					},
					vendor: {
						chunks: 'all',
						test: /[\\/]node_modules[\\/]/,
						filename: '[chunkhash:8].js',
						enforce: true,
						reuseExistingChunk: true,
					},
					utils: {
						chunks: 'all',
						test: /[\\/]utils[\\/]/,
						filename: '[chunkhash:8].js',
						reuseExistingChunk: true,
						minSize: 10000,
						maxSize: 100000,
					},
					app: {
						chunks: 'all',
						test: /[\\/]app[\\/]/,
						filename: '[chunkhash:8].js',
						reuseExistingChunk: true,
						minSize: 10000,
						maxSize: 100000,
					},
					store: {
						chunks: 'all',
						test: /[\\/]store[\\/]/,
						filename: '[chunkhash:8].js',
						reuseExistingChunk: true,
						minSize: 10000,
						maxSize: 100000,
					},
					hooks: {
						chunks: 'all',
						test: /[\\/]hooks[\\/]/,
						filename: '[chunkhash:8].js',
						reuseExistingChunk: true,
						minSize: 10000,
						maxSize: 100000,
					},
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
							// drop_console: true, // It will stop showing any console.log statement in dev tools. Make it false if you want to see consoles in production mode.
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
						// CssMinimizerPlugin.esbuildMinify,
						CssMinimizerPlugin.cssnanoMinify,
						CssMinimizerPlugin.cssoMinify,
						CssMinimizerPlugin.cleanCssMinify,
					],
				}),
			],
		}, // optimization
		target: process.env.ESM ? 'web' : 'browserslist',
		...(process.env.ESM
			? {
					experiments: {
						outputModule: true,
					},
			  }
			: {
					experiments: {
						cacheUnaffected: true,
					},
			  }),
	}
})()
