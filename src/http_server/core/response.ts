import WebSocket from 'ws';
import { ActionResolver } from './actions.ts';
import { IncomingMessage, MessageTemplate, OutgoingMessage } from '../entities/interface/message.ts';
import { incomingParser, outgoingParser } from '../helpers/parsers.ts';
import { Actions } from '../entities/interface/common.ts';
import { connections } from './wsHandler.ts';
import { GAME_DB } from '../../DB/games.ts';
import { getUsersShips } from '../helpers/getters.ts';

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
  let i: number = 1;
  connections.forEach((c) => {
    c.send(
      outgoingParser({ type: Actions.u_room, id: inc.id, data: JSON.stringify({ ...res, idPlayer: i + 1 }) })
    );
    c.send(
      outgoingParser({ type: Actions.c_game, id: inc.id, data: JSON.stringify({ ...res, idPlayer: i + 1 }) })
    );
    i++;
  });
};

export const addShips = (ws: WebSocket, message: Buffer, key: string): void => {
  const inc = incomingParser(message) as MessageTemplate<IncomingMessage.AddShips>;
  const res = ActionResolver.addShips(inc.data);
  if (res) {
    connections.forEach((c, sId) => {
      const data = getUsersShips(inc.data.gameId, sId, key);
      c.send(outgoingParser({ type: Actions.s_game, id: inc.id, data: JSON.stringify(data) }));
    });
  }
};
