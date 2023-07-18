import { GAME_DB } from '../../DB/games.ts';
import { USERS_DB } from '../../DB/users.ts';
import { OutgoingMessage } from '../entities/interface/message.ts';

export function getUsersShips(gameId: number, sId: string, key: string): OutgoingMessage.StartGame {
  const game = GAME_DB[gameId];
  const user = USERS_DB[sId];
  const keyUser = USERS_DB[key];
  const res = {
    currentPlayerIndex: keyUser.index,
    ships: game.users[user.index],
  };
  return res;
}
