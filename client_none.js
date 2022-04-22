import { Algorithm } from "./algorithm.js";

export class ClientNone extends Algorithm {
  onInit(_boardPoints, _agentNum, _turnNum) {
  }

  onTurn(_field, _pid, _agents, _turn) {
    return [];
  }
}

if (import.meta.main) {
  const a = new ClientNone();
  a.match({
    name: "AI-NONE",
    spec: "なにもしない"
  });
}
