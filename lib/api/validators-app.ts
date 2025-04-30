/**
 * API client for validators.app
 * This module handles all interactions with the validators.app API
 */

import type {
  APYHistory,
  GeographicDistribution,
  NetworkStat,
  StakeDistribution,
  Validator,
} from '@/lib/types';
import { Cluster } from '@solana/web3.js';
import { RateLimitError } from '../errors/api-errors';

// Base URL for validators.app API
export const API_BASE_URL =
  process.env.VALIDATORS_APP_API_URL || 'https://www.validators.app/api/v1';

// API key for authentication
const API_KEY = process.env.VALIDATORS_APP_API_KEY;
if (!API_KEY) {
  throw new Error(
    'API key for validators.app is not set in environment variables.'
  );
}

// Adjust cache times based on data update frequency
const CACHE_TIMES = {
  validators: 5 * 60 * 1000, // 5 minutes
  networkStats: 5 * 60 * 1000, // 5 minutes
  epochInfo: 15 * 60 * 1000, // 15 minutes
  geoDistribution: 60 * 60 * 1000, // 1 hour - changes very rarely
  apyHistory: 60 * 60 * 1000, // 1 hour - historical data
} as const;

const DATA_CENTER_LOCATIONS: Record<string, { lat: number; lng: number }> = {
  'aws us-east': { lat: 37.7749, lng: -122.4194 },
  'aws us-west': { lat: 47.6062, lng: -122.3321 },
  'aws eu': { lat: 50.1109, lng: 8.6821 },
  'google cloud': { lat: 51.5074, lng: -0.1278 },
  'microsoft azure': { lat: 52.3676, lng: 4.9041 },
  hetzner: { lat: 49.4542, lng: 11.0767 },
  ovh: { lat: 48.8566, lng: 2.3522 },
  'digital ocean': { lat: 40.7128, lng: -74.006 },
  linode: { lat: 39.9526, lng: -75.1652 },
  unknown: { lat: 0, lng: 0 },
};

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
  const cacheTime =
    CACHE_TIMES[key.split('-')[0] as keyof typeof CACHE_TIMES] ||
    CACHE_TIMES.validators;

  if (cached && now - cached.timestamp < cacheTime) {
    return cached.data as T;
  }

  try {
    const data = await fetchFn();
    cache[key] = { timestamp: now, data };
    return data;
  } catch (error) {
    if (error instanceof RateLimitError && cached) {
      return cached.data as T;
    }
    throw error;
  }
}

/**
 * Rate limit tracking
 */
const rateLimits = {
  lastReset: Date.now(),
  requestCount: 0,
  queue: [] as Array<() => Promise<void>>,
  processing: false,
};

// Process queued requests
async function processQueue() {
  if (rateLimits.processing) return;
  rateLimits.processing = true;

  while (rateLimits.queue.length > 0) {
    const now = Date.now();
    const timeSinceReset = now - rateLimits.lastReset;

    // Reset counter if 5 minutes have passed
    if (timeSinceReset >= 300000) {
      rateLimits.requestCount = 0;
      rateLimits.lastReset = now;
    }

    // Check if we can make more requests
    if (rateLimits.requestCount >= 15) {
      // Use 15 to be safe
      const waitTime = 300000 - timeSinceReset;
      await new Promise((resolve) => setTimeout(resolve, waitTime));
      continue;
    }

    const request = rateLimits.queue.shift();
    if (request) {
      try {
        await request();
      } catch (error) {
        console.error('Queue processing error:', error);
      }
      rateLimits.requestCount++;
    }
  }

  rateLimits.processing = false;
}

/**
 * Queue an API request with rate limiting
 */
