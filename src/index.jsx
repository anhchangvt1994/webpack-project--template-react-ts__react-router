import 'assets/styles/tailwind.css'
import 'assets/styles/app.scss'
import React, { Suspense } from 'react'
import { createRoot } from 'react-dom/client'
// import App from 'js/App.tsx'

const root = createRoot(document.getElementById('root'))

const App = React.lazy(() => import('js/App.tsx'))

root.render(
	<Suspense>
		<App />
	</Suspense>
)

// NOTE - Must have that code for Hot module reload + install @pmmmwh/react-refresh-webpack-plugin
if (module.hot) {
	module.hot.accept()
}
