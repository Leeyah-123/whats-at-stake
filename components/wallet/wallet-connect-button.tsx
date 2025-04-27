"use client"

import { Button } from "@/components/ui/button"
import { useWallet } from "./wallet-provider"
import { useWalletModal } from "@solana/wallet-adapter-react-ui"
import { Loader2, Wallet } from "lucide-react"
import { formatAddress } from "@/lib/utils"

export function WalletConnectButton() {
  const { connected, connecting, publicKey, walletName } = useWallet()
  const { setVisible } = useWalletModal()

  const handleClick = () => {
    if (!connected) {
      setVisible(true)
    }
  }

  if (connecting) {
    return (
      <Button variant="outline" disabled className="min-w-[140px]">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Connecting
      </Button>
    )
  }

  if (connected && publicKey) {
    return (
      <Button variant="outline" className="min-w-[140px]" onClick={handleClick}>
        <Wallet className="mr-2 h-4 w-4" />
        {formatAddress(publicKey)}
      </Button>
    )
  }

  return (
    <Button variant="outline" className="min-w-[140px]" onClick={handleClick}>
      <Wallet className="mr-2 h-4 w-4" />
      Connect Wallet
    </Button>
  )
}
