import useEffectCustomize from 'js/services/use-effect-customize'

function App() {
	const [count, setCount] = useState(0)

	const useEffectCounter = new useEffectCustomize([count])

	useEffectCounter.init(() => {
		const timer = setTimeout(() => setCount(count + 1), 1000)
		return () => clearTimeout(timer)
	})

	return (
		<div className="app">
			<img
				className="app-logo"
				src={require('assets/images/logo.svg')}
				alt="React Logo"
				width="256"
				height="256"
			/>
			<p className="text-primary greeting-label">
				Welcome to {import.meta.env.GENERAL_GREETING}
			</p>
			<p className="text-green counter-label">
				Page has been open for <code>{count}</code> seconds.
			</p>
		</div>
	)
} // App()

export default App

// NOTE - Must have that code for Hot module reload + install @pmmmwh/react-refresh-webpack-plugin
if (module.hot) {
	module.hot.accept()
}
