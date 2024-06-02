const path = require('path')
const loader = require('style-loader')

module.exports = function () {}

module.exports.pitch = function (request) {
	const result = loader.pitch.call(this, request)
	const index = result.indexOf(
		'options.styleTagTransform = styleTagTransformFn;\n'
	)
	if (index === -1) return result
	const insertIndex = index - 1

	// eslint-disable-next-line prefer-destructuring
	const resourcePath = this.resourcePath
	const relativePath = path.relative(
		path.resolve(__dirname, '..'),
		resourcePath
	)

	const insertAttr = `
if (typeof options.attributes !== 'object') {
  options.attributes = {}
}
options.attributes["source-path"] = '${relativePath}' // do anything you want
runtimeOptions.attributes = options.attributes;
  `

	console.log(
		result.slice(0, insertIndex) + insertAttr + result.slice(insertIndex)
	)

	return result.slice(0, insertIndex) + insertAttr + result.slice(insertIndex)
}
