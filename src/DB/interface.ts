export interface IUser {
  name: string;
  password: string;
  index: number;
}

export interface IRoom {
  roomId: number;
  roomUsers: Omit<IUser, 'password'>[];
}
