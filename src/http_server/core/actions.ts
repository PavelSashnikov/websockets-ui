import { USERS_DB } from '../../DB/users.ts';
import { IncomingMessage, MessageTemplate, OutgoingMessage } from '../entities/interface/message.ts';
import { validateUser } from '../entities/validator.ts';

export class ActionResolver {
  constructor() {}
  static register(mes: IncomingMessage.Registration): OutgoingMessage.Registration {
    const { name, password } = mes;

    const user = validateUser({ name, password }, USERS_DB.length);

    if (!user.error) {
      USERS_DB.push({name, password, index: user.index});
    }

    return user;
  }
}
