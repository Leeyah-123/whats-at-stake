/**
 * API client for validators.app
 * This module handles all interactions with the validators.app API
 */

import type {
  APYHistory,
  GeographicDistribution,
  StakeDistribution,
  Validator,
} from '@/lib/types';
import { Cluster } from '@solana/web3.js';

// Base URL for validators.app API
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_VALIDATORS_APP_API_URL ||
  'https://www.validators.app/api/v1';

// API key for authentication
const API_KEY = process.env.NEXT_PUBLIC_VALIDATORS_APP_API_KEY;
if (!API_KEY) {
  throw new Error(
    'API key for validators.app is not set in environment variables.'
  );
}

// Cache time in milliseconds (5 minutes)
const CACHE_TIME = 5 * 60 * 1000;

// Cache for API responses
type CacheEntry = {
  timestamp: number;
  data: any;
};

const cache: Record<string, CacheEntry> = {};

/**
 * Get cached data or fetch new data if cache is expired
 */
async function getCachedOrFetch<T>(
  key: string,
  fetchFn: () => Promise<T>
): Promise<T> {
  const now = Date.now();
  const cached = cache[key];

  if (cached && now - cached.timestamp < CACHE_TIME) {
    console.log(`Using cached data for ${key}`);
    return cached.data as T;
  }

  console.log(`Fetching fresh data for ${key}`);
  try {
    const data = await fetchFn();
    cache[key] = { timestamp: now, data };
    return data;
  } catch (error) {
    console.error(`Error fetching data for ${key}:`, error);
    if (cached) {
      console.log(`Using stale cached data for ${key}`);
      return cached.data as T;
    }
    throw error;
  }
}

/**
 * Make an authenticated request to validators.app API
 */
