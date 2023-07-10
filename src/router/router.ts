import WebSocket from 'ws';
import { ICommand, IRegUser } from '../types/types.js';
import RegController from '../controller/regController.js';
import RoomController from '../controller/roomController.js';

export const router = <T>(ws: WebSocket, data: ICommand<T>) => {
  console.log('Data in router', data);
  const commandType = data.type;

  switch (commandType) {
    case 'reg':
      new RegController().sendRegResponse(ws, data as ICommand<IRegUser>);
      new RoomController().sendUpdateRoomState(ws); //TODO: send updates to all or only reg-user??
      // console.log('SEND update room state - send rooms list, where only one player inside');
      console.log('SEND update winners'); //TODO
      break;
    case 'update_winners':
      console.log('update winners');
      break;
    case 'create_room':
      new RoomController().createNewRoom(ws);
      break;
    case 'add_user_to_room':
      console.log('add user to room');
      break;
    case 'create_game':
      console.log('create game - send for both players in the room');
      break;
    case 'update_room':
      console.log('update room state - send rooms list, where only one player inside');
      break;
    case 'add_ships':
      console.log('add ships');
      break;
    case 'start_game':
      console.log("start game -only after server receives both player's ships positions");
      break;
    case 'attack':
      console.log('attack');
      break;
    case 'randomAttack':
      console.log('random attack');
      break;
    case 'turn':
      console.log("Info about player's turn (send after game start and every attack, miss or kill result");
      break;
    case 'finish':
      console.log('finish game');
      break;
    default:
      console.log('Invalid input');
  }
};
