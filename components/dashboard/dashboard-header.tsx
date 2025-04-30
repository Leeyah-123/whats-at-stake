'use client';

import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import Image from 'next/image';
import { AlertSettings } from '../profile/alert-settings';
import { FavoriteValidators } from '../profile/favorite-validators';
import { ProfileSettings } from '../profile/profile-settings';
import { useStaking } from '../providers/staking-provider';
import { NetworkSelector } from '../wallet/network-selector';
import { WalletConnectButton } from '../wallet/wallet-connect-button';
import { WalletDetails } from '../wallet/wallet-details';
import { useWallet } from '../wallet/wallet-provider';
import { ApiStatusIndicator } from './api-status-indicator';

export function DashboardHeader() {
  const { connected } = useWallet();
  const { solPrice, solPriceChange } = useStaking();

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-2 md:gap-4">
        <Image
          src="/placeholder.svg?height=32&width=32"
          alt="Solana Logo"
          width={32}
          height={32}
          className="rounded-full"
        />
        <div className="flex flex-col">
          <span className="text-sm font-medium md:text-base">
            What's At Stake
          </span>
          <span className="text-xs text-muted-foreground">
            SOL ${solPrice?.toFixed(2) || '0.00'}
            <span
              className={`ml-1 ${
                solPriceChange
                  ? solPriceChange > 0
                    ? 'text-green-500'
                    : solPriceChange < 0
                    ? 'text-red-500'
                    : 'text-gray-500'
                  : ''
              }`}
            >
              {solPriceChange && solPriceChange >= 0 ? '+' : ''}
              {solPriceChange?.toFixed(2) || '0.00'}%
            </span>
          </span>
        </div>
      </div>

      <div className="hidden md:flex items-center gap-4 md:ml-auto md:gap-6">
        <form className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search validators..."
            className="w-56 rounded-lg bg-background pl-8 md:w-80"
          />
        </form>

        <ApiStatusIndicator />
        <NetworkSelector />

        {connected && (
          <>
            <AlertSettings />
            <FavoriteValidators />
          </>
        )}

        <ProfileSettings />
      </div>

      <div className="flex items-center gap-2 ml-auto md:ml-0">
        {connected ? <WalletDetails /> : <WalletConnectButton />}
      </div>
    </header>
  );
}
