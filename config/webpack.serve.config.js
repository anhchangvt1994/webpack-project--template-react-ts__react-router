const { webpack } = require('webpack')
const WebpackDevServer = require('webpack-dev-server')

const serverInitial = new WebpackDevServer(
	webpack({
		mode: 'production',
		entry: {},
		output: {},
	}),
	{
		compress: true,
		static: './dist',
    historyApiFallback: true,
	}
)

serverInitial.start(process.env.PORT || 8080)
