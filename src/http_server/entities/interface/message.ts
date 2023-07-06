import { Actions } from './common.ts';

export namespace IncomingMessage {
  export interface Registration {
    name: string;
    password: string;
  }
}

export namespace OutgoingMessage {
  export interface Registration {
    name: string;
    index: number;
    error: boolean;
    errorText: string;
  }
}

export interface MessageTemplate<T = any> {
  type: Actions;
  data: T;
  id: 0;
}