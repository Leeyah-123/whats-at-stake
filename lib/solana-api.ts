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
  getAPYHistory,
  getNetworkStats,
  getStakeDistribution,
  getValidators as getValidatorsApp,
} from './api/validators-app';
import type {
  EpochInfo,
  StakingDataType,
  Validator,
  ValidatorScore,
} from './types';

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
    const [validators, networkStats, apyHistory, stakeDistribution] =
      await Promise.all([
        getValidatorsApp(network),
        getNetworkStats(network),
        getAPYHistory(network),
        getStakeDistribution(network),
      ]);

    // Process data
    const totalStake = validators.reduce((sum, v) => sum + v.activatedStake, 0);
    validators.forEach((validator) => {
      validator.stakePercentage = (validator.activatedStake / totalStake) * 100;
      validator.votingPower = validator.stakePercentage;
      const apy = validator.apy;
      validator.rewards = {
        daily: calculateDailyRewards(validator.activatedStake, apy),
        epoch: calculateEpochRewards(validator.activatedStake, apy),
        per1000: calculateRewardsPer1000(apy),
      };
    });

    return {
      validators,
      networkStats: {
        ...networkStats,
        totalValidators: validators.length,
        activeValidators: validators.filter((v) => !v.delinquent).length,
      },
      apyHistory,
      stakeDistribution,
      delinquentValidators: validators.filter((v) => v.delinquent).length,
      validatorScore: getValidatorScores(validators),
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
