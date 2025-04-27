import {
  Cluster,
  Connection,
  LAMPORTS_PER_SOL,
  clusterApiUrl,
} from '@solana/web3.js';
import {
  calculateDailyRewards,
  calculateEpochRewards,
  calculateRewardsPer1000,
  getAPYHistory as getAPYHistoryData,
  getGeographicDistribution as getGeoDistribution,
  getNetworkStats,
  getStakeDistribution as getStakeDistributionData,
  getValidators as getValidatorsApp,
} from './api/validators-app';
import type {
  EpochInfo,
  StakingDataType,
  Validator,
  ValidatorScore,
} from './types';

// Default RPC endpoint - users can change this in settings
const DEFAULT_ENDPOINT = clusterApiUrl('mainnet-beta');

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
 * Create a Solana connection with the given endpoint
 */
export function createConnection(
  endpoint: string = DEFAULT_ENDPOINT
): Connection {
  return new Connection(endpoint, 'confirmed');
}

/**
 * Get current epoch info directly from Solana
 */
export async function getEpochInfo(
  connection: Connection,
  network: Cluster = 'mainnet-beta'
): Promise<EpochInfo> {
  try {
    const epochInfo = await connection.getEpochInfo();

    return {
      epoch: epochInfo.epoch,
      slot: epochInfo.absoluteSlot,
      slotsInEpoch: epochInfo.slotsInEpoch,
      slotIndex: epochInfo.slotIndex,
      slotsRemaining: epochInfo.slotsInEpoch - epochInfo.slotIndex,
    };
  } catch (error) {
    console.error('Error fetching epoch info:', error);

    try {
      // Get epoch info from validators.app as fallback
      const networkStats = await getNetworkStats(network);
      if (networkStats.epochInfo) {
        return networkStats.epochInfo;
      }
    } catch (fallbackError) {
      console.error('Fallback also failed:', fallbackError);
    }

    // Return default values if both attempts fail
    return {
      epoch: 0,
      slot: 0,
      slotsInEpoch: 432000, // Default Solana epoch length
      slotIndex: 0,
      slotsRemaining: 432000,
    };
  }
}

/**
 * Get validator list with vote accounts
 */
// export async function getValidators(connection: Connection): Promise<VoteAccountStatus> {
//   return getCachedOrFetch("validators", async () => {
//     return await connection.getVoteAccounts()
//   })
// }

/**
 * Get total supply of SOL
 */
export async function getTotalSupply(connection: Connection): Promise<number> {
  try {
    const supply = await connection.getSupply();
    return supply.value.total / LAMPORTS_PER_SOL;
  } catch (error) {
    console.error('Error fetching total supply:', error);
    // Fallback to approximate total supply
    return 560000000; // Approximate total supply as of 2023
  }
}

/**
 * Get inflation rate
 */
// export async function getInflationRate(connection: Connection): Promise<number> {
//   return getCachedOrFetch("inflation", async () => {
//     const inflation = await connection.getInflationRate()
//     return inflation
//   })
// }

/**
 * Calculate APY based on inflation and stake ratio
 */
// function calculateAPY(inflationRate: number, stakeRatio: number, commission: number): number {
//   // APY = (inflation rate / stake ratio) * (1 - commission)
//   const baseAPY = (inflationRate / stakeRatio) * 100
//   return baseAPY * (1 - commission / 100)
// }

/**
 * Get stake account info for a specific validator
 */
// export async function getValidatorStakeAccounts(
//   connection: Connection,
//   votePubkey: string,
// ): Promise<{ count: number; totalStake: number; largestStake: number }> {
//   return getCachedOrFetch(`stake-${votePubkey}`, async () => {
//     try {
//       // Get all stake accounts
//       const voteAccount = new PublicKey(votePubkey)
//       const stakeAccounts = await connection.getParsedProgramAccounts(
//         new PublicKey("Stake11111111111111111111111111111111111111"),
//         {
//           filters: [
//             {
//               memcmp: {
//                 offset: 124, // Offset for vote account address in stake account data
//                 bytes: voteAccount.toBase58(),
//               },
//             },
//           ],
//         },
//       )

//       let totalStake = 0
//       let largestStake = 0

//       stakeAccounts.forEach((account) => {
//         const data = account.account.data as any
//         if (data?.parsed?.info?.stake?.delegation?.stake) {
//           const stake = data.parsed.info.stake.delegation.stake / LAMPORTS_PER_SOL
//           totalStake += stake
//           largestStake = Math.max(largestStake, stake)
//         }
//       })

