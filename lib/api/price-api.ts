type CoinGeckoResponse = {
  solana: {
    usd: number;
    usd_24h_change: number;
  };
};

/**
 * Get current SOL price and 24h change from CoinGecko
 */
export async function getSolanaPrice(): Promise<{
  price: number;
  change24h: number;
}> {
  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd&include_24hr_change=true'
    );

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
