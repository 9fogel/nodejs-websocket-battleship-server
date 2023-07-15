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
  shipsCoords?: Array<TPosition[]>;
  indexPlayer?: number;
};

export type TAddToRoom = {
  indexRoom: number;
};

export interface IGame {
  gameId?: number /* index in gamesList */;
  roomUsers: Array<TRoomUser>;
  whoseTurnIndex?: number /* 0 or 1 */;
}

export interface IAddShips {
  gameId: number;
  ships: Array<IShip>;
  indexPlayer: number /* id of the player in the current game - 0 for room creator, 1 for second player */;
}

export interface IShip {
  position: TPosition;
  direction: boolean;
  length: number;
  type: 'small' | 'medium' | 'large' | 'huge';
}

export type TPosition = {
  x: number;
  y: number;
};

export type TShipLength = {
  [key: string]: number;
};

export interface IAttack {
  gameId: number;
  x: number;
  y: number;
  indexPlayer: number;
}