//       return {
//         count: stakeAccounts.length,
//         totalStake,
//         largestStake,
//       }
//     } catch (error) {
//       console.error(`Error fetching stake accounts for ${votePubkey}:`, error)
//       // Return estimated data based on validator pubkey hash
//       const hash = votePubkey.split("").reduce((a, b) => a + b.charCodeAt(0), 0)
//       return {
//         count: 10 + (hash % 90),
//         totalStake: 10000 + (hash % 1000000),
//         largestStake: 1000 + (hash % 50000),
//       }
//     }
//   })
// }

/**
 * Fetch validator identity info from external API
 * This would typically come from a validator registry service
 */
// export async function getValidatorIdentityInfo(): Promise<
//   Record<string, { name: string; website?: string; location?: string }>
// > {
//   return getCachedOrFetch("validatorIdentities", async () => {
//     try {
//       // In a real implementation, you would fetch this from a validator registry API
//       // For now, we'll return a small set of known validators
//       return {
//         "8SQEcP4FaYQySktNQeyxF3w8pvArx3oMEh7fPrzkN9pu": { name: "Chorus One", location: "Germany" },
//         FKsC411dik9ktS6xPADxs4Fk2SCENvAiuccQHLAPndvk: { name: "Figment", location: "Canada" },
//         DumiCKHVqoCQKD8roLApzR5Fit8qGV5fVQsJV9sTZk4a: { name: "Staking Facilities", location: "Germany" },
//         eoKpUABi59aT4rR9HGS3LcMecfut9x7zJyodWWP43YQ: { name: "Everstake", location: "Ukraine" },
//         BxFf75Vtzro2Hy3coFHKxFMZo5au8W7J8BmLC3gCMotU: { name: "Certus One", location: "United States" },
//         CcaHc2L43ZWjwCHART3oZoJvHLAe9hzT2DJNUpBzoTN1: { name: "Staked", location: "United States" },
//         "2het6nBRLq9LLZER8fqUEk7j5pbLxq2mVGqSse2nS3tf": { name: "P2P Validator", location: "Switzerland" },
//         Bf6JtoLAg9zxAksgZ9gUsa6zZum1UuPWuirY6qKLXXoW: { name: "Blockdaemon", location: "United States" },
//       }
//     } catch (error) {
//       console.error("Error fetching validator identity info:", error)
//       return {}
//     }
//   })
// }

/**
 * Get geographic distribution of validators
 * Note: This would typically come from an external API as Solana doesn't store this info on-chain
 */
// export async function getGeographicDistribution(): Promise<GeographicDistribution[]> {
//   return getCachedOrFetch("geoDistribution", async () => {
//     try {
//       // In a real implementation, you would fetch this from an API that tracks validator IPs
//       // For now, we'll return simulated data based on common validator locations
//       const countries = [
//         {
//           country: "United States",
//           latitude: 37.0902,
//           longitude: -95.7129,
//           count: 120,
//           stake: 45000000,
//           delinquent: false,
//         },
//         { country: "Germany", latitude: 51.1657, longitude: 10.4515, count: 85, stake: 30000000, delinquent: false },
//         { country: "Singapore", latitude: 1.3521, longitude: 103.8198, count: 65, stake: 25000000, delinquent: false },
//         { country: "Japan", latitude: 36.2048, longitude: 138.2529, count: 40, stake: 15000000, delinquent: false },
//         {
//           country: "United Kingdom",
//           latitude: 55.3781,
//           longitude: -3.436,
//           count: 35,
//           stake: 12000000,
//           delinquent: false,
//         },
//         { country: "Canada", latitude: 56.1304, longitude: -106.3468, count: 30, stake: 10000000, delinquent: false },
//         { country: "France", latitude: 46.2276, longitude: 2.2137, count: 25, stake: 8000000, delinquent: false },
//         { country: "Australia", latitude: -25.2744, longitude: 133.7751, count: 20, stake: 5000000, delinquent: false },
//         { country: "Brazil", latitude: -14.235, longitude: -51.9253, count: 15, stake: 3000000, delinquent: true },
//         { country: "India", latitude: 20.5937, longitude: 78.9629, count: 10, stake: 2000000, delinquent: true },
//       ]

//       return countries
//     } catch (error) {
//       console.error("Error fetching geographic distribution:", error)
//       return []
//     }
//   })
// }

/**
 * Get historical APY data
 */
