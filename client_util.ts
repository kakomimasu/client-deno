import { parse } from "./deps.ts";

const args = parse(Deno.args);

const cl = (...param: Parameters<typeof console.log>) => {
  if (!args.nolog) console.log(...param);
};

class Action {
  private agentId?: number;
  private type?: string;
  private x?: number;
  private y?: number;

  constructor(agentId: number, type: string, x: number, y: number) {
    this.agentId = agentId;
    this.type = type;
    this.x = x;
    this.y = y;
  }
}

function sleep(msec: number) {
  return new Promise<void>((resolve) => {
    setTimeout(() => resolve(), msec);
  });
}

function diffTime(unixTime: number) {
  const dt = unixTime * 1000 - new Date().getTime();
  cl("diffTime", dt);
  return dt;
}

type Pnt = {
  x: number;
  y: number;
  point: number;
};

function sortByPoint(p: Pnt[]) {
  p.sort((a, b) => b.point - a.point);
}

const DIR = [
  [0, -1],
  [1, -1],
  [1, 0],
  [1, 1],
  [0, 1],
  [-1, 1],
  [-1, 0],
  [-1, -1],
];

function rnd(n: number) {
  return Math.floor(Math.random() * n); // MT is better
}

export { Action, args, cl, diffTime, DIR, rnd, sleep, sortByPoint };
export type { Pnt };
