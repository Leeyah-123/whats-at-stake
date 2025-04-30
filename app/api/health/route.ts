import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const startTime = performance.now();
    const response = await fetch(
      'https://www.validators.app/api/v1/ping.json',
      {
        headers: {
          'Content-Type': 'application/json',
          Token: process.env.VALIDATORS_APP_API_KEY || '',
        },
        signal: AbortSignal.timeout(5000),
      }
    );

    const endTime = performance.now();
    const latency = Math.round(endTime - startTime);

    if (response.status === 429) {
      const retryAfter = parseInt(
        response.headers.get('retry-after') || '300',
        10
      );
      return NextResponse.json(
        {
          status: 'rate_limited',
          retryAfter,
          message: 'API rate limit exceeded',
        },
        {
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString(),
          },
        }
      );
    }

    const data = await response.json();

    if (response.ok && data.answer === 'pong') {
      return NextResponse.json({ status: 'online', latency });
    } else {
      return NextResponse.json(
        { status: 'degraded', latency },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error('API health check failed:', error);
    return NextResponse.json(
      {
        status:
          error instanceof DOMException && error.name === 'TimeoutError'
            ? 'degraded'
            : 'offline',
        error: 'API health check failed',
      },
      { status: 500 }
    );
  }
}
