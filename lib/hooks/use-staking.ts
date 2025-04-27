import { useEffect, useState } from 'react';
import { useConnection } from '@solana/wallet-adapter-react';
import { useWallet } from '@/components/wallet/wallet-provider';
import { StakingDataType } from '@/lib/types';
import { getStakingData } from '@/lib/solana-api';

export function useStaking() {
  const { connection } = useConnection();
  const { network } = useWallet();
  const [data, setData] = useState<StakingDataType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const stakingData = await getStakingData(connection, network);
        setData(stakingData);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error('Failed to fetch staking data')
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // Refresh every 5 minutes
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [connection, network]);

  return { data, loading, error };
}
