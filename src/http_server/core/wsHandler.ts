import WebSocket from 'ws';
import http from 'http';
import { hostname } from 'os';
import { incomingParser, outgoingParser } from '../helpers/parsers.ts';
import { IncomingMessage, MessageTemplate, OutgoingMessage } from '../entities/interface/message.ts';
import { Actions } from '../entities/interface/common.ts';
import { ActionResolver } from './actions.ts';

const connections = new Map();

export function onConnect(wsClient: WebSocket, req: http.IncomingMessage) {
  const key = req.headers['sec-websocket-key'] as string;
  console.log('new user connected ', key);
  connections.set(key, wsClient);

  wsClient.on('message', (message: Buffer) => {
    const inc = incomingParser(message) as MessageTemplate;
    let res: unknown;
    switch (inc.type) {
      case Actions.reg:
        res = ActionResolver.register(inc.data as IncomingMessage.Registration, key);
        wsClient.send(outgoingParser({ type: inc.type, id: inc.id, data: JSON.stringify(res) }));
        wsClient.send(
          outgoingParser({ type: Actions.u_room, id: inc.id, data: JSON.stringify(ActionResolver.rooms) })
        );
        break;
      case Actions.c_room:
        res = ActionResolver.addRoom(key);
        connections.forEach((c) => {
          c.send(outgoingParser({ type: Actions.u_room, id: inc.id, data: JSON.stringify(res) }));
        });
        break;
      case Actions.add_to_room:
        res = ActionResolver.addUserToRoom(
          inc.data as IncomingMessage.AddToRoom,
          key
        ) as OutgoingMessage.CreateGame;
        if (!res) {
          break;
        }
        connections.forEach((c) => {
          c.send(outgoingParser({ type: Actions.u_room, id: inc.id, data: JSON.stringify(res) }));
          c.send(outgoingParser({ type: Actions.c_game, id: inc.id, data: JSON.stringify(res) }));
        });

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
