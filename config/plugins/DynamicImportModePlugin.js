const validWebpackModes = ['lazy', 'lazy-once', 'eager', 'weak']

module.exports = class DynamicImportModePlugin {
	constructor(webpackMode) {
		if (webpackMode && !validWebpackModes.includes(webpackMode)) {
			throw new Error(
				`Invalid webpackMode provided to DynamicImportModePlugin. Must be one of ${validWebpackModes.join(
					', '
				)}`
			)
		}
		this.webpackMode = webpackMode
	}

	apply(compiler) {
		if (!this.webpackMode) {
			return
		}

		const webpackMode = this.webpackMode
		console.log(
			`DynamicImportModePlugin: Overriding dynamic imports to use '${webpackMode}' webpackMode`
		)

		compiler.hooks.compilation.tap(
			'DynamicImportModePlugin',
			(compilation, { normalModuleFactory }) => {
				;['javascript/auto', 'javascript/dynamic', 'javascript/esm'].forEach(
					(type) => {
						normalModuleFactory.hooks.parser
							.for(type)
							.tap('DynamicImportModePlugin', (parser) => {
								const oldParseCommentOptions = parser.parseCommentOptions

								parser.parseCommentOptions = function () {
									const { options, ...rest } = oldParseCommentOptions.apply(
										parser,
										arguments
									)

									return {
										options: {
											...options,
											webpackMode,
										},
										...rest,
									}
								}
							})
					}
				)
			}
		)
	}
}
