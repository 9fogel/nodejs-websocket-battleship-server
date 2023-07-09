import { ICommand } from '../types/types.js';
export const router = (data: ICommand) => {
  console.log('Data in router', data);
  const commandType = data.type;

  switch (commandType) {
    case 'reg':
      console.log('send reg response');
      break;
    case 'update_winners':
      console.log('update winners');
      break;
    case 'create_room':
      console.log('create room');
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
