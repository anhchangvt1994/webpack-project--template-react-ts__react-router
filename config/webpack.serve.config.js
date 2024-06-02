const { webpack } = require('webpack')
const WebpackDevServer = require('webpack-dev-server')
const { findFreePort } = require('./utils/PortHandler')

;(async () => {
	const port = await findFreePort(process.env.PORT)
	const serverInitial = new WebpackDevServer(
		webpack({
			mode: 'development',
			entry: {},
			output: {},
		}),
		{
			compress: true,
			port: port,
			static: './dist',
			historyApiFallback: true,
		}
	)

	serverInitial.start()
})()
