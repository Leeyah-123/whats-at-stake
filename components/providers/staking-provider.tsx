'use client';

import { useToast } from '@/hooks/use-toast';
import { DEFAULT_SOL_PRICE, DEFAULT_SOL_PRICE_CHANGE } from '@/lib/constants';
import type { StakingDataType } from '@/lib/types';
import type React from 'react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useProfile } from '../profile/profile-provider';
import { useWallet } from '../wallet/wallet-provider';

type StakingContextType = {
  data: StakingDataType;
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  lastUpdated: Date | null;
  isRefreshing: boolean;
  solPrice?: number;
  solPriceChange?: number;
};

const StakingContext = createContext<StakingContextType | undefined>(undefined);

// Initial empty data structure
const initialData: StakingDataType = {
  validators: [],
  networkStats: {
    totalStake: 0,
    totalValidators: 0,
    activeValidators: 0,
    epochInfo: {
      epoch: 0,
      slot: 0,
      slotsInEpoch: 0,
      slotIndex: 0,
      slotsRemaining: 0,
    },
    averageAPY: 0,
    stakingRatio: 0,
    averageSkippedSlots: 0,
    averageCommission: 0,
  },
  apyHistory: [],
  stakeDistribution: [],
  delinquentValidators: 0,
  geographicDistribution: [],
  validatorScore: [],
};

export function StakingProvider({ children }: { children: React.ReactNode }) {
  const { profile } = useProfile();
  const { endpoint, network } = useWallet();
  const { toast } = useToast();
  const [data, setData] = useState<StakingDataType>(initialData);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshCount, setRefreshCount] = useState<number>(0);
  const [solPrice, setSolPrice] = useState(DEFAULT_SOL_PRICE);
  const [solPriceChange, setSolPriceChange] = useState(
    DEFAULT_SOL_PRICE_CHANGE
  );
  const [rateLimitedUntil, setRateLimitedUntil] = useState<Date | null>(null);

  const loadData = useCallback(
    async (isInitialLoad = false) => {
      // Only block if we're already refreshing
      if (!isInitialLoad && isRefreshing) return;

      try {
        if (isInitialLoad) {
          setLoading(true);
        }
        setIsRefreshing(true);

        const [stakingResponse, priceResponse] = await Promise.all([
          fetch('/api/network/stats', {
            headers: { 'x-network': network },
          }),
          fetch('/api/price'),
        ]);

        if (!stakingResponse.ok || !priceResponse.ok) {
          throw new Error('Failed to fetch data');
        }

        const [stakingData, priceData] = await Promise.all([
          stakingResponse.json(),
          priceResponse.json(),
        ]);

        setData(stakingData);
        setSolPrice(priceData.price);
        setSolPriceChange(priceData.change24h);
        setError(null);
        setLastUpdated(new Date());

        if (!isInitialLoad) {
          toast({
            title: 'Data Updated',
            description: `Dashboard refreshed`,
          });
        }
      } catch (error) {
        setError(
          error instanceof Error ? error.message : 'Failed to load data'
        );
      } finally {
        setIsRefreshing(false);
        if (isInitialLoad) {
          setLoading(false);
        }
      }
    },
    [network, toast]
  );

  // Initial data load
  useEffect(() => {
    loadData(true);
  }, [loadData]);

  // Auto-refresh setup
  useEffect(() => {
    if (profile.refreshInterval <= 0) return;

    const intervalId = setInterval(() => {
      loadData(false);
    }, profile.refreshInterval * 1000);

    return () => clearInterval(intervalId);
  }, [profile.refreshInterval, loadData]);

  const refreshData = useCallback(async () => {
    await loadData(false);
  }, [loadData]);

  return (
    <StakingContext.Provider
      value={{
        data,
        loading,
        error,
        refreshData,
        lastUpdated,
        isRefreshing,
        solPrice,
        solPriceChange,
      }}
    >
      {children}
    </StakingContext.Provider>
  );
}

export function useStaking() {
  const context = useContext(StakingContext);
  if (context === undefined) {
    throw new Error('useStaking must be used within a StakingProvider');
  }
  return context;
}
