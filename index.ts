import { httpServer } from './src/http_server/index.js';
import { wsServer, onConnect } from './src/websocket_server/websocket.js';

const HTTP_PORT = 8181;

console.log(`Start static http server on the ${HTTP_PORT} port!`);
httpServer.listen(HTTP_PORT);

wsServer.on('connection', onConnect);
// wsServer.on('close', onClose);