// export async function getAPYHistory(): Promise<APYHistory[]> {
//   return getCachedOrFetch("apyHistory", async () => {
//     try {
//       // In a real implementation, you would fetch this from historical data
//       // For now, we'll return simulated data with a realistic trend
//       const days = 30
//       const result: APYHistory[] = []
//       const baseAPY = 7.0

//       for (let i = days; i >= 0; i--) {
//         const date = new Date()
//         date.setDate(date.getDate() - i)

//         // Create a realistic APY trend with small fluctuations
//         const dayFactor = i / days // 0 to 1
//         const trendFactor = Math.sin(dayFactor * Math.PI) * 0.5 // Sinusoidal trend
//         const randomFactor = Math.random() * 0.4 - 0.2 // Random noise

//         const apy = baseAPY + trendFactor + randomFactor

//         result.push({
//           date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
//           averageAPY: Number.parseFloat(apy.toFixed(2)),
//         })
//       }

//       return result
//     } catch (error) {
//       console.error("Error generating APY history:", error)
//       return []
//     }
//   })
// }

/**
 * Transform raw validator data into our application format
 */
// export async function transformValidatorData(
//   connection: Connection,
//   voteAccounts: VoteAccountStatus,
//   totalSupply: number,
// ): Promise<Validator[]> {
//   try {
//     const currentEpoch = await getEpochInfo(connection)
//     const allAccounts = [...voteAccounts.current, ...voteAccounts.delinquent]
//     const totalStake = allAccounts.reduce((sum, account) => sum + account.activatedStake / LAMPORTS_PER_SOL, 0)
//     const inflationRate = await getInflationRate(connection)
//     const identityInfo = await getValidatorIdentityInfo()

//     // Get the current slot to calculate vote distance
//     const currentSlot = await connection.getSlot()

//     return Promise.all(
//       allAccounts.map(async (account) => {
//         const stake = account.activatedStake / LAMPORTS_PER_SOL
//         const stakePercentage = (stake / totalStake) * 100
//         const isDelinquent = voteAccounts.delinquent.some((a) => a.votePubkey === account.votePubkey)

//         // Calculate a score based on various metrics
//         const epochCredits = account.epochCredits[account.epochCredits.length - 1]?.[1] || 0
//         const maxCredits = 432000 // Theoretical maximum for perfect performance
//         const creditScore = Math.min(100, (epochCredits / maxCredits) * 100)

//         // Calculate skip rate based on epoch credits
//         const skipRate = isDelinquent ? 5 + Math.random() * 20 : Math.max(0, 5 - creditScore / 20)

//         // Calculate APY using inflation rate and commission
//         const commission = account.commission / 100
//         const stakeRatio = totalStake / totalSupply
//         const apy = calculateAPY(inflationRate, stakeRatio, commission)

//         // Get stake account info
//         const stakeInfo = await getValidatorStakeAccounts(connection, account.votePubkey)

//         // Get validator identity info if available
//         const identity = identityInfo[account.nodePubkey] || {}
//         const name = identity.name || `${account.nodePubkey.slice(0, 6)}...${account.nodePubkey.slice(-6)}`

//         // Calculate vote distance
//         let voteDistance = 0
//         try {
//           const voteAccount = await connection.getAccountInfo(new PublicKey(account.votePubkey))
//           if (voteAccount && voteAccount.data) {
//             // Extract last voted slot from vote account data
//             // This is a simplified approach - in reality, you'd need to properly parse the vote account data
//             const lastVotedSlot = currentSlot - Math.floor(Math.random() * 100) // Simulated for now
//             voteDistance = currentSlot - lastVotedSlot
//           }
//         } catch (error) {
//           console.error(`Error getting vote account info for ${account.votePubkey}:`, error)
//           voteDistance = isDelinquent ? Math.floor(Math.random() * 100) + 50 : Math.floor(Math.random() * 20)
//         }

//         // Calculate score
//         const uptimeScore = isDelinquent ? 30 + Math.random() * 30 : 70 + Math.random() * 30
//         const score = Math.round(creditScore * 0.4 + uptimeScore * 0.6)

//         // Determine data center based on node pubkey (in reality, this would come from an external API)
//         const dataCenters = ["AWS", "Google Cloud", "Azure", "Hetzner", "OVH", "Digital Ocean"]
//         const dataCenter = dataCenters[Math.abs(account.nodePubkey.charCodeAt(0) % dataCenters.length)]

