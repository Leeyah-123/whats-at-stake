import type {
  StakingDataType,
  Validator,
  APYHistory,
  StakeDistribution,
  GeographicDistribution,
  ValidatorScore,
} from "./types"

// Generate random validator names
const validatorNames = [
  "Chorus One",
  "Figment",
  "Staking Facilities",
  "P2P Validator",
  "Everstake",
  "Staked",
  "Blockdaemon",
  "Certus One",
  "Chainflow",
  "Chainlayer",
  "Cosmostation",
  "DokiaCapital",
  "Forbole",
  "HashQuark",
  "Huobi Pool",
  "Infstones",
  "Luganodes",
  "Melea",
  "Nodeasy",
  "RockX",
  "Stakin",
  "Staking Fund",
  "StakingHub",
  "Syncnode",
  "Ubik Capital",
  "01node",
  "Allnodes",
  "Anonstake",
  "Audit One",
  "Binance Staking",
  "Blockscape",
  "Coinbase Cloud",
  "Cryptium Labs",
  "Dokia Capital",
  "Everynode",
  "Forbole",
  "Genesis Lab",
  "HashKey Cloud",
  "Imperator",
  "Jito Labs",
  "Kraken",
  "Lido",
  "Marinade",
  "Notional",
  "OKEx Pool",
  "Protofire",
  "Quicknode",
  "Rockaway",
  "Solflare",
  "Triton",
]

// Generate random countries for geographic distribution
const countries = [
  { name: "United States", lat: 37.0902, lng: -95.7129 },
  { name: "Germany", lat: 51.1657, lng: 10.4515 },
  { name: "Singapore", lat: 1.3521, lng: 103.8198 },
  { name: "United Kingdom", lat: 55.3781, lng: -3.436 },
  { name: "Canada", lat: 56.1304, lng: -106.3468 },
  { name: "Japan", lat: 36.2048, lng: 138.2529 },
  { name: "South Korea", lat: 35.9078, lng: 127.7669 },
  { name: "France", lat: 46.2276, lng: 2.2137 },
  { name: "Australia", lat: -25.2744, lng: 133.7751 },
  { name: "Switzerland", lat: 46.8182, lng: 8.2275 },
  { name: "Netherlands", lat: 52.1326, lng: 5.2913 },
  { name: "Finland", lat: 61.9241, lng: 25.7482 },
  { name: "China", lat: 35.8617, lng: 104.1954 },
  { name: "Brazil", lat: -14.235, lng: -51.9253 },
  { name: "India", lat: 20.5937, lng: 78.9629 },
]

// Generate random data centers
const dataCenters = [
  "AWS US-East",
  "AWS US-West",
  "AWS EU-Central",
  "AWS Asia-Pacific",
  "Google Cloud US",
  "Google Cloud EU",
  "Google Cloud Asia",
  "Azure US",
  "Azure EU",
  "Azure Asia",
  "Hetzner",
  "Digital Ocean",
  "OVH",
  "Alibaba Cloud",
  "Linode",
]

// Generate random validator versions
const versions = ["1.16.15", "1.16.14", "1.16.13", "1.16.12", "1.16.11", "1.16.10"]

// Generate random validator data
function generateValidators(count: number): Validator[] {
  const validators: Validator[] = []

  // Total stake amount to distribute
  const totalStake = 150000000 // 150M SOL

  // Generate validators
  for (let i = 0; i < count; i++) {
    // Generate random stake amount with some validators having much larger stakes
    let stakeAmount
    if (i < 5) {
      // Top validators have larger stakes
      stakeAmount = Math.random() * 10000000 + 5000000 // 5M-15M SOL
    } else if (i < 20) {
      // Medium validators
      stakeAmount = Math.random() * 3000000 + 1000000 // 1M-4M SOL
    } else {
      // Smaller validators
      stakeAmount = Math.random() * 900000 + 100000 // 100K-1M SOL
    }

    // Random commission between 0-10%
    const commission = Math.floor(Math.random() * 11)

    // APY is inversely related to commission
    const baseAPY = 7.0
    const apy = Number.parseFloat((baseAPY - commission * 0.1 + (Math.random() * 0.4 - 0.2)).toFixed(2))

    // Skip rate - most validators have low skip rates
    const skippedSlots = Number.parseFloat((Math.random() * 5 + (i % 20 === 0 ? 5 : 0)).toFixed(2))

    // Delinquent status - small chance of being delinquent
    const delinquent = i % 25 === 0

    // Score based on performance metrics
    const score = Math.floor(100 - skippedSlots * 5 - (commission > 7 ? 10 : 0) - (delinquent ? 50 : 0))

    // Generate a random identity (public key)
    const identity = Array.from({ length: 44 }, () =>
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".charAt(Math.floor(Math.random() * 62)),
    ).join("")

    validators.push({
      name:
        validatorNames[i % validatorNames.length] +
        (i >= validatorNames.length ? ` ${Math.floor(i / validatorNames.length) + 1}` : ""),
      identity,
      activatedStake: stakeAmount,
      commission,
      apy,
      skippedSlots,
      delinquent,
      score,
      stakePercentage: Number.parseFloat(((stakeAmount / totalStake) * 100).toFixed(4)),
      votingPower: Number.parseFloat(((stakeAmount / totalStake) * 100).toFixed(4)),
      voteDistance: Math.floor(Math.random() * 10),
      commissionChange: Math.random() < 0.1, // 10% chance of upcoming commission change
      dataCenter: dataCenters[Math.floor(Math.random() * dataCenters.length)],
      uptime: Number.parseFloat((99 + Math.random()).toFixed(2)),
      version: versions[Math.floor(Math.random() * versions.length)],
      lastVote: `${Math.floor(Math.random() * 10) + 1} min ago`,
      rootSlot: (Math.floor(Math.random() * 1000000) + 200000000).toString(),
      updatedAt: `${Math.floor(Math.random() * 10) + 1} min ago`,
      rewards: {
        daily: Number.parseFloat((stakeAmount * 0.00019).toFixed(2)),
        epoch: Number.parseFloat((stakeAmount * 0.00133).toFixed(2)),
        per1000: Number.parseFloat((1000 * 0.00133).toFixed(2)),
      },
      stakeAccounts: {
        count: Math.floor(Math.random() * 1000) + 100,
        averageSize: Number.parseFloat((stakeAmount / (Math.floor(Math.random() * 1000) + 100)).toFixed(2)),
        largest: Number.parseFloat((stakeAmount * 0.3).toFixed(2)),
        superminority: Math.random() < 0.1, // 10% chance of being part of superminority
      },
    })
  }

  // Sort by stake amount descending
  return validators.sort((a, b) => b.activatedStake - a.activatedStake)
}

