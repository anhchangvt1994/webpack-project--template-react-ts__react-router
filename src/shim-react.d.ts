import type { AgnosticNonIndexRouteObject } from '@remix-run/router'
import type { IndexRouteObject } from 'react-router-dom'
import 'react-router-dom'
declare module 'react-router-dom' {
	interface NonIndexRouteObject {
		caseSensitive?: AgnosticNonIndexRouteObject['caseSensitive']
		path?: AgnosticNonIndexRouteObject['path']
		id?: AgnosticNonIndexRouteObject['id']
		loader?: AgnosticNonIndexRouteObject['loader']
		action?: AgnosticNonIndexRouteObject['action']
		hasErrorBoundary?: AgnosticNonIndexRouteObject['hasErrorBoundary']
		shouldRevalidate?: AgnosticNonIndexRouteObject['shouldRevalidate']
		handle?: { protect?: (certInfo) => boolean | string }
		index?: false
		children?: RouteObject[]
		element?: React.ReactNode | null
		errorElement?: React.ReactNode | null
	}

	type RouteObject = IndexRouteObject | NonIndexRouteObject
}
