import WebSocket from 'ws';
import { stringifyResponse } from '../utils/commandsHandler.js';
import { IAttack, ICommand, IGame, IRegUser, TPosition, TRoomUser } from '../types/types.js';
import { gamesList } from '../data/rooms-data.js';
import { userList, winnersList } from '../data/users-data.js';
import RegController from './regController.js';

class GameController {
  handleAttack(command: ICommand<IAttack>): void {
    const { gameId, indexPlayer } = command.data;
    const currentGame = gamesList.find((game) => game.gameId === gameId);
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

    if (currentGame) {
      const whoseTurnIndex = currentGame.whoseTurnIndex;
      if (whoseTurnIndex === indexPlayer) {
        const status = this.detectMissOrKill(currentGame, attackedBoardIndex, indexPlayer, coordinates);
        const turn = this.generateTurn(currentGame, indexPlayer, status);
        const killedShip = currentGame.roomUsers[attackedBoardIndex].killedShips?.pop();

        currentGame.roomUsers.forEach((player) => {
          const playerWs = userList[player.index - 1].ws;

          if (playerWs) {
            if (status === 'double-shot') {
              return;
            }
            this.sendAttackResponse(playerWs, coordinates, indexPlayer, status);
            if (status === 'killed' && killedShip) {
              this.sendKillShipResponse(playerWs, killedShip, indexPlayer);
              this.sendSurroundingCellsResponse(playerWs, killedShip, indexPlayer);

              const isGameFinished = currentGame.roomUsers[indexPlayer].isWinner;
              if (isGameFinished) {
                this.sendFinishResponse(playerWs, indexPlayer);
                this.removeFinishedGame(currentGame);
                new RegController().sendUpdateWinnersToAll();
              }
            }
            this.sendTurnResponse(playerWs, turn);
          }
        });
      }
    }
  }

