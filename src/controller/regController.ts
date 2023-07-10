import WebSocket from 'ws';
import { ICommand, IRegUser } from '../types/types.js';
import { stringifyResponse } from '../utils/commandsHandler.js';
import { isUserNameValid } from '../utils/validators.js';
import { userList } from '../data/users-data.js';

class RegController {
  sendRegResponse(ws: WebSocket, command: ICommand<IRegUser>): void {
    const response = this.createRegResponse(command);
    this.addUser(ws, command.data);
    ws.send(response);
  }

  private addUser(ws: WebSocket, userData: IRegUser): void {
    if (isUserNameValid(userData.name)) {
      userList.push({ ...userData, ws });
      console.log(`user ${userData.name} added to DB`);
      console.log(userList);
    }
  }

  private createRegResponse(command: ICommand<IRegUser>): string {
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
