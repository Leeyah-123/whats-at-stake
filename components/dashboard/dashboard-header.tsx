'use client';

import { UserButton, useUser } from '@civic/auth/react';
import Image from 'next/image';
import { AlertSettings } from '../profile/alert-settings';
import { FavoriteValidators } from '../profile/favorite-validators';
import { ProfileSettings } from '../profile/profile-settings';
import { useStaking } from '../providers/staking-provider';
import { NetworkSelector } from '../wallet/network-selector';
import { ApiStatusIndicator } from './api-status-indicator';
import { MobileMenu } from './mobile-menu';

export function DashboardHeader() {
  const { solPrice, solPriceChange } = useStaking();
  const { authStatus } = useUser();
  const isAuthenticated = authStatus === 'authenticated';

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-2 md:gap-4">
        <Image
          src="/whats-at-stake-logo.png"
          alt="What's At Stake Logo"
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
        <ApiStatusIndicator />
        <NetworkSelector />

        {isAuthenticated && (
          <>
            <AlertSettings />
            <FavoriteValidators />
          </>
        )}

        <ProfileSettings />
        <UserButton className="hover:bg-slate-800" />
      </div>

      <div className="hidden max-md:flex items-center gap-2 ml-auto md:ml-0">
        <MobileMenu />
      </div>
    </header>
  );
}
