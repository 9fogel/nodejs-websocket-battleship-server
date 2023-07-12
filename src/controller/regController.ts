import WebSocket from 'ws';
import { ICommand, IRegUser } from '../types/types.js';
import { stringifyResponse } from '../utils/commandsHandler.js';
import { isNewUser, isPasswordValid } from '../utils/validators.js';
import { userList, websocketsList } from '../data/users-data.js';

class RegController {
  sendRegResponse(ws: WebSocket, command: ICommand<IRegUser>): void {
    const response = this.createRegResponse(command);
    this.addUser(ws, command.data);
    ws.send(response);
  }

  private addUser(ws: WebSocket, userData: IRegUser): void {
    if (isNewUser(userData.name)) {
      userList.push({ ...userData, ws });
      websocketsList.add(ws);
      console.log(`user ${userData.name} added to DB`);
    } else {
      this.updateExistingUser(ws, userData);
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

  private updateExistingUser(ws: WebSocket, userData: IRegUser) {
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
