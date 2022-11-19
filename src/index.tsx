import 'assets/styles/tailwind.css'
import 'assets/styles/app.scss'

const root = createRoot(document.getElementById('root'))
const App = React.lazy(() => import('js/App'))

root.render(
	<Suspense>
		<App />
	</Suspense>
)

// NOTE - Must have that code for Hot module reload + install @pmmmwh/react-refresh-webpack-plugin
if (module.hot) {
	module.hot.accept()
}
