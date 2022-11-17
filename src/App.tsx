import React, { useState } from 'react'
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
			<header className="app-head">
				<img
					className="app-logo"
					src={require('assets/images/logo.svg')}
					alt="React Logo"
				/>
				<p>{import.meta.env.ROUTER_NAME_HOME_PAGE}</p>
				<p className="text-purple">
					Page has been open for <code>{count}</code> seconds.
				</p>
			</header>
		</div>
	)
} // App()

export default App
