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

  export interface AddShips {
    gameId: number;
    ships: Ship[];
    indexPlayer: number;
  }

  export interface Attack {
    gameID: number;
    x: number;
    y: number;
    indexPlayer: number;
  }
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
  }

  export interface StartGame {
    ships: Ship[];
    currentPlayerIndex: number;
  }

  export interface Attack {
    position: {
      x: number;
      y: number;
    };
    currentPlayer: number /* id of the player in the current game */;
    status: AttackStatus;
  }
}

export interface MessageTemplate<T = any> {
  type: Actions;
  data: T;
  id: 0;
}

export interface Ship {
  position: { x: number; y: number };
  direction: boolean;
  length: number;
  type: ShipType;
}
type ShipType = 'small' | 'medium' | 'large' | 'huge';
type AttackStatus = 'miss' | 'killed' | 'shot';
