import { userList } from '../data/users-data.js';
import { IRegUser } from '../types/types.js';

export const isNewUser = (name: string) => {
  const isFound = userList.find((item) => item.name === name);

  return isFound ? false : true;
};

export const isPasswordValid = (user: IRegUser) => {
  const isFound = userList.find((item) => item.name === user.name);

  return isFound?.password === user.password;
};
