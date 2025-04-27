'use client';

import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { API_BASE_URL } from '@/lib/api/validators-app';
import { AlertCircle, CheckCircle, Wifi } from 'lucide-react';
import { useEffect, useState } from 'react';

export function ApiStatusIndicator() {
  const [status, setStatus] = useState<
    'online' | 'degraded' | 'offline' | 'checking'
  >('checking');
  const [latency, setLatency] = useState<number | null>(null);

  useEffect(() => {
    const checkApiStatus = async () => {
      setStatus('checking');

      try {
        const startTime = performance.now();

        // Try to fetch from validators.app API
        // In a real implementation, you would use a health check endpoint
        const response = await fetch(API_BASE_URL + '/ping.json', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Token: process.env.NEXT_PUBLIC_VALIDATORS_APP_API_KEY || '',
          },
          // Short timeout to detect slow responses
          signal: AbortSignal.timeout(5000),
        });

        const endTime = performance.now();
        setLatency(Math.round(endTime - startTime));

        if (response.ok && (await response.json()).answer === 'pong') {
          setStatus('online');
        } else {
          setStatus('degraded');
        }
      } catch (error) {
        console.error('API status check failed:', error);
        setStatus(
          error instanceof DOMException && error.name === 'TimeoutError'
            ? 'degraded'
            : 'offline'
        );
      }
    };

    // Check status immediately and then every 60 seconds
    checkApiStatus();
    const interval = setInterval(checkApiStatus, 60000);

    return () => clearInterval(interval);
  }, []);

  const getStatusDisplay = () => {
    switch (status) {
      case 'online':
        return {
          icon: <CheckCircle className="h-3 w-3 mr-1" />,
          text: 'API Online',
          color: 'bg-green-500/20 text-green-500 border-green-500/30',
          tooltip: latency
            ? `API responding in ${latency}ms`
            : 'API is operational',
        };
      case 'degraded':
        return {
          icon: <AlertCircle className="h-3 w-3 mr-1" />,
          text: 'API Degraded',
          color: 'bg-amber-500/20 text-amber-500 border-amber-500/30',
          tooltip: latency
            ? `Slow response: ${latency}ms`
            : 'API performance is degraded',
        };
      case 'offline':
        return {
          icon: <Wifi className="h-3 w-3 mr-1" />,
          text: 'API Offline',
          color: 'bg-red-500/20 text-red-500 border-red-500/30',
          tooltip: 'API is currently unreachable',
        };
      case 'checking':
      default:
        return {
          icon: <Wifi className="h-3 w-3 mr-1 animate-pulse" />,
          text: 'Checking API',
          color: 'bg-blue-500/20 text-blue-500 border-blue-500/30',
          tooltip: 'Checking API status...',
        };
    }
  };

  const { icon, text, color, tooltip } = getStatusDisplay();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="outline"
            className={`text-xs flex items-center ${color}`}
          >
            {icon}
            {text}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