  handleTechnicalDefeat(user: IRegUser): void {
    const foundGame = gamesList.find((game) => {
      return game.roomUsers.some((roomUser) => roomUser.name === user.name);
    });
    if (foundGame) {
      const foundGameIndex = gamesList.indexOf(foundGame);
      const exitedPlayer = gamesList[foundGameIndex].roomUsers.find((roomUser) => roomUser.name === user.name);
      let winnerPlayerIndex;

      if (exitedPlayer) {
        const playerIndex = gamesList[foundGameIndex].roomUsers.indexOf(exitedPlayer);
        if (playerIndex) {
          winnerPlayerIndex = 0;
        } else {
          winnerPlayerIndex = 1;
        }
        const losingPlayer = gamesList[foundGameIndex].roomUsers[playerIndex];
        const winnerUser = gamesList[foundGameIndex].roomUsers[winnerPlayerIndex];
        losingPlayer.isWinner = false;
        winnerUser.isWinner = true;

        const playerWs = winnerUser.ws;
        if (playerWs) {
          console.log('Game finished with technical defeat');
          this.addWinner(winnerUser);
          this.sendFinishResponse(playerWs, winnerPlayerIndex);
          this.removeFinishedGame(foundGame);
          new RegController().sendUpdateWinnersToAll();
        }
      }
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

  private addWinner(winnerUser: TRoomUser): void {
    const winnerUserName = winnerUser.name;
    const existingWinner = winnersList.find((winner) => winner.name === winnerUserName);

    if (existingWinner) {
      existingWinner.wins += 1;
    } else {
      const newWinner = {
        name: winnerUserName,
        wins: 1,
      };
      winnersList.push(newWinner);
    }
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

  private createFinishResponse(userIndex: number): string {
    const finishResponse = {
      type: 'finish',
      data: {
        winPlayer: userIndex,
      },
      id: 0,
    };

    return stringifyResponse(finishResponse);
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

  private detectMissOrKill(
    currentGame: IGame,
    attackedBoardIndex: number,
    indexPlayer: number,
    coordinates: TPosition,
  ): string {
    let status = 'miss';
    const shipCoords = currentGame.roomUsers[attackedBoardIndex].shipsCoords;
    const woundedCoords = currentGame.roomUsers[attackedBoardIndex].woundedCoords;

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

          console.log(`RESULT: Ship was killed\n`);
          this.handleWinners(currentGame, attackedBoardIndex, indexPlayer);
        } else {
          console.log(`RESULT: Ship was shot\n`);
        }
      } else {
        if (woundedCoords) {
          for (let i = 0; i < woundedCoords?.length; i++) {
            const doubleShotCoords = woundedCoords[i].find(
              (coords) => coords.x === coordinates.x && coords.y === coordinates.y,
            );
            if (doubleShotCoords) {
              status = 'double-shot';
              console.log(`RESULT: This is double-shot, try again\n`);
              break;
            } else {
              status = 'miss';
            }
          }
          console.log(`RESULT: This cell is empty\n`);
        }
      }
    }

    return status;
  }

  private doesAttackerWin(opponentShips: Array<TPosition[]>): boolean {
    const allShipsKilled = opponentShips.every((ship) => ship.length === 0);

    return allShipsKilled;
  }

  private generateRandomCoordinates(): TPosition {
    const coordinates = {
      x: Math.floor(Math.random() * 10),
      y: Math.floor(Math.random() * 10),
    };

    return coordinates;
  }

  private generateSurroundingCells(killedShip: Array<TPosition>): Array<TPosition> {
    const surroundingCells: Array<TPosition> = [];

    killedShip.forEach((original) => {
      for (let i = original.x - 1; i <= original.x + 1; i++) {
        for (let k = original.y - 1; k <= original.y + 1; k++) {
          const surroundingCoords: TPosition = {
            x: i,
            y: k,
          };

          const isKilledCoords = killedShip.find(
            (coords) => coords.x === surroundingCoords.x && coords.y === surroundingCoords.y,
          );
          const isCellIncluded = surroundingCells.find(
            (cell) => cell.x === surroundingCoords.x && cell.y === surroundingCoords.y,
          );
          const isNegativeValue = surroundingCoords.x < 0 || surroundingCoords.y < 0;
          const isMoreThanTen = surroundingCoords.x > 9 || surroundingCoords.y > 9;

          if (!isKilledCoords && !isCellIncluded && !isNegativeValue && !isMoreThanTen) {
            surroundingCells.push(surroundingCoords);
          }
        }
      }
    });

    return surroundingCells;
  }

  private handleWinners(currentGame: IGame, attackedBoardIndex: number, indexPlayer: number): void {
    const opponentShipsLeft = currentGame.roomUsers[attackedBoardIndex].shipsCoords;
    if (opponentShipsLeft) {
      const isWinner = this.doesAttackerWin(opponentShipsLeft);
      currentGame.roomUsers[indexPlayer].isWinner = isWinner;

      if (isWinner) {
        const winnerUser = currentGame.roomUsers[indexPlayer];
        this.addWinner(winnerUser);
        console.log(`All opponent's ships were killed. User ${winnerUser.name} is a winner!`);
      }
    }
  }

  private removeFinishedGame(currentGame: IGame): void {
    const currentGameIndex = gamesList.indexOf(currentGame);
    if (currentGameIndex !== -1) {
      gamesList.splice(currentGameIndex, 1);
    }
  }

  private sendKillShipResponse(playerWs: WebSocket, killedShip: Array<TPosition>, indexPlayer: number): void {
    killedShip.forEach((coordinates) => {
      this.sendAttackResponse(playerWs, coordinates, indexPlayer, 'killed');
    });
  }

  private sendSurroundingCellsResponse(playerWs: WebSocket, killedShip: Array<TPosition>, indexPlayer: number): void {
    const surroundingCells = this.generateSurroundingCells(killedShip);
    surroundingCells.forEach((coordinates) => {
      this.sendAttackResponse(playerWs, coordinates, indexPlayer, 'miss');
    });
  }

  private sendFinishResponse(ws: WebSocket, userIndex: number): void {
    const createFinishResponse = this.createFinishResponse(userIndex);
    ws.send(createFinishResponse);
  }
}

export default GameController;
