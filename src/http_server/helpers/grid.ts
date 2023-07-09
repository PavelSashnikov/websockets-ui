import { AttackStatus, Coord, Grid, Ship, cell } from '../entities/interface/message.ts';
import { SHIP_GRIDS } from './ships.ts';

export const createGrid = (ships: Ship[]): Grid => {
  const grid: Grid = [];
  for (let i = 0; i < 10; i++) {
    grid[i] = [];
    for (let j = 0; j < 10; j++) {
      grid[i][j] = cell.default;
    }
  }
  placeShips(ships, grid);
  return grid;
};

export const placeShips = (ships: Ship[], grid: Grid): Grid => {
  ships.forEach((sh) => {
    const coord = { ...sh.position };
    const direction = sh.direction; //vert = true

    let length = sh.length;

    while (length) {
      grid[coord.y][coord.x] = cell.ship;
      length--;
      if (direction) {
        coord.y++;
      } else {
        coord.x++;
      }
    }
  });
  return grid;
};

export const shot = (coord: Coord, grid: Grid): [AttackStatus, boolean] => {
  if (grid[coord.y][coord.x] === cell.default) {
    return ['miss', false];
  }

  if (grid[coord.y][coord.x] === cell.ship) {
    let x = coord.x + 1;
    let y = coord.y + 1;
    let found = false;

    for (let i = x; i >= x - 2; i--) {
      for (let j = y; j >= y - 2; j--) {
        if ((i !== coord.x || j !== coord.y) && !found) {
          found = grid[j]?.[i] === cell.ship;
        }
      }
    }

    grid[coord.y][coord.x] = found ? cell.shot : cell.kill;

    const won = grid.every((a) => !a.includes(cell.ship));

    return [found ? 'shot' : 'killed', won];
  }
  return ['miss', false];
};

export const placeRandom = (): Grid => {
  const i = Math.floor(Math.random() * SHIP_GRIDS.length - 1);
  return SHIP_GRIDS[i];
};
