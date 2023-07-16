import WebSocket from 'ws';
import { gamesList, playRooms } from '../data/rooms-data.js';
import { stringifyResponse } from '../utils/commandsHandler.js';
import { userList, websocketsList } from '../data/users-data.js';
import { ICommand, IGame, IRegUser, TAddToRoom } from '../types/types.js';

class RoomController {
  addToRoom(ws: WebSocket, command: ICommand<TAddToRoom>): void {
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
    if (user && this.isFirstUserRoom(user)) {
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

      this.sendUpdateRoomStateToAll();
    }
  }

  sendUpdateRoomStateToAll(): void {
    websocketsList.forEach((wsClient) => {
      this.sendUpdateRoomState(wsClient);
    });
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
    const singleRooms = playRooms
      .filter((room) => room.roomUsers.length === 1)
      .map((room) => {
        return {
          roomId: room.roomId,
          roomUsers: [
            {
              name: room.roomUsers[0].name,
              index: room.roomUsers[0].index,
            },
          ],
        };
      });
    const roomResponse = {
      type: 'update_room',
      data: singleRooms,
      id: 0,
    };

    return stringifyResponse(roomResponse);
  }

  private isFirstUserRoom(user: IRegUser): boolean {
    const foundRoomWithUser = playRooms.find((room) => {
      return room.roomUsers.some((roomUser) => roomUser.name === user.name);
    });
    return foundRoomWithUser ? false : true;
  }

  private isRoomCreator(ws: WebSocket, indexRoom: number): boolean {
    const currentRoom = playRooms[indexRoom - 1];
    if (currentRoom) {
      const roomCreator = currentRoom.roomUsers?.find((user) => user.ws === ws);
      return roomCreator ? true : false;
    } else {
      return false;
    }
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
