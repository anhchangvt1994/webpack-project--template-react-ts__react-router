import type { ReactElement, ReactNode } from 'react'

function withDelay(delay: number, fallback: ReactNode): ReactNode {
	const [isShow, setIsShow] = useState(delay === 0 ? true : false)

	let timeout: NodeJS.Timeout | null = null

	useEffect(() => {
		if (!isShow) {
			timeout = setTimeout(function () {
				setIsShow(true)
			}, delay)
		}
	}, [])

	return isShow ? fallback : ''
}

export default function LoadingBoundary({
	children,
	delay,
	fallback,
}: {
	children?: ReactNode | undefined
	delay?: number
	fallback?: ReactNode
}): ReactElement {
	const delayTime: number = Number(delay) || 0

	const Component: ReactNode = withDelay(delayTime, fallback)

	return <Suspense fallback={Component}>{children}</Suspense>
} // LoadingBoundary
