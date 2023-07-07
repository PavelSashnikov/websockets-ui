import { Ship } from "../http_server/entities/interface/message.ts";

export interface IUser {
  name: string;
  index: number;
}

export interface IRoom {
  roomId: number;
  roomUsers: IUser[];
}

export interface IGame {
  idGame: number;
  users: {
    [key: number]: Ship[];
  };
}
