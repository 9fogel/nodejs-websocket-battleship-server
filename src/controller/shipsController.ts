import WebSocket from 'ws';
import { IAddShips, ICommand, IGame, IShip, TShipLength, TPosition } from '../types/types.js';
import { gamesList } from '../data/rooms-data.js';
import { stringifyResponse } from '../utils/commandsHandler.js';
import { userList } from '../data/users-data.js';
import GameController from './gameController.js';

class ShipsController {
  addShipsToGameBoard(ws: WebSocket, command: ICommand<IAddShips>): void {
    const { gameId, ships, indexPlayer } = command.data;
    const userShipsCoordinatesList = ships.map((ship) => this.convertShipToCoordinates(ship));
    const shipsAmount = userShipsCoordinatesList.length;
    const currentGame = gamesList[gameId];
    const currentPlayer = currentGame.roomUsers.find((user) => user.ws === ws);

    if (currentPlayer) {
      currentPlayer.indexPlayer = indexPlayer;
      currentPlayer.shipsList = ships;
      currentPlayer.shipsCoords = userShipsCoordinatesList;
      currentPlayer.woundedCoords = Array.from({ length: shipsAmount }, () => []);
      currentPlayer.killedShips = [];
    }

    if (this.areBothPlayersReady(currentGame)) {
      const turn = new GameController().generateTurn(currentGame, 0, 'start');

      currentGame.roomUsers.forEach((player, index) => {
        const playerWs = userList[player.index - 1].ws;
        if (playerWs) {
          this.sendCreateGameResponse(playerWs, currentGame, index);
          new GameController().sendTurnResponse(playerWs, turn);
        }
      });
    }
  }

  private areBothPlayersReady(currentGame: IGame): boolean {
    const haveShips = currentGame.roomUsers.every((player) => player.shipsList?.length);

    return haveShips;
  }

  private convertShipToCoordinates(ship: IShip): Array<TPosition> {
    const shipCoordinates = [];

    const shipLength: TShipLength = {
      huge: 4,
      large: 3,
      medium: 2,
      small: 1,
    };

    for (let i = 0; i < shipLength[ship.type]; i++) {
      if (ship.direction) {
        const coordinates = {
          x: ship.position.x,
          y: ship.position.y + i,
        };
        shipCoordinates.push(coordinates);
      } else {
        const coordinates = {
          x: ship.position.x + i,
          y: ship.position.y,
        };
        shipCoordinates.push(coordinates);
      }
    }

    return shipCoordinates;
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
