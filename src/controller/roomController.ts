import WebSocket from 'ws';
import { gamesList, playRooms } from '../data/rooms-data.js';
import { stringifyResponse } from '../utils/commandsHandler.js';
import { userList, websocketsList } from '../data/users-data.js';
import { ICommand, TAddToRoom } from '../types/types.js';

class RoomController {
  addToRoom(ws: WebSocket, command: ICommand<TAddToRoom>) {
    const { indexRoom } = command.data;
    const user = userList.find((user) => user.ws === ws);
    if (user) {
      const secondPlayer = {
        name: user?.name,
        index: userList.indexOf(user) + 1,
      };

      playRooms[indexRoom - 1].roomUsers.push(secondPlayer);

      playRooms[indexRoom - 1].roomUsers.forEach((player, index) => {
        const playerWs = userList[player.index - 1].ws;
        if (playerWs) {
          this.sendCreateGameResponse(playerWs, index);
        }
      });

      const game = playRooms.splice(indexRoom, 1);
      gamesList.push(game[0]);

      websocketsList.forEach((wsClient) => {
        this.sendUpdateRoomState(wsClient);
      });
    }
  }

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

  sendCreateGameResponse(ws: WebSocket, index: number) {
    const createGameResponse = this.createGameResponse(index);
    ws.send(createGameResponse);
  }

  sendUpdateRoomState(ws: WebSocket) {
    const updateRoomResponse = this.createRoomResponse();
    ws.send(updateRoomResponse);
  }

  private createGameResponse(index: number): string {
    const gameResponse = {
      type: 'create_game',
      data: {
        idGame: gamesList.length,
        idPlayer: index,
      },
      id: 0,
    };

    return stringifyResponse(gameResponse);
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
