'use client';

import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { AlertCircle, CheckCircle, Wifi } from 'lucide-react';
import { useEffect, useState } from 'react';

export function ApiStatusIndicator() {
  const [status, setStatus] = useState<
    'online' | 'degraded' | 'offline' | 'rate_limited' | 'checking'
  >('checking');
  const [retryAfter, setRetryAfter] = useState<number | null>(null);

  useEffect(() => {
    const checkApiStatus = async () => {
      setStatus('checking');

      try {
        const response = await fetch('/api/health');
        const data = await response.json();

        setStatus(data.status);
        if (data.retryAfter) {
          setRetryAfter(data.retryAfter);
        }
      } catch (error) {
        console.error('Health check failed:', error);
        setStatus('offline');
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
          tooltip: retryAfter
            ? `API responding in ${Math.ceil(retryAfter)}ms`
            : 'API is operational',
        };
      case 'degraded':
        return {
          icon: <AlertCircle className="h-3 w-3 mr-1" />,
          text: 'API Degraded',
          color: 'bg-amber-500/20 text-amber-500 border-amber-500/30',
          tooltip: retryAfter
            ? `Slow response: ${Math.ceil(retryAfter)}ms`
            : 'API performance is degraded',
        };
      case 'offline':
        return {
          icon: <Wifi className="h-3 w-3 mr-1" />,
          text: 'API Offline',
          color: 'bg-red-500/20 text-red-500 border-red-500/30',
          tooltip: 'API is currently unreachable',
        };
      case 'rate_limited':
        return {
          icon: <AlertCircle className="h-3 w-3 mr-1" />,
          text: 'API Rate Limited',
          color: 'bg-amber-500/20 text-amber-500 border-amber-500/30',
          tooltip: retryAfter
            ? `Rate limit exceeded. Try again in ${Math.ceil(
                retryAfter / 60
              )} minutes`
            : 'API rate limit exceeded',
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
