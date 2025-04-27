'use client';

import { useToast } from '@/hooks/use-toast';
import { getSolanaPrice } from '@/lib/api/price-api';
import { createConnection, getStakingData } from '@/lib/solana-api';
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
  solPrice: number;
  solPriceChange: number;
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

  // Load data with error handling
  const loadData = useCallback(
    async (isInitialLoad = false) => {
      if (!isInitialLoad && isRefreshing) return;
      setIsRefreshing(true);

      try {
        // Fetch price data
        const priceData = await getSolanaPrice();
        setSolPrice(priceData.price);
        setSolPriceChange(priceData.change24h);

        // Existing data fetching
        const connection = createConnection(endpoint);
        const stakingData = await getStakingData(connection, network);
        setData(stakingData);
        setError(null);
        setLastUpdated(new Date());

        if (!isInitialLoad) {
          toast({
            title: 'Data Updated',
            description:
              'The dashboard has been refreshed with the latest data.',
          });
        }
      } catch (error) {
        console.error('Error loading staking data:', error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Failed to load staking data';
        setError(errorMessage);

        toast({
          title: 'Data Loading Error',
          description: `Could not fetch the latest staking data: ${errorMessage}`,
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    },
    [endpoint, network, isRefreshing, toast]
  );

  // Initial data load
  useEffect(() => {
    loadData(true);
  }, [loadData]);

  // Set up auto-refresh if enabled
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
