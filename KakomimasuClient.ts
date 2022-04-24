import { Action, args, cl, diffTime, sleep } from "./client_util.ts";
import { ActionPost, ApiClient, dotenv, Game, MatchReq } from "./deps.ts";

type Field = {
  type: 0 | 1;
  pid: number | null;
  point: number;
  x: number;
  y: number;
  agentPid: number;
};

class KakomimasuClient {
  private name?: string;
  private spec?: string;
  private bearerToken?: string;
  private gameId?: string;
  private pic?: string;
  private pno?: number;
  private gameInfo?: Game;
  private field?: Field[][];
  private log?: Game[];

  apiClient = new ApiClient("https://api.kakomimasu.com");

  constructor(name?: string, spec?: string) {
    dotenv.config();
    this.name = name || Deno.env.get("name");
    this.spec = spec || Deno.env.get("spec");
    if (!args.aiOnly) this.bearerToken = Deno.env.get("bearerToken");
    console.log(args.local);
    if (args.local) this.setServerHost("http://localhost:8880");
    else if (args.host) this.setServerHost(args.host);
    else this.setServerHost(Deno.env.get("host"));
  }

  setServerHost(host?: string) {
    if (host) {
      if (host.endsWith("/")) {
        host = host.substring(0, host.length - 1);
      }
      //setHost(`${host}/api`);
      this.apiClient = new ApiClient(host);
    }
  }

  async waitMatching() { // GameInfo
    const matchParam: MatchReq = {
      spec: this.spec,
    };
    // Bearerがない場合はゲストで参加
    if (!this.bearerToken) {
      matchParam.guest = {
        name: this.name ?? "ゲスト",
      };
    }
    if (args.useAi) {
      matchParam.useAi = true;
      matchParam.aiOption = {
        aiName: args.useAi,
        boardName: args.aiBoard,
      };
    } else if (args.gameId) {
      matchParam.gameId = args.gameId;
    }
    //cl(matchParam);
    const matchRes = await this.apiClient.match(
      matchParam,
      `Bearer ${this.bearerToken}`,
    );
    //cl(MatchRes);
    if (matchRes.success) {
      const matchGame = matchRes.data;
      this.pic = matchRes.data.pic;
      this.gameId = matchGame.gameId;
      this.pno = matchGame.index;
      cl("playerid", matchGame, this.pno);
    } else {
      console.log(matchRes.data);
      throw Error("Match Error");
    }
    do {
      const gameRes = await this.apiClient.getMatch(this.gameId);
      if (gameRes.success) this.gameInfo = gameRes.data;
      else throw Error("Get Match Error");
      await sleep(100);
    } while (this.gameInfo.startedAtUnixTime === null);

    cl(this.gameInfo);
    cl(
      "ゲーム開始時間：",
      new Date(this.gameInfo.startedAtUnixTime * 1000).toLocaleString("ja-JP"),
    );
    return this.gameInfo;
  }

  getPlayerNumber() {
    return this.pno;
  }

  getAgentCount() {
    if (this.gameInfo?.players && this.pno !== undefined) {
      return this.gameInfo.players[this.pno].agents.length;
    }
  }

  getPoints() {
    if (!this.gameInfo || !this.gameInfo.board) {
      return undefined;
    }
    const w = this.gameInfo.board.width;
    const h = this.gameInfo.board.height;
    const p = this.gameInfo.board.points;
    const res = [];
    for (let i = 0; i < h; i++) {
      const row = [];
      for (let j = 0; j < w; j++) {
        row.push(p[i * w + j]);
      }
      res.push(row);
    }
    return res;
  }

  _makeField() {
    if (!this.gameInfo || !this.gameInfo.board) {
      return;
    }
    const w = this.gameInfo.board.width;
    const h = this.gameInfo.board.height;
    const p = this.gameInfo.board.points;
    const res = [];
    const tiled = this.gameInfo.tiled;
    if (!tiled) {
      return;
    }
    for (let i = 0; i < h; i++) {
      const row = [];
      for (let j = 0; j < w; j++) {
        const idx = i * w + j;
        const point = p[idx];
        const type = tiled[idx].type;
        const pid = tiled[idx].player;
        row.push({ type, pid, point, x: j, y: i, agentPid: -1 });
      }
      res.push(row);
    }
    this.field = res;
  }

  _updateField() {
    if (!this.gameInfo || !this.gameInfo.board || !this.field) {
      return;
    }
    const w = this.gameInfo.board.width;
    const h = this.gameInfo.board.height;
    const tiled = this.gameInfo.tiled;
    if (!tiled) {
      return;
    }

    const agentXYs: Record<string, number> = {};
    for (let i = 0; i < this.gameInfo.players.length; i++) {
      const player = this.gameInfo.players[i];
      for (const agent of player.agents) {
        if (agent.x != -1) {
          agentXYs[agent.x + "," + agent.y] = i;
        }
      }
    }

    for (let i = 0; i < h; i++) {
      for (let j = 0; j < w; j++) {
        const f = this.field[i][j];
        const idx = i * w + j;
        f.type = tiled[idx].type;
        f.pid = tiled[idx].player;
        const agentPid = agentXYs[j + "," + i];
        f.agentPid = (agentPid != undefined) ? agentPid : -1;
      }
    }
  }

  getField() { // after start
    return this.field;
  }

  async waitStart() { // GameInfo
    if (
      !this.gameInfo || !this.gameInfo.board ||
      !this.gameInfo.startedAtUnixTime || !this.gameId
    ) {
      return;
    }
    const board = this.gameInfo.board;
    await sleep(diffTime(this.gameInfo.startedAtUnixTime));
    const res = await this.apiClient.getMatch(this.gameId);
    if (res.success) this.gameInfo = res.data;
    else throw Error("Get Match Error");
    cl(this.gameInfo);
    this.log = [this.gameInfo];
    cl("totalTurn", board.nTurn);
    this._makeField();
    return this.gameInfo;
  }

  async setActions(actions: ActionPost[]) { // void
    if (!this.gameId || !this.pic) {
      return;
    }
    const res = await this.apiClient.setAction(
      this.gameId,
      { actions },
      this.pic,
    );
    //console.log("setActions", res);
    if (res.success === false) throw Error("Set Action Error");
  }

  async waitNextTurn() { // GameInfo? (null if end)
    if (!this.log || !this.gameInfo || !this.gameId) {
      return;
    }
    if (this.gameInfo.nextTurnUnixTime) {
      const bknext = this.gameInfo.nextTurnUnixTime;
      cl("nextTurnUnixTime", bknext);
      await sleep(diffTime(bknext));

      for (;;) {
        const res = await this.apiClient.getMatch(this.gameId);
        if (res.success) this.gameInfo = res.data;
        else throw Error("Get Match Error");
        if (this.gameInfo.nextTurnUnixTime !== bknext) {
          break;
        }
        await sleep(100);
      }
    } else {
      this.saveLog();
      return null;
    }
    this.log.push(this.gameInfo);
    cl("turn", this.gameInfo.turn);
    this._updateField();
    return this.gameInfo;
  }

  saveLog() {
    if (!this.gameInfo || !this.gameInfo.gameId) {
      return;
    }
    if (!args.nolog) {
      try {
        Deno.mkdirSync("log");
      } catch (_e) {
        //
      }
      const fname = `log/${this.gameInfo.gameId}-player${this.pno}.log`;
      Deno.writeTextFileSync(fname, JSON.stringify(this.log, null, 2));
    }
  }
}

// 8方向、上から時計回り
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

export { Action, args, cl, DIR, KakomimasuClient };
export type { Field };
