export const CACHE_KEY = {
  USER_DATA: (address: string) => {
    return address + "-data";
  },
  USER_STORE: (address: string) => {
    return address + "-store";
  },
  //store user addresses as a list
  USER_LIST: "user-list",
};
