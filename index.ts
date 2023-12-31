import { httpServer } from './src/http_server/index.js';
import { wsServer, onConnect, onClose, onListen } from './src/websocket_server/websocket.js';

const HTTP_PORT = 8181;

console.log(`Start static http server on the ${HTTP_PORT} port!\n`);
httpServer.listen(HTTP_PORT);

wsServer.on('listening', onListen);
wsServer.on('connection', onConnect);
wsServer.on('close', onClose);
