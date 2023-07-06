import { WebSocketServer } from 'ws';
import { onConnect, onListen } from './core/wsHandler.ts';
import 'dotenv/config';

const port: number = +process.env.PORT! || 4000;

const wsServer = new WebSocketServer({ port });

wsServer.on('listening', onListen);
wsServer.on('connection', onConnect);
