import WebSocket from 'ws';
import { stringifyResponse } from '../utils/commandsHandler.js';
import { IGame } from '../types/types.js';

class GameController {
  sendTurnResponse(ws: WebSocket, currentGame: IGame, index: number, status: string): void {
    const createTurnResponse = this.createTurnResponse(currentGame, index, status);
    ws.send(createTurnResponse);
  }

  private createTurnResponse(currentGame: IGame, index: number, status: string): string {
    const currentPlayerIndex = this.generateTurn(currentGame, index, status);
    const turnResponse = {
      type: 'turn',
      data: {
        currentPlayer: currentPlayerIndex,
      },
      id: 0,
    };

    return stringifyResponse(turnResponse);
  }

  private generateTurn(currentGame: IGame, index: number, status: string): number {
    let whoseTurnIndex;
    switch (status) {
      case 'start':
        whoseTurnIndex = currentGame.whoseTurnIndex ? currentGame.whoseTurnIndex : Math.round(Math.random());
        break;
      case 'miss':
        if (index) {
          whoseTurnIndex = 0;
        } else {
          whoseTurnIndex = 1;
        }
        break;
      case 'kill':
        if (index) {
          whoseTurnIndex = 1;
        } else {
          whoseTurnIndex = 0;
        }
        break;
      default:
        whoseTurnIndex = index;
    }

    console.log('whoseTurn', whoseTurnIndex);
    currentGame.whoseTurnIndex = whoseTurnIndex;
    console.log(currentGame);
    return whoseTurnIndex;
  }
}

export default GameController;
