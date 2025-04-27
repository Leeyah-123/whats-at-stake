import { StakingDashboard } from "@/components/staking-dashboard"
import { WalletContextProvider } from "@/components/wallet/wallet-provider"
import { ProfileProvider } from "@/components/profile/profile-provider"
import { StakingProvider } from "@/components/providers/staking-provider"

export default function Home() {
  return (
    <WalletContextProvider>
      <ProfileProvider>
        <StakingProvider>
          <StakingDashboard />
        </StakingProvider>
      </ProfileProvider>
    </WalletContextProvider>
  )
}
