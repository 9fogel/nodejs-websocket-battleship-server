import WebSocket from 'ws';
import { playRooms } from '../data/rooms-data.js';
import { stringifyResponse } from '../utils/commandsHandler.js';

class RoomController {
  createNewRoom() {}

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
