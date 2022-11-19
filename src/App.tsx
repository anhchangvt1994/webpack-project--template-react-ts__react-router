import useEffectCustomize from 'js/services/use-effect-customize'

function App() {
	const [count, setCount] = useState(0)

	const useEffectCounter = new useEffectCustomize([count])

	useEffectCounter.init(() => {
		const timer = setTimeout(() => setCount(count + 1), 1000)
		return () => clearTimeout(timer)
	})

	const arr = [...[1, 2, 3, 4], ...[5, 6, 7, 8]]

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
