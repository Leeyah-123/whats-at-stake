import {
  getAPYHistory,
  getGeographicDistribution,
  getNetworkStats,
  getStakeDistribution,
  getValidators,
} from '@/lib/api/validators-app';
import { RateLimitError } from '@/lib/errors/api-errors';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const headersList = headers();
    const network = (await headersList).get('x-network') || 'mainnet-beta';

    // Fetch all required data in parallel
    const [
      networkStats,
      validators,
      geoDistribution,
      stakeDistribution,
      apyHistory,
    ] = await Promise.all([
      getNetworkStats(network as any),
      getValidators(network as any),
      getGeographicDistribution(network as any),
      getStakeDistribution(network as any),
      getAPYHistory(network as any),
    ]);

    // Combine data into expected format
    const response = {
      networkStats,
      validators,
      geographicDistribution: geoDistribution,
      stakeDistribution,
      apyHistory,
      validatorScore: validators.map((v) => ({
        name: v.name,
        score: v.score,
        uptime: v.uptime,
        stake: v.activatedStake,
        commission: v.commission,
        delinquent: v.delinquent,
      })),
      delinquentValidators: validators.filter((v) => v.delinquent).length,
    };

    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof RateLimitError) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          retryAfter: error.retryAfter,
        },
        {
          status: 429,
          headers: {
            'Retry-After': error.retryAfter.toString(),
          },
        }
      );
    }

    console.error('Network stats API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch network stats' },
      { status: 500 }
    );
  }
}
