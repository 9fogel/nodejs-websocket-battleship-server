import WebSocket from 'ws';
import { IRegUser } from '../types/types.js';

export const userList: Array<IRegUser> = [];

export const websocketsList = new Set<WebSocket>();
