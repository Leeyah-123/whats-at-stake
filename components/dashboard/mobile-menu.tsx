'use client';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { AlertSettings } from '../profile/alert-settings';
import { FavoriteValidators } from '../profile/favorite-validators';
import { ProfileSettings } from '../profile/profile-settings';
import { NetworkSelector } from '../wallet/network-selector';
import { WalletConnectButton } from '../wallet/wallet-connect-button';
import { WalletDetails } from '../wallet/wallet-details';
import { useWallet } from '../wallet/wallet-provider';
import { ApiStatusIndicator } from './api-status-indicator';

export function MobileMenu() {
  const { connected } = useWallet();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-4 mt-4">
          <ApiStatusIndicator />
          <NetworkSelector />
          {connected && (
            <>
              <AlertSettings />
              <FavoriteValidators />
            </>
          )}
          <ProfileSettings />
          {connected ? <WalletDetails /> : <WalletConnectButton />}
        </div>
      </SheetContent>
    </Sheet>
  );
}
