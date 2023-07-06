import WebSocket from 'ws';
import http from 'http';
import { hostname } from 'os';
import { incomingParser, outgoingParser } from '../helpers/parsers.ts';
import { IncomingMessage, MessageTemplate } from '../entities/interface/message.ts';
import { Actions } from '../entities/interface/common.ts';
import { ActionResolver } from './actions.ts';

const connections = new Map();

export function onConnect(wsClient: WebSocket, req: http.IncomingMessage) {
  const key = req.headers['sec-websocket-key'] as string;
  console.log('new user connected ', key);
  connections.set(key, wsClient);

  wsClient.on('message', (message: Buffer) => {
    const inc = incomingParser(message) as MessageTemplate;
    let res;
    switch (inc.type) {
      case Actions.reg:
        res = ActionResolver.register(inc.data as IncomingMessage.Registration, key);
        break;
      default:
        break;
    }
    const out = outgoingParser({ type: inc.type, id: inc.id, data: JSON.stringify(res) });
    wsClient.send(out);
  });

  wsClient.on('close', () => {
    wsClient.close();
    connections.delete(key);
    ActionResolver.logout(key);
    console.log('user disconnected ', key);
  });
}

export function onListen() {
  console.log(`listening on localhost:${process.env.PORT}, os hostName: ${hostname()}`);
}
