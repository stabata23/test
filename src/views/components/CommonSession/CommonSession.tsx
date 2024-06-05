// TODO オブジェクトで渡すことも可能
// export type UserDataType = {
//   userId: number;
//   name: string;
//   imo: string;
//   group: string;
// };

// セッションカスタムhook
export const useSessionData = () => {
  // TODO オブジェクトで渡すことも可能
  // get
  // const getUserData = (): UserDataType | undefined => {
  //   const sessionData = sessionStorage.getItem("userData");
  //   if (sessionData != null) {
  //     return JSON.parse(sessionData) as UserDataType;
  //   }
  //   return;
  // };

  // set
  // const setUserData = (userData: UserDataType) => {
  //   const sessionData = JSON.stringify(userData);
  //   sessionStorage.setItem('userData', sessionData);
  // };

  // delete
  // const deleteUserData = () => {
  //   sessionStorage.removeItem('userData');
  // };
  // return { getUserData, deleteUserData, setUserData };

  // IMOのget
  const getImo = () => {
    return String(sessionStorage.getItem("imo"));
  }
  
  // IMOのset
  const setImo = (imo: string) => {
    sessionStorage.setItem("imo", imo);
  }

  return { getImo, setImo };
};