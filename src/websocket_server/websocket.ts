import { IncomingMessage } from 'http';
import WebSocket, { WebSocketServer } from 'ws';

const WS_PORT = 3000;

export const wsServer: WebSocket.Server<typeof WebSocket, typeof IncomingMessage> = new WebSocketServer({
  port: WS_PORT,
});

export function onConnect(ws: WebSocket.Server<typeof WebSocket, typeof IncomingMessage>): void {
  ws.on('error', console.error);

  console.log(`WebSocket server works on ${WS_PORT}`);

  ws.on('message', function message(data) {
    console.log('Data received: ', JSON.parse(data.toString()));
  });
}

export function onClose(): void {
  console.log('WebSocket closed');
}
