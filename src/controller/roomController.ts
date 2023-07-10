import WebSocket from 'ws';
import { playRooms } from '../data/rooms-data.js';
import { stringifyResponse } from '../utils/commandsHandler.js';
import { userList, websocketsList } from '../data/users-data.js';

class RoomController {
  createNewRoom(ws: WebSocket): void {
    const user = userList.find((user) => user.ws === ws);
    if (user) {
      const firstPlayer = {
        name: user?.name,
        index: userList.indexOf(user) + 1,
      };
      const newRoom = {
        roomId: playRooms.length + 1,
        roomUsers: [firstPlayer],
      };
      playRooms.push(newRoom);
      console.log(playRooms[playRooms.length - 1]);

      websocketsList.forEach((wsClient) => {
        if (wsClient !== ws) {
          this.sendUpdateRoomState(wsClient);
        }
      });
    }
  }

  sendUpdateRoomState(ws: WebSocket) {
    const updateRoomResponse = this.createRoomResponse();
    ws.send(updateRoomResponse);
  }

  private createRoomResponse(): string {
    const singleRooms = playRooms.filter((room) => room.roomUsers.length === 1);
    const roomResponse = {
      type: 'update_room',
      data: singleRooms,
      id: 0,
    };

    return stringifyResponse(roomResponse);
  }
}

export default RoomController;
