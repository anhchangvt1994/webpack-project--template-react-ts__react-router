const path = require('path')
const fs = require('fs')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ReactRefreshPlugin = require('@pmmmwh/react-refresh-webpack-plugin')
const {
	WebpackCustomizeDefinePlugin,
} = require('./plugins/WebpackCustomizeDefinePlugin.js')
const { IPV4_ADDRESS } = require('./libs/network-ipv4-generator.js')

const PROJECT_PATH = __dirname.replace(/\\/g, '/')

// NOTE - Setup process.env for address and host
if (process.env) {
	process.env.LOCAL_ADDRESS = 'localhost'
	process.env.IPV4_ADDRESS = IPV4_ADDRESS || process.env.LOCAL_ADDRESS
	process.env.LOCAL_HOST = `localhost:${process.env.PORT || 3000}`
	process.env.IPV4_HOST = `${process.env.IPV4_ADDRESS}:${
		process.env.PORT || 3000
	}`
	process.env.IO_HOST = `${process.env.IPV4_ADDRESS}:${
		process.env.IO_PORT || 3030
	}`
}
// End setup process.env for address and host

const ioInitial = require('./server/io.js')

const port = process.env.PORT || 3000
let _socket = null

const WebpackDevelopmentConfiguration = async () => {
	await initENVHandler()

	return {
		mode: 'development',
		port,
		entry: {},
		output: {
			publicPath: '/',
			environment: {
				dynamicImport: true,
			},
			// module: true,
			// library: { type: 'module' },
		},
		devtool: 'inline-source-map', // NOTE - BAD Performance, GOOD debugging
		// devtool: 'eval-cheap-module-source-map', // NOTE - SLOW Performance, GOOD debugging
		// devtool: 'eval', // NOTE - GOOD Performance, BAD debugging
		// devtool: 'eval-cheap-source-map',
		devServer: {
			compress: true,
			port,
			static: './dist',
			watchFiles: ['src/**/*', 'config/index.html'],
			hot: true,
			liveReload: false,
			host: process.env.PROJECT_IPV4_HOST,
			client: {
				overlay: false,
				logging: 'warn', // Want to set this to 'warn' or 'error'
			}, // NOTE - Use overlay of react refresh plugin
			historyApiFallback: true,
			devMiddleware: {
				publicPath: '/',
				writeToDisk: true,
			},
			// onBeforeSetupMiddleware: function (devServer) {
			// 	if (!devServer) {
			// 		throw new Error('webpack-dev-server is not defined')
			// 	}

			// 	devServer.app.get(
			// 		'/src_pages_HomePage_tsx.5d1e03d3.js',
			// 		function (req, res, next) {
			// 			res.status(404).send('Not found')
			// 		}
			// 	)
			// },
		},
		module: {
			rules: [
				// NOTE - Option 2
				{
					test: /.(jsx|tsx|js|ts)$/,
					exclude: /(node_modules)/,
					use: {
						loader: 'swc-loader',
						options: {
							jsc: {
								parser: {
									syntax: 'typescript',
									tsx: true,
									decorators: false,
									dynamicImport: true,
								},
								target: 'esnext',
							},
						},
					},
				},
				// NOTE - Option 1 (popular)
				// {
				// 	test: /\.(jsx|tsx|js|ts)$/,
				// 	use: {
				// 		loader: 'esbuild-loader',
				// 		options: {
				// 			loader: 'tsx',
				// 			target: 'esnext',
				// 		},
				// 	},
				// 	exclude: /node_modules/,
				// },
				{
					test: /libs[\\/]socket.io.min.js/,
					type: 'asset/resource',
					generator: {
						filename: '[name][ext]',
					},
				},
			],
		},
		plugins: [
			new HtmlWebpackPlugin({
				title: 'webpack project for vue',
				// template: './config/templates/index.development.pacman-loading.html',
				template: './config/templates/index.development.image-loading.html',
				inject: 'body',
				templateParameters: {
					env: process.env.ENV,
					ioHost: JSON.stringify(process.env.IO_HOST),
				},
				// scriptLoading: 'module',
			}),
			RecompileLoadingScreenInitial,
			new ReactRefreshPlugin(),
			// { esModule: true, overlay: true }
			new WebpackCustomizeDefinePlugin({
				'import.meta.env': WebpackCustomizeDefinePlugin.RuntimeUpdateValue(
					() => {
						let objEnvDefault = null

						return new Promise((resolve) => {
							let result = null
							try {
								result = fs.readFileSync(`${PROJECT_PATH}/env/env.json`)
								result = result ? JSON.parse(result) : {}
							} catch (err) {
								console.log(
									'=============\nError Message:\nRead env.json file process is wrong!\nIf you need setup env, make sure you have run create-dts package script\n============='
								)
							}

							objEnvDefault = {
								PORT: JSON.stringify(process.env.PORT),
								IO_PORT: JSON.stringify(process.env.IO_PORT),
								LOCAL_ADDRESS: JSON.stringify(process.env.LOCAL_ADDRESS),
								LOCAL_HOST: JSON.stringify(process.env.LOCAL_HOST),
								IPV4_ADDRESS: JSON.stringify(process.env.IPV4_ADDRESS),
								IPV4_HOST: JSON.stringify(process.env.IPV4_HOST),
								IO_HOST: JSON.stringify(process.env.IO_HOST),
							}

							result = {
								...result,
								...objEnvDefault,
							}

							resolve(result)
						})
					},
					{
						fileDependencies: path.resolve(__dirname, './env/.env'),
					}
				),
			}),
			new webpack.ProgressPlugin({
				// NOTE - https://webpack.js.org/plugins/progress-plugin/#usage
				percentBy: 'entries',
				handler: (() => {
					// NOTE - At the first time, system will compile 3 process instead 1
					let totalProcess = 3
					let tmpTotalPercentagePerTotalProcess = 0
					let tmpTotalPercentage = 0
					let totalPercentage = 0

					return function (percentage) {
						if (!_socket) {
							return
						}

						if (percentage === 0)
							tmpTotalPercentagePerTotalProcess = totalPercentage

						tmpTotalPercentage =
							tmpTotalPercentagePerTotalProcess < 100
								? tmpTotalPercentagePerTotalProcess +
								  Math.ceil(percentage * 100) / totalProcess
								: Math.ceil(percentage * 100)

						totalPercentage =
							tmpTotalPercentage > totalPercentage || tmpTotalPercentage === 0
								? tmpTotalPercentage
								: totalPercentage + 0.5

						_socket.emit('updateProgressPercentage', totalPercentage)
					}
				})(),
			}),
		].filter(Boolean),

		stats: {
			preset: 'errors-only',
			all: false,
		},

		cache: {
			// NOTE - Type memory
			type: 'memory',
			cacheUnaffected: true,
		},

		optimization: {
			runtimeChunk: false,
			removeAvailableModules: false,
			removeEmptyChunks: false,
			splitChunks: false,
			sideEffects: false,
			providedExports: false,
		},
		// NOTE - refer to: https://github.com/webpack/webpack/issues/12102
		experiments: {
			lazyCompilation: {
				imports: true,
				entries: true,
				test: (module) =>
					!/[\\/](node_modules|src\/(utils|config|assets))[\\/]/.test(
						module.nameForCondition()
					),
			},
			layers: true,
			cacheUnaffected: true,
		},
	}
}

