import WebSocket from 'ws';
import { stringifyResponse } from '../utils/commandsHandler.js';
import { IAttack, ICommand, IGame, TPosition } from '../types/types.js';
import { gamesList } from '../data/rooms-data.js';
import { userList } from '../data/users-data.js';

class GameController {
  handleAttack(command: ICommand<IAttack>): void {
    const { gameId, indexPlayer } = command.data;
    const currentGame = gamesList[gameId];
    const attackedBoardIndex = indexPlayer ? 0 : 1;

    let coordinates: TPosition;

    if (command.type === 'randomAttack') {
      coordinates = this.generateRandomCoordinates();
    } else {
      const { x, y } = command.data;
      coordinates = {
        x: x ?? 0,
        y: y ?? 0,
      };
    }

    const whoseTurnIndex = currentGame.whoseTurnIndex;
    if (whoseTurnIndex === indexPlayer) {
      const status = this.detectMissOrKill(currentGame, attackedBoardIndex, coordinates);
      const turn = this.generateTurn(currentGame, indexPlayer, status);
      const killedShip = currentGame.roomUsers[attackedBoardIndex].killedShips?.pop();

      currentGame.roomUsers.forEach((player) => {
        const playerWs = userList[player.index - 1].ws;

        if (playerWs) {
          this.sendAttackResponse(playerWs, coordinates, indexPlayer, status);
          if (status === 'killed' && killedShip) {
            this.sendKillShipResponse(playerWs, killedShip, indexPlayer);
            //TODO: if some ship is killed send additional miss response for surrounding cells
          }
          this.sendTurnResponse(playerWs, turn);
        }
      });
    }
  }

  generateTurn(currentGame: IGame, index: number, status: string): number {
    let whoseTurnIndex = 0;
    const hasTurnSpecified = 'whoseTurnIndex' in currentGame;

    switch (status) {
      case 'start':
        if (hasTurnSpecified) {
          whoseTurnIndex = currentGame.whoseTurnIndex !== undefined ? currentGame.whoseTurnIndex : 0;
        } else {
          Math.round(Math.random());
        }
        break;
      case 'miss':
        if (index) {
          whoseTurnIndex = 0;
        } else {
          whoseTurnIndex = 1;
        }
        break;
      case 'kill':
      case 'shot':
        if (index) {
          whoseTurnIndex = 1;
        } else {
          whoseTurnIndex = 0;
        }
        break;
      default:
        whoseTurnIndex = index;
    }

    currentGame.whoseTurnIndex = whoseTurnIndex;
    return whoseTurnIndex;
  }

  sendAttackResponse(ws: WebSocket, coordinates: TPosition, indexPlayer: number, status: string): void {
    const createAttackResponse = this.createAttackResponse(coordinates, indexPlayer, status);
    ws.send(createAttackResponse);
  }

  sendTurnResponse(ws: WebSocket, turn: number): void {
    const createTurnResponse = this.createTurnResponse(turn);
    ws.send(createTurnResponse);
  }

  private createAttackResponse(coordinates: TPosition, indexPlayer: number, status: string): string {
    const attackResponse = {
      type: 'attack',
      data: {
        position: coordinates,
        currentPlayer: indexPlayer,
        status,
      },
      id: 0,
    };

    return stringifyResponse(attackResponse);
  }

  private createTurnResponse(turn: number): string {
    const turnResponse = {
      type: 'turn',
      data: {
        currentPlayer: turn,
      },
      id: 0,
    };

    return stringifyResponse(turnResponse);
  }

  private detectMissOrKill(currentGame: IGame, attackedBoardIndex: number, coordinates: TPosition): string {
    let status = 'miss';
    const shipCoords = currentGame.roomUsers[attackedBoardIndex].shipsCoords;
    const woundedCoords = currentGame.roomUsers[attackedBoardIndex].woundedCoords;
    console.log(shipCoords);

    let foundCoords;
    let shipIndex;

    if (shipCoords) {
      for (let i = 0; i < shipCoords?.length; i++) {
        foundCoords = shipCoords[i].find((coords) => coords.x === coordinates.x && coords.y === coordinates.y);
        if (foundCoords) {
          shipIndex = i;
          break;
        }
      }

      if (foundCoords && shipIndex !== undefined && woundedCoords) {
        status = 'shot';
        const foundCoordsIndex = shipCoords[shipIndex].indexOf(foundCoords);
        const wounded = shipCoords[shipIndex].splice(foundCoordsIndex, 1);
        woundedCoords[shipIndex].push(wounded[0]);

        if (shipCoords[shipIndex].length === 0) {
          status = 'killed';
          const killedShip = woundedCoords[shipIndex];
          currentGame.roomUsers[attackedBoardIndex].killedShips?.push(killedShip);
        }
      } else {
        status = 'miss';
      }
    }

    return status;
  }

  private sendKillShipResponse(playerWs: WebSocket, killedShip: Array<TPosition>, indexPlayer: number): void {
    killedShip.forEach((coordinates) => {
      this.sendAttackResponse(playerWs, coordinates, indexPlayer, 'killed');
    });
  }

  private generateRandomCoordinates(): TPosition {
    const coordinates = {
      x: Math.floor(Math.random() * 10),
      y: Math.floor(Math.random() * 10),
    };

    return coordinates;
  }
}

export default GameController;
