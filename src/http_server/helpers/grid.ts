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

export const shot = (coord: Coord, grid: Grid): [AttackStatus, boolean, Coord[]] => {
  if (grid[coord.y][coord.x] === cell.default) {
    grid[coord.y][coord.x] = cell.empty;
    return ['miss', false, []];
  }

  if (grid[coord.y][coord.x] === cell.ship) {
    let x = coord.x + 1;
    let y = coord.y + 1;

    grid[coord.y][coord.x] = cell.shot;
    const [arroundCoords, allIn] = arroudKill(grid, coord);

    const foudShip = allIn.some((c) => {
      if (c.x === coord.x && c.y === coord.y) {
        return false;
      }
      return grid[c.y][c.x] === cell.ship;
    });

    grid[coord.y][coord.x] = foudShip ? cell.shot : cell.kill;

    const won = grid.every((a) => !a.includes(cell.ship));

    return [foudShip ? 'shot' : 'killed', won, foudShip ? [] : arroundCoords];
  }
  return ['miss', false, []];
};

export const arroudKill = (grid: Grid, coord: Coord): [Coord[], Coord[]] => {
  const res: Coord[] = [];
  const allIn: Coord[] = [];
  const x = coord.x;
  const y = coord.y;

  let maxY = y;
  let maxX = x;
  let minX = x;
  let minY = y;

  while (grid[maxY]?.[x] === cell.kill || grid[maxY]?.[x] === cell.shot) {
    maxY++;
  }
  while (grid[y][maxX] === cell.kill || grid[y][maxX] === cell.shot) {
    maxX++;
  }
  while (grid[y][minX] === cell.kill || grid[y][minX] === cell.shot) {
    minX--;
  }
  while (grid[minY]?.[x] === cell.kill || grid[minY]?.[x] === cell.shot) {
    minY--;
  }

  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      if (grid[y]?.[x] !== undefined) {
        allIn.push({ x, y });
      }
      if (grid[y]?.[x] === cell.default) {
        res.push({ x, y });
      }
    }
  }

  return [res, allIn];
};

export const placeRandom = (): Grid => {
  const i = Math.floor(Math.random() * (SHIP_GRIDS.length - 1));
  return SHIP_GRIDS[i];
};
