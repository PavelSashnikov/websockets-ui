import { GAME_DB } from '../../DB/games.ts';
import { ROOM_DB } from '../../DB/rooms.ts';
import { USERS_DB } from '../../DB/users.ts';
import { IncomingMessage, MessageTemplate, OutgoingMessage } from '../entities/interface/message.ts';
import { validateUser } from '../entities/validator.ts';

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

    
    GAME_DB[room.roomId] = { idGame: room?.roomId!, users: usersInGame };
    delete ROOM_DB[ind];

    return GAME_DB[room?.roomId!];
  }

  static addShips(data: IncomingMessage.AddShips): boolean {
    try {
      const game = GAME_DB[data.gameId];
      game.users[data.indexPlayer] = data.ships;
      console.log("🚀 ~ file: actions.ts:61 ~ ActionResolver ~ addShips ~ game.users:", game.users)
      if (Object.values(game.users).every(u => u.length)) {
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  static logout(id: string): void {
    delete USERS_DB[id];
    delete ROOM_DB[id];
  }
}