class RecompileLoadingScreen {
	_socketEmitTurnOnLoadingScreenTimeout = null
	_socketEmitTurnOffLoadingScreenTimeout = null
	_isFinishFirstCompiling = false

	constructor() {
		this._setupSocketConnection()
	}

	async _setupSocketConnection() {
		const self = this
		await ioInitial.then(function (data) {
			_socket = data?.socket
			data?.setupCallback?.(self._setupSocketReconnection.bind(self))
		})
	}

	_setupSocketReconnection(data) {
		if (!data || !this._isFinishFirstCompiling) return
		_socket = data?.socket
	}

	_stopTimeoutTurnOnProcessing() {
		clearTimeout(this._socketEmitTurnOffLoadingScreenTimeout)
		this._socketEmitTurnOffLoadingScreenTimeout = null
	} // _stopTimeoutTurnOnProcessing()

	_setTimeoutTurnOnProcessingWithDuration(duration) {
		if (!duration) {
			_socket.emit('turnOnLoadingScreen')
		} else {
			const self = this
			self._socketEmitTurnOnLoadingScreenTimeout = setTimeout(function () {
				_socket.emit('turnOnLoadingScreen')
				clearTimeout(self._socketEmitTurnOnLoadingScreenTimeout)
			}, duration)
		}
	} // _setTimeoutTurnOnProcessingWithDuration()

	_stopTimeoutTurnOffProcessing() {
		clearTimeout(this._socketEmitTurnOffLoadingScreenTimeout)
		this._socketEmitTurnOffLoadingScreenTimeout = null
	} // _stopTimeoutTurnOffProcessing()

	_setTimeoutTurnOffProcessingWithDuration(duration) {
		if (!duration) {
			_socket.emit('turnOffLoadingScreen')
		} else {
			const self = this
			self._socketEmitTurnOffLoadingScreenTimeout = setTimeout(function () {
				_socket.emit('turnOffLoadingScreen')
				clearTimeout(self._socketEmitTurnOffLoadingScreenTimeout)
			}, duration)
		}
	} // _setTimeoutTurnOffProcessingWithDuration()

	apply(compiler) {
		const self = this
		compiler.hooks.watchRun.tap('RecompileLoadingScreen', () => {
			if (!self._isFinishFirstCompiling || !_socket) return

			if (self._socketEmitTurnOnLoadingScreenTimeout) {
				self._stopTimeoutTurnOnProcessing()
			}

			if (self._socketEmitTurnOffLoadingScreenTimeout) {
				self._stopTimeoutTurnOffProcessing()
			}

			self._setTimeoutTurnOnProcessingWithDuration()
		}) // compiler.hooks.watchRun

		compiler.hooks.done.tap('RecompileLoadingScreen', () => {
			if (!self._isFinishFirstCompiling || !_socket) {
				self._isFinishFirstCompiling = true
				return
			}

			if (self._socketEmitTurnOnLoadingScreenTimeout) {
				self._stopTimeoutTurnOnProcessing()
			}

			if (self._socketEmitTurnOffLoadingScreenTimeout) {
				self._stopTimeoutTurnOffProcessing()
			}

			self._setTimeoutTurnOffProcessingWithDuration(70)
		}) // compiler.hooks.done
	}
}

const RecompileLoadingScreenInitial = new RecompileLoadingScreen()

const initENVHandler = async () => {
	await import('./types/dts-generator.mjs').then(async (data) => {
		if (!data) return

		return await data.promiseENVWriteFileSync.then(function () {
			const nodemon = require('nodemon')

			nodemon({
				script: './config/types/dts-generator.mjs',
				stdout: false,
				quiet: true,
				watch: './env/env*.mjs',
				runOnChangeOnly: true,
			})

			nodemon.on('restart', function () {
				RecompileLoadingScreenInitial._setTimeoutTurnOnProcessingWithDuration(
					10
				)
			})
		})
	})
} // initENVHandler()

module.exports = WebpackDevelopmentConfiguration()
