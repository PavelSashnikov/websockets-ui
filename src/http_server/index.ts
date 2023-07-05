import { WebSocketServer } from 'ws';
import { onConnect, onOpen } from './core/wsHandler.ts';
import 'dotenv/config';

const port: number = +process.env.PORT! || 4000;

const wsServer = new WebSocketServer({ port });

console.log(`listening on ${port}`);

wsServer.on('open', onOpen);
wsServer.on('connection', onConnect);
