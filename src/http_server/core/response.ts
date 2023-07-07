import WebSocket from 'ws';
import { ActionResolver } from './actions.ts';
import { IncomingMessage, MessageTemplate, OutgoingMessage } from '../entities/interface/message.ts';
import { incomingParser, outgoingParser } from '../helpers/parsers.ts';
import { Actions } from '../entities/interface/common.ts';
import { connections } from './wsHandler.ts';

export const reg = (ws: WebSocket, message: Buffer, key: string): void => {
  const inc = incomingParser(message) as MessageTemplate<IncomingMessage.Registration>;
  const res = ActionResolver.register(inc.data as IncomingMessage.Registration, key);

  ws.send(outgoingParser({ type: inc.type, id: inc.id, data: JSON.stringify(res) }));
  ws.send(outgoingParser({ type: Actions.u_room, id: inc.id, data: JSON.stringify(ActionResolver.rooms) }));
};

export const createRoom = (ws: WebSocket, message: Buffer, key: string): void => {
  const inc = incomingParser(message) as MessageTemplate<IncomingMessage.CreateRoom>;
  const res = ActionResolver.addRoom(key);
  connections.forEach((c) => {
    c.send(outgoingParser({ type: Actions.u_room, id: inc.id, data: JSON.stringify(res) }));
  });
};

export const addToRoom = (ws: WebSocket, message: Buffer, key: string): void => {
  const inc = incomingParser(message) as MessageTemplate<IncomingMessage.AddToRoom>;
  const res = ActionResolver.addUserToRoom(
    inc.data as IncomingMessage.AddToRoom,
    key
  ) as OutgoingMessage.CreateGame;
  if (!res) {
    return;
  }
  connections.forEach((c) => {
    c.send(outgoingParser({ type: Actions.u_room, id: inc.id, data: JSON.stringify(res) }));
    c.send(outgoingParser({ type: Actions.c_game, id: inc.id, data: JSON.stringify(res) }));
  });
};

export const addShips = (ws: WebSocket, message: Buffer, key: string): void => {
  
}
