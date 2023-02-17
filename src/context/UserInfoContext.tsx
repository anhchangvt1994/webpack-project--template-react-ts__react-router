export type IUserInfo = {
	email: string
}

const INIT_USER_INFO: IUserInfo = { email: '' }

export const UserInfoContext = createContext<IUserInfo>(INIT_USER_INFO)

export function UserInfoProvider({ children }) {
	const userInfo: IUserInfo = INIT_USER_INFO

	return (
		<UserInfoContext.Provider value={userInfo}>
			{children}
		</UserInfoContext.Provider>
	)
} // UserInfoDeliver()

export function useUserInfo() {
	return useContext(UserInfoContext)
} // useUserInfo()
