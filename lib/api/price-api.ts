type CoinGeckoResponse = {
  solana: {
    usd: number;
    usd_24h_change: number;
  };
};

export async function getSolanaPrice(): Promise<{
  price: number;
  change24h: number;
}> {
  try {
    const response = await fetch('/api/price');

    if (!response.ok) {
      throw new Error('Failed to fetch price data');
    }

    const data = (await response.json()) as CoinGeckoResponse;

    return {
      price: Number(data.solana.usd.toFixed(2)),
      change24h: Number(data.solana.usd_24h_change.toFixed(2)),
    };
  } catch (error) {
    console.error('Error fetching SOL price:', error);
    // Return default values if API fails
    return {
      price: 0,
      change24h: 0,
    };
  }
}
