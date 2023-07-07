import { GAME_DB, WINNERS } from '../../DB/games.ts';
import { ROOM_DB } from '../../DB/rooms.ts';
import { USERS_DB } from '../../DB/users.ts';
import { IncomingMessage, MessageTemplate, OutgoingMessage } from '../entities/interface/message.ts';
import { validateUser } from '../entities/validator.ts';
import { createGrid, shot } from '../helpers/grid.ts';

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
      USERS_DB[socketId] = { name, index: user.index };
    }

    return user;
  }

  static addRoom(key: string) {
    const user = USERS_DB[key];
    const room = {
      roomId: user.index,
      roomUsers: [user],
    };
    ROOM_DB[user.index] = room;
    return ActionResolver.rooms;
  }

  static addUserToRoom(data: IncomingMessage.AddToRoom, userKey: string): OutgoingMessage.CreateGame | null {
    const ind = data.indexRoom;
    const room = ROOM_DB[ind];
    const user = USERS_DB[userKey];
    if (room?.roomUsers.some((u) => u.index === user.index)) {
      return null;
    }
    room?.roomUsers.push(user);
    const usersInGame = {
      [user.index]: [],
      [room?.roomId!]: [],
    };

    GAME_DB[room.roomId] = { idGame: room?.roomId!, users: usersInGame, grid: {} };
    delete ROOM_DB[ind];

    return GAME_DB[room?.roomId!];
  }

  static addShips(data: IncomingMessage.AddShips): boolean {
    try {
      const game = GAME_DB[data.gameId];
      game.users[data.indexPlayer] = data.ships;
      game.grid[data.indexPlayer] = createGrid(data.ships);
      if (Object.values(game.users).every((u) => u.length)) {
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  static attack(data: IncomingMessage.Attack): {
    res: OutgoingMessage.Attack;
    nextUser: number;
    won: boolean;
  } {
    const game = GAME_DB[data.gameId];
    const currUser = game.grid[data.indexPlayer];
    const secondUserKey: number = +Object.keys(game.users).find((k) => +k !== data.indexPlayer)!;
    const secondUser = game.grid[secondUserKey];

    let [res, won] = shot({ x: data.x, y: data.y }, secondUser);

    if (won) {
      const winUser = Object.values(USERS_DB).find((u) => u.index === data.indexPlayer)?.name;
      WINNERS[winUser!] ? WINNERS[winUser!].wins++ : (WINNERS[winUser!] = { name: winUser!, wins: 1 });
    }

    return {
      res: {
        position: {
          x: data.x,
          y: data.y,
        },
        currentPlayer: data.indexPlayer,
        status: res,
      },
      nextUser: secondUserKey,
      won,
    };
  }

  static randomAttack(data: IncomingMessage.RandomAttack): {
    res: OutgoingMessage.Attack;
    nextUser: number;
    won: boolean;
  } {
    const game = GAME_DB[data.gameId];
    const secondUserKey: number = +Object.keys(game.users).find((k) => +k !== data.indexPlayer)!;
    const secondUser = game.grid[secondUserKey];

    const x = Math.floor(Math.random() * 10);
    const y = Math.floor(Math.random() * 10);
    const [res, won] = shot({ x, y }, secondUser);

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
      won: won,
    };
  }

  static logout(id: string): void {
    delete USERS_DB[id];
    delete ROOM_DB[id];
  }
}
