import { IncomingMessage } from 'http';
import WebSocket, { WebSocketServer } from 'ws';
import { router } from '../router/router.js';
import { parseCommand } from '../utils/commandsHandler.js';
import { userList } from '../data/users-data.js';

const WS_PORT = 3000;

export const wsServer: WebSocket.Server<typeof WebSocket, typeof IncomingMessage> = new WebSocketServer({
  port: WS_PORT,
});

export function onConnect(ws: WebSocket): void {
  ws.on('error', console.error);

  console.log(`WebSocket server works on ${WS_PORT}`);

  ws.on('message', function message(command) {
    console.log('ws on', command.toString());
    const parsedCommand = parseCommand(command);
    router(ws, parsedCommand);
  });

  ws.on('close', function close() {
    const user = userList.find((user) => user.ws === ws);
    if (user) {
      console.log(`User ${user.name} exited, WebSocket closed`);
    } else {
      console.log('Unauthorized user exited, WebSocket closed');
    }
  });
}

// export function onClose(): void {
//   console.log('WebSocket closed');
// }
