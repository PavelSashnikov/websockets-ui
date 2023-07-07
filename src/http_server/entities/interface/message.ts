import { Actions } from './common.ts';

export namespace IncomingMessage {
  export interface Registration {
    name: string;
    password: string;
  }

  export interface AddToRoom {
    indexRoom: number;
  }

  export type CreateRoom = '';
}

export namespace OutgoingMessage {
  export interface Registration {
    name: string;
    index: number;
    error: boolean;
    errorText: string;
  }

  export interface CreateGame {
    idGame: number;
    idPlayer: number;
  }
}

export interface MessageTemplate<T = any> {
  type: Actions;
  data: T;
  id: 0;
}
