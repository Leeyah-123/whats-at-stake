export interface Validator {
  name: string;
  identity: string;
  votePubkey?: string;
  activatedStake: number;
  commission: number;
  apy: number;
  skippedSlots: number;
  delinquent: boolean;
  score: number;
  stakePercentage: number;
  votingPower: number;
  voteDistance: number;
  commissionChange: boolean;
  dataCenter: string;
  uptime: number;
  version: string;
  lastVote: string;
  rootSlot: string;
  updatedAt: string;
  rewards: {
    daily: number;
    epoch: number;
    per1000: number;
  };
  stakeAccounts: {
    count: number;
    averageSize: number;
    largest: number;
    superminority: boolean;
  };
}

export interface NetworkStat {
  totalStake: number;
  totalValidators: number;
  activeValidators: number;
  epochInfo: EpochInfo;
  averageAPY: number;
  stakingRatio: number;
  averageSkippedSlots: number;
  averageCommission: number;
}

export interface EpochInfo {
  epoch: number;
  slot: number;
  slotsInEpoch: number;
  slotIndex: number;
  slotsRemaining: number;
}

export interface APYHistory {
  date: string;
  averageAPY: number;
}

export interface StakeDistribution {
  name: string;
  stakeAmount: number;
  percentage: number;
}

export interface GeographicDistribution {
  country: string;
  latitude: number;
  longitude: number;
  count: number;
  stake: number;
  delinquent: boolean;
}

export interface ValidatorScore {
  name: string;
  stake: number;
  score: number;
  commission: number;
  delinquent: boolean;
}

export interface StakingDataType {
  validators: Validator[];
  networkStats?: NetworkStat;
  apyHistory: APYHistory[];
  stakeDistribution: StakeDistribution[];
  delinquentValidators: number;
  validatorScore: ValidatorScore[];
}