// Generate APY history
function generateAPYHistory(): APYHistory[] {
  const history: APYHistory[] = []
  const today = new Date()

  for (let i = 0; i < 30; i++) {
    const date = new Date()
    date.setDate(today.getDate() - (29 - i))

    // Base APY with slight upward trend and some variance
    const baseAPY = 6.8 + i * 0.01
    const variance = Math.random() * 0.4 - 0.2

    history.push({
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      averageAPY: Number.parseFloat((baseAPY + variance).toFixed(2)),
    })
  }

  return history
}

// Generate stake distribution data
function generateStakeDistribution(validators: Validator[]): StakeDistribution[] {
  return validators.slice(0, 25).map((validator) => ({
    name: validator.name,
    stakeAmount: validator.activatedStake,
    percentage: validator.stakePercentage,
  }))
}

// Generate geographic distribution
function generateGeographicDistribution(): GeographicDistribution[] {
  const distribution: GeographicDistribution[] = []

  countries.forEach((country) => {
    // Add some randomness to coordinates to spread validators within countries
    const validatorCount = Math.floor(Math.random() * 50) + 5
    const totalStake = Math.random() * 10000000 + 1000000
    const delinquent = Math.random() < 0.1 // 10% chance of having delinquent validators

    distribution.push({
      country: country.name,
      latitude: country.lat + (Math.random() * 2 - 1),
      longitude: country.lng + (Math.random() * 2 - 1),
      count: validatorCount,
      stake: totalStake,
      delinquent,
    })
  })

  return distribution
}

// Generate validator scores for scatter plot
function generateValidatorScores(validators: Validator[]): ValidatorScore[] {
  return validators.map((validator) => ({
    name: validator.name,
    stake: validator.activatedStake,
    score: validator.score,
    commission: validator.commission,
    delinquent: validator.delinquent,
  }))
}

// Main function to generate all staking data
export function getStakingData(): StakingDataType {
  const validators = generateValidators(100)
  const totalStake = validators.reduce((sum, validator) => sum + validator.activatedStake, 0)
  const activeValidators = validators.filter((v) => !v.delinquent).length
  const delinquentValidators = validators.filter((v) => v.delinquent).length

  const apyHistory = generateAPYHistory()
  const currentAPY = apyHistory[apyHistory.length - 1].averageAPY

  return {
    validators,
    networkStats: {
      totalStake,
      totalValidators: validators.length,
      activeValidators,
      epochInfo: {
        epoch: 372,
        slot: 160452000,
        slotsInEpoch: 432000,
        slotIndex: 160452000 % 432000,
        slotsRemaining: 432000 - (160452000 % 432000),
      },
      averageAPY: currentAPY,
      stakingRatio: 72.5, // Percentage of total supply that is staked
      averageSkippedSlots: validators.reduce((sum, v) => sum + v.skippedSlots, 0) / validators.length,
      averageCommission: validators.reduce((sum, v) => sum + v.commission, 0) / validators.length,
    },
    apyHistory,
    stakeDistribution: generateStakeDistribution(validators),
    delinquentValidators,
    geographicDistribution: generateGeographicDistribution(),
    validatorScore: generateValidatorScores(validators),
  }
}

export function createConnection(endpoint: string): string {
  return endpoint
}
