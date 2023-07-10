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
  id?: string;
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

// {
//   type: "update_room",
//   data:
//       [
//           {
//               roomId: <number>,
//               roomUsers:
//                   [
//                       {
//                           name: <string>,
//                           index: <number>,
//                       }
//                   ],
//           },
//       ],
//   id: 0,
// }
