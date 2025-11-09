/**
 * WebSocket Status Component
 * Shows connection status and real-time updates
 */

import React, { useEffect, useState } from 'react';

interface WebSocketStatusProps {
  isConnected: boolean;
  lastUpdate?: string;
}

export default function WebSocketStatus({
  isConnected,
  lastUpdate,
}: WebSocketStatusProps) {
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (lastUpdate) {
      setPulse(true);
      const timer = setTimeout(() => setPulse(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [lastUpdate]);

  return (
    <div className="flex items-center space-x-2 text-sm">
      <div className="relative">
        <div
          className={`w-3 h-3 rounded-full ${
            isConnected ? 'bg-green-500' : 'bg-gray-400'
          }`}
        />
        {isConnected && pulse && (
          <div className="absolute inset-0 w-3 h-3 rounded-full bg-green-500 animate-ping" />
        )}
      </div>
      <span className="text-gray-600">
        {isConnected ? 'Live Updates' : 'Disconnected'}
      </span>
      {lastUpdate && (
        <span className="text-xs text-gray-500">
          • Updated {new Date(lastUpdate).toLocaleTimeString()}
        </span>
      )}
    </div>
  );
}

