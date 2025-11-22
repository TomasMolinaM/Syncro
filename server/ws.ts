import { WebSocketServer } from 'ws';

let wss: WebSocketServer | null = null;

export function setWSS(server: WebSocketServer) {
  wss = server;
}

export function broadcast(msg: any) {
  if (!wss) return;
  const data = JSON.stringify(msg);
  wss.clients.forEach((client) => {
    // @ts-ignore
    if (client.readyState === 1) {
      client.send(data);
    }
  });
}

export function broadcastUserList(list: string[]) {
  if (!wss) return;
  const data = JSON.stringify({ type: 'users', list });
  wss.clients.forEach((client) => {
    // @ts-ignore
    if (client.readyState === 1) {
      client.send(data);
    }
  });
}

export default {
  setWSS,
  broadcast,
  broadcastUserList,
};
