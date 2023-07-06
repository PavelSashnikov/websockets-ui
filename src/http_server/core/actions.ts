import { ROOM_DB } from '../../DB/rooms.ts';
import { USERS_DB } from '../../DB/users.ts';
import { IncomingMessage, MessageTemplate, OutgoingMessage } from '../entities/interface/message.ts';
import { validateUser } from '../entities/validator.ts';

export class ActionResolver {
  constructor() {}
  static get rooms() {
    return Object.values(ROOM_DB);
  }
  static id: number;

  static register(mes: IncomingMessage.Registration, socketId: string): OutgoingMessage.Registration {
    const { name, password } = mes;

    const user = validateUser({ name, password }, ++ActionResolver.id);

    if (!user.error) {
      USERS_DB[socketId] = { name, password, index: user.index };
    }

    return user;
  }

  static addRoom(key: string) {
    const user = { name: USERS_DB[key].name, index: USERS_DB[key].index };
    const room = {
      roomId: user.index,
      roomUsers: [
        {
          name: user.name,
          index: user.index,
        },
      ],
    };
    ROOM_DB[key] = room;
    return ActionResolver.rooms;
  }

  static logout(id: string): void {
    delete USERS_DB[id];
    delete ROOM_DB[id];
  }
}