//         // Determine software version (in reality, this would come from an external API)
//         const versions = ["1.14.18", "1.14.17", "1.14.16", "1.14.15", "1.14.14"]
//         const version = versions[Math.abs(account.nodePubkey.charCodeAt(1) % versions.length)]

//         return {
//           name,
//           identity: account.votePubkey,
//           activatedStake: stake,
//           commission: account.commission,
//           apy: Number.parseFloat(apy.toFixed(2)),
//           skippedSlots: Number.parseFloat(skipRate.toFixed(2)),
//           delinquent: isDelinquent,
//           score,
//           stakePercentage,
//           votingPower: stakePercentage,
//           voteDistance,
//           commissionChange: Math.random() > 0.9, // Simulated for now
//           dataCenter,
//           uptime: isDelinquent ? 90 + Math.random() * 5 : 98 + Math.random() * 2,
//           version,
//           lastVote: `${Math.floor(Math.random() * 100)}s ago`, // Simulated for now
//           rootSlot: `${currentSlot - Math.floor(Math.random() * 1000)}`,
//           updatedAt: new Date().toLocaleTimeString(),
//           rewards: {
//             daily: Number.parseFloat(((stake * apy) / 36500).toFixed(2)),
//             epoch: Number.parseFloat(((stake * apy) / 365).toFixed(2)),
//             per1000: Number.parseFloat(((1000 * apy) / 365).toFixed(2)),
//           },
//           stakeAccounts: {
//             count: stakeInfo.count,
//             averageSize: Number.parseFloat((stakeInfo.totalStake / stakeInfo.count).toFixed(2)),
//             largest: stakeInfo.largestStake,
//             superminority: stakeInfo.totalStake > totalStake * 0.01,
//           },
//         }
//       }),
//     )
//   } catch (error) {
//     console.error("Error transforming validator data:", error)
//     throw error
//   }
// }

/**
 * Get stake distribution data
 */
// export async function getStakeDistribution(validators: Validator[]): Promise<StakeDistribution[]> {
//   try {
//     return validators
//       .sort((a, b) => b.activatedStake - a.activatedStake)
//       .slice(0, 25)
//       .map((validator) => ({
//         name: validator.name,
//         stakeAmount: validator.activatedStake,
//         percentage: validator.stakePercentage,
//       }))
//   } catch (error) {
//     console.error("Error getting stake distribution:", error)
//     return []
//   }
// }

/**
 * Get validator score data for visualization
 */
export function getValidatorScores(validators: Validator[]): ValidatorScore[] {
  try {
    return validators.map((validator) => ({
      name: validator.name,
      stake: validator.activatedStake,
      score: validator.score,
      commission: validator.commission,
      delinquent: validator.delinquent,
    }));
  } catch (error) {
    console.error('Error getting validator scores:', error);
    return [];
  }
}

/**
 * Get complete staking data
 */
export async function getStakingData(
  connection: Connection,
  network: Cluster = 'mainnet-beta'
): Promise<StakingDataType> {
  try {
    // Fetch validators first to get total stake
    const validators = await getValidatorsApp(network);
    const totalStake = validators.reduce((sum, v) => sum + v.activatedStake, 0);

    // Update validator percentages
    validators.forEach((validator) => {
      validator.stakePercentage = (validator.activatedStake / totalStake) * 100;
      validator.votingPower = validator.stakePercentage;

      // Calculate rewards based on stake percentage
      const apy = validator.apy;
      validator.rewards = {
        daily: calculateDailyRewards(validator.activatedStake, apy),
        epoch: calculateEpochRewards(validator.activatedStake, apy),
        per1000: calculateRewardsPer1000(apy),
      };
    });

    // Fetch other data
    const networkStats = await getNetworkStats(network);
    networkStats.totalValidators = validators.length;
    networkStats.activeValidators = validators.filter(
      (v) => !v.delinquent
    ).length;

    const geographicDistribution = await getGeoDistribution(network);
    const apyHistory = await getAPYHistoryData(network);
    const stakeDistribution = await getStakeDistributionData(network);
    const delinquentValidators = validators.filter((v) => v.delinquent).length;
    const validatorScore = getValidatorScores(validators);

    return {
      validators,
      networkStats,
      apyHistory,
      stakeDistribution,
      delinquentValidators,
      geographicDistribution,
      validatorScore,
    };
  } catch (error) {
    console.error('Error fetching staking data:', error);
    throw new Error(
      `Failed to fetch staking data: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}
