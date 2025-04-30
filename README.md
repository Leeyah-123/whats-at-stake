# What's At Stake

A real-time dashboard and analytics platform for Solana staking, validator performance, and network health.

## Overview

**What's At Stake** provides a comprehensive view of the Solana staking ecosystem, including:

- Total staked SOL and staking ratio
- Validator performance and APY analytics
- Stake distribution among top validators
- Network statistics and epoch information
- Historical APY and rewards analytics

The dashboard is built with React, Next.js, and leverages Solana's APIs and [validators.app](https://www.validators.app/) for live data.

---

## Features

- **Staking Overview:** Real-time stats on total staked SOL, staking ratio, and validator counts.
- **Validator Analytics:** Detailed validator list with APY, commission, uptime, and more.
- **Stake Distribution:** Visual breakdown of stake among top validators.
- **Rewards Analytics:** Historical APY, rewards over time, and stake-weighted APY.
- **Network Stats:** Epoch progress, skipped slots, and commission trends.
- **Auto-Refresh:** Data updates automatically at configurable intervals.
- **Responsive UI:** Optimized for desktop and mobile.

---

## Data Sources

- **[validators.app](https://www.validators.app/):** Used for validator, epoch, and network statistics via its public API.
- **Solana RPC:** For live network and validator data.
- **Coingecko API:** For SOL price and price change.
- **Custom API routes:** For aggregation and caching.

---

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- Yarn or npm

### Installation

```bash
git clone https://github.com/yourusername/whats-at-stake.git
cd whats-at-stake
pnpm install
```

### Environment Variables

Copy the `.env.example` file to a `.env` file in the project root and add your API keys and other environment variables.:

```bash
cp .env.example .env
```

### Running Locally

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

---

## Customization

- **Network Selection:** Easily switch between Solana clusters (mainnet, testnet, devnet)
- **Refresh Interval:** User profile allows setting data refresh frequency
- **Theme:** Supports light/dark mode toggle

---

## Acknowledgements

- [Solana Labs](https://solana.com/)
- [validators.app](https://www.validators.app/)
- [Coingecko](https://coingecko.com/)
- [Chart.js](https://www.chartjs.org/)
- [Next.js](https://nextjs.org/)
