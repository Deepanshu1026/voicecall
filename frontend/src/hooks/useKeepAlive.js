import { useEffect, useRef } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const PING_INTERVAL_MS = 4 * 60 * 1000; // 4 minutes (Render sleeps after ~15 min)

export const useKeepAlive = () => {
  const intervalRef = useRef(null);

  useEffect(() => {
    const ping = async () => {
      try {
        await axios.get(`${API_BASE_URL}/health`, {
          timeout: 10000,
        });
      } catch (error) {
        // Silent failure — this is just a keep-alive ping
      }
    };

    // Ping immediately on mount, then every 4 minutes
    ping();
    intervalRef.current = setInterval(ping, PING_INTERVAL_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);
};

export default useKeepAlive;
