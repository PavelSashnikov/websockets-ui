import WebSocket from 'ws';
import http from 'http';
import { hostname } from 'os';
import { incomingParser, outgoingParser } from '../helpers/parsers.ts';
import { MessageTemplate } from '../entities/interface/message.ts';
import { Actions } from '../entities/interface/common.ts';
import { ActionResolver } from './actions.ts';
import { addShips, addToRoom, attack, createRoom, reg } from './response.ts';

export const connections = new Map();

export function onConnect(wsClient: WebSocket, req: http.IncomingMessage) {
  const key = req.headers['sec-websocket-key'] as string;
  console.log('new user connected ', key);
  connections.set(key, wsClient);

  wsClient.on('message', (message: Buffer) => {
    const inc = incomingParser(message) as MessageTemplate;
    switch (inc.type) {
      case Actions.reg:
        reg(wsClient, message, key);
        break;

      case Actions.c_room:
        createRoom(wsClient, message, key);
        break;

      case Actions.add_to_room:
        addToRoom(wsClient, message, key);
        break;

      case Actions.add_ships:
        addShips(wsClient, message, key);
        break;

      case Actions.attack:
        attack(wsClient, message, key);
        break;

      case Actions.r_attack:
        attack(wsClient, message, key, true);
        break;

      default:
        break;
    }
  });

  wsClient.on('close', () => {
    wsClient.close();
    connections.delete(key);
    ActionResolver.logout(key);
    connections.forEach((c) => {
      c.send(outgoingParser({ type: Actions.u_room, id: 0, data: JSON.stringify(ActionResolver.rooms) }));
    });
    console.log('user disconnected ', key);
  });
}

export function onListen() {
  console.log(`listening on localhost:${process.env.PORT}, os hostName: ${hostname()}`);
}
