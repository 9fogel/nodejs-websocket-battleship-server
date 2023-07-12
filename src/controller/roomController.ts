import WebSocket from 'ws';
import { gamesList, playRooms } from '../data/rooms-data.js';
import { stringifyResponse } from '../utils/commandsHandler.js';
import { userList, websocketsList } from '../data/users-data.js';
import { ICommand, IGame, TAddToRoom } from '../types/types.js';

class RoomController {
  addToRoom(ws: WebSocket, command: ICommand<TAddToRoom>) {
    const { indexRoom } = command.data;
    const isCreator = this.isRoomCreator(ws, indexRoom);

    if (!isCreator) {
      const user = userList.find((user) => user.ws === ws);
      if (user) {
        const secondPlayer = {
          ws: user.ws,
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

        const deletedRoom = playRooms.splice(indexRoom - 1, 1);

        const game: IGame = {
          roomUsers: deletedRoom[0].roomUsers,
        };
        gamesList.push(game);

        this.sendUpdateRoomStateToAll();
      }
    }
  }

  createNewRoom(ws: WebSocket): void {
    const user = userList.find((user) => user.ws === ws);
    if (user) {
      const firstPlayer = {
        ws: user.ws,
        name: user?.name,
        index: userList.indexOf(user) + 1,
      };
      const newRoom = {
        roomId: playRooms.length + 1,
        roomUsers: [firstPlayer],
      };
      playRooms.push(newRoom);
      console.log(playRooms[playRooms.length - 1]);

      this.sendUpdateRoomStateToAll();

      // websocketsList.forEach((wsClient) => {
      //   if (wsClient !== ws) {
      //     this.sendUpdateRoomState(wsClient);
      //   }
      // });
    }
  }

  sendUpdateRoomStateToAll(): void {
    websocketsList.forEach((wsClient) => {
      this.sendUpdateRoomState(wsClient);
    });
  }

  private isRoomCreator(ws: WebSocket, indexRoom: number): boolean {
    const currentRoom = playRooms[indexRoom - 1];
    const roomCreator = currentRoom.roomUsers.find((user) => user.ws === ws);
    console.log('roomCreator', roomCreator);

    return roomCreator ? true : false;
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

  private sendCreateGameResponse(ws: WebSocket, index: number): void {
    const createGameResponse = this.createGameResponse(index);
    ws.send(createGameResponse);
  }

  private sendUpdateRoomState(ws: WebSocket): void {
    const updateRoomResponse = this.createRoomResponse();
    ws.send(updateRoomResponse);
  }
}

export default RoomController;
