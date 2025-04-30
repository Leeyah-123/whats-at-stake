import dbConnect from '@/lib/db/connect';
import { User } from '@/lib/db/models/user';
import { createWallets, getUser } from '@civic/auth-web3/nextjs';
import { NextResponse } from 'next/server';

const WALLET_API_BASE_URL =
  process.env.WALLET_API_BASE_URL || 'https://api.civic.com/wallet';

function userHasWallet(user: any) {
  return !!user.solWalletAddress;
}

export async function GET() {
  try {
    const user = await getUser({
      endpoints: { wallet: WALLET_API_BASE_URL },
    });

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!userHasWallet(user)) {
      await createWallets();
    }

    await dbConnect();

    const dbUser = await User.findOne({
      walletAddress: user.solWalletAddress,
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(dbUser);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user preferences' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await getUser({
      endpoints: { wallet: WALLET_API_BASE_URL },
    });

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!userHasWallet(user)) {
      await createWallets();
    }

    const updates = await req.json();
    await dbConnect();

    const dbUser = await User.findOneAndUpdate(
      { walletAddress: user.solWalletAddress },
      {
        ...updates,
        updatedAt: new Date(),
      },
      { new: true, upsert: true }
    );

    return NextResponse.json(dbUser);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to update user preferences' },
      { status: 500 }
    );
  }
}
