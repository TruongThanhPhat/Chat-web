export const createAuthSlices = (set)=>({
    userInfo: undefined,
    setUserInfo: (userInfo) => set({userInfo}),
});