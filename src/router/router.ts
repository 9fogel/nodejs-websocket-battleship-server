import WebSocket from 'ws';
import { IAddShips, IAttack, ICommand, IRegUser, TAddToRoom } from '../types/types.js';
import RegController from '../controller/regController.js';
import RoomController from '../controller/roomController.js';
import ShipsController from '../controller/shipsController.js';
import GameController from '../controller/gameController.js';

export const router = <T>(ws: WebSocket, data: ICommand<T>) => {
  const commandType = data.type;

  switch (commandType) {
    case 'reg':
      new RegController().sendRegResponse(ws, data as ICommand<IRegUser>);
      new RoomController().sendUpdateRoomStateToAll();
      new RegController().sendUpdateWinnersToAll();
      break;
    case 'create_room':
      new RoomController().createNewRoom(ws);
      break;
    case 'add_user_to_room':
      new RoomController().addToRoom(ws, data as ICommand<TAddToRoom>);
      break;
    case 'add_ships':
      new ShipsController().addShipsToGameBoard(ws, data as ICommand<IAddShips>);
      break;
    case 'attack':
    case 'randomAttack':
      new GameController().handleAttack(data as ICommand<IAttack>);
      break;
    default:
      console.log('Invalid command');
  }
};