async function queueApiRequest<T>(
  endpoint: string,
  params: Record<string, string> = {}
): Promise<T> {
  return new Promise((resolve, reject) => {
    const request = async () => {
      const requestUrl = `${API_BASE_URL}${endpoint}${
        params ? `?${new URLSearchParams(params).toString()}` : ''
      }`;

      try {
        const response = await fetch(requestUrl, {
          headers: {
            Token: `${API_KEY}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.status === 429) {
          const retryAfter = parseInt(
            response.headers.get('retry-after') || '300',
            10
          );
          throw new RateLimitError(retryAfter);
        }

        if (!response.ok) {
          throw new Error(`API request failed: ${response.statusText}`);
        }

        resolve(await response.json());
      } catch (error) {
        reject(error);
      }
    };

    rateLimits.queue.push(request);
    processQueue();
  });
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
  total_validators?: number;
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
    try {
      const validators: ValidatorApiResponse[] = [];
      const pageSize = 100;
      const maxParallel = 3;

      // First request to get total count
      const firstPage = await queueApiRequest<ValidatorApiResponse[]>(
        `/validators/${validatorsNetwork}.json`,
        { page: '1', limit: pageSize.toString() }
      );
      validators.push(...firstPage);

      // Calculate total validators from first page header or use array length
      const totalValidators =
        firstPage[0]?.total_validators ?? firstPage.length;
      const totalPages = Math.ceil(totalValidators / pageSize);

      // Batch remaining requests
      for (let page = 2; page <= totalPages; page += maxParallel) {
        const batch = Array.from(
          { length: Math.min(maxParallel, totalPages - page + 1) },
          (_, i) =>
            queueApiRequest<ValidatorApiResponse[]>(
              `/validators/${validatorsNetwork}.json`,
              { page: (page + i).toString(), limit: pageSize.toString() }
            )
        );

        const results = await Promise.all(batch);
        results.forEach((result) => validators.push(...result));
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
    } catch (error) {
      if (error instanceof RateLimitError) {
        const cached = cache[`validators-${network}`];
        if (cached) {
          console.log(`Using stale cache due to rate limit for ${network}`);
          return cached.data;
        }
      }
      throw error;
    }
  });
}

/**
 * Get network statistics
 */
export async function getNetworkStats(network: Cluster): Promise<NetworkStat> {
  return getCachedOrFetch(`network-stats-${network}`, async () => {
    // Get validators first to calculate stats
    const validators = await getValidators(network);
    const totalStake = validators.reduce((sum, v) => sum + v.activatedStake, 0);
    const activeValidators = validators.filter((v) => !v.delinquent).length;
    const delinquentValidators = validators.length - activeValidators;

    // Get epoch data
    const epochData = await queueApiRequest<EpochApiResponse>(
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
// export async function getGeographicDistribution(
//   network: Cluster
// ): Promise<GeographicDistribution[]> {
//   return getCachedOrFetch(`geo-distribution-${network}`, async () => {
//     const validators = await getValidators(network);
//     const distribution = new Map<
//       string,
//       {
//         country: string;
//         latitude: number;
//         longitude: number;
//         count: number;
//         stake: number;
//         delinquent: number;
//       }
//     >();

//     // Group validators by data center location
//     validators.forEach((validator) => {
//       const dcKey = validator.dataCenter.toLowerCase();
//       const location =
//         Object.entries(DATA_CENTER_LOCATIONS).find(([key]) =>
//           dcKey.includes(key)
//         )?.[1] || DATA_CENTER_LOCATIONS.unknown;

//       const key = validator.dataCenter.toLowerCase();
//       const entry = distribution.get(key) || {
//         country: validator.dataCenter,
//         latitude: location.lat,
//         longitude: location.lng,
//         count: 0,
//         stake: 0,
//         delinquent: 0,
//       };

//       entry.count++;
//       entry.stake += validator.activatedStake;
//       if (validator.delinquent) entry.delinquent++;

//       distribution.set(key, entry);
//     });

//     return Array.from(distribution.values())
//       .map((entry) => ({
//         ...entry,
//         delinquent: entry.delinquent > 0,
//       }))
//       .filter((entry) => entry.latitude !== 0 && entry.longitude !== 0);
//   });
// }

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

/**
 * Get APY history from actual epoch reward data
 */
export async function getAPYHistory(network: Cluster): Promise<APYHistory[]> {
  return getCachedOrFetch(`apy-history-${network}`, async () => {
    // Fetch last 30 epochs of data
    const epochData = await queueApiRequest<EpochApiResponse>(
      `/epochs/${convertNetwork(network)}.json`,
      { limit: '30' }
    );

    // Calculate APY for each epoch
    return epochData.epochs
      .map((epoch) => {
        const annualizedRewards =
          ((epoch.total_rewards / epoch.total_active_stake) *
            (365 * 24 * 60 * 60)) /
          (epoch.slots_in_epoch * 0.4); // 0.4s per slot
        const date = new Date();
        date.setDate(
          date.getDate() - (epochData.epochs[0].epoch - epoch.epoch) * 2
        ); // Approximate 2 days per epoch

        return {
          date: date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          }),
          averageAPY: Number((annualizedRewards * 100).toFixed(2)),
        };
      })
      .reverse();
  });
}

/**
 * Get stake distribution data
 */
export async function getStakeDistribution(
  network: Cluster
): Promise<StakeDistribution[]> {
  return getCachedOrFetch(`stake-distribution-${network}`, async () => {
    const validators = await getValidators(network);
    const totalStake = validators.reduce((sum, v) => sum + v.activatedStake, 0);

    return validators
      .sort((a, b) => b.activatedStake - a.activatedStake)
      .slice(0, 25)
      .map((validator) => ({
        name: validator.name,
        stakeAmount: validator.activatedStake,
        percentage: (validator.activatedStake / totalStake) * 100,
      }));
  });
}
