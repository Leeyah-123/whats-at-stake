import { getValidators } from '@/lib/api/validators-app';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const headersList = headers();
    const network = (await headersList).get('x-network') || 'mainnet-beta';

    const validators = await getValidators(network as any);
    return NextResponse.json(validators);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch validators' },
      { status: 500 }
    );
  }
}
