import WebSocket from 'ws';
import { incomingParser, outgoingParser } from '../helpers/parsers.ts';
import { writeSync } from 'fs';
import { IncomingMessage, MessageTemplate } from '../entities/interface/message.ts';
import { Actions } from '../entities/interface/common.ts';
import { ActionResolver } from './actions.ts';

export function onConnect(wsClient: WebSocket) {
  console.log('new user connected');

  wsClient.on('message', (message: Buffer) => {
    const inc = incomingParser(message) as MessageTemplate;
    let res;
    switch (inc.type) {
      case Actions.reg:
        res = ActionResolver.register(inc.data as IncomingMessage.Registration);
        break;

      default:
        break;
    }
    const out = outgoingParser({ type: inc.type, id: inc.id, data: JSON.stringify(res) });
    wsClient.send(out);
  });

  wsClient.on('close', () => {
    console.log('user disconnected');
  });
}

export function onOpen() {
  console.log('socket opened');
}
