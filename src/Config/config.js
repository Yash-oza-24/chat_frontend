const getTokenFromLocalStorage = localStorage.getItem("Token")
  ? localStorage.getItem("Token")
  : null;

export const config = {
  headers: {
    Authorization: `Bearer ${
      getTokenFromLocalStorage !== null && getTokenFromLocalStorage
        ? getTokenFromLocalStorage
        : ""
    }`,
    Accept: "application/json",
  },
};
