import WebSocket from 'ws';
import { gameStats, gamesList, playRooms } from '../data/rooms-data.js';
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
          gameId: gameStats.count,
          roomUsers: deletedRoom[0].roomUsers,
        };
        gamesList.push(game);
        gameStats.count += 1;

        console.log(`RESULT: User ${user.name} was added to the room. Game was created\n`);

        this.deleteRoomsCreatedByUser(user);
        this.sendUpdateRoomStateToAll();
      }
    } else {
      console.log(
        `RESULT: This user is already in the room as he/she is a room creator. Game will be created when second user will join this room\n`,
      );
    }
  }

  createNewRoom(ws: WebSocket): void {
    const user = userList.find((user) => user.ws === ws);
    if (user && this.isFirstUserRoom(user)) {
      const firstPlayer = {
        ws: user.ws,
        name: user.name,
        index: userList.indexOf(user) + 1,
      };
      const newRoom = {
        roomId: playRooms.length + 1,
        roomUsers: [firstPlayer],
      };
      playRooms.push(newRoom);

      console.log(`RESULT: New room was created by ${user.name}\n`);

      this.sendUpdateRoomStateToAll();
    } else {
      console.log('RESULT: This user already has another room. Only one room per user is allowed\n');
    }
  }

  deleteRoomsCreatedByUser(user: IRegUser): void {
    const foundRoom = playRooms.find((room) => {
      return room.roomUsers.some((roomUser) => roomUser.name === user.name);
    });
    if (foundRoom) {
      const foundRoomIndex = playRooms.indexOf(foundRoom);
      playRooms.splice(foundRoomIndex, 1);
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
        idGame: gameStats.count,
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
