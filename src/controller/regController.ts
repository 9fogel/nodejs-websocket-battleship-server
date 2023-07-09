import WebSocket from 'ws';
import { ICommand, IRegUser } from '../types/types.js';
import { stringifyResponse } from '../utils/commandsHandler.js';
import { isUserNameValid } from '../utils/validators.js';
import { userList } from '../data/users-data.js';

class RegController {
  sendRegResponse(ws: WebSocket, command: ICommand): void {
    const response = this.createRegResponse(command);
    this.addUser(command.data);
    ws.send(response);
  }

  private addUser(userData: IRegUser): void {
    if (isUserNameValid(userData.name)) {
      userList.push(userData);
      console.log(`user ${userData.name} added to DB`);
    }
  }

  private createRegResponse(command: ICommand): string {
    const regResponse = {
      type: command.type,
      data: {
        ...command.data,
        error: isUserNameValid(command.data.name) ? false : true,
        errorText: isUserNameValid(command.data.name) ? '' : 'User with such a name already exists',
      },
      id: command.id,
    };

    return stringifyResponse(regResponse);
  }
}

export default RegController;
