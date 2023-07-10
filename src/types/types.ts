// export interface ICommand {
//   type: string;
//   data: IRegUser | Array<IRoom>;
//   id: number;
// }

import { WebSocket } from 'ws';

export interface ICommand<T> {
  type: string;
  data: T;
  id: number;
}

export interface IRegUser {
  ws?: WebSocket;
  name: string;
  password: string;
  error?: boolean;
  errorText?: string;
}

export interface IRoom {
  roomId: number;
  roomUsers: Array<TRoomUser>;
}

type TRoomUser = {
  name: string;
  index: number;
};

export type TAddToRoom = {
  indexRoom: number;
};
