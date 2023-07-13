import WebSocket from 'ws';
import { IAddShips, ICommand, IGame } from '../types/types.js';
import { gamesList } from '../data/rooms-data.js';
import { stringifyResponse } from '../utils/commandsHandler.js';
import { userList } from '../data/users-data.js';

class ShipsController {
  addShipsToGameBoard(ws: WebSocket, command: ICommand<IAddShips>): void {
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

    if (this.areBothPlayersReady(currentGame)) {
      currentGame.roomUsers.forEach((player, index) => {
        const playerWs = userList[player.index - 1].ws;
        if (playerWs) {
          this.sendCreateGameResponse(playerWs, currentGame, index);
        }
      });
    }
  }

  private areBothPlayersReady(currentGame: IGame): boolean {
    const haveShips = currentGame.roomUsers.every((player) => player.shipsList?.length);

    return haveShips;
  }

  private createStartGameResponse(currentGame: IGame, index: number): string {
    const startGameResponse = {
      type: 'start_game',
      data: {
        ships: currentGame.roomUsers[index].shipsList,
        currentPlayerIndex: index,
      },
      id: 0,
    };

    return stringifyResponse(startGameResponse);
  }

  private sendCreateGameResponse(ws: WebSocket, currentGame: IGame, index: number): void {
    const createGameResponse = this.createStartGameResponse(currentGame, index);
    ws.send(createGameResponse);
  }
}

export default ShipsController;
