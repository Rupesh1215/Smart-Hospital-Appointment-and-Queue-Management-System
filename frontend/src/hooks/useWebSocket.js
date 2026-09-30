import { useEffect, useRef, useState, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const getWsUrl = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl && envUrl.startsWith('http')) {
    return envUrl.replace(/\/api\/?$/, '') + '/ws';
  }
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin + '/ws';
  }
  return 'http://localhost:8080/ws';
};

const WS_URL = getWsUrl();

/**
 * Custom hook for WebSocket subscription via STOMP.
 * Subscribes to a topic and returns live data.
 *
 * @param {string} topic — e.g. '/topic/queue/doctorId123'
 * @param {boolean} enabled — set false to disable connection
 * @returns {{ data, connected, error }}
 */
export default function useWebSocket(topic, enabled = true) {
  const [data, setData] = useState(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);
  const clientRef = useRef(null);

  const connect = useCallback(() => {
    if (!topic || !enabled) return;

    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: () => {
        setConnected(true);
        setError(null);

        client.subscribe(topic, (message) => {
          try {
            const parsed = JSON.parse(message.body);
            setData(parsed);
          } catch {
            setData(message.body);
          }
        });
      },
      onStompError: (frame) => {
        setError(frame.headers?.message || 'WebSocket error');
        setConnected(false);
      },
      onDisconnect: () => {
        setConnected(false);
      },
    });

    client.activate();
    clientRef.current = client;
  }, [topic, enabled]);

  useEffect(() => {
    connect();

    return () => {
      if (clientRef.current) {
        clientRef.current.deactivate();
        clientRef.current = null;
      }
    };
  }, [connect]);

  return { data, connected, error };
}
