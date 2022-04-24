import { Field, KakomimasuClient } from "./KakomimasuClient.ts";
import { ActionPost, Game } from "./deps.ts";

// アルゴリズムはこれを継承する
abstract class Algorithm {
  abstract onInit(
    boardPoints: number[][],
    agentCount: number,
    totalTurn: number,
  ): void;
  abstract onTurn(
    field: Field[][],
    playerNumber: number,
    agents: AgentPos[],
    turn: number,
  ): ActionPost[];

  // サーバに接続して対戦する(id,name,spec,passwordの連想配列を渡す)
  async match(param: Param) {
    const kc = new KakomimasuClient(
      param.name,
      param.spec,
    );
    kc.setServerHost(param.host);
    let info: Game | null | undefined = await kc.waitMatching();
    const ac = kc.getAgentCount();
    const points = kc.getPoints();
    if (ac === undefined || points === undefined) {
      return;
    }
    this.onInit(
      points,
      ac,
      info.totalTurn,
    );
    info = await kc.waitStart();
    while (info) {
      const field = kc.getField();
      const pn = kc.getPlayerNumber();
      if (field && pn !== undefined) {
        const actions = this.onTurn(
          field,
          pn,
          info.players[pn].agents,
          info.turn,
        );
        kc.setActions(actions);
      }
      info = await kc.waitNextTurn();
    }
  }
}

type Param = {
  name?: string;
  spec?: string;
  host?: string;
};

type AgentPos = {
  x: number;
  y: number;
};

export { Algorithm };
export type { ActionPost, AgentPos, Field, Param };
