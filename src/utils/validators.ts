import { userList } from '../data/users-data.js';

export const isUserNameValid = (name: string) => {
  const isFound = userList.find((item) => item.name === name);

  return isFound ? false : true;
};
