import WebSocket from 'ws';
import { ICommand, IRegUser, IWinner } from '../types/types.js';
import { stringifyResponse } from '../utils/commandsHandler.js';
import { isNewUser, isPasswordValid } from '../utils/validators.js';
import { userList, websocketsList, winnersList as winners } from '../data/users-data.js';

class RegController {
  sendRegResponse(ws: WebSocket, command: ICommand<IRegUser>): void {
    const response = this.createRegResponse(command);
    this.addUser(ws, command.data);
    ws.send(response);
  }

  sendUpdateWinnersResponse(ws: WebSocket, winners: Array<IWinner>): void {
    const createWinnersResponse = this.createWinnersResponse(winners);
    ws.send(createWinnersResponse);
  }

  sendUpdateWinnersToAll(): void {
    websocketsList.forEach((wsClient) => {
      this.sendUpdateWinnersResponse(wsClient, winners);
    });
  }

  private addUser(ws: WebSocket, userData: IRegUser): void {
    if (isNewUser(userData.name)) {
      userList.push({ ...userData, ws });
      websocketsList.add(ws);
      console.log(`User ${userData.name} added to DB\n`);
    } else {
      this.updateExistingUser(ws, userData);
      console.log(`User ${userData.name} logged in again\n`);
    }
  }

  private createRegResponse(command: ICommand<IRegUser>): string {
    const regResponse = {
      type: command.type,
      data: {
        ...command.data,
        error: isNewUser(command.data.name) ? false : isPasswordValid(command.data) ? false : true,
        errorText: isNewUser(command.data.name)
          ? ''
          : isPasswordValid(command.data)
          ? ''
          : "Password for this username doesn't match",
      },
      id: command.id,
    };

    return stringifyResponse(regResponse);
  }

  private createWinnersResponse(winners: Array<IWinner>) {
    const winnersResponse = {
      type: 'update_winners',
      data: winners,
      id: 0,
    };

    return stringifyResponse(winnersResponse);
  }

  private updateExistingUser(ws: WebSocket, userData: IRegUser): void {
    const user = userList.find((user) => user.name === userData.name);
    if (user) {
      const userPreviousWs = user.ws;
      if (userPreviousWs) {
        websocketsList.delete(userPreviousWs);
        websocketsList.add(ws);
      }
      user.ws = ws;
    }
  }
}

export default RegController;
