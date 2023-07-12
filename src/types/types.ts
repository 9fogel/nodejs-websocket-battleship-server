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
  ws?: WebSocket;
  name: string;
  index: number /* user index in userList */;
  shipsList?: Array<IShip>;
  indexPlayer?: number;
};

export type TAddToRoom = {
  indexRoom: number;
};

export interface IGame {
  // roomId?: number;
  gameId?: number /* index in gamesList */;
  roomUsers: Array<TRoomUser>;
}

export interface IAddShips {
  gameId: number;
  ships: Array<IShip>;
  indexPlayer: number /* id of the player in the current game - 0 for room creator, 1 for second player */;
}

interface IShip {
  position: Tposition;
  direction: boolean;
  length: number;
  type: 'small' | 'medium' | 'large' | 'huge';
}

type Tposition = {
  x: number;
  y: number;
};
