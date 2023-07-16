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
    // console.log('gameId', gameId);
    // console.log(x, y);
    // console.log('indexPlayer', indexPlayer);
    console.log(coordinates);

    const whoseTurnIndex = currentGame.whoseTurnIndex;
    if (whoseTurnIndex === indexPlayer) {
      const status = this.detectMissOrKill(currentGame, attackedBoardIndex, coordinates);
      const turn = this.generateTurn(currentGame, indexPlayer, status);

      currentGame.roomUsers.forEach((player) => {
        const playerWs = userList[player.index - 1].ws;

        if (playerWs) {
          this.sendAttackResponse(playerWs, coordinates, indexPlayer, status);
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

    // console.log('whoseTurn', whoseTurnIndex);
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
    //TODO: write logic for detecting the result of attack - 'miss'|'killed'|'shot'
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

      if (foundCoords && shipIndex && woundedCoords) {
        status = 'shot';
        const foundCoordsIndex = shipCoords[shipIndex].indexOf(foundCoords);
        const wounded = shipCoords[shipIndex].splice(foundCoordsIndex, 1);
        console.log('wounded', wounded);
        woundedCoords[shipIndex].push(wounded[0]);
        console.log(woundedCoords);

        if (shipCoords[shipIndex].length === 0) {
          status = 'killed';
          const killedShip = woundedCoords[shipIndex];
          console.log('killedShip', killedShip);
          this.markAsKilled(killedShip);
        }
      } else {
        status = 'miss';
      }
    }

    // if (shipCoords) {
    //   for (let i = 0; i < shipCoords?.length; i++) {
    //     const foundCoords = shipCoords[i].find((coords) => coords.x === coordinates.x && coords.y === coordinates.y);
    //     // console.log(foundCoords);

    //     if (foundCoords && woundedCoords) {
    //       status = 'shot';
    //       console.log('shot', status);

    //       const foundCoordsIndex = shipCoords[i].indexOf(foundCoords);
    //       // console.log('foundCoordsIndex', foundCoordsIndex);
    //       const wounded = shipCoords[i].splice(foundCoordsIndex, 1);
    //       // console.log('wounded', wounded);
    //       // console.log('woundedCoords[i]', woundedCoords[i]);
    //       woundedCoords[i].push(wounded[0]); // TODO: check what happens here - value is pushed to all 10 arrays

    //       // console.log(woundedCoords);
    //       // console.log(i);

    //       if (shipCoords[i].length === 0) {
    //         status = 'killed';
    //         const killedShip = woundedCoords[i];
    //         console.log('killedShip', killedShip);
    //         this.markAsKilled(killedShip);
    //       }
    //       break;
    //     } else {
    //       status = 'miss';
    //     }
    //   }
    // }

    console.log(status);
    return status;
  }

  private markAsKilled(killedShip: Array<TPosition>) {
    killedShip.forEach((coordinates) => {
      //TODO: send attack killed response
      //call method for marking surrounding cells as missed and sending response attack-miss
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
