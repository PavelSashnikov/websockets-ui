import { GAME_DB, WINNERS } from '../../DB/games.ts';
import { ROOM_DB } from '../../DB/rooms.ts';
import { USERS_DB } from '../../DB/users.ts';
import { BOT_INDEX_PLUS } from '../entities/constants.ts';
import { IncomingMessage, OutgoingMessage, Ship, cell } from '../entities/interface/message.ts';
import { validateUser } from '../entities/validator.ts';
import { createGrid, placeRandom, shot } from '../helpers/grid.ts';

export class ActionResolver {
  constructor() {}
  static get rooms() {
    return Object.values(ROOM_DB);
  }
  static id: number = 1;

  static register(mes: IncomingMessage.Registration, socketId: string): OutgoingMessage.Registration {
    const { name, password } = mes;

    const user = validateUser({ name, password }, ++ActionResolver.id);

    if (!user.error) {
      USERS_DB[socketId] = { name, password, index: user.index };
    }

    return user;
  }

  static addRoom(key: string) {
    const user = USERS_DB[key];
    const room = {
      roomId: user.index,
      roomUsers: [{ name: user.name, index: user.index }],
    };
    ROOM_DB[user.index] = room;
    return ActionResolver.rooms;
  }

  static addUserToRoom(
    data: IncomingMessage.AddToRoom,
    userKey: string
  ): [OutgoingMessage.CreateGame | null, string[]] {
    const ind = data.indexRoom;
    const room = ROOM_DB[ind];
    const user = USERS_DB[userKey];
    if (room?.roomUsers.some((u) => u.index === user.index) || room.roomUsers.length === 2) {
      return [null, []];
    }
    room?.roomUsers.push({ name: user.name, index: user.index });
    const usersInGame = {
      [user.index]: [],
      [room?.roomId!]: [],
    };

    const u = ActionResolver.getCurrUsers(Object.keys(usersInGame));

    GAME_DB[room.roomId] = { idGame: room?.roomId!, users: usersInGame, grid: {} };
    delete ROOM_DB[ind];

    return [GAME_DB[room?.roomId!], u];
  }

  static addShips(data: IncomingMessage.AddShips): [boolean, string[]] {
    try {
      const game = GAME_DB[data.gameId];
      game.users[data.indexPlayer] = data.ships;
      game.grid[data.indexPlayer] = createGrid(data.ships);
      const u = ActionResolver.getCurrUsers(Object.keys(game.users));
      if (Object.values(game.users).every((u) => u.length)) {
        return [true, u];
      }
      return [false, u];
    } catch (error) {
      return [false, []];
    }
  }

  static attack(
    data: IncomingMessage.Attack,
    random = false
  ): {
    res?: OutgoingMessage.Attack;
    nextUser?: number;
    won?: boolean;
    u?: string[];
  } {
    const game = GAME_DB[data.gameId];
    const currUser = game.grid[data.indexPlayer];
    const secondUserKey: number = +Object.keys(game.users).find((k) => +k !== data.indexPlayer)!;
    const secondUser = game.grid[secondUserKey];

    const u = ActionResolver.getCurrUsers(Object.keys(game.users));

    let x = random ? Math.floor(Math.random() * 10) : data.x;
    let y = random ? Math.floor(Math.random() * 10) : data.y;

    let [res, won] = shot({ x, y }, secondUser);

    if (won) {
      const winUser = Object.values(USERS_DB).find((u) => u.index === data.indexPlayer)?.name;
      WINNERS[winUser!] ? WINNERS[winUser!].wins++ : (WINNERS[winUser!] = { name: winUser!, wins: 1 });
    }

    return {
      res: {
        position: {
          x,
          y,
        },
        currentPlayer: data.indexPlayer,
        status: res,
      },
      nextUser: secondUserKey,
      won,
      u,
    };
  }

  static createSingleGame(socketId: string) {
    const user = USERS_DB[socketId];
    const game = {
      idGame: user.index,
      users: { [user.index]: [], [user.index + BOT_INDEX_PLUS]: [{} as Ship] },
      grid: { [user.index + BOT_INDEX_PLUS]: placeRandom() },
    };
    GAME_DB[user.index] = game;
    if (ROOM_DB[user.index]) {
      delete ROOM_DB[user.index];
    }
    return game;
  }

  static logout(id: string): void {
    const user = USERS_DB[id];
    delete USERS_DB[user.index];
    delete ROOM_DB[user.index];
    delete USERS_DB[id];
  }

  private static getCurrUsers(ind: (string | number)[]): string[] {
    const res: string[] = [];
    Object.keys(USERS_DB).forEach((k) => {
      if (ind.includes(USERS_DB[k].index.toString())) {
        res.push(k);
      }
    });

    return res;
  }
}
