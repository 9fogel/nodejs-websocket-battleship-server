import WebSocket from 'ws';
import { IAddShips, ICommand } from '../types/types.js';
import { gamesList } from '../data/rooms-data.js';

class ShipsController {
  addShipsToGameBoard(ws: WebSocket, command: ICommand<IAddShips>) {
    const { gameId, ships, indexPlayer } = command.data;
    console.log('gameId', gameId);
    console.log('indexPlayer', indexPlayer);
    console.log('ships', ships);

    const currentGame = gamesList[gameId];
    const currentPlayer = currentGame.roomUsers.find((user) => user.ws === ws);
    if (currentPlayer) {
      currentPlayer.indexPlayer = indexPlayer;
      currentPlayer.shipsList = ships;
    }
    console.log(currentGame);
  }

  //TODO: start_game only after we have both players responses with ships
}

export default ShipsController;