async function apiRequest<T>(
  endpoint: string,
  params: Record<string, string> = {}
): Promise<T> {
  const url = new URL(`${API_BASE_URL}${endpoint}`);

  // Add query parameters
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });

  try {
    const response = await fetch(url.toString(), {
      headers: {
        Token: `${API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(
        `API request failed with status ${
          response.status
        }: ${await response.text()}`
      );
    }

    return (await response.json()) as T;
  } catch (error) {
    console.error(`Error making request to ${endpoint}:`, error);
    throw error;
  }
}

/**
 * API response types
 */
type ValidatorApiResponse = {
  account: string;
  name: string;
  keybase_id: string | null;
  www_url: string;
  details: string;
  active_stake: number;
  commission: number;
  delinquent: boolean;
  total_score: number;
  vote_account: string;
  data_center_key: string;
  data_center_host: string;
  latitude: string;
  longitude: string;
  skipped_slot_percent: string;
  software_version: string;
  stake_pools_list: string[];
  // ... other fields as needed
};

type EpochApiResponse = {
  epochs: Array<{
    epoch: number;
    starting_slot: number;
    slots_in_epoch: number;
    total_rewards: number;
    total_active_stake: number;
  }>;
  epochs_count: number;
};

type NetworkStatsResponse = {
  network: string;
  total_active_stake: number;
  total_active_validators: number;
  total_delinquent_validators: number;
  average_apy: number;
  average_commission: number;
  average_skip_rate: number;
  current_epoch: {
    number: number;
    first_slot: number;
    slots_in_epoch: number;
    current_slot: number;
  };
};

/**
 * Convert Solana cluster name to validators.app network name
 */
function convertNetwork(network: Cluster): string {
  switch (network) {
    case 'mainnet-beta':
      return 'mainnet';
    case 'testnet':
      return 'testnet';
    case 'devnet':
      return 'devnet';
    default:
      return 'mainnet';
  }
}

/**
 * Get all validators with pagination
 */
export async function getValidators(network: Cluster): Promise<Validator[]> {
  const validatorsNetwork = convertNetwork(network);
  return getCachedOrFetch(`validators-${network}`, async () => {
    const validators: ValidatorApiResponse[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const response = await apiRequest<ValidatorApiResponse[]>(
        `/validators/${validatorsNetwork}.json`,
        {
          page: page.toString(),
          limit: '100',
        }
      );

      if (response.length === 0) {
        hasMore = false;
      } else {
        validators.push(...response);
        page++;
      }
    }

    // Create a map to deduplicate validators by identity
    const validatorMap = new Map<string, ValidatorApiResponse>();
    validators.forEach((validator) => {
      const existing = validatorMap.get(validator.account);
      if (!existing || validator.active_stake > existing.active_stake) {
        validatorMap.set(validator.account, validator);
      }
    });

    // Transform deduplicated validators
    return Array.from(validatorMap.values()).map((validator) => ({
      name:
        validator.name ||
        `${validator.account.slice(0, 6)}...${validator.account.slice(-6)}`,
      identity: validator.account,
      votePubkey: validator.vote_account,
      activatedStake: validator.active_stake / 1_000_000_000,
      commission: validator.commission,
      apy: calculateAPY(validator.commission),
      skippedSlots: parseFloat(validator.skipped_slot_percent || '0'),
      delinquent: validator.delinquent,
      score: validator.total_score,
      stakePercentage: 0,
      votingPower: 0,
      voteDistance: 0,
      commissionChange: false,
      dataCenter: validator.data_center_host || 'Unknown',
      uptime: 100 - parseFloat(validator.skipped_slot_percent || '0'),
      version: validator.software_version || 'Unknown',
      lastVote: 'Unknown',
      rootSlot: 'Unknown',
      updatedAt: new Date().toLocaleTimeString(),
      rewards: {
        daily: 0,
        epoch: 0,
        per1000: 0,
      },
      stakeAccounts: {
        count: 0,
        averageSize: 0,
        largest: 0,
        superminority: false,
      },
    }));
  });
}

/**
 * Get network statistics
 */
export async function getNetworkStats(network: Cluster) {
  return getCachedOrFetch(`network-stats-${network}`, async () => {
    // Get validators first to calculate stats
    const validators = await getValidators(network);
    const totalStake = validators.reduce((sum, v) => sum + v.activatedStake, 0);
    const activeValidators = validators.filter((v) => !v.delinquent).length;
    const delinquentValidators = validators.length - activeValidators;

    // Get epoch data
    const epochData = await apiRequest<EpochApiResponse>(
      `/epochs/${convertNetwork(network)}.json`
    );
    const latestEpoch = epochData.epochs[0];

    // Calculate average metrics
    const avgCommission =
      validators.reduce((sum, v) => sum + v.commission, 0) / validators.length;
    const avgSkipRate =
      validators.reduce((sum, v) => sum + v.skippedSlots, 0) /
      validators.length;
    const avgApy =
      validators.reduce((sum, v) => sum + v.apy, 0) / validators.length;

    return {
      totalStake: totalStake,
      totalValidators: validators.length,
      activeValidators,
      epochInfo: {
        epoch: latestEpoch.epoch,
        slot: latestEpoch.starting_slot,
        slotsInEpoch: latestEpoch.slots_in_epoch,
        slotIndex: 0, // Not available from API
        slotsRemaining: latestEpoch.slots_in_epoch, // Approximate
      },
      averageAPY: avgApy,
      stakingRatio: 70, // Fixed value as API doesn't provide this
      averageSkippedSlots: avgSkipRate,
      averageCommission: avgCommission,
    };
  });
}

/**
 * Get geographic distribution of validators
 */
export async function getGeographicDistribution(
  network: Cluster
): Promise<GeographicDistribution[]> {
  return getCachedOrFetch(`geo-distribution-${network}`, async () => {
    const validators = await getValidators(network);
    const distribution = new Map<
      string,
      {
        country: string;
        latitude: number;
        longitude: number;
        count: number;
        stake: number;
        delinquent: number;
      }
    >();

    // Group validators by data center location
    validators.forEach((validator) => {
      // Skip if no location data
      if (!validator.dataCenter) return;

      const key = validator.dataCenter.toLowerCase();
      const entry = distribution.get(key) || {
        country: validator.dataCenter,
        latitude: 0, // Would need a mapping of data centers to coordinates
        longitude: 0,
        count: 0,
        stake: 0,
        delinquent: 0,
      };

      entry.count++;
      entry.stake += validator.activatedStake;
      if (validator.delinquent) entry.delinquent++;

      distribution.set(key, entry);
    });

    return Array.from(distribution.values()).map((entry) => ({
      country: entry.country,
      latitude: entry.latitude,
      longitude: entry.longitude,
      count: entry.count,
      stake: entry.stake,
      delinquent: entry.delinquent > 0,
    }));
  });
}

/**
 * Get APY history from validators.app
 * Since historical data isn't available, we'll simulate it based on current APY
 */
export async function getAPYHistory(network: Cluster): Promise<APYHistory[]> {
  return getCachedOrFetch(`apy-history-${network}`, async () => {
    const validators = await getValidators(network);
    const currentAPY =
      validators.reduce((sum, v) => sum + v.apy, 0) / validators.length;

    // Generate 30 days of history with small variations
    const days = 30;
    const result: APYHistory[] = [];

    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      // Create a realistic APY trend with small fluctuations
      const dayFactor = i / days; // 0 to 1
      const trendFactor = Math.sin(dayFactor * Math.PI) * 0.5; // Sinusoidal trend
      const randomFactor = Math.random() * 0.4 - 0.2; // Random noise

      const apy = currentAPY + trendFactor + randomFactor;

      result.push({
        date: date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
        averageAPY: Number(apy.toFixed(2)),
      });
    }

    return result;
  });
}

/**
 * Get stake distribution data
 */
export async function getStakeDistribution(
  network: Cluster
): Promise<StakeDistribution[]> {
  return getCachedOrFetch('stake-distribution', async () => {
    const validators = await getValidators(network);

    return validators
      .sort((a, b) => b.activatedStake - a.activatedStake)
      .slice(0, 25)
      .map((validator) => ({
        name: validator.name,
        stakeAmount: validator.activatedStake,
        percentage: validator.stakePercentage,
      }));
  });
}

/**
 * Get delinquent validators count
 */
export async function getDelinquentValidatorsCount(
  network: Cluster
): Promise<number> {
  const validators = await getValidators(network);
  return validators.filter((v) => v.delinquent).length;
}

/**
 * Helper function to calculate APY based on commission
 */
function calculateAPY(commission: number): number {
  // Base APY is around 7% for Solana, adjusted for commission
  const baseAPY = 7.0;
  return Number((baseAPY * (1 - commission / 100)).toFixed(2));
}

/**
 * Helper function to calculate daily rewards
 */
export function calculateDailyRewards(stake: number, apy: number): number {
  return Number(((stake * apy) / 36500).toFixed(2));
}

/**
 * Helper function to calculate epoch rewards
 */
export function calculateEpochRewards(stake: number, apy: number): number {
  // Assuming 1 epoch is approximately 2-3 days
  return Number((((stake * apy) / 365) * 2.5).toFixed(2));
}

/**
 * Helper function to calculate rewards per 1000 SOL
 */
export function calculateRewardsPer1000(apy: number): number {
  return Number(((1000 * apy) / 365).toFixed(2));
}
