import { IncomingMessage } from 'http';
import WebSocket, { WebSocketServer } from 'ws';
import { router } from '../router/router.js';
import { parseCommand } from '../utils/commandsHandler.js';
import { userList } from '../data/users-data.js';
import RoomController from '../controller/roomController.js';
import GameController from '../controller/gameController.js';

const WS_PORT = 3000;

export const wsServer: WebSocket.Server<typeof WebSocket, typeof IncomingMessage> = new WebSocketServer({
  port: WS_PORT,
});

export function onConnect(ws: WebSocket, req: IncomingMessage): void {
  ws.on('error', console.error);

  console.log(`WebSocket server works on ${WS_PORT} port`);
  console.log(`Remote Address is ${req.socket.remoteAddress}. Remote Port is ${req.socket.remotePort}\n`);

  ws.on('message', function message(command) {
    const parsedCommand = parseCommand(command);
    router(ws, parsedCommand);
  });

  ws.on('close', function close() {
    const user = userList.find((user) => user.ws === ws);
    if (user) {
      new RoomController().deleteRoomsCreatedByUser(user);
      new RoomController().sendUpdateRoomStateToAll();
      new GameController().handleTechnicalDefeat(user);
      console.log(
        `User ${user.name} disconnected, WebSocket closed, rooms created by this user deleted automatically\n`,
      );
      //TODO: check there are no active games with this user
    } else {
      console.log('Unauthorized user exited, WebSocket closed\n');
    }
  });
}

// export function onClose(): void {
//   console.log('WebSocket closed');
// }
