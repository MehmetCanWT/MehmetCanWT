import { useEffect, useState, useRef, useCallback } from 'react';
import type { DiscordData } from '../types';

const MAX_RECONNECT_ATTEMPTS = 10;
const INITIAL_RECONNECT_DELAY = 3000;
const MAX_RECONNECT_DELAY = 30000;

export function useDiscordPresence(discordId: string) {
  const [discordData, setDiscordData] = useState<DiscordData | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const heartbeatIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cleanup = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  const connectLanyard = useCallback(() => {
    cleanup();
    
    const ws = new WebSocket('wss://api.lanyard.rest/socket');
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);

        if (msg.op === 1) {
          const interval = msg.d.heartbeat_interval;
          ws.send(JSON.stringify({ op: 2, d: { subscribe_to_id: discordId } }));
          
          if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);
          heartbeatIntervalRef.current = setInterval(() => {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ op: 3 }));
            }
          }, interval);
        }

        if (msg.op === 0) {
          if (msg.t === 'INIT_STATE' || msg.t === 'PRESENCE_UPDATE') {
            setDiscordData(msg.d);
            reconnectAttemptsRef.current = 0;
          }
        }
      } catch (e) {
        console.error('Failed to parse Lanyard WebSocket message:', e);
      }
    };

    ws.onerror = (error) => {
      console.error('Lanyard WebSocket error:', error);
    };

    ws.onclose = () => {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }

      if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
        const delay = Math.min(
          INITIAL_RECONNECT_DELAY * Math.pow(2, reconnectAttemptsRef.current),
          MAX_RECONNECT_DELAY
        );
        reconnectAttemptsRef.current++;
        reconnectTimeoutRef.current = setTimeout(connectLanyard, delay);
      }
    };
  }, [discordId, cleanup]);

  useEffect(() => {
    connectLanyard();
    return cleanup;
  }, [connectLanyard, cleanup]);

  return discordData;
}
