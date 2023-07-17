import WebSocket from 'ws';
import { IRegUser, IWinner } from '../types/types.js';

export const userList: Array<IRegUser> = [];

export const websocketsList = new Set<WebSocket>();

export const winnersList: Array<IWinner> = [];
