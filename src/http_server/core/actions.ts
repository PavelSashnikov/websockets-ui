import { USERS_DB } from '../../DB/users.ts';
import { IncomingMessage, MessageTemplate, OutgoingMessage } from '../entities/interface/message.ts';
import { validateUser } from '../entities/validator.ts';

export class ActionResolver {
  constructor() {}

  static id: number;

  static register(mes: IncomingMessage.Registration, socketId: string): OutgoingMessage.Registration {
    const { name, password } = mes;

    const user = validateUser({ name, password }, ++ActionResolver.id);

    if (!user.error) {
      USERS_DB[socketId] = { name, password, index: user.index };
    }

    return user;
  }

  static logout(id: string): void {
    delete USERS_DB[id];
  }
}
