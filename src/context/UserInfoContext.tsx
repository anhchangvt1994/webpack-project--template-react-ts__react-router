export type IUserInfo = {
	email: string
}

const INIT_USER_INFO: IUserInfo = { email: '' }

export const UserInfoContext = createContext<{
	userInfo: IUserInfo
	userState: IUserInfo
	setUserInfo: (newVal: IUserInfo) => void
}>({
	userInfo: INIT_USER_INFO,
	userState: INIT_USER_INFO,
	setUserInfo: (val) => null,
})

export function UserInfoProvider({ children }) {
	const [userState, setUserState] = useState(INIT_USER_INFO)
	const userInfo = userState

	const setUserInfo: (newVal: IUserInfo) => void = (newVal: IUserInfo) => {
		setUserState(newVal)
	}

	return (
		<UserInfoContext.Provider
			value={{
				userInfo,
				userState,
				setUserInfo,
			}}
		>
			{children}
		</UserInfoContext.Provider>
	)
} // UserInfoDeliver()

export function useUserInfo() {
	return useContext(UserInfoContext)
} // useUserInfo()
