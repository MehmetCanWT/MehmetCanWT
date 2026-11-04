import { useEffect, useState } from 'react';
import type { DiscordData } from '../types';

export function useDiscordPresence(initialId?: string) {
  const [discordData, setDiscordData] = useState<DiscordData | null>(null);
  const [activeId, setActiveId] = useState<string>(
    initialId || (import.meta.env.VITE_DISCORD_ID as string) || ''
  );

  // 1. Sync via HTTP on mount and periodically every 20s as guaranteed fallback
  useEffect(() => {
    let mounted = true;
    async function syncHttp() {
      try {
        const res = await fetch('/api/lanyard');
        if (res.ok && mounted) {
          const json = await res.json();
          if (json?.data) {
            setDiscordData(json.data);
          }
          if (json?.discord_id) {
            setActiveId((prev) => prev || json.discord_id);
          }
        }
      } catch {
        // HTTP fallback silent
      }
    }

    syncHttp();
    const timer = setInterval(syncHttp, 20000);
    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, []);

  // 2. WebSocket for zero-latency live events
  useEffect(() => {
    if (!activeId) return;

    let isClosed = false;
    let heartbeatTimer: ReturnType<typeof setInterval> | null = null;
    let ws: WebSocket | null = null;

    try {
      ws = new WebSocket('wss://api.lanyard.rest/socket');

      ws.onmessage = (event) => {
        if (isClosed) return;
        try {
          const msg = JSON.parse(event.data);
          if (msg.op === 1) {
            const interval = msg.d.heartbeat_interval;
            if (ws && ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ op: 2, d: { subscribe_to_id: activeId } }));
            }
            if (heartbeatTimer) clearInterval(heartbeatTimer);
            heartbeatTimer = setInterval(() => {
              if (ws && ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ op: 3 }));
              }
            }, interval);
          }

          if (msg.op === 0 && (msg.t === 'INIT_STATE' || msg.t === 'PRESENCE_UPDATE')) {
            setDiscordData(msg.d);
          }
        } catch {
          // parse error
        }
      };

      ws.onopen = () => {
        // Connected
      };

      ws.onerror = () => {
        // Will rely on HTTP polling
      };
    } catch {
      // WebSocket creation error
    }

    return () => {
      isClosed = true;
      if (heartbeatTimer) clearInterval(heartbeatTimer);
      if (ws) {
        if (ws.readyState === WebSocket.OPEN) {
          ws.close();
        } else if (ws.readyState === WebSocket.CONNECTING) {
          ws.onopen = () => ws?.close();
        }
      }
    };
  }, [activeId]);

  return discordData;
}
