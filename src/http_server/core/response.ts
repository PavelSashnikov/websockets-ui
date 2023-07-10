import WebSocket from 'ws';
import { ActionResolver } from './actions.ts';
import { IncomingMessage, MessageTemplate } from '../entities/interface/message.ts';
import { incomingParser, outgoingParser } from '../helpers/parsers.ts';
import { Actions } from '../entities/interface/common.ts';
import { connections } from './wsHandler.ts';
import { WINNERS } from '../../DB/games.ts';
import { getUsersShips } from '../helpers/getters.ts';
import { USERS_DB } from '../../DB/users.ts';
import { BOT_INDEX_PLUS } from '../entities/constants.ts';

export const reg = (ws: WebSocket, message: Buffer, key: string): void => {
  const inc = incomingParser(message) as MessageTemplate<IncomingMessage.Registration>;
  const res = ActionResolver.register(inc.data as IncomingMessage.Registration, key);

  ws.send(outgoingParser({ type: inc.type, id: inc.id, data: JSON.stringify(res) }));
  ws.send(outgoingParser({ type: Actions.u_room, id: inc.id, data: JSON.stringify(ActionResolver.rooms) }));
  ws.send(
    outgoingParser({
      type: Actions.u_winners,
      id: inc.id,
      data: JSON.stringify(Object.values(WINNERS)),
    })
  );
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
  const [res, u] = ActionResolver.addUserToRoom(inc.data as IncomingMessage.AddToRoom, key);
  if (!res) {
    return;
  }
  connections.forEach((c) => {
    c.send(outgoingParser({ type: Actions.u_room, id: inc.id, data: JSON.stringify(ActionResolver.rooms) }));
  });
  u.forEach((k) => {
    connections.get(k).send(
      outgoingParser({
        type: Actions.c_game,
        id: inc.id,
        data: JSON.stringify({ ...res, idPlayer: USERS_DB[k].index }),
      })
    );
  });
};

export const addShips = (ws: WebSocket, message: Buffer, key: string): void => {
  const inc = incomingParser(message) as MessageTemplate<IncomingMessage.AddShips>;
  const [full, keys] = ActionResolver.addShips(inc.data);
  if (full) {
    keys.forEach((sId) => {
      const data = getUsersShips(inc.data.gameId, sId, key);
      connections
        .get(sId)
        .send(outgoingParser({ type: Actions.s_game, id: inc.id, data: JSON.stringify(data) }));
      connections.get(sId).send(
        outgoingParser({
          type: Actions.turn,
          id: inc.id,
          data: JSON.stringify({ currentPlayer: data.currentPlayerIndex }),
        })
      );
    });
  }
};

export const attack = (ws: WebSocket, message: Buffer, key: string, random = false): void => {
  const inc = incomingParser(message) as MessageTemplate<IncomingMessage.Attack>;
  let { res, nextUser, won, u, arround } = ActionResolver.attack(inc.data, random);
  if (!res) {
    return;
  }
  u?.forEach((c) => {
    connections.get(c).send(outgoingParser({ type: Actions.attack, id: inc.id, data: JSON.stringify(res) }));
    if (res?.status === 'miss') {
      connections.get(c).send(
        outgoingParser({
          type: Actions.turn,
          id: inc.id,
          data: JSON.stringify({ currentPlayer: nextUser }),
        })
      );
    } else {
      nextUser = inc.data.indexPlayer;
      connections.get(c).send(
        outgoingParser({
          type: Actions.turn,
          id: inc.id,
          data: JSON.stringify({ currentPlayer: inc.data.indexPlayer }),
        })
      );

      arround?.forEach((coordinates) => {
        connections.get(c).send(
          outgoingParser({
            type: Actions.attack,
            id: inc.id,
            data: JSON.stringify({
              position: coordinates,
              currentPlayer: inc.data.indexPlayer,
              status: 'miss',
            }),
          })
        );
      });
    }
    if (won) {
      connections.get(c).send(
        outgoingParser({
          type: Actions.finish,
          id: inc.id,
          data: JSON.stringify({ winPlayer: res?.currentPlayer }),
        })
      );
    }
  });
  if (won) {
    connections.forEach((c) => {
      c.send(
        outgoingParser({
          type: Actions.u_winners,
          id: inc.id,
          data: JSON.stringify(Object.values(WINNERS)),
        })
      );
    });
  }

  // if bot attack
  if (nextUser! - BOT_INDEX_PLUS > 0) {
    console.log('BOT ATTACK');
    const mess: IncomingMessage.Attack = {
      ...inc.data,
      indexPlayer: nextUser!,
    };
    attack(
      ws,
      outgoingParser({ type: Actions.attack, id: inc.id, data: JSON.stringify(mess) }) as unknown as Buffer,
      key,
      true
    );
  }
};

export const sPlay = (ws: WebSocket, message: Buffer, key: string): void => {
  const inc = incomingParser(message) as MessageTemplate<IncomingMessage.CreateRoom>;
  const res = ActionResolver.createSingleGame(key);
  connections.forEach((c) => {
    c.send(outgoingParser({ type: Actions.u_room, id: inc.id, data: JSON.stringify(ActionResolver.rooms) }));
  });

  ws.send(
    outgoingParser({
      type: Actions.c_game,
      id: inc.id,
      data: JSON.stringify({ ...res, idPlayer: USERS_DB[key].index }),
    })
  );
};
